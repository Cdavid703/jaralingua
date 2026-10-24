"""Healthy Living: explanation-only content and exact ElevenLabs models."""
from html import escape

AUDIO = '/ingles/preintermedio-1/audio/unit3/lesson/'
audios = {}
topics = []


def say(key, text, voice='Narrator'):
    key = 'u3-' + key
    item = dict(text=text, voice=voice, path=AUDIO+key+'.mp3')
    assert key not in audios or audios[key] == item
    audios[key] = item
    return f'<button type="button" class="pi-say" data-audio="{key}" aria-label="Listen: {escape(text, quote=True)}">{escape(text)}<span aria-hidden="true"> ♪</span></button>'


def card(title, body):
    return f'<article class="basic2-info-card pi-card"><h4>{title}</h4>{body}</article>'


def grid(*parts):
    return '<div class="pi-grid">'+''.join(parts)+'</div>'


def note(text):
    return '<p class="pi-note">'+text+'</p>'


def ex(key, text, why='', voice='Narrator'):
    return '<p class="pi-example">'+say(key, text, voice)+'</p>'+('<p class="pi-small">'+why+'</p>' if why else '')


def topic(group, id, title, goal, body):
    topics.append(dict(group=group, id=id, title=title, goal=goal, body=body))


def vocab(items):
    return grid(*(card(say('word-'+key, word), '<p>'+meaning+'</p>') for key, word, meaning in items))


topic(1, 'everyday-habits', 'Everyday habits',
      'Understand words and expressions for food, activity and rest in everyday routines.',
      vocab([
          ('drink-water', 'drink water', 'Drink is the action; water is the thing you drink.'),
          ('have-breakfast', 'have breakfast', 'Eat the first meal of the day. Have is common with meal names.'),
          ('cook-at-home', 'cook at home', 'Prepare food in your own home.'),
          ('go-for-walk', 'go for a walk', 'Walk for a while, often for enjoyment.'),
          ('exercise', 'exercise', 'Do physical activity. As a general activity, exercise is uncountable.'),
          ('take-break', 'take a break', 'Stop an activity for a short time.'),
          ('rest', 'rest', 'Stop working or being active for a while.'),
          ('get-enough-sleep', 'get enough sleep', 'Sleep for the amount the speaker needs. Enough means sufficient.')
      ])+
      grid(card('A routine', ex('routine', 'I have breakfast at home and go for a walk after work.')+
                '<p>The present simple describes a regular pattern. <b>After work</b> tells us when the walk happens.</p>'),
           card('Words that belong together', '<p><b>have</b> breakfast · <b>drink</b> water · <b>take</b> a break · <b>get</b> enough sleep</p><p>These combinations are useful language chunks. “Take a break” names a short pause; “break” alone can have other meanings.</p>'))+
      note('Healthy living is the unit topic. The examples show how people describe everyday habits and choices in English.'))

frequency = [('always', 'always', 'On every occasion in the situation described.'),
             ('usually', 'usually', 'On most occasions.'),
             ('often', 'often', 'On many occasions.'),
             ('sometimes', 'sometimes', 'On some occasions.'),
             ('hardly-ever', 'hardly ever', 'Almost never.'),
             ('never', 'never', 'On no occasion in the situation described.')]
topic(1, 'frequency', 'How often: frequency adverbs',
      'Recognise frequency and the usual position of an adverb with a main verb or be.',
      '<div class="pi-process pi-frequency-scale" aria-label="Frequency from always to never">'+
      ''.join('<div>'+say('frequency-'+key, word)+'<p>'+meaning+'</p></div>' for key, word, meaning in frequency)+'</div>'+
      grid(card('Before a main verb', '<p><b>subject + frequency adverb + main verb</b></p>'+ex('usually', 'I usually cook at home.')+
                '<p>She <b>often walks</b> to work. The adverb tells us how often the action happens.</p>'),
           card('After be', '<p><b>subject + am/is/are + frequency adverb</b></p>'+ex('often-tired', 'I’m often tired after work.')+
                '<p>He <b>is usually</b> calm. Here, be connects the subject to a description.</p>'),
           card('Never already has a negative meaning', ex('never', 'I never skip breakfast.')+
                '<p>Use <b>I never skip</b>, not “I don’t never skip”. <b>Skip breakfast</b> means not having that meal.</p>'))+
      note('The scale shows an approximate order, not fixed percentages. <b>Every day</b> and <b>twice a week</b> are frequency phrases, usually placed at the end: “I walk twice a week.”'))

