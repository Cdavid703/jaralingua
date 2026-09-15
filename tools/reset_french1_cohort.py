"""Reset only French 1 from a private JSON roster, with a recoverable backup.

Run with the progress service stopped to prevent concurrent gradebook writes.
Student data is supplied privately and must never be committed to the repository.
"""
import argparse
import datetime
import json
import os
from pathlib import Path
import shutil


def prepare(grades, bundle, roster):
    if not isinstance(roster, list) or not roster:
        raise ValueError("A nonempty roster is required")
    ids, emails, students = set(), set(), []
    for row in roster:
        sid = str(row['id']).strip()
        email = row['email'].strip().lower()
        name = row['fullName'].strip()
        if not sid.isdigit() or '@' not in email or not name or sid in ids or email in emails:
            raise ValueError("Invalid or duplicate student")
        ids.add(sid)
        emails.add(email)
        students.append(dict(id=sid, fullName=name, email=email, emailAliases=[],
                             level='Français Niveau 1', contact='', bookDate='', grades={}, gradeDetails={}))
    grades = json.loads(json.dumps(grades))
    grades['students'] = students
    grades['bonusEvent'] = None
    grades['allowStudentIdClaim'] = False
    grades['evaluations'] = [e for e in grades['evaluations'] if e['id'] != 'pronunciationTheme1']
    required = {'pronunciationTheme3', 'pronunciationTheme5', 'pronunciationTheme7'}
    for e in grades['evaluations']:
        if e['id'] in required:
            e['weight'] = 5
            e.pop('date', None)
            e.pop('deadline', None)
            e['description'] = 'Audio obligatoire ; estimation provisoire et révision par le professeur.'
    if not required.issubset({e['id'] for e in grades['evaluations']}):
        raise ValueError('Expected pronunciation evaluations missing')
    if not any(e['id'] == 'evaluationPending5' for e in grades['evaluations']):
        grades['evaluations'].append(dict(id='evaluationPending5', title='Évaluation à définir (5 %)',
                                         weight=5, type='À définir', description='À définir par le professeur.'))
    if sum(e.get('weight', 0) for e in grades['evaluations']) != 100:
        raise ValueError('Weights must total 100 before resetting')
    bundle = json.loads(json.dumps(bundle))
    bundle['exam']['version'] = '2026-09-15-cohort-v3'
    for section in bundle['exam']['sections']:
        for question in section.get('questions', []):
            if question.get('id') == 'v2' and question.get('prompt') == 'On va au cinéma pour voir un film.':
                question['prompt'] = 'On va au ___ pour voir un film.'
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    bundle['state'] = dict(isOpen=False, openedAt=None, openedBy=None, closedAt=now, updatedAt=now,
                           durationMinutes=bundle.get('state', {}).get('durationMinutes', 90),
                           releaseResults=False, releasedAt=None, extraMinutesByStudent={},
                           revision=int(bundle.get('state', {}).get('revision', 0))+1)
    store = dict(submissions={}, attempts={}, preflight={}, events=[])
    return grades, bundle, store


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('roster', type=Path)
    parser.add_argument('--data-dir', type=Path, default=Path('/var/lib/jaralingua'))
    parser.add_argument('--backup-dir', type=Path, default=Path('/root/backups'))
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    names = ['french1-grades.json', 'french1-final-exam.json', 'french1-final-exam-submissions.json']
    originals = [json.loads((args.data_dir / name).read_text(encoding='utf-8')) for name in names]
    results = prepare(originals[0], originals[1], json.loads(args.roster.read_text(encoding='utf-8-sig')))
    assert results[0].get('teacherEmails') == originals[0].get('teacherEmails')
    assert results[0].get('adminEmails') == originals[0].get('adminEmails')
    print('Validated students:', len(results[0]['students']), '| weights: 100 | exam: closed | staff preserved')
    if not args.apply:
        return
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    backup = args.backup_dir / ('french1-cohort-reset-' + stamp)
    backup.mkdir(parents=True, mode=0o700)
    for name in names:
        shutil.copy2(args.data_dir / name, backup / name)
    audio = args.data_dir / 'french1-pronunciation-audio'
    if audio.exists():
        shutil.copytree(audio, backup / audio.name)
    try:
        for name, result in zip(names, results):
            dest = args.data_dir / name
            stat = dest.stat()
            temp = dest.with_suffix('.cohort-tmp')
            temp.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
            os.chmod(temp, stat.st_mode)
            if hasattr(os, 'chown'):
                os.chown(temp, stat.st_uid, stat.st_gid)
            os.replace(temp, dest)
    except Exception:
        for name in names:
            shutil.copy2(backup / name, args.data_dir / name)
        raise
    print('Reset complete. Backup:', backup)


if __name__ == '__main__':
    main()
