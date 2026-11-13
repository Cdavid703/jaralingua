"""Authored complementary session-8 grammar; fictional schedules, suggestions and intentions."""
TITLE='Stress and Relaxation'
AUDIO_ROOT='/ingles/preintermedio-1/audio/unit3/stress-relaxation/'
INSTRUCTIONS={
 'hours':'Complete the gaps with the present simple form of the words in brackets. The questions ask about a usual number of hours. In the two answers, include the given number and the word hours. Write only the missing words.',
 'suggestions':'Complete each gap using could try followed by the activity in the ing form. Use the words in brackets, and write only the missing words. Each sentence offers a possible activity to try.',
 'plans':'Complete each gap with am, is or are going to and the base verb in brackets. For negative sentences, put not before going to. Include the subject where it appears in brackets. These sentences describe intentions that the people have already decided on.'}
HOURS=[]
for n,(prompt,answer,model,explanation) in enumerate([
 ('How many hours ___ at night? (you / sleep)','do you sleep','How many hours do you sleep at night?','Use do + you + the base verb sleep. How many hours asks for a number of hours, not how often something happens.'),
 ('How many hours ___ each day? (Mia / work)','does Mia work','How many hours does Mia work each day?','With Mia, use does + Mia + the base verb work, without an s after does.'),
 ('How many hours ___ on Saturdays? (your classmates / study)','do your classmates study','How many hours do your classmates study on Saturdays?','Your classmates is plural. Use do + subject + study.'),
 ('How many hours ___ each week? (Ben / spend studying)','does Ben spend studying','How many hours does Ben spend studying each week?','Use does + Ben + spend. Keep studying after spend in this expression.'),
 ('Complete the fictional answer: “How many hours do you work each day?” “I ___ each day.” (work / eight hours)','work eight hours','I work eight hours each day.','Keep the base form work with I and include eight hours. The numeral 8 is also accepted.'),
 ('Complete the fictional answer: “How many hours does Mia work each day?” “She ___ each day.” (work / six hours)','works six hours','She works six hours each day.','With she, use works in an affirmative answer. Include six hours; the numeral 6 is also accepted.'),
 ('How many hours ___ at the learning centre each week? (they / spend)','do they spend','How many hours do they spend at the learning centre each week?','Use do + they + spend. The question asks about their usual total time in hours.'),
 ('How many hours ___ each night? (your brother / sleep)','does your brother sleep','How many hours does your brother sleep each night?','Your brother is singular. Use does + subject + sleep, without sleeps.')],1):
 HOURS.append(dict(id=f'hours-{n}',number=n,prompt=prompt,answer=answer,accepted=[answer],model=model,explanation=explanation))
SUGGESTIONS=[]
for n,(prompt,answer,model,explanation) in enumerate([
 ('You ___ a short break. (could / try / take)','could try taking','You could try taking a short break.','After could, use base-form try. After try, use taking to name an activity to test.'),
 ('She ___ soft music after work. (could / try / listen to)','could try listening to','She could try listening to soft music after work.','Use could try listening to. Could does not take a third-person s, and listen keeps the preposition to.'),
 ('We ___ a short list before we start. (could / try / make)','could try making','We could try making a short list before we start.','Make loses its final e before ing: making. Try making suggests testing this approach.'),
 ('He ___ his tasks. (could / try / write down)','could try writing down','He could try writing down his tasks.','Write becomes writing. Keep down as part of write down.'),
 ('You ___ to a friend about your busy day. (could / try / talk)','could try talking','You could try talking to a friend about your busy day.','Could try talking offers an option. The ing form names the activity; it is not a present continuous tense.'),
 ('They ___ fewer windows open on the laptop. (could / try / keep)','could try keeping','They could try keeping fewer windows open on the laptop.','Use could try keeping. Fewer refers to a smaller number of the windows described here.'),
 ('Mia ___ home earlier in the morning. (could / try / leave)','could try leaving','Mia could try leaving home earlier in the morning.','Leave loses its final e before ing: leaving. This gives one possible suggestion, not an obligation.'),
 ('We ___ for a walk after class. (could / try / go)','could try going','We could try going for a walk after class.','Use could + try + going. Keep the for a walk phrase that follows the gap.')],1):
 SUGGESTIONS.append(dict(id=f'suggestions-{n}',number=n,prompt=prompt,answer=answer,accepted=[answer],model=model,explanation=explanation))
