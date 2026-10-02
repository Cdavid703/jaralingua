"""Build the course-style group story page, shared audio map and page QR."""
from pathlib import Path
import html
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
STEM = "speaking-unit-5-our-picture-stories"
E = html.escape
photo_slugs = ["01-station", "02-picnic", "03-model", "04-bags", "05-celebration", "06-plant", "07-screen", "08-trail", "09-rehearsal", "10-dinner"]
pictures = [dict(number=i+1, image="/assets/img/english-intermediate-2/unit-5/group-stories/"+slug+".webp") for i, slug in enumerate(photo_slugs)]
models = json.loads((ROOT / "assets/data/english-intermediate2-unit5-impressions.json").read_text(encoding="utf-8"))
frames = models["frames"][:10]
expressions = {term: item for term, item in models["expressions"].items() if item["kind"] == "Phrasal verb"}
audio = {text: models["audio"][text] for text in [t for _, t in frames] + list(expressions)}
data = dict(pictures=pictures, frames=frames, expressions=expressions, audio=audio)
(ROOT / "assets/data/english-intermediate2-group-stories.json").write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")


def say(text):
    return '<button type="button" class="gs-say" data-audio="'+audio[text]+'" aria-pressed="false" aria-label="Listen: '+E(text)+'">'+E(text)+'<span aria-hidden="true"> ◖))</span></button>'


