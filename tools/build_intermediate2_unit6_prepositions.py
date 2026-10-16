"""Render the Unit 6 contrastive verb/preposition explanation inside its existing shell."""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'assets/data/english-intermediate2-unit6-prepositions.json'
IMAGE_ROOT = '../../assets/img/english-intermediate-2/unit-6/prepositions/'

def render(say, note, grid):
    data = json.loads(DATA.read_text())
    esc = lambda value: html.escape(value, quote=True)
    def spoken(key, text, prep):
        result = say(key, text)
        # Only highlight visible label text, leaving accessible labels and attributes intact.
        start = result.index('>') + 1
        result = result[:start] + re.sub(r'\b' + re.escape(prep) + r'\b', '<mark>' + prep + '</mark>', result[start:], count=1)
        return result
    pairs = []
    for number, pair in enumerate(data['pairs'], 1):
        cards = []
        verb = pair['verb']
        for scene in pair['scenes']:
            key = 'prep-' + scene['id']
            phrase = verb + ' ' + scene['preposition']
            cards.append(f'''<article class="u4-card u6-scene u6-prep-scene" data-project-title="{esc(phrase)}">
<button type="button" class="u4-project-open" aria-label="Enlarge: {esc(phrase)}" aria-haspopup="dialog"><img src="{IMAGE_ROOT}{scene['id']}-v1.webp" width="1536" height="1024" alt="{esc(scene['alt'])}" loading="lazy" decoding="async"/><span class="u4-project-hint">Enlarge ↗</span></button>
<div class="u4-card-copy"><h3>{spoken(key, phrase, scene['preposition'])}</h3><p class="u6-prep-definition">{esc(scene['definition'])}</p><p>{esc(scene['context'])}</p>
<p class="u4-model"><b>Present:</b><br>{spoken(key+'-present', scene['model'], scene['preposition'])}</p>
<details class="u6-support"><summary>Report it in the past</summary><p class="u4-model">{spoken(key+'-past', scene['past'], scene['preposition'])}</p></details></div></article>''')
        title = f'{number:02} · {verb.upper()} · ' + ' / '.join(s['preposition'] for s in pair['scenes'])
        pairs.append(f'''<details class="u6-topic-group u6-prep-pair" id="prep-pair-{verb}"><summary>{title}</summary><div class="u6-group-body">
<button class="intermediate2-button u6-project-pair" type="button" aria-haspopup="dialog">Project this pair ↗</button>
<p class="u6-prep-question">{say('prep-'+verb+'-question',pair['question'])}</p>{grid(*cards)}
<aside class="u4-note"><strong>Notice the difference</strong><p>{esc(pair['contrast'])}</p></aside>
</div></details>''')
    return (note('Same verb. Different preposition. A different message.',
        'Sometimes the action changes: <b>look for</b> means search; <b>look at</b> means direct your eyes towards something. In other pairs, the preposition identifies a topic, a listener or a source. These examples teach specific meanings, not a rule that a verb can never take another preposition.')
        + '<p>' + say('prep-introduction', 'Listen to how this explanation works') + '</p>'
        + '<p>Open one pair. Compare its two pictures, read the context and listen. Hover over each underlined combination for Spanish; click to hear it. You can project both pictures together or enlarge either picture.</p>'
        + ''.join(pairs)
        + note('Change the tense, keep the combination',
          '<b>They are looking for survivors.</b> → <b>The rescuers looked for survivors.</b> Use the present to describe the picture and the past to report the completed event. Do not omit the preposition or move it after its object: <b>look for them</b>, not <b>look them for</b>.')
        + note('One sentence for a news report',
          'Choose a picture and describe the visible action. Then report it as a completed event. Use the past model for support and change details only when the picture or the fictional context supports them. A picture alone does not establish a date, cause or exact number of people affected.')
        + '<p class="u6-source">Language support: <a href="https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/verbs-prepositions" target="_blank" rel="noopener">British Council · Verbs and prepositions</a>. These twenty scenes and news contexts are fictional teaching examples.</p>')

def prepare_models():
    """Add new public scripts once; preserve hashes/settings of existing recordings."""
    data = json.loads(DATA.read_text())
    path = ROOT / 'ingles/intermediate-2/audio/unit-6-explanation/models.json'
    config = json.loads(path.read_text())
    current = {item['id']: item for item in config['items']}
    items = [dict(id='prep-introduction', text=data['intro'], kind='model')]
    for pair in data['pairs']:
        items.append(dict(id='prep-'+pair['verb']+'-question', text=pair['question'], kind='model'))
        for scene in pair['scenes']:
            key = 'prep-'+scene['id']
            items.extend([
                dict(id=key, text=pair['verb']+' '+scene['preposition'], spanish=scene['spanish'], kind='phrase'),
                dict(id=key+'-present', text=scene['model'], kind='model'),
                dict(id=key+'-past', text=scene['past'], kind='model')])
    for item in items:
        item['file'] = item['id'] + '.mp3'
        if item['id'] in current:
            assert current[item['id']]['text'] == item['text'], 'Use a new version for changed audio'
        else:
            config['items'].append(item)
    path.write_text(json.dumps(config, ensure_ascii=False, indent=2)+'\n')
    print('Prepared', len(items), 'new Sarah scripts.')

if __name__ == '__main__':
    prepare_models()