topic(1, 'routine-or-change', 'Routines and temporary changes',
      'Distinguish a regular pattern from an action or temporary change happening around now.',
      grid(card('A regular pattern', ex('usual-lunch', 'I usually bring lunch from home.')+
                '<p><b>Present simple:</b> a routine.<br>She brings lunch. She doesn’t buy lunch every day.<br><b>Does she bring lunch?</b> Yes, she does.</p>'),
           card('A temporary change', ex('temporary-lunch', 'This week, I’m buying lunch near work.')+
                '<p><b>Present continuous:</b> a change around now.<br>She is buying lunch this week. She isn’t cooking at home this week.<br><b>Is she buying lunch?</b> Yes, she is.</p>'))+
      '<div class="pi-compare"><div><p class="pi-label">Routine → do/does</p>'+ex('habit-question', 'What do you usually eat for lunch?')+
      '<p>“I usually eat rice and vegetables.”</p></div><div><p class="pi-label">Around now → am/is/are</p>'+ex('change-question', 'What are you eating this week?')+
      '<p>“I’m trying different lunches this week.”</p></div></div>'+
      note('<b>This week</b> can include times when the action is not happening at the exact moment of speaking. Time expressions help establish context, but the speaker’s intended meaning determines the tense. This develops the contrast introduced in Unit 2.'))

label_rows = [('Energy', '120 kcal', '240 kcal'), ('Fat', '4 g', '8 g'), ('Sugars', '3 g', '6 g'), ('Salt', '0.2 g', '0.4 g')]
topic(1, 'food-label', 'Understanding a food label',
      'Read serving size, amounts and units in an illustrated label.',
      '<figure class="pi-food-label"><figcaption><b>Fictional snack label</b> · One bag contains two servings.</figcaption><table><thead><tr><th scope="col">Information</th><th scope="col">Per serving<br>30 g</th><th scope="col">Per bag<br>60 g</th></tr></thead><tbody>'+
      ''.join('<tr><th scope="row">'+name+'</th><td>'+serving+'</td><td>'+bag+'</td></tr>' for name, serving, bag in label_rows)+
      '</tbody></table></figure>'+
      grid(card('Serving and package', '<p>A <b>serving</b> is the portion used for the listed values. A <b>bag</b> or <b>package</b> can contain more than one serving.</p>'+ex('serving', 'One serving is thirty grams. The bag contains two servings.')),
           card('Amounts and units', '<p><b>g = grams</b>; <b>kcal = kilocalories</b>, a unit of energy.</p>'+ex('label-amount', 'There are three grams of sugar in one serving.')+
                '<p>The column matters: the example shows <b>3 g per serving</b> and <b>6 g per bag</b>.</p>'),
           card('Language for quantities', '<p><b>How much sugar is there in one serving?</b><br>There are three grams.</p><p><b>How many servings are there in the bag?</b><br>There are two servings.</p><p>Sugar names a substance; servings are countable portions.</p>'))+
      note('These invented values illustrate English on a label. The two columns describe different amounts of the same product; they are not two different foods.'))

topic(2, 'how-you-feel', 'Describing how you feel',
      'Distinguish have + a noun from feel/be + an adjective.',
      vocab([('headache', 'a headache', 'Pain in the head.'), ('stomachache', 'a stomachache', 'Pain in the stomach area.'),
             ('sore-throat', 'a sore throat', 'A throat that hurts.'), ('cough', 'a cough', 'The noun for repeated coughing.'),
             ('cold', 'a cold', 'A common illness; different from feeling cold.'), ('tired', 'tired', 'Feeling a need to rest.'),
             ('stressed', 'stressed', 'Feeling pressure or worry.'), ('relaxed', 'relaxed', 'Feeling calm and at ease.')])+
      grid(card('Have + noun', ex('have-headache', 'I have a headache.')+
                '<p>I have <b>a cold</b>. She has <b>a sore throat</b>.<br>In these examples, the noun takes <b>a</b>.</p>'),
           card('Feel / be + adjective', ex('feel-tired', 'I feel tired. I’m tired.')+
                '<p>She feels stressed. She is stressed.<br>Use “I’m tired”, not “I have tired”.</p>'),
           card('Two different meanings', ex('cold-contrast', 'I have a cold, but I don’t feel cold.')+
                '<p><b>Have a cold</b> refers to an illness.<br><b>Feel cold</b> describes temperature sensation.</p>'))+
      note('The question <b>How do you feel?</b> asks about a current feeling or condition. “I feel tired” reports a feeling; it does not name its cause.'))