PLANS=[]
for n,(prompt,answer,model,explanation) in enumerate([
 ('My intention: Tonight, I ___ my evening. (plan)','am going to plan','Tonight, I am going to plan my evening.','With I, use am going to + base verb plan. This expresses a decided intention.'),
 ('Mia has decided: She ___ earlier tonight. (finish)','is going to finish','She is going to finish earlier tonight.','With she, use is going to + finish. Keep finish in the base form.'),
 ('Our intention: We ___ late tonight. (not / work)','are not going to work','We are not going to work late tonight.','With we, use are not going to + work. Aren’t going to work is also accepted.'),
 ('Ask about their intention: ___ a short list? (they / make)','are they going to make','Are they going to make a short list?','For a question, put are before they, followed by going to + make.'),
 ('Ask about your classmate’s intention: What ___ after class? (you / do)','are you going to do','What are you going to do after class?','Use are + you + going to + the base verb do. Do is the main verb, not a question auxiliary here.'),
 ('They have decided: They ___ a walk after lunch tomorrow. (take)','are going to take','They are going to take a walk after lunch tomorrow.','With they, use are going to + take. The context states a decided intention.'),
 ('Ben has decided: He ___ work messages tonight. (not / check)','is not going to check','He is not going to check work messages tonight.','Use is not going to + check with he. Isn’t going to check is also accepted.'),
 ('Complete Nora’s intention: “Tomorrow, ___ time for a break.” (I / make)','I am going to make','Tomorrow, I am going to make time for a break.','Include I from the brackets, then am going to + make. I’m going to make is also accepted.')],1):
 PLANS.append(dict(id=f'plans-{n}',number=n,prompt=prompt,answer=answer,accepted=[answer],model=model,explanation=explanation))
TASKS={'hours':HOURS,'suggestions':SUGGESTIONS,'plans':PLANS}
EXAMPLES={
 'hours':dict(id='example-hours',text='How many hours do you study each week? I study four hours each week.'),
 'suggestions':dict(id='example-suggestions',text='You could try taking a short break. She could try making a short list.'),
 'plans':dict(id='example-plans',text='I am going to make a list tonight. We are not going to work late. Are you going to take a break?')}
VOCABULARY=[dict(term=t,spanish=s,audio=AUDIO_ROOT+'word-'+slug+'.mp3') for t,s,slug in [
 ('at night','por la noche','at-night'),('on Saturdays','los sábados','on-saturdays'),('classmates','compañeros y compañeras de clase','classmates'),('spend studying','dedicar tiempo a estudiar','spend-studying'),('each day','cada día','each-day'),('soft music','música suave','soft-music'),('write down','anotar; poner algo por escrito','write-down'),('tasks','tareas o actividades por realizar','tasks'),('fewer','menos; para una cantidad menor de elementos contables','fewer'),('windows','ventanas; aquí, ventanas abiertas en el computador','windows'),('leave home','salir de casa','leave-home'),('intention','intención; algo que una persona tiene decidido hacer','intention'),('tonight','esta noche','tonight'),('earlier','más temprano; antes de la hora habitual o prevista','earlier'),('make time for','reservar o encontrar tiempo para algo','make-time-for'),('a break','un descanso; una pausa breve en una actividad','a-break')]]
AUDIO={}
for k,text in INSTRUCTIONS.items():AUDIO['instruction-'+k]=dict(text=text,path=AUDIO_ROOT+'instruction-'+k+'.mp3',kind='instruction')
for e in EXAMPLES.values():AUDIO[e['id']]=dict(text=e['text'],path=AUDIO_ROOT+e['id']+'.mp3',kind='worked-example')
for items in TASKS.values():
 for i in items:AUDIO[i['id']]=dict(text=i['model'],path=AUDIO_ROOT+i['id']+'.mp3',kind='gated-model')
for v in VOCABULARY:AUDIO['word-'+v['audio'].rsplit('word-',1)[1].removesuffix('.mp3')]=dict(text=v['term'],path=v['audio'],kind='vocabulary')