source = (ROOT / "ingles/intermediate-2/speaking-unit-5-one-picture-many-impressions.html").read_text(encoding="utf-8")
head = source.split("<main>")[0].replace("One Picture, Many Impressions | Unit 5 Speaking", "Our Picture Stories | Unit 5 Group Speaking")
head = head.replace("Twenty picture discussions for teacher-led projection: impressions, feelings, opinions and expressions.", "Build a two-minute group story from one picture, prepare every speaker’s part and submit it to your teacher.")
head = head.replace("speaking-unit-5-one-picture-many-impressions", STEM).replace("english-intermediate2-unit5-impressions.css?v=20260925-1", "english-intermediate2-group-stories.css?v=20260926-student-workspace").replace("ie2-u5-impressions", "ie2-group-stories")
head = head.replace('href="#pictures">Picture gallery', 'href="#workspace">Class workspace').replace('href="#howTo">How to speak', 'href="#howTo">Your task')
page = '''<main>
<section class="ie2-grammar-hero" aria-labelledby="pageTitle"><div class="ie2-grammar-hero-copy"><p class="intermediate2-kicker">Practice Lab · Unit 5 · Group speaking</p><h1 id="pageTitle">Our Picture<br>Stories</h1><p>One image. Your group’s story.<br>Everyone has a part to tell.</p><div class="ie2-grammar-meta"><span>10 pictures</span><span>2 minutes per team</span><span>1 phrasal verb minimum</span></div><div class="intermediate2-actions"><a class="intermediate2-button primary" href="#workspace">Open class workspace</a><a class="intermediate2-button ghost" href="#howTo">See the task</a></div></div><figure><img src="HERO" width="1536" height="1024" alt="A picture for your group story" fetchpriority="high"/></figure></section>
<div class="ie2-grammar-shell gs-shell">
<section id="howTo" class="ie2-grammar-intro"><div><p class="intermediate2-kicker">Build the story together</p><h2>Describe the image. Tell us what happened.</h2><p>Invent a short story based on your assigned picture. Explain the people’s feelings and what happened before or after this moment.</p></div><aside><strong>Two minutes · every member speaks</strong><span>Use at least one phrasal verb in your story. Write each speaker’s name before their part. This is practice without a grade.</span></aside></section>
<ol class="gs-steps"><li><b>1 · Look and plan</b><span>Discuss the picture and agree on a story.</span></li><li><b>2 · Write and send</b><span>Any teammate can edit the shared text. Submit the version you will present.</span></li><li><b>3 · Tell your story</b><span>The teacher starts when every team has submitted. Then editing closes.</span></li></ol>
<p class="gs-required"><strong>Include in your story:</strong> looks, seems or looks like; a feeling and its cause (<em>-ed / -ing</em>); I think, I guess or perhaps; and at least one phrasal verb.</p>
<details class="gs-help"><summary>Language reminder · tap the words to listen</summary><div class="gs-audio-controls" role="group" aria-label="Pronunciation speed"><button type="button" data-speed="0.75" aria-pressed="true">0.75×</button><button type="button" data-speed="1" aria-pressed="false">1×</button><button type="button" data-stop>Stop audio</button></div><p>Describe what you see with looks, seems or looks like. Use feelings, possible causes and your own ideas to build the story.</p><div class="gs-language-grid">FRAMES</div><h3>Phrasal verbs you could use</h3><div class="gs-language-grid">EXPRESSIONS</div><p><a href="./unit-5-impressions-feelings-and-satire.html#expressions">Review the Unit 5 explanations →</a></p></details>
<section data-jaralingua-managed-draft id="workspace" class="gs-workspace" aria-labelledby="workspaceTitle"><h2 id="workspaceTitle">Class workspace</h2><p id="gsStatus" role="status">Sign in to open your assigned team or manage your class.</p><button type="button" id="gsSignIn" class="intermediate2-button primary">Sign in</button>
<div id="gsAccount" hidden>
<form id="gsCreate" class="gs-toolbar" hidden><label>New class activity<input id="gsName" maxlength="120" required placeholder="Intermediate 2 · Friday · Group stories"/></label><button class="intermediate2-button" type="submit">Create activity</button></form>
<div class="gs-toolbar"><label>Class activity<select id="gsSession"><option value="">Choose an activity</option></select></label><button id="gsRefresh" class="intermediate2-button" type="button">Refresh</button></div>
<div id="gsRoom" hidden><div class="gs-room-heading"><div><h3 id="gsRoomName"></h3><p id="gsProgress" role="status"></p></div><div class="gs-actions"><button id="gsFinalize" class="intermediate2-button primary" type="button" hidden>Finish assignments</button><button id="gsReturn" class="intermediate2-button" type="button" hidden>Edit assignments</button><button id="gsStart" class="intermediate2-button primary" type="button" hidden>Start presentations</button></div></div><p id="gsRoomNote"></p></div>
</div>
<section id="gsMyTeam" class="gs-my-team" aria-label="Your assigned team" hidden><p id="gsMyTeamInfo"></p><p id="gsMyTeamNote"></p><button id="gsOpenMyStory" class="intermediate2-button primary" type="button">Write and submit our story</button></section>\n<div id="gsGallery" class="gs-gallery">GALLERY</div>
</section></div></main>
<dialog data-jaralingua-managed-draft id="gsAssign" class="gs-dialog" aria-labelledby="gsAssignTitle"><header><h2 id="gsAssignTitle">Assign students</h2><button type="button" data-close="gsAssign">Close ×</button></header><div class="gs-dialog-body"><p>Select the registered students for this picture. Each student can belong to one team in this activity.</p><label>Find a student<input id="gsRosterSearch" type="search" autocomplete="off" placeholder="Student name"/></label><p id="gsSelectedCount" role="status"></p><fieldset id="gsRoster"><legend class="gs-sr-only">Students in the course</legend></fieldset><p id="gsAssignStatus" role="status"></p></div><footer><button id="gsApply" class="intermediate2-button primary" type="button">Save this team</button></footer></dialog>
<dialog data-jaralingua-managed-draft id="gsEditor" class="gs-dialog gs-editor" aria-labelledby="gsEditorTitle"><header><h2 id="gsEditorTitle">Our story</h2><button type="button" data-close="gsEditor">Close ×</button></header><div class="gs-dialog-body gs-editor-body"><figure><img id="gsEditorImage" alt="Your assigned picture"/><figcaption id="gsEditorMembers"></figcaption></figure><div><p id="gsEditorStatus" role="status"></p><p id="gsEditHint">Write one shared text. Put each speaker’s name before their part.</p><div id="gsNameButtons" class="gs-name-buttons" aria-label="Insert a speaker’s name"></div><form id="gsStoryForm"><label>Our story and speaking parts<textarea id="gsText" rows="12" maxlength="16000" placeholder="Name: ...&#10;&#10;Name: ..."></textarea></label><label>Phrasal verb used in our story<input id="gsPhrasal" maxlength="160" placeholder="For example: cheer up"/></label><label class="gs-check"><input id="gsEveryone" type="checkbox"/> Every member has a named speaking part. We included the required language and a phrasal verb.</label><div id="gsConflict" class="gs-conflict" hidden><h3>A teammate saved another version</h3><p>Your text is still in the editor. Compare it with the saved version below.</p><pre id="gsLatestText"></pre><p id="gsLatestPhrasal"></p><button type="button" id="gsUseLatest">Use the saved version</button><button type="button" id="gsKeepMine">I compared them — keep my editor text</button></div></form></div></div><footer><div class="gs-editor-actions"><button id="gsDraft" type="button" class="intermediate2-button">Save draft</button><button id="gsSend" type="submit" form="gsStoryForm" class="intermediate2-button primary">Submit to teacher</button></div><p id="gsSaveStatus" role="status"></p></footer></dialog>
<dialog id="gsProjector" aria-labelledby="gsProjectTitle"><header><div><h2 id="gsProjectTitle"></h2><p id="gsProjectNames"></p></div><div><button id="gsFullscreen" type="button">Full screen</button><button type="button" data-close="gsProjector">Close ×</button></div></header><div id="gsProjectStage" class="gs-project-stage"><figure><img id="gsProjectImage" alt="Selected story picture"/><figcaption id="gsImageStatus" role="status"></figcaption></figure><article id="gsProjectStory" hidden><h3>Our story</h3><div id="gsProjectedText"></div></article></div><footer><button id="gsToggleStory" type="button" aria-expanded="true" hidden>Hide story</button><div id="gsTimerControls" hidden><strong id="gsTime">02:00</strong><button id="gsTimerToggle" type="button">Start timer</button><button id="gsTimerReset" type="button">Reset</button><span id="gsTimerNote" role="status">Everyone speaks.</span></div></footer></dialog>
<footer class="site-footer"><p>JaraLingua · Intermediate English Course 2 · Group speaking</p></footer><script src="../../assets/js/google-auth-config.js"></script><script src="https://accounts.google.com/gsi/client" async defer></script><script src="../../assets/js/google-auth.js?v=20260919-local-login"></script><script src="../../assets/js/english-intermediate2-group-stories.js?v=20260926-student-workspace"></script><script src="/assets/js/course-switcher.js"></script><script src="/assets/js/page-qr-access.js"></script></body></html>
'''
page = page.replace("HERO", pictures[0]["image"])
page = page.replace("FRAMES", "".join('<article><h3>'+E(label)+'</h3>'+say(text)+'</article>' for label, text in frames))
page = page.replace("EXPRESSIONS", "".join('<article>'+say(term)+'<p lang="es">'+E(item["spanish"])+'</p></article>' for term, item in expressions.items()))
gallery = "".join('<article class="gs-card" data-picture="'+str(p["number"])+'"><button type="button" class="gs-picture" data-open="'+str(p["number"])+'" aria-label="Open picture '+str(p["number"])+'"><img src="'+p["image"]+'" alt="Picture '+str(p["number"])+' for a group story" width="1536" height="1024" loading="lazy"/><span>'+str(p["number"]).zfill(2)+'</span></button><div class="gs-card-info"></div></article>' for p in pictures)
page = page.replace("GALLERY", gallery)
(ROOT / "ingles/intermediate-2" / (STEM+".html")).write_text(head+page, encoding="utf-8")
js = ROOT / "assets/js/english-intermediate2-group-stories.js"
if js.exists():
    s = js.read_text(encoding="utf-8"); a=s.index("const config="); b=s.index("\nconst $=", a)
    js.write_text(s[:a]+"const config="+json.dumps(data, ensure_ascii=False)+";"+s[b:], encoding="utf-8")
sys.path.insert(0, str(ROOT / "tmp/unit5-explanation/python-deps"))
import qrcode
import qrcode.image.svg
qrcode.make("https://www.jaralingua.com/ingles/intermediate-2/"+STEM+".html", image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=4).save(ROOT / "assets/img/page-qr" / ("ingles-intermediate-2-"+STEM+".svg"))
print("Built 10 image-only scenes, authenticated workspace, 18 existing audio models and canonical QR.")