topic(2, 'should', 'Advice with should',
      'Understand advice, negative advice and questions using should + base verb.',
      grid(card('A recommendation', '<p><b>subject + should + base verb</b></p>'+ex('should-advice', 'You should talk to someone about the problem.')+
                '<p>Should presents something as a good idea. The form stays the same: <b>I should talk; she should talk</b>.</p>'),
           card('Negative advice', '<p><b>subject + shouldn’t + base verb</b></p>'+ex('shouldnt-advice', 'You shouldn’t try to do everything at once.')+
                '<p><b>Shouldn’t = should not.</b> It advises against an action.</p>'),
           card('Ask for advice', '<p><b>Should + subject + base verb?</b></p>'+ex('should-question', 'What should I do?')+ex('should-short-answer', 'Should I ask for help? Yes, you should.')+
                '<p>No, you shouldn’t. A full response can explain a reason.</p>'))+
      '<div class="pi-compare"><p><b>Correct:</b> She should rest.<br><b>Not:</b> She should rests.<br><b>Not:</b> She should to rest.</p><p>Should takes the <b>base verb</b>. Questions do not use do/does: <b>Should she rest?</b></p></div>')

topic(2, 'could', 'Suggestions with could',
      'Recognise could as a way to offer an option rather than an obligation.',
      grid(card('One possible option', '<p><b>subject + could + base verb</b></p>'+ex('could-option', 'You could take a short break.')+
                '<p>Could presents an available idea. Another option may also be possible.</p>'),
           card('More than one option', ex('could-alternatives', 'You could talk to a friend, or you could write your plans down.')+
                '<p><b>Or</b> connects alternatives. The speaker is offering suggestions.</p>'),
           card('Compare the purpose', ex('should-could', 'You should ask for help. You could speak to your teacher.')+
                '<p><b>Should</b> recommends a course of action.<br><b>Could</b> suggests one way to do it.</p>'))+
      note('Could has other uses in English. Here, it introduces a suggestion. It is not describing an ability in the past. Like should, it takes a base verb without to or a third-person s.'))

topic(2, 'obligation', 'Obligation and necessity',
      'Distinguish must, have to, mustn’t and don’t have to in clearly stated situations.',
      grid(card('Must', ex('must', 'At this library, visitors must keep their phones silent.')+
                '<p><b>must + base verb</b> expresses a strong requirement. It can communicate a rule or the speaker’s insistence.</p>'),
           card('Have to / has to', ex('have-to', 'I have to start work at eight. She has to start at nine.')+
                '<p><b>have/has to + base verb</b> expresses necessity or obligation, often because of circumstances or rules.</p><p><b>Does she have to start at nine?</b><br>Yes, she does. Use have after does.</p>'))+
      '<div class="pi-compare"><div><p class="pi-label">Prohibition</p>'+ex('mustnt', 'You mustn’t make phone calls in this reading room.')+
      '<p><b>Mustn’t = must not:</b> the action is not allowed by the stated rule.</p></div><div><p class="pi-label">No obligation</p>'+ex('dont-have-to', 'You don’t have to bring a printed copy. A digital copy is fine.')+
      '<p><b>Don’t/doesn’t have to:</b> the action is optional. It is not prohibited.</p></div></div>'+
      grid(card('Same necessity, different constructions', '<p>She <b>must arrive</b> on time.<br>She <b>has to arrive</b> on time.</p><p>Both can express necessity. The context matters; must is not always “personal” and have to is not always “external”.</p>'),
           card('Avoid changing the meaning', '<p><b>She doesn’t have to come.</b><br>Coming is optional.</p><p><b>She mustn’t come.</b><br>Coming is forbidden in the situation.</p>'))+
      note('The library and copy requirements are fictional contexts for comparing meanings. The examples do not set rules for this course.'))

