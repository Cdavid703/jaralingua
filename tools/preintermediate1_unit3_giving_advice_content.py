"""Complementary session-7 grammar authored for Jaralingua; not an original ESL Pals exercise."""
TITLE='Giving Advice'
AUDIO_ROOT='/ingles/preintermedio-1/audio/unit3/giving-advice/'
INSTRUCTIONS={
 'advice':'Complete each gap with the words in brackets and the modal named in the prompt. Write only the missing words. Use should for advice, should not for negative advice, and could for a possible suggestion.',
 'obligation':'Complete each gap with a form of must or have to and the verb in brackets. Read whether the situation describes a requirement, something forbidden, or something optional. For the last two questions, use have to as requested.',
 'situations':'Complete each gap with the present simple form of the words in brackets. These if and when sentences describe habitual situations and usual responses. Write only the missing words, including the subject where it appears in brackets.'}
ADVICE=[]
for n,(prompt,answer,model,explanation) in enumerate([
 ('Nora feels tired after a busy morning. Use should: You ___ a short break. (take)','should take','You should take a short break.','Should takes the base verb take. The sentence gives advice.'),
 ('Sam has a sore throat. Use should: He ___ to a healthcare professional. (talk)','should talk','He should talk to a healthcare professional.','Use should + talk, without to between should and the base verb. The fictional example practises a recommendation.'),
 ('Leo is trying to do everything alone. Use shouldn’t: He ___ every problem alone. (try to solve)','should not try to solve','He should not try to solve every problem alone.','Should not + try gives negative advice. Keep to solve after try. Shouldn’t is also accepted.'),
 ('Ask for advice with should: What ___? (I / do)','should I do','What should I do?','Use should + subject I + base verb do. Do not add do as a question auxiliary.'),
 ('Offer an option with could: We ___ a quieter place to study. (choose)','could choose','We could choose a quieter place to study.','Could + choose presents one possible suggestion; it does not express an obligation.'),
 ('Give negative advice with shouldn’t: You ___ your appointments. (forget)','should not forget','You should not forget your appointments.','Should not is followed by the base verb forget. Shouldn’t is also accepted.'),
 ('Ask for advice with should: ___ for help? (she / ask)','should she ask','Should she ask for help?','In a question, should comes before she. Use ask, without a third-person s.'),
 ('Mia wants an idea for organising a busy day. Use could: She ___ her tasks. (write down)','could write down','She could write down her tasks.','Could + write down offers an option. Keep the base form write, even with she.')],1):
 ADVICE.append(dict(id=f'advice-{n}',number=n,prompt=prompt,answer=answer,accepted=[answer],model=model,explanation=explanation))
OBLIGATION=[]
for n,(prompt,answer,alternatives,model,explanation) in enumerate([
 ('Fictional clinic rule: every visitor is required to sign in. Visitors ___ at reception. (sign in)','must sign in',['have to sign in'],'Visitors must sign in at reception.','Both must sign in and have to sign in express the stated requirement and are accepted. The audio gives one model.'),
 ('Fictional class rule: a group badge is required for Mia. Mia ___ her group badge. (wear)','has to wear',['must wear'],'Mia has to wear her group badge.','Use has to with Mia, followed by wear. Must wear is also accepted; must does not change with the subject.'),
 ('A printed copy is optional; a digital copy is fine. Students ___ a printed copy. (bring)','do not have to bring',[],'Students do not have to bring a printed copy.','Do not have to means there is no requirement. Must not would wrongly mean that bringing a copy is forbidden. Don’t have to is also accepted.'),
 ('The extra support session is optional for Ben. Ben ___ it. (attend)','does not have to attend',[],'Ben does not have to attend it.','Use does not have to + attend with Ben. Optional means he may attend; he is not required to. Doesn’t have to is also accepted.'),
 ('Fictional reading-room rule: phone calls are forbidden. You ___ phone calls here. (make)','must not make',[],'You must not make phone calls here.','Must not expresses the stated prohibition. Do not have to would mean optional and would change the meaning. Mustn’t is also accepted.'),
 ('Fictional classroom rule: opening private folders is forbidden. Visitors ___ private folders. (open)','must not open',[],'Visitors must not open private folders.','Must not + open means the action is prohibited by the rule. Mustn’t is also accepted.'),
 ('Ask about a requirement using have to: ___ at reception? (we / sign in)','do we have to sign in',[],'Do we have to sign in at reception?','Use do + we + have to + sign in. The task specifically requests a question with have to.'),
 ('Ask about Mia’s requirement using have to: ___ her group badge? (Mia / wear)','does Mia have to wear',[],'Does Mia have to wear her group badge?','Use does + Mia + have to + wear. After does, use have, not has.')],1):
 OBLIGATION.append(dict(id=f'obligation-{n}',number=n,prompt=prompt,answer=answer,accepted=[answer]+alternatives,model=model,explanation=explanation))
