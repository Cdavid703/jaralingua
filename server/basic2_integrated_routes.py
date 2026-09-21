"""Basic 2-only HTTP adapter. Uses the existing verified auth and gradebook."""
import os
from basic2_integrated_exam import IntegratedExam, ExamError


def service(api):
    return IntegratedExam(
        os.environ.get('JARALINGUA_BASIC2_INTEGRATED_DB', '/var/lib/jaralingua/basic2-integrated-task.sqlite3'),
        os.environ.get('JARALINGUA_BASIC2_INTEGRATED_CONTENT_DIR',
            os.path.join(api['REPO_ROOT'], 'server', 'private_assets', 'basic2-integrated-task')
            if os.name == 'nt' else '/var/lib/jaralingua/basic2-integrated-task'))


def reconcile(api, grades):
    return service(api).project_grades(grades)


def handle(handler, profile, parsed, api, payload=None):
    if not parsed.path.startswith('/api/basic2/integrated-task/'):
        return False
    try:
        with api['data_lock']:
            grades = api['read_grades_data'](api['BASIC2_ENGLISH_GRADES_PATH'])
            trusted = {k:v for k,v in profile.items() if k != '_studentIdClaim'}
            student = api['matched_student_for_profile'](trusted, grades)
            actor = {'role':api['grade_user_role'](trusted, grades),
                     'key':str(trusted.get('sub') or trusted.get('email') or ''),
                     'student':{'id':str(student['id']),'fullName':student['fullName']} if student else None}
            exam = service(api)
            action = parsed.path.rsplit('/',1)[-1]
            if handler.command == 'GET' and action == 'state':
                result = exam.view(actor)
            elif handler.command == 'GET' and action == 'audio':
                api['binary_response'](handler,200,exam.audio(actor),'audio/mpeg')
                return True
            elif handler.command == 'POST':
                result = exam.action(actor,action,payload)
                if action in ('submit','grade'):
                    try:
                        if exam.project_grades(grades):
                            api['write_json_file'](api['BASIC2_ENGLISH_GRADES_PATH'],grades,'.basic2-grades-')
                        result['gradebookSynced'] = True
                    except Exception as error:
                        result['gradebookSynced'] = False
                        print('Basic 2 integrated projection:',type(error).__name__,flush=True)
            else:
                api['json_response'](handler,404,{'error':'unknown_route'})
                return True
            api['json_response'](handler,200,result)
    except ExamError as error:
        api['json_response'](handler,error.status,{'error':error.message,**error.extra})
    except Exception as error:
        print('Basic 2 integrated:',type(error).__name__,flush=True)
        api['json_response'](handler,503,{'error':'exam_temporarily_unavailable'})
    return True