topic(2, 'if-when', 'Habitual situations with if and when',
      'Understand a condition or situation and its usual result using present forms.',
      grid(card('When: a situation that happens', ex('when', 'When I feel tired, I take a break.')+
                '<p>The speaker describes what normally happens in that situation. Both verbs are in the present simple.</p>'),
           card('If: a condition', ex('if', 'If I have a busy morning, I bring lunch from home.')+
                '<p>If introduces a condition. The main clause describes the speaker’s usual response when that condition is met.</p>'),
           card('Third-person forms still matter', ex('when-she', 'When she feels stressed, she talks to a friend.')+
                '<p>She <b>feels</b>; she <b>talks</b>. If and when do not remove the usual present-simple verb endings.</p>'))+
      '<div class="pi-process"><div><b>Situation</b><p>When I feel tired,</p></div><span aria-hidden="true">→</span><div><b>Usual response</b><p>I take a break.</p></div></div>'+
      grid(card('The order can change', '<p><b>When I feel tired, I take a break.</b><br><b>I take a break when I feel tired.</b></p><p>A comma normally follows an introductory if/when clause. It is usually unnecessary when that clause comes last.</p>'),
           card('A question about a usual response', ex('when-question', 'What do you do when you feel stressed?')+
                '<p>“I usually talk to a friend.” The question asks about a repeated response.</p>'))+
      note('This section covers habitual meanings, often called the <b>zero conditional</b> with if. It does not introduce hypothetical situations or future predictions.'))

topic(3, 'demanding-day', 'A demanding day',
      'Understand words for daily demands, feelings, pauses and rest.',
      vocab([('busy', 'busy', 'Having many things to do.'), ('deadline', 'a deadline', 'The time by which something must be finished.'),
             ('pressure', 'pressure', 'Demands that make a situation feel difficult.'), ('free-time', 'free time', 'Time outside work and other responsibilities.'),
             ('relax', 'relax', 'Become less tense or spend time at ease.'), ('routine', 'a routine', 'A regular way of doing things.')])+
      grid(card('Describe demands and feelings', ex('busy-day', 'I have a busy morning, and I sometimes feel stressed.')+
                '<p><b>Have + noun:</b> I have a deadline.<br><b>Feel + adjective:</b> I feel stressed.</p>'),
           card('Explain a reason', ex('reason', 'I’m organising my tasks because this week is busy.')+
                '<p><b>Because</b> introduces the reason. <b>This week</b> supports a temporary situation here.</p>'))+
      note('<b>Stressed</b> describes how someone feels; <b>stressful</b> describes something that causes that feeling. “I feel stressed” and “This is a stressful week” have different subjects and meanings.'))

topic(3, 'hours-frequency', 'Hours, duration and frequency',
      'Recognise whether a question asks for a number of hours, a duration or a frequency.',
      grid(card('How many hours…?', ex('hours-question', 'How many hours do you sleep at night?')+
                '<p>“About seven hours.” <b>Hours</b> is a plural countable noun. This asks for a number of hours, not a number of occasions.</p>'),
           card('How often…?', ex('frequency-question', 'How often do you go for a walk?')+
                '<p>“Three times a week.” This asks about frequency.</p>'),
           card('How long…?', ex('duration-question', 'How long does your lunch break last?')+
                '<p>“Thirty minutes.” This asks about duration; the answer can use minutes or hours.</p>'))+
      '<div class="pi-compare"><p><b>Number of hours:</b> How many hours do you work a day?<br>I work eight hours a day.</p><p><b>Frequency:</b> How often do you work late?<br>I sometimes work late.</p></div>'+
      note('The numbers are fictional answers that illustrate question meanings. “How much hours” is incorrect: use <b>How many hours</b>. After does, use <b>last</b>, not lasts.'))