SITUATIONS=[]
for n,(prompt,answer,model,explanation) in enumerate([
 ('When I feel tired, I ___ a short break. (take)','take','When I feel tired, I take a short break.','Use take with I to describe the usual response. Both clauses use the present simple.'),
 ('If she has a busy day, she ___ a list. (make)','makes','If she has a busy day, she makes a list.','With she, add s: makes. If introduces a condition with a habitual response here.'),
 ('He ___ work messages when he relaxes at home. (not / check)','does not check','He does not check work messages when he relaxes at home.','Use does not + the base verb check with he. Doesn’t check is also accepted.'),
 ('What ___ when you feel stressed? (you / do)','do you do','What do you do when you feel stressed?','For this present simple question, use auxiliary do + you + main verb do.'),
 ('If our classroom is noisy, we ___ a quieter room. (choose)','choose','If our classroom is noisy, we choose a quieter room.','Use choose with we. This describes a usual response, not a future prediction.'),
 ('When Mia ___ tired, she talks to a classmate. (feel)','feels','When Mia feels tired, she talks to a classmate.','The subject Mia takes feels. When does not remove the present simple third-person ending.'),
 ('If I have an early class, I ___ late. (not / stay up)','do not stay up','If I have an early class, I do not stay up late.','Use do not + stay up with I. Don’t stay up is also accepted.'),
 ('What ___ when he needs help? (Ben / do)','does Ben do','What does Ben do when he needs help?','Use does + Ben + base verb do. The other clause has needs because its subject is he.')],1):
 SITUATIONS.append(dict(id=f'situations-{n}',number=n,prompt=prompt,answer=answer,accepted=[answer],model=model,explanation=explanation))
TASKS={'advice':ADVICE,'obligation':OBLIGATION,'situations':SITUATIONS}
EXAMPLES={
 'advice':dict(id='example-advice',text='I feel stressed. You should ask for help. You could talk to a classmate.'),
 'obligation':dict(id='example-obligation',text='A rule can require an action: you must sign in. An optional action is different: you do not have to bring a printed copy.'),
 'situations':dict(id='example-situations',text='When she feels tired, she takes a break. If I have a busy morning, I make a list.')}
VOCABULARY=[dict(term=t,spanish=s,audio=AUDIO_ROOT+'word-'+slug+'.mp3') for t,s,slug in [
 ('sore throat','dolor de garganta; garganta irritada o adolorida','sore-throat'),('healthcare professional','profesional de la salud','healthcare-professional'),('take a short break','tomar un descanso breve','take-a-short-break'),('appointments','citas o compromisos programados','appointments'),('write down','anotar; poner algo por escrito','write-down'),('required','obligatorio; que se exige en la situación descrita','required'),('sign in','registrar la llegada; aquí, anotarse al llegar a recepción','sign-in'),('reception','recepción; lugar donde se recibe a los visitantes','reception'),('group badge','distintivo o identificación del grupo','group-badge'),('optional','opcional; que se puede hacer, pero no es obligatorio','optional'),('attend','asistir a una clase, reunión o sesión','attend'),('forbidden','prohibido; que no está permitido','forbidden'),('private folders','carpetas privadas','private-folders'),('stressed','estresado o estresada; bajo presión','stressed'),('noisy','ruidoso o ruidosa','noisy'),('stay up','quedarse despierto o despierta; no acostarse todavía','stay-up')]]
AUDIO={}
for k,text in INSTRUCTIONS.items():AUDIO['instruction-'+k]=dict(text=text,path=AUDIO_ROOT+'instruction-'+k+'.mp3',kind='instruction')
for e in EXAMPLES.values():AUDIO[e['id']]=dict(text=e['text'],path=AUDIO_ROOT+e['id']+'.mp3',kind='worked-example')
for items in TASKS.values():
 for i in items:AUDIO[i['id']]=dict(text=i['model'],path=AUDIO_ROOT+i['id']+'.mp3',kind='gated-model')
for v in VOCABULARY:AUDIO['word-'+v['audio'].rsplit('word-',1)[1].removesuffix('.mp3')]=dict(text=v['term'],path=v['audio'],kind='vocabulary')
