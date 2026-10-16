"""Original scaffolded reported-speech explanations and public Sarah audio scripts."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = {
'rs-meaning': 'Indirect speech lets us pass on another person\'s message. Direct speech repeats their exact words. Indirect speech tells us who spoke and expresses the message from the reporter\'s point of view. Keep the meaning, even when the grammar changes.',
'rs-four-steps': 'Maya says, I am worried about my family. Later, Luis reports her message. First, name the speaker: Maya said. Next, identify the people: I means Maya, and my means Maya\'s. Then, use a past reporting form: am becomes was. Finally, join the ideas without quotation marks. Maya said that she was worried about her family.',
'rs-family-direct': 'I am worried about my family.',
'rs-family-report': 'Maya said that she was worried about her family.',
'rs-sentence-parts': 'Maya told Luis that she was worried. Maya is the original speaker. Told is the reporting verb. Luis is the listener. That connects the two parts. She was worried is the message. The message needs its own subject and verb.',
'rs-negative-direct': 'We do not have electricity.',
'rs-negative-report': 'The residents said that they did not have electricity.',
'rs-pronouns': 'Ask who each word refers to. Maya tells Luis, I can help you. Luis reports, Maya told me that she could help me. I becomes she because it refers to Maya. You becomes me because Luis was the listener and is now the reporter.',
'rs-reference-report': 'Maya told me that she could help me.',
'rs-present-direct': 'We need clean water.',
'rs-present-report': 'The residents said that they needed clean water.',
'rs-continuous-direct': 'We are checking the roof.',
'rs-continuous-report': 'The engineers said that they were checking the roof.',
'rs-perfect-direct': 'I have checked the source.',
'rs-perfect-report': 'The journalist said that she had checked the source.',
'rs-calendar': 'On Tuesday, the spokesperson says, We will publish the repair plan tomorrow. Tomorrow means Wednesday. On Thursday, a reporter says, The spokesperson said they would publish the repair plan the following day. The following day means the day after Tuesday: Wednesday. The report repeats the promise; it does not confirm that the plan was published.',
'rs-no-backshift': 'Backshift is common after said or told, but it is not automatic in every situation. Maya says that she is worried reports a current message. If information is still true, a present form can remain appropriate after said. A past form in a report does not, by itself, mean that the situation has ended.',
'rs-question-command': 'First identify the message. A statement gives information: Maya said that the road was closed. A question asks for information: Maya asked where the shelter was. An instruction asks someone to act: The officer told us to wait. These messages use different reporting patterns.'
}

def prepare_models():
    path=ROOT/'ingles/intermediate-2/audio/unit-6-explanation/models.json'
    data=json.loads(path.read_text());known={x['id']:x for x in data['items']}
    for key,text in SCRIPTS.items():
        if key in known:
            assert known[key]['text']==text, 'Use a new recording ID when changing a published script.'
        else:data['items'].append(dict(id=key,file=key+'.mp3',text=text,kind='model'))
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

def panel(key,title,body):
    return f'<details class="u6-topic-group u6-explainer" id="{key}"><summary><h3>{title}</h3></summary><div class="u6-group-body"><button type="button" class="intermediate2-button u6-project-explainer" aria-haspopup="dialog">Project this explanation ↗</button><div class="u6-explainer-body">{body}</div></div></details>'

def render_definition(model,scene,grid,note,table,card,say):
    intro=note('Start with the purpose: pass on a message',
      '<b>Indirect speech tells someone what another person said, using a new sentence.</b> We name the speaker and report the message from our own point of view. In this lesson, <b>reported speech</b> refers to this indirect way of reporting. We use it in conversations, interviews and news reports.')
    intro+='<p>'+say('rs-meaning','Listen: what is indirect speech?')+'</p>'
    intro+=grid(scene('witness-interview','Maya speaks to the reporter',model('direct-worried')+'<p><b>Direct speech:</b> Maya’s exact words appear inside quotation marks: “I am worried about the library.” <b>I</b> is Maya speaking about herself.</p>'),scene('reporting-the-interview','The reporter tells his editor',model('reported-worried')+'<p><b>Indirect speech:</b> the reporter names Maya and reports her message. He uses <b>she</b> to refer to Maya. The reported sentence does not use quotation marks around her message.</p>'))
    intro+=panel('rs-same-message','Same person. Same message. A different point of view.',
      '<div class="u6-report-route"><div><b>1 · Original speaker</b><p>Maya: “<mark>I</mark> <mark>am</mark> worried.”</p><small>I = Maya.</small></div><div><b>2 · Reporter</b><p>Luis listens to Maya.</p><small>He will pass on her message.</small></div><div><b>3 · New listener</b><p>Luis tells his editor: Maya said that <mark>she</mark> <mark>was</mark> worried.</p><small>She still means Maya.</small></div></div>'+note('Notice the two parts','<b>Maya said</b> identifies the source. <b>She was worried</b> is the message. The past form <b>was</b> looks back at Maya’s earlier words; it does not tell us whether she has stopped worrying.'))
    intro+=panel('rs-build-report','Build one report in four steps',
      '<p><b>Situation:</b> Maya speaks to Luis after the storm. Later, Luis tells his editor what she said.</p>'+model('rs-family-direct')+
      '<ol class="u6-report-steps"><li><b>1 · Name the speaker.</b><p>Who spoke? Maya. Start with <strong>Maya said…</strong></p></li><li><b>2 · Identify the people.</b><p><strong>I → she</strong> and <strong>my → her</strong>, because both refer to Maya. The family belongs to Maya, not to Luis.</p></li><li><b>3 · Look back at the original words.</b><p>With <strong>said</strong>, use the common backshift: <strong>am worried → was worried</strong>.</p></li><li><b>4 · Join and check.</b><p>Add <strong>that</strong> if you want to. Remove the quotation marks. Keep the same message about Maya and her family.</p></li></ol>'+
      '<div class="u6-report-result"><b>The complete report</b>'+model('rs-family-report')+'</div><p>'+say('rs-four-steps','Listen to the four steps')+'</p>')
    intro+=grid(card('Reporting an event','<p><b>The storm damaged the roof.</b></p><p>This sentence tells us what happened. It does not name a person whose words we are reporting.</p>'),card('Reporting someone’s words','<p><b>Maya said that the storm had damaged the roof.</b></p><p>This sentence tells us what Maya said. It identifies her as the source of the message.</p>'))
    intro+=note('Preserve the meaning, not every word','“I am worried” does not mean “I am terrified.” Keep names, numbers, negatives and the level of certainty faithful to the original. Reporting a claim does not prove that it is true.')
    return intro

def render_say_tell(model,scene,grid,note,table,card,say):
    return (note('Choose the frame before changing the message','Use <b>said</b> to introduce what someone said. Use <b>told + listener</b> when you name the person who received the message.')+model('said-told')+
      table(['Frame','Complete model','What to notice'],[
      ['Speaker + said + (that) + message','Maya said (that) she was worried.','No listener is needed after said.'],
      ['Speaker + told + listener + (that) + message','Maya told Luis (that) she was worried.','Luis is the person she spoke to. Use me, us, him, her, them or a name.'],
      ['Speaker + said to + listener','Maya said to Luis, “I am worried.”','Before the listener, use the preposition <b>to</b>. You can also say: Maya said to Luis that she was worried.']])+
      panel('rs-sentence-frame','See how the sentence is built',
      '<div class="u6-report-parts"><span><small>Speaker</small><b>Maya</b></span><span><small>Reporting verb</small><b>told</b></span><span><small>Listener</small><b>Luis</b></span><span><small>Optional link</small><b>that</b></span><span><small>Message: subject + verb</small><b>she was worried.</b></span></div><p>'+say('rs-sentence-parts','Listen to the sentence parts')+'</p>'+note('Why do we need she?','The report contains two ideas: <b>Maya told Luis</b> and <b>she was worried</b>. The message needs its own subject. “Maya said was worried” is incomplete.'))+
      grid(card('That is optional','<p><b>Maya said that she was worried.</b><br><b>Maya said she was worried.</b></p><p>Both are correct. That connects the reporting verb to the message. It is not a pronoun replacing Maya.</p>'),card('Keep the negative in the right place','<p>“I am not ready.” → Maya said she <b>was not ready</b>.</p><p><b>Maya did not say she was ready</b> is different: it says that she did not make that statement.</p>'))+
      panel('rs-negative-message','A negative message stays negative',
      '<p><b>The residents’ original words:</b></p>'+model('rs-negative-direct')+'<p><b>A later report:</b></p>'+model('rs-negative-report')+
      '<p><b>We → they</b> because the journalist is talking about the residents. <b>Do not have → did not have</b> when backshifting. After <b>did not</b>, use the base form <b>have</b>, not <b>had</b>.</p>')+
      table(['Avoid','Use','Why'],[
      ['She said me the news.','She told me the news.','Tell takes a listener directly; say needs to before a listener.'],
      ['She told that she was worried.','She told us that she was worried.','Told needs a listener in this statement pattern.'],
      ['She said was worried.','She said she was worried.','The reported message needs its own subject.'],
      ['They said they did not had electricity.','They said they did not have electricity.','After did not, use the base form.']]))

def render_changes(model,scene,grid,note,table,card,say):
    out=note('Three checks, not a word-replacement machine','Ask: <b>Who do the words refer to?</b> <b>When is the report being made?</b> <b>Where is the reporter?</b> Change the language only as needed to keep the original meaning clear.')
    out+=panel('rs-verb-changes','1 · Verb forms: why am can become was',
      '<p><b>Backshift</b> means moving a verb form back when we report earlier words after a past reporting verb such as <b>said</b> or <b>told</b>. The event itself does not move in time; the reporter is looking back at the statement.</p>'+
      table(['Original form','Later report','What changes'],[
      [say('direct-worried'),say('reported-worried'),'am → was; I → she'],
      [say('rs-present-direct'),say('rs-present-report'),'need → needed; we → they'],
      [say('rs-continuous-direct'),say('rs-continuous-report'),'are checking → were checking; keep the -ing form'],
      [say('direct-will'),say('reported-will'),'will → would; tomorrow changes only if its reference has changed'],
      [say('direct-can'),say('reported-can'),'can → could; the performance date stays Saturday']])+
      note('Do not change every verb into a simple past form','<b>Are checking → were checking</b>, not “were checked”: the action is still in progress at the time described. For be: <b>am/is → was</b>, <b>are → were</b>. Match was/were to the new subject.'))
    out+='<details class="u6-topic-group"><summary>Next step · perfect forms and earlier past events</summary><div class="u6-group-body">'+model('rs-perfect-direct')+model('rs-perfect-report')+table(['Original words','Later report','Reason'],[
      ['“I have checked the source.”','The journalist said she had checked the source.','present perfect → past perfect'],
      ['“I saw the tree fall.”','Maya said she had seen the tree fall.','past simple → past perfect is common when backshifting'],
      ['“We had left before the storm.”','They said they had left before the storm.','past perfect stays past perfect']])+note('Keep the timeline clear','Past simple can remain when the sequence is already clear. <b>Would, could, should and might</b> normally stay the same. Learn the main patterns first, then use this extension.')+'</div></details>'
    out+=panel('rs-person-reference','2 · Pronouns: follow the people',
      '<p><b>Maya says to Luis:</b> “I can help you.”<br><b>Later, Luis tells his editor:</b></p>'+model('rs-reference-report')+
      table(['Original word','Who does it mean?','Luis reports'],[['I','Maya, the original speaker','she'],['you','Luis, who is now reporting','me'],['my, in Maya’s words','Something belonging to Maya','her']])+
      '<p>'+say('rs-pronouns','Listen: follow the people')+'</p>'+note('I does not always become she','If Maya reports her own words, she can say: <b>I said that I could help Luis.</b> I still means Maya. If Luis tells another person, he can say: <b>Maya told me that she could help me.</b> Identify the people before choosing the pronouns.'))
    out+=panel('rs-time-place','3 · Time and place: preserve the original reference',
      '<div class="u6-report-route"><div><b>Tuesday · Original statement</b><p>The spokesperson: “We will publish the repair plan <mark>tomorrow</mark>.”</p></div><div><b>Wednesday · Promised date</b><p>Tuesday’s <b>tomorrow</b> means Wednesday.</p></div><div><b>Thursday · Later report</b><p>The spokesperson said they would publish the repair plan <mark>the following day</mark>.</p></div></div>'+
      '<p>The following day means <b>the day after the original statement</b>: Wednesday, not Friday. The report repeats the promise; it does not confirm that the plan was published.</p><p>'+say('rs-calendar','Listen to the calendar example')+'</p>'+
      table(['Original reference','Possible later reference','Use it when…'],[
      ['today / tonight','that day / that night','you are reporting on a different day'],['yesterday','the day before','you need to refer to the day before the original statement'],['tomorrow','the next day / the following day','tomorrow from the reporter’s viewpoint would mean a different date'],['last week / next week','the previous week / the following week','the reporter’s reference week has changed'],['here','there','the reporter is now in a different place'],['this / these','that / those','the object or place is no longer close in the new context']])+
      note('Here can stay here; today can stay today','If you are still at the same shelter, <b>here</b> may still be accurate. If the report is on the same day, <b>today</b> may stay. Do not replace these words automatically.'))
    out+=panel('rs-no-automatic-change','When a change is not necessary',
      grid(card('Reporting with a present verb','<p><b>Maya says that she is worried.</b></p><p>With <b>says</b>, do not backshift simply because you are reporting. The reporting verb presents her message as current.</p>'),card('Information that is still current',model('still-true')+'<p><b>Is</b> presents the closure as still current. <b>The reporter said the library was still closed</b> is also possible when referring to the earlier statement. Was alone does not prove that it has reopened.</p>'))+
      '<p>'+say('rs-no-backshift','Listen: when a change is not necessary')+'</p>')
    out+=panel('rs-message-types','Statements, questions and instructions use different patterns',
      table(['Original message','Reported message','Pattern'],[
      ['Maya: “The road is closed.”','Maya said that the road was closed.','said + (that) + subject + verb'],
      ['Maya: “Where is the shelter?”','Maya asked where the shelter was.','asked + question word + subject + verb; not “where was the shelter”'],
      ['Maya asks Luis: “Are you safe?”','Maya asked Luis if he was safe.','asked + listener + if/whether + subject + verb'],
      ['Officer to us: “Wait here.”','The officer told us to wait there.','told + listener + to + base verb; the report is from another place'],
      ['Officer to us: “Do not enter.”','The officer told us not to enter.','told + listener + not to + base verb']])+
      '<p>'+say('rs-question-command','Listen: identify the message type')+'</p><p>Start with statements. For more instruction examples, open <a href="#instructions">Instructions and action plans</a>.</p>')
    out+=note('Before you finish a report','Check the source, the message, the people, the verb forms and the references to time and place. Do not add facts that the speaker did not give.')
    out+='<p class="u6-source">Grammar references: <a href="https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/reported-speech-statements" target="_blank" rel="noopener">British Council · statements</a> and <a href="https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/reported-speech-questions" target="_blank" rel="noopener">questions</a>. Examples and classroom explanations are original.</p>'
    return out

if __name__=='__main__':prepare_models()