topic(3, 'could-try', 'You could try…',
      'Understand the two verb patterns inside a suggestion with could try.',
      '<div class="pi-process"><div><b>Could + base verb</b><p>You could <b>try</b></p></div><span aria-hidden="true">→</span><div><b>Try + activity in -ing</b><p><b>taking</b> a short break.</p></div></div>'+
      grid(card('Suggest an activity as an option', ex('try-break', 'You could try taking a short break.')+
                '<p><b>Could try</b> introduces the suggestion. <b>Taking</b> names the activity to try.</p>'),
           card('Another complete example', ex('try-list', 'You could try making a short list before you start.')+
                '<p>The clause <b>before you start</b> places the suggested activity in time.</p>'),
           card('Try doing and try to do', '<p><b>Try doing something</b> can mean testing an approach to see whether it helps.</p><p><b>Try to do something</b> means making an effort to do it.</p><p>Both patterns exist. This section focuses on suggestions with <b>try + -ing</b>.</p>'))+
      note('Correct: <b>You could try taking…</b> Avoid “You could to try…” and “You could tries…”. The -ing form here names an activity; it is not a present continuous tense.'))

topic(3, 'intentions', 'Personal intentions with going to',
      'Recognise an intention and form statements, negatives and questions with be going to.',
      grid(card('An intention', '<p><b>subject + am/is/are + going to + base verb</b></p>'+ex('going-to', 'I’m going to organise my evening.')+
                '<p>The speaker has an intention. <b>I’m</b> supplies am; the main action is <b>organise</b>.</p>'),
           card('Other subjects and a negative', ex('going-to-she', 'She’s going to make a list. We’re going to leave earlier.')+ex('going-to-negative', 'I’m not going to work late tonight.')+
                '<p>She isn’t going to work late. They aren’t going to stay.</p>'),
           card('Questions and short answers', '<p><b>Am/Is/Are + subject + going to + base verb?</b></p>'+ex('going-to-question', 'Are you going to change your evening routine?')+ex('going-to-answer', 'Yes, I am. No, I’m not.')+
                '<p><b>What are you going to change?</b><br>I’m going to finish earlier.</p>'))+
      '<div class="pi-compare"><div><b>Habit</b><p>I usually make a list.</p></div><div><b>Temporary change</b><p>I’m making a list this week.</p></div><div><b>Intention</b><p>I’m going to make a list tonight.</p></div></div>'+
      note('Keep both parts: <b>I am going to rest</b>, not “I going to rest”. Use a base verb after to: <b>going to rest</b>, not “going to resting”. These examples concern intentions, rather than physical movement to a place.'))

dialogues = [
    ('Habits interview', [
        ('Laura', 'Hi, Mateo. What do you usually do after work?'),
        ('Mateo', 'I usually cook at home, but this week I’m buying dinner near work.'),
        ('Laura', 'Why are you changing your routine?'),
        ('Mateo', 'I have a lot of work this week. I’m going to cook at home again next week.')]),
    ('A problem and a suggestion', [
        ('Laura', 'I feel stressed because I have too many tasks today.'),
        ('Mateo', 'You should ask for help. You could talk to your teacher.'),
        ('Laura', 'That’s a good idea. What do you do when you feel stressed?'),
        ('Mateo', 'I usually make a short list. You could try doing that too.')])
]
model_parts = []
for j, (title, lines) in enumerate(dialogues, 1):
    keys = [f'u3-dialogue-{j}-{i}' for i in range(1, len(lines)+1)]
    model_parts.append('<h4 class="pi-model-heading">'+title+'</h4><button type="button" class="btn btn-primary pi-button" data-playlist="'+','.join(keys)+'">Listen to '+('the habits interview' if j == 1 else 'the suggestion dialogue')+'</button><div class="pi-dialogue">'+
                       ''.join('<article class="pi-dialogue-line"><span class="pi-label">'+role+'</span>'+say(f'dialogue-{j}-{i}', text, role)+'</article>' for i, (role, text) in enumerate(lines, 1))+'</div>')
plan = 'I usually study after work, but this week I’m finishing a project. I sometimes feel stressed when I have several deadlines. When that happens, I make a short list and ask for help. Tonight, I’m going to finish one task and take a break. I’m not going to work on every task at the same time.'
topic(4, 'complete-models', 'Complete language models',
      'Notice how complete examples connect habits, a temporary change, advice and an intention.',
      '<p>These fictional conversations and the paragraph below are worked examples. The speaker labels identify voices and are not spoken in the recordings.</p>'+''.join(model_parts)+
      grid(card('A personal plan: explained model', ex('plan-model', plan)),
           card('How the paragraph works', '<ol><li><b>I usually study</b> establishes a habit.</li><li><b>This week I’m finishing</b> explains a temporary situation.</li><li><b>When that happens</b> connects a situation to a usual response.</li><li><b>I’m going to finish</b> states an intention.</li><li><b>I’m not going to work</b> states a negative intention.</li></ol>')))

expressions = [
    ('cut-down', 'Phrasal verb', 'cut down on', 'reducir la cantidad o frecuencia de algo', 'Do or use less of something.', 'Everyday, neutral. Keep on before the noun or activity.', 'I’m going to cut down on late-night screen time.'),
    ('give-up', 'Phrasal verb', 'give up', 'dejar de hacer algo', 'Stop an activity or habit.', 'Everyday, neutral in this use. Follow it with a noun or an -ing activity; with an object pronoun: give it up.', 'She wants to give up working late every evening.'),
    ('wind-down', 'Phrasal verb', 'wind down', 'relajarse después de un periodo de actividad', 'Gradually relax after being busy.', 'Everyday, conversational. Here wind is pronounced like the verb in wind a clock.', 'I read a short story to wind down after work.'),
    ('under-weather', 'Idiom', 'under the weather', 'sentirse un poco indispuesto', 'Feel slightly unwell.', 'Informal, common. It describes a feeling without naming a specific illness.', 'I’m feeling under the weather today.'),
    ('recharge', 'Idiom', 'recharge your batteries', 'recuperar energías o descansar', 'Rest and feel ready for activity again.', 'Conversational, figurative. Change your to my, her or our to match the person.', 'I like a quiet weekend to recharge my batteries.')
]
expressions_html = grid(*(card('<span class="pi-label">'+kind+'</span>'+say(key, phrase),
                              '<p class="pi-spanish">'+spanish+'</p><p>'+meaning+'</p><p class="pi-small"><b>Use:</b> '+register+'</p>'+ex(key+'-example', sample))
                         for key, kind, phrase, spanish, meaning, register, sample in expressions))
topic(4, 'healthy-expressions', 'Useful expressions in context',
      'Distinguish phrasal verbs from idioms and recognise their meaning, form and register.',
      expressions_html+note('<b>Take a break</b> is a useful everyday combination, not a phrasal verb. <b>Recharge your batteries</b> is figurative here; no physical batteries are involved. The same five expressions appear in the expression library.'))

topic(4, 'unit-3-summary', 'Unit summary',
      'Recognise the vocabulary and grammar connected by the unit.',
      '<ul class="pi-checklist">'+''.join('<li>'+item+'</li>' for item in [
          'I can understand descriptions of everyday habits and frequency.',
          'I can distinguish a routine from a temporary change.',
          'I can understand amounts and serving information on an example label.',
          'I can describe feelings with have, feel and be.',
          'I can distinguish advice, a suggestion and an obligation.',
          'I can distinguish a prohibition from the absence of an obligation.',
          'I can understand habitual situations with if and when.',
          'I can distinguish questions about hours, duration and frequency.',
          'I can understand suggestions with could try + -ing.',
          'I can explain an intention with be going to.'
      ])+'</ul>')

clusters = [
    (1, 'healthy-habits', 'Healthy Habits and Eating', 'Everyday habits, frequency, temporary changes and food-label language.'),
    (2, 'recommendations', 'Aches, Pains and Recommendations', 'Feelings, advice, suggestions, obligation and habitual situations.'),
    (3, 'stress-relaxation', 'Stress and Relaxation', 'Daily demands, time questions, suggestions and personal intentions.'),
    (4, 'language-context', 'Language in Context', 'Explained models, useful expressions and the unit summary.')
]
