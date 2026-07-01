from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
N8 = ROOT / "frances" / "Niveau 8"
ATELIERS = N8 / "ateliers"
THEMES = N8 / "themes"
AUDIO = N8 / "audio"
ASSETS_JS = ROOT / "assets" / "js"


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig")


def script_after_file(markdown_path: Path, rel_audio: str) -> str:
    text = read(markdown_path)
    marker = f"File: `{rel_audio}`"
    start = text.find(marker)
    if start == -1:
        raise ValueError(f"Missing script marker: {rel_audio}")
    block = text[start + len(marker):]
    next_heading = re.search(r"\n##\s+", block)
    if next_heading:
        block = block[:next_heading.start()]
    lines = [line.strip() for line in block.splitlines() if line.strip() and not line.strip().startswith("File:")]
    return "\n\n".join(lines)


FRANCE_SCRIPT = AUDIO / "french8-listenings-b2-france-scripts.md"
QUEBEC_SCRIPT = AUDIO / "french8-listenings-b2-quebec-scripts.md"


LISTENINGS = {
    "08a": {
        "title": "Parler comme un Parisien",
        "subtitle": "Comprendre les réductions, le verlan et les changements de registre dans une conversation métalinguistique.",
        "file_france": "complete/n8-08a-parler-parisien-france-b2.mp3",
        "file_quebec": "complete/n8-08a-parler-parisien-quebec-b2.mp3",
        "image": "../img/ateliers/listening-08a-parler-parisien.png",
        "page": "comprehension-orale-08a-parler-parisien.html",
        "questions_france": [
            ["Quelle idée Victor rejette-t-il au début ?", ["Le français réel ne se limite pas au français des manuels.", "Les Parisiens parlent toujours un français très soutenu.", "Le verlan n'existe plus dans la conversation."], 0],
            ["Quelle réduction orale est donnée comme exemple ?", ["Je ne sais pas devient j'sais pas ou chais pas.", "Bonjour devient bonsoir.", "Merci devient madame."], 0],
            ["Que signifie le mot en verlan « meuf » ?", ["Femme.", "Maison.", "Travail."], 0],
            ["Quel mot signifie que quelque chose est bizarre ?", ["Chelou.", "Relou.", "Vénère."], 0],
            ["Quel exemple correspond au registre soutenu ?", ["Je souhaiterais que vous m'accordiez un instant.", "T'as deux minutes ?", "Chuis crevé."], 0],
            ["Que veut dire « c'est chaud » dans l'audio ?", ["C'est difficile, tendu ou compliqué.", "La température est élevée.", "Le café est prêt."], 0],
            ["Pourquoi Victor mentionne-t-il « du coup » ?", ["Comme marqueur oral très fréquent.", "Comme verbe au subjonctif.", "Comme mot suisse obligatoire."], 0],
            ["Quelle compétence est centrale selon Victor ?", ["Adapter son registre à la situation.", "Éviter toute variation orale.", "Parler uniquement avec des phrases littéraires."], 0],
            ["Quelle phrase familière signifie « je suis très fatigué » ?", ["Chuis crevé.", "Je souhaiterais un instant.", "Je suis extrêmement fatigué."], 0],
            ["Quelle conclusion résume l'audio ?", ["Le français oral authentique varie selon le contexte social.", "Le français familier est toujours une erreur.", "Le registre soutenu suffit dans toutes les situations."], 0],
        ],
        "questions_quebec": [
            ["Qu'observe Émilie chez les Parisiens ?", ["Ils changent de registre selon la situation.", "Ils refusent toute expression familière.", "Ils parlent tous exactement comme les livres."], 0],
            ["Quel exemple familier signifie « restaurant » dans l'audio ?", ["On va se faire un resto.", "Nous déjeunerons officiellement.", "Je souhaiterais commander."], 0],
            ["Quel mot en verlan est cité ?", ["Meuf.", "Natel.", "Panosses."], 0],
            ["Où le changement de registre est-il illustré ?", ["Dans le monde du travail, entre réunion et pause.", "Dans une compétition sportive.", "Dans une recette de cuisine."], 0],
            ["Quelle réduction orale est mentionnée ?", ["J'sais pas.", "Je souhaiterais.", "Nous eûmes."], 0],
            ["Pourquoi « du coup » et « genre » sont-ils importants ?", ["Ce sont des marqueurs oraux très fréquents.", "Ce sont des insultes.", "Ce sont des formes du passé simple."], 0],
            ["Que demande la compétence sociolinguistique ?", ["Savoir quand utiliser chaque registre.", "Éliminer les accents régionaux.", "Traduire chaque mot en anglais."], 0],
            ["Quel mot est associé à quelque chose de pénible ?", ["Relou.", "Meuf.", "Chanmé."], 0],
            ["Quel ton a l'échange ?", ["Explicatif et comparatif.", "Policier et judiciaire.", "Publicitaire et commercial."], 0],
            ["Quelle idée finale est défendue ?", ["Le registre est un choix social, pas seulement grammatical.", "Le français familier annule la communication.", "Le Québec ne connaît pas les registres."], 0],
        ],
    },
    "08b": {
        "title": "La francophonie en mouvement",
        "subtitle": "Repérer les variations lexicales et culturelles dans plusieurs espaces francophones.",
        "file_france": "complete/n8-08b-francophonie-mouvement-france-b2.mp3",
        "file_quebec": "complete/n8-08b-francophonie-mouvement-quebec-b2.mp3",
        "image": "../img/ateliers/listening-08b-francophonie-mouvement.png",
        "page": "comprehension-orale-08b-francophonie-mouvement.html",
        "questions_france": [
            ["Quel constat ouvre l'audio ?", ["Le français n'est pas uniforme dans le monde.", "Le français est identique partout.", "Le français disparaît des médias."], 0],
            ["Quels lieux sont cités pour montrer la diversité ?", ["Paris, Bruxelles, Genève, Dakar et Montréal.", "Madrid, Rome et Berlin.", "Tokyo, Lima et Oslo."], 0],
            ["Quels nombres belges sont mentionnés ?", ["Septante et nonante.", "Soixante-dix et quatre-vingt-dix uniquement.", "Dix et vingt."], 0],
            ["Quel mot suisse désigne le téléphone portable ?", ["Natel.", "Char.", "Blonde."], 0],
            ["Que montre le français du Sénégal selon l'audio ?", ["Un mélange avec le wolof et des formules propres.", "Un refus total des langues locales.", "Une copie exacte du français parisien."], 0],
            ["Quelle expression sénégalaise est citée ?", ["On est ensemble.", "C'est la goutte d'eau.", "Jeter l'éponge."], 0],
            ["Quels mots québécois sont donnés ?", ["Char, blonde et magasiner.", "Panosses, natel et huitante.", "Relou, chelou et vénère."], 0],
            ["Quels sacres québécois sont mentionnés ?", ["Tabarnac, câlice et crisse.", "Bonjour, merci et pardon.", "Septante, huitante et nonante."], 0],
            ["Pourquoi la variation ne doit-elle pas être vue comme une erreur ?", ["Elle reflète des histoires et des identités différentes.", "Elle empêche toute communication.", "Elle concerne seulement les enfants."], 0],
            ["Quelle conclusion correspond à l'audio ?", ["La francophonie est plurielle et vivante.", "Un seul français est légitime.", "Les accents doivent disparaître."], 0],
        ],
        "questions_quebec": [
            ["Combien de locuteurs francophones sont évoqués ?", ["Environ 320 millions.", "Environ 32 millions.", "Environ 3 millions."], 0],
            ["Quel débat oppose les puristes aux autres locuteurs ?", ["La variation et l'adaptation de la langue.", "La fermeture des écoles.", "La disparition des dictionnaires."], 0],
            ["Quel exemple ivoirien est cité ?", ["C'est dja.", "Pantoute.", "Natel."], 0],
            ["Quel mot québécois signifie « pas du tout » ?", ["Pantoute.", "Kiffer.", "Meeting."], 0],
            ["Quels mots familiers venus de l'usage contemporain sont mentionnés ?", ["Kiffer et ça me saoule.", "Septante et nonante.", "Avoir et être."], 0],
            ["Quel phénomène lié à l'anglais est discuté ?", ["Le franglais : meeting, weekend, checker ses mails.", "Le latin juridique.", "Le passé simple."], 0],
            ["Quel équivalent officiel est proposé pour email ?", ["Courriel.", "Natel.", "Char."], 0],
            ["Quelle position l'audio adopte-t-il face aux emprunts ?", ["Ils montrent que la langue s'adapte, même si le débat continue.", "Ils prouvent que le français est terminé.", "Ils doivent tous être interdits immédiatement."], 0],
            ["Quel ton a le dialogue ?", ["Nuancé et sociolinguistique.", "Moqueur envers tous les accents.", "Uniquement nostalgique."], 0],
            ["Quelle idée finale domine ?", ["La francophonie bouge parce que ses locuteurs inventent et adaptent.", "La variation détruit toujours la langue.", "Le français doit rester figé."], 0],
        ],
    },
    "08c": {
        "title": "Portrait : un rappeur et la langue",
        "subtitle": "Comprendre comment un artiste utilise registre littéraire, oralité et verlan pour construire une identité.",
        "file_france": "complete/n8-08c-rappeur-langue-france-b2.mp3",
        "file_quebec": "complete/n8-08c-rappeur-langue-quebec-b2.mp3",
        "image": "../img/ateliers/listening-08c-rappeur-langue.png",
        "page": "comprehension-orale-08c-rappeur-langue.html",
        "questions_france": [
            ["Quel artiste est présenté ?", ["Karim Ziani, connu sous le nom de K-Zed.", "Agnès Morel, réalisatrice.", "Victor, professeur de grammaire."], 0],
            ["Où Martin rencontre-t-il l'artiste ?", ["Dans son studio du dix-huitième arrondissement.", "Dans une mairie.", "Dans un tribunal."], 0],
            ["Quelle idée K-Zed défend-il ?", ["Il n'y a pas de frontière nette entre bon français et français de la rue.", "Le français familier doit être interdit.", "Le rap doit éviter la littérature."], 0],
            ["Quel contraste apparaît dans ses vers ?", ["Victor Hugo et le verlan.", "La météo et la cuisine.", "Le droit et la médecine."], 0],
            ["Quel type de vers est mentionné ?", ["Les alexandrins.", "Les haïkus japonais uniquement.", "Les slogans publicitaires."], 0],
            ["Quelles formes orales apparaissent dans l'album ?", ["Chuis, t'as vu et du verlan.", "Nous eûmes et vous fîtes.", "Natel et panosses."], 0],
            ["Pourquoi son écriture touche-t-elle le public ?", ["Elle met en scène une double culture linguistique.", "Elle refuse toute nuance.", "Elle simplifie tous les mots."], 0],
            ["Comment les critiques réagissent-ils ?", ["Ils saluent sa maîtrise du français.", "Ils ignorent complètement son album.", "Ils lui demandent de ne plus écrire."], 0],
            ["Quelle compétence linguistique l'artiste illustre-t-il ?", ["Passer d'un registre à l'autre avec intention.", "Parler sans aucune structure.", "Employer seulement l'argot."], 0],
            ["Quelle conclusion correspond au portrait ?", ["Le rap peut montrer la créativité du français oral et littéraire.", "Le verlan empêche toute poésie.", "La langue populaire n'a aucun intérêt."], 0],
        ],
        "questions_quebec": [
            ["Quel artiste est présenté dans la version québécoise ?", ["Amine Kouachi.", "Karim Ziani uniquement.", "Nathalie Tremblay."], 0],
            ["Quel est le titre de son album ?", ["Trilingue.", "La Panosse.", "Le Rapport."], 0],
            ["Quels trois français l'album fait-il dialoguer ?", ["Le français de la cité, de l'école et du quotidien.", "Le français, l'espagnol et l'italien.", "Le passé, le présent et le futur."], 0],
            ["Quels mots relèvent de la cité dans l'audio ?", ["Wesh, chanmé, on s'arrache.", "Courriel, natel, panosse.", "Bien que, quoique, malgré."], 0],
            ["Quel exemple représente le registre scolaire ?", ["Nous devons prendre en considération les conséquences sociales.", "C'est trop relou.", "On s'arrache."], 0],
            ["Quels mots familiers sont cités ?", ["Keufs, relou, vénère.", "Septante, nonante, huitante.", "Veuillez, agréer, considération."], 0],
            ["Comment les linguistes réagissent-ils ?", ["Ils saluent l'usage maîtrisé des variations.", "Ils affirment que ce n'est pas du français.", "Ils refusent d'écouter l'album."], 0],
            ["Quelle critique populaire est rapportée ?", ["Le verlan, ce n'est pas du français.", "Les alexandrins sont impossibles.", "Le français québécois n'existe pas."], 0],
            ["Quelle réponse implicite donne le portrait ?", ["La variation peut être une ressource artistique.", "La langue doit rester uniforme.", "L'argot interdit la pensée."], 0],
            ["Quel ton domine ?", ["Culturel et explicatif.", "Scientifique sans exemple.", "Commercial et touristique."], 0],
        ],
    },
}


def header(title: str, extra_css: str = "") -> str:
    return f"""<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" href="/assets/img/favicon.png" sizes="96x96">
  <link href="../../../assets/vendor/bootstrap/bootstrap.min.css" rel="stylesheet">
  <link href="../../../assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
  <link href="../../../assets/vendor/fonts/jaralingua-fonts.css" rel="stylesheet">
  <style>
    :root{{--blue:#1f4e8c;--blue-dark:#15345d;--red:#d62839;--yellow:#ffc857;--green:#23886f;--soft:#f4f8ff;--text:#1f2937;--muted:#5d6b82;--shadow:0 20px 45px rgba(15,23,42,.12)}}*{{box-sizing:border-box;scroll-behavior:smooth}}body{{margin:0;font-family:"Inter","Segoe UI",system-ui,sans-serif;background:var(--soft);color:var(--text)}}h1,h2,h3,.navbar-brand{{font-family:"Montserrat","Segoe UI",sans-serif}}.navbar{{background:rgba(255,255,255,.94);box-shadow:0 10px 30px rgba(15,23,42,.08)}}.navbar-brand{{display:flex;align-items:center;gap:.7rem;font-weight:900;color:var(--blue-dark)!important}}.brand-logo{{height:42px}}.nav-link{{font-weight:800;color:var(--blue-dark)!important}}.hero{{min-height:min(650px,78vh);display:flex;align-items:center;padding:7rem 0 4rem;color:#fff;background:linear-gradient(135deg,rgba(21,52,93,.94),rgba(31,78,140,.74),rgba(214,40,57,.48)),var(--hero-image) center/cover no-repeat}}.badge-course{{display:inline-flex;align-items:center;gap:.55rem;padding:.7rem 1rem;border-radius:999px;background:rgba(255,255,255,.9);color:var(--blue-dark);font-weight:900}}.hero h1{{margin:1.2rem 0 1rem;font-weight:900;line-height:1;text-shadow:0 12px 34px rgba(0,0,0,.24);font-size:clamp(2.35rem,5.8vw,5.15rem)}}.hero-text,.section-text{{font-size:1.05rem;line-height:1.72;color:var(--muted)}}.hero .hero-text{{max-width:900px;color:rgba(255,255,255,.93)}}.btn-main,.btn-soft{{border-radius:999px;font-weight:900;padding:.82rem 1.1rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:.45rem}}.btn-main{{border:0;background:linear-gradient(135deg,var(--red),#9f1d2a);color:#fff;box-shadow:0 16px 34px rgba(214,40,57,.22)}}.btn-main:hover{{color:#fff}}.btn-soft{{border:2px solid rgba(31,78,140,.18);background:#fff;color:var(--blue-dark)}}section{{padding:4.5rem 0}}.section-kicker{{text-transform:uppercase;color:var(--red);font-weight:900;letter-spacing:.12em;font-size:.82rem}}.section-title{{color:var(--blue-dark);font-size:clamp(2rem,4vw,3.05rem);font-weight:900}}.panel,.rule-card,.activity-shell,.practice-card{{background:#fff;border-radius:8px;box-shadow:var(--shadow);padding:clamp(1.1rem,3vw,1.8rem)}}.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem}}footer{{background:var(--blue-dark);color:#fff;padding:3rem 0}}footer a{{color:#fff;text-decoration:none;font-weight:900}}@media(max-width:575px){{.btn-main,.btn-soft{{width:100%}}.hero{{padding-top:5.75rem;min-height:auto}}}}
    {extra_css}
  </style>
</head>"""


def nav(active: str = "Ateliers") -> str:
    return f"""<nav class="navbar navbar-expand-lg fixed-top"><div class="container"><a class="navbar-brand" href="../index.html"><img class="brand-logo" src="../../../assets/img/jaralingua-logo.png" alt="JaraLingua"><span>Français · Niveau 8</span></a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="menu"><ul class="navbar-nav ms-auto"><li class="nav-item"><a class="nav-link" href="../index.html">Accueil</a></li><li class="nav-item"><a class="nav-link {'active' if active == 'Themes' else ''}" href="../themes-du-cours.html">Thèmes</a></li><li class="nav-item"><a class="nav-link {'active' if active == 'Ateliers' else ''}" href="../ateliers-activites.html">Ateliers</a></li></ul></div></div></nav>"""


def scripts() -> str:
    return """<script src="../../../assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
  <script src="../../../assets/js/google-auth-config.js"></script>
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <script src="../../../assets/js/google-auth.js"></script>
  <script src="/assets/js/course-switcher.js?v=20260628-cours"></script>"""


def listening_page(activity_id: str, item: dict) -> str:
    transcript_fr = script_after_file(FRANCE_SCRIPT, item["file_france"])
    data_questions = json.dumps(item["questions_france"], ensure_ascii=False)
    transcript_js = json.dumps(transcript_fr, ensure_ascii=False)
    return f"""{header(item['title'] + ' - Compréhension orale B2 - Français Niveau 8', ".activity-head{padding:1.25rem;background:linear-gradient(135deg,var(--blue-dark),var(--blue));color:#fff}.activity-head p{margin:0;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:rgba(255,255,255,.8);font-size:.82rem}.activity-body{padding:clamp(1rem,3vw,1.6rem)}.audio-panel{border-radius:8px;background:#f8fbff;border:1px solid rgba(31,78,140,.12);padding:1rem;margin-bottom:1rem}.audio-panel audio{width:100%;margin-top:.85rem}.audio-variant-selector{display:flex;flex-wrap:wrap;align-items:center;gap:.55rem;margin-top:.85rem;padding:.8rem;border:1px solid rgba(31,78,140,.14);border-radius:8px;background:#eef5ff}.audio-variant-selector span{font-weight:900;color:var(--blue-dark)}.audio-variant-button{border:2px solid rgba(31,78,140,.18);background:#fff;color:var(--blue-dark);border-radius:999px;font-weight:900;padding:.5rem .85rem}.audio-variant-button.is-active{background:var(--blue-dark);border-color:var(--blue-dark);color:#fff}.question-grid{display:grid;gap:.9rem}.question-card{border:1px solid rgba(31,78,140,.12);border-radius:8px;padding:1rem;background:#fff}.question-card legend{float:none;width:auto;font-size:1rem;font-weight:900;color:var(--blue-dark);margin-bottom:.75rem}.question-card label{display:flex;gap:.55rem;align-items:flex-start;padding:.58rem .65rem;border-radius:8px;cursor:pointer;line-height:1.45}.question-card label:hover{background:rgba(31,78,140,.06)}.result-box{display:none;margin-top:1rem;border-radius:8px;padding:1rem;font-weight:900}.result-box.correct{display:block;background:rgba(47,158,119,.12);color:var(--green)}.result-box.incorrect{display:block;background:rgba(214,40,57,.1);color:var(--red)}.teacher-only{display:none!important}.can-view-transcripts .teacher-only{display:inline-flex!important}.teacher-note{display:none;color:var(--muted);font-weight:800;font-size:.92rem}.can-view-transcripts .teacher-note{display:block}.nav-pills-panel{background:#fff;border-radius:8px;box-shadow:var(--shadow);padding:1rem;margin-top:-1.35rem;position:relative;z-index:4}")} 
<body>
  {nav("Ateliers")}
  <header class="hero" style="--hero-image:url('{item['image']}')"><div class="container"><span class="badge-course"><i class="bi bi-headphones"></i> Thème 08 · Compréhension orale B2</span><h1>{item['title']}</h1><p class="hero-text">{item['subtitle']} Répondez uniquement selon la version audio choisie.</p><div class="d-flex flex-wrap gap-3 mt-4"><a class="btn-main" href="#atelier"><i class="bi bi-play-circle"></i> Commencer</a><a class="btn-soft" href="../ateliers-activites.html#theme-08"><i class="bi bi-arrow-left"></i> Retour au thème 08</a></div></div></header>
  <section class="nav-pills-panel container"><div class="d-flex flex-wrap gap-2 justify-content-between align-items-center"><a class="btn-soft" href="../themes/francophonie-registres-francais-oral.html"><i class="bi bi-journal-text"></i> Revoir le thème 08</a><a class="btn-soft" href="../bibliotheque-audio.html"><i class="bi bi-soundwave"></i> Bibliothèque audio</a></div></section>
  <main><section id="atelier"><div class="container"><div class="activity-shell"><div class="activity-head"><p>Thème 08 · Activité {activity_id.upper()}</p><h2>{item['title']}</h2></div><div class="activity-body"><div class="audio-panel"><div class="d-flex flex-wrap gap-3 align-items-center justify-content-between"><div><strong>Consigne</strong><p class="mb-0 text-muted">Repérez les registres, les expressions orales et les variantes francophones présentes dans l'audio.</p><p class="teacher-note mb-0 mt-2">Accès professeur/admin détecté : la transcription PDF est disponible.</p></div><button type="button" class="btn-soft teacher-only" data-transcript-button><i class="bi bi-file-earmark-pdf"></i> Transcription professeur</button></div><div class="audio-variant-selector" role="group" aria-label="Choisir l'accent de l'audio"><span>Version audio :</span><button type="button" class="audio-variant-button" data-audio-variant="france"><i class="bi bi-volume-up"></i> Français de France</button><button type="button" class="audio-variant-button is-active" data-audio-variant="quebec"><i class="bi bi-volume-up"></i> Français québécois</button></div><audio id="activityAudio" controls preload="metadata" src="../audio/{item['file_quebec']}"></audio></div><form class="question-grid" id="quizForm"></form><div class="d-flex flex-wrap gap-3 mt-4"><button type="button" class="btn-main" id="checkBtn"><i class="bi bi-check2-circle"></i> Corriger</button><button type="button" class="btn-soft" id="resetBtn"><i class="bi bi-arrow-counterclockwise"></i> Recommencer</button></div><div class="result-box" id="resultBox"></div></div></div></div></section></main>
  <footer><div class="container d-flex flex-wrap justify-content-between gap-3"><div><h2 class="h4 fw-bold">Français Niveau 8 · Compréhension orale</h2><p class="mb-0 opacity-75">Activité B2 avec audio France/Québec et transcription réservée au personnel enseignant.</p></div><a href="../ateliers-activites.html#theme-08"><i class="bi bi-arrow-left"></i> Retour aux ateliers</a></div></footer>
  <script src="../../../assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
  <script src="../../../assets/js/transcript-pdf.js"></script>
  <script src="../../../assets/js/google-auth-config.js"></script>
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <script src="../../../assets/js/google-auth.js"></script>
  <script src="../../../assets/js/french8-listening-controls.js?v=20260625-speed-transcript"></script>
  <script src="../../../assets/js/french8-listening-activity-data.js?v=20260701-theme08"></script>
  <script src="../../../assets/js/french8-listening-activity.js?v=20260626-audio-sync"></script>
  <script>
    const ACTIVITY={{id:"{activity_id}",theme:"Thème 08",themeTitle:"Francophonie, registres et français oral authentique",title:{json.dumps(item['title'], ensure_ascii=False)},file:"../audio/{item['file_quebec']}",image:{json.dumps(item['image'], ensure_ascii=False)},page:{json.dumps(item['page'], ensure_ascii=False)},questions:{data_questions},transcript:{transcript_js}}};
    initFrench8ListeningActivity(ACTIVITY);
  </script>
  <script src="../../../assets/js/jaralingua-back-button.js"></script>
  <script src="/assets/js/course-switcher.js?v=20260628-cours"></script>
</body>
</html>"""


def theme_page() -> str:
    return """<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Francophonie, registres et français oral authentique - Français Niveau 8</title>
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" href="/assets/img/favicon.png" sizes="96x96">
  <link href="../../../assets/vendor/bootstrap/bootstrap.min.css" rel="stylesheet">
  <link href="../../../assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
  <link href="../../../assets/vendor/fonts/jaralingua-fonts.css" rel="stylesheet">
  <style>
    :root{--blue:#1f4e8c;--blue-dark:#15345d;--red:#d62839;--yellow:#ffc857;--green:#23886f;--soft:#f4f8ff;--text:#1f2937;--muted:#5d6b82;--shadow:0 20px 45px rgba(15,23,42,.12)}*{box-sizing:border-box;scroll-behavior:smooth}body{margin:0;font-family:"Inter","Segoe UI",system-ui,sans-serif;background:var(--soft);color:var(--text)}h1,h2,h3,.navbar-brand{font-family:"Montserrat","Segoe UI",sans-serif}.navbar{background:rgba(255,255,255,.94);box-shadow:0 10px 30px rgba(15,23,42,.08)}.navbar-brand{display:flex;align-items:center;gap:.7rem;font-weight:900;color:var(--blue-dark)!important}.brand-logo{height:42px}.nav-link{font-weight:800;color:var(--blue-dark)!important}.hero{min-height:min(680px,82vh);display:flex;align-items:center;padding:7rem 0 4rem;color:#fff;background:linear-gradient(135deg,rgba(21,52,93,.94),rgba(31,78,140,.72),rgba(214,40,57,.5)),url('../img/themes/theme-08-francophonie-registres-hero.png') center/cover no-repeat}.badge-course{display:inline-flex;align-items:center;gap:.55rem;padding:.7rem 1rem;border-radius:999px;background:rgba(255,255,255,.9);color:var(--blue-dark);font-weight:900}.hero h1{margin:1.2rem 0 1rem;font-weight:900;line-height:1;text-shadow:0 12px 34px rgba(0,0,0,.24);font-size:clamp(2.35rem,5.8vw,5.2rem)}.hero-text,.section-text{font-size:1.05rem;line-height:1.75;color:var(--muted)}.hero .hero-text{max-width:900px;color:rgba(255,255,255,.92)}.btn-main,.btn-soft{border-radius:999px;font-weight:900;padding:.82rem 1.1rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:.45rem}.btn-main{border:0;background:linear-gradient(135deg,var(--red),#9f1d2a);color:#fff;box-shadow:0 16px 34px rgba(214,40,57,.22)}.btn-main:hover{color:#fff}.btn-soft{border:2px solid rgba(31,78,140,.18);background:#fff;color:var(--blue-dark)}.hero .btn-soft{border-color:rgba(255,255,255,.7);background:rgba(255,255,255,.12);color:#fff}.hero .btn-soft:hover{background:#fff;color:var(--blue-dark)}section{padding:4.5rem 0}.section-kicker{text-transform:uppercase;color:var(--red);font-weight:900;letter-spacing:.12em;font-size:.82rem}.section-title{color:var(--blue-dark);font-size:clamp(2rem,4vw,3.05rem);font-weight:900}.panel,.rule-card,.reading-box,.practice-card{background:#fff;border-radius:8px;box-shadow:var(--shadow);padding:clamp(1.1rem,3vw,2rem)}.rule-grid,.practice-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem}.rule-card{border-left:7px solid var(--green)}.rule-card.red{border-left-color:var(--red)}.rule-card.gold{border-left-color:var(--yellow)}.rule-card h3,.practice-card h3{font-weight:900;color:var(--blue-dark);font-size:1.12rem}.example{border-left:5px solid var(--yellow);background:#fffdf5;border-radius:8px;padding:.95rem 1rem;color:var(--blue-dark);font-weight:800;line-height:1.65}.table-wrap{overflow-x:auto;background:#fff;border-radius:8px;box-shadow:var(--shadow)}table{width:100%;min-width:760px;border-collapse:collapse}th{background:var(--blue-dark);color:#fff;padding:1rem;text-align:left}td{padding:1rem;border-bottom:1px solid rgba(31,78,140,.1);vertical-align:top}.reading-box{border-left:7px solid var(--red)}.reading-box p{line-height:1.78}.question-list{display:grid;gap:.8rem}.question-list details{background:#f8fbff;border:1px solid rgba(31,78,140,.12);border-radius:8px;padding:.85rem}.question-list summary{cursor:pointer;color:var(--blue-dark);font-weight:900}.practice-card{display:grid;gap:.65rem;text-decoration:none;color:var(--text);border:1px solid rgba(31,78,140,.08)}.practice-card b{color:var(--red);font-size:.78rem;text-transform:uppercase;letter-spacing:.08em}.idiom-strip{display:flex;flex-wrap:wrap;gap:.6rem}.idiom-strip span{border-radius:999px;background:#e9f8f2;color:#126047;font-weight:900;padding:.45rem .7rem}footer{background:var(--blue-dark);color:#fff;padding:3rem 0}footer a{color:#fff;text-decoration:none;font-weight:900}@media(max-width:575px){.btn-main,.btn-soft{width:100%}.hero{min-height:auto;padding-top:5.75rem}}
  </style>
</head>
<body>
  <nav class="navbar navbar-expand-lg fixed-top"><div class="container"><a class="navbar-brand" href="../index.html"><img class="brand-logo" src="../../../assets/img/jaralingua-logo.png" alt="JaraLingua"><span>Français · Niveau 8</span></a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="menu"><ul class="navbar-nav ms-auto"><li class="nav-item"><a class="nav-link" href="../index.html">Accueil</a></li><li class="nav-item"><a class="nav-link active" href="../themes-du-cours.html">Thèmes</a></li><li class="nav-item"><a class="nav-link" href="../ateliers-activites.html">Ateliers</a></li></ul></div></div></nav>
  <header class="hero"><div class="container"><span class="badge-course"><i class="bi bi-chat-dots-fill"></i> Thème 08 · Registres et oralité</span><h1>Francophonie, registres et français oral authentique</h1><p class="hero-text">Comprendre le français tel qu'il circule réellement : français soutenu, standard, familier, verlan, réductions orales et variantes francophones. L'objectif n'est pas de parler « relâché » partout, mais de choisir le bon registre au bon moment.</p><div class="d-flex flex-wrap gap-3 mt-4"><a class="btn-main" href="#structure"><i class="bi bi-compass"></i> Comprendre les registres</a><a class="btn-soft" href="../ateliers/studio-registres-francophones.html"><i class="bi bi-people-fill"></i> Conversation 08R</a><a class="btn-soft" href="../ateliers/atelier-registres-francais-oral.html"><i class="bi bi-ui-checks"></i> Atelier 08G</a></div></div></header>
  <main>
    <section id="sens"><div class="container"><div class="text-center mb-5"><p class="section-kicker">Objectif communicatif</p><h2 class="section-title">Passer du manuel au français vivant</h2><p class="section-text mx-auto">En B2, comprendre un francophone suppose d'identifier les réductions, les marqueurs oraux, les mots familiers et les variations régionales sans les juger trop vite.</p></div><div class="rule-grid"><article class="rule-card red"><h3>Registre soutenu</h3><p>Pour une lettre, une présentation officielle ou une situation très formelle.</p><div class="example">Je souhaiterais que vous m'accordiez un instant.</div></article><article class="rule-card gold"><h3>Registre standard</h3><p>Pour communiquer clairement dans la plupart des contextes scolaires et professionnels.</p><div class="example">Est-ce que vous avez un moment ?</div></article><article class="rule-card"><h3>Registre familier</h3><p>Pour une conversation proche, orale, rapide ou très informelle.</p><div class="example">T'as deux minutes ? J'sais pas, c'est chaud.</div></article></div></div></section>
    <section class="bg-white" id="structure"><div class="container"><div class="row g-5 align-items-start"><div class="col-lg-5"><p class="section-kicker">Boîte à outils</p><h2 class="section-title">Registres, verlan et marqueurs oraux</h2><p class="section-text">Le français oral authentique n'est pas une simple liste d'erreurs. Il obéit à des contextes, des relations sociales et des habitudes de rythme.</p></div><div class="col-lg-7"><div class="table-wrap"><table><thead><tr><th>Phénomène</th><th>Exemples</th><th>À comprendre</th></tr></thead><tbody><tr><td><strong>Réduction orale</strong></td><td>je ne sais pas → j'sais pas / chais pas; il y a → y'a</td><td>La forme écrite reste différente, mais l'oreille doit reconnaître la réduction.</td></tr><tr><td><strong>Verlan</strong></td><td>femme → meuf; fou → ouf; bizarre → chelou</td><td>Très présent dans certains milieux et médias; à utiliser avec prudence.</td></tr><tr><td><strong>Marqueurs oraux</strong></td><td>du coup, genre, en fait, bah</td><td>Ils organisent le discours, mais peuvent alourdir une production formelle.</td></tr><tr><td><strong>Francophonie</strong></td><td>char, magasiner, septante, huitante, on est ensemble</td><td>Les variantes ne sont pas des fautes; elles signalent des histoires linguistiques.</td></tr></tbody></table></div></div></div></div></section>
    <section id="idiomes"><div class="container"><div class="panel"><p class="section-kicker">Expressions du thème</p><h2 class="section-title">À réutiliser dans les activités</h2><p class="section-text">Ces expressions apparaissent dans les audios ou dans les productions. Elles aident à parler de difficulté, de solidarité ou d'intensité sans traduire mot à mot depuis l'espagnol.</p><div class="idiom-strip"><span>c'est chaud</span><span>c'est ouf</span><span>c'est relou</span><span>être vénère</span><span>on est ensemble</span></div></div></div></section>
    <section class="bg-white" id="lecture"><div class="container"><div class="row g-5 align-items-start"><div class="col-lg-7"><p class="section-kicker">Compréhension écrite</p><h2 class="section-title">Un français, des situations</h2><div class="reading-box"><p>Dans une classe de français avancé, le professeur demande aux étudiants d'analyser trois versions d'une même idée. Dans la première, un candidat écrit : « Je souhaiterais obtenir un entretien afin de vous présenter mon projet. » Dans la deuxième, il dit : « Est-ce que je pourrais vous présenter mon projet ? » Dans la troisième, il lance à un ami : « T'as deux minutes ? J'te parle d'un truc, c'est chaud. » Le message général reste proche, mais la relation avec l'interlocuteur change complètement.</p><p>Cette compétence devient encore plus importante dans la francophonie. À Montréal, on peut entendre « char » ou « magasiner »; en Belgique, « septante »; au Sénégal, « on est ensemble ». Aucun de ces usages n'est inférieur. Le vrai défi consiste à comprendre qui parle, où, à qui et dans quel but. Utiliser un mot familier au mauvais moment peut sembler relou; l'éviter partout peut aussi donner une parole artificielle. Le bon registre, au fond, permet de rester naturel sans perdre la précision.</p></div></div><div class="col-lg-5"><div class="panel"><p class="section-kicker">Questions</p><div class="question-list"><details><summary>1. Que comparent les étudiants ?</summary><p>Trois versions d'une même idée dans des registres différents.</p></details><details><summary>2. Quelle phrase appartient au registre familier ?</summary><p>« T'as deux minutes ? J'te parle d'un truc, c'est chaud. »</p></details><details><summary>3. Quelle expression sénégalaise est citée ?</summary><p>On est ensemble.</p></details><details><summary>4. Pourquoi le registre est-il important ?</summary><p>Parce qu'il dépend de l'interlocuteur, du lieu et de l'intention.</p></details><details><summary>5. Quelle idée finale défend le texte ?</summary><p>Choisir le bon registre aide à rester naturel et précis.</p></details></div></div></div></div></div></section>
    <section id="activites"><div class="container"><div class="text-center mb-5"><p class="section-kicker">Parcours du thème</p><h2 class="section-title">Écouter, pratiquer, changer de registre</h2></div><div class="practice-grid"><a class="practice-card" href="../ateliers/comprehension-orale-08a-parler-parisien.html?audio-variants=2"><b>Compréhension orale · 08A</b><h3>Parler comme un Parisien</h3><p>Comprendre réductions, verlan et registre familier en contexte.</p><span>Ouvrir <i class="bi bi-headphones"></i></span></a><a class="practice-card" href="../ateliers/comprehension-orale-08b-francophonie-mouvement.html?audio-variants=2"><b>Compréhension orale · 08B</b><h3>La francophonie en mouvement</h3><p>Repérer les variantes belges, suisses, québécoises et africaines.</p><span>Ouvrir <i class="bi bi-headphones"></i></span></a><a class="practice-card" href="../ateliers/comprehension-orale-08c-rappeur-langue.html?audio-variants=2"><b>Compréhension orale · 08C</b><h3>Un rappeur et la langue</h3><p>Analyser l'alternance entre langue littéraire, oralité et verlan.</p><span>Ouvrir <i class="bi bi-headphones"></i></span></a><a class="practice-card" href="../ateliers/atelier-registres-francais-oral.html"><b>Grammaire · 08G</b><h3>Registres et oralité</h3><p>15 questions pour choisir la formulation adaptée et comprendre le sens.</p><span>S'entraîner <i class="bi bi-ui-checks"></i></span></a><a class="practice-card" href="../ateliers/studio-registres-francophones.html"><b>Conversation · 08R</b><h3>Studio des registres</h3><p>Roulette orale : situation, interlocuteur, registre et expression idiomatique.</p><span>Parler <i class="bi bi-people-fill"></i></span></a><a class="practice-card" href="../ateliers/production-08e-portrait-langue.html"><b>Production · 08E</b><h3>Portrait de langue</h3><p>Texte guidé et audio sauvegardé pour feedback professeur.</p><span>Produire <i class="bi bi-pencil-square"></i></span></a></div></div></section>
  </main>
  <footer><div class="container d-flex flex-wrap justify-content-between gap-3"><div><h2 class="h4 fw-bold">Thème 08 · Français oral authentique</h2><p class="mb-0 opacity-75">Registres, verlan, francophonie et compétence sociolinguistique.</p></div><a href="../themes-du-cours.html"><i class="bi bi-arrow-left"></i> Retour aux thèmes</a></div></footer>
  <script src="../../../assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
  <script src="../../../assets/js/google-auth-config.js"></script>
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <script src="../../../assets/js/google-auth.js"></script>
  <script src="/assets/js/course-switcher.js?v=20260628-cours"></script>
</body>
</html>"""


def grammar_page() -> str:
    questions = [
        ("Vous écrivez à un directeur inconnu. Quelle formule convient le mieux ?", ["T'as deux minutes ?", "Je souhaiterais vous présenter mon projet.", "C'est ouf ton bureau."], 1, "Dans une situation formelle, le registre soutenu est attendu."),
        ("Dans une conversation avec un ami, « j'sais pas » correspond à :", ["je ne sais pas", "je ne savais pas", "je saurai"], 0, "C'est une réduction orale fréquente de je ne sais pas."),
        ("Que signifie « chelou » ?", ["bizarre", "fatigué", "cher"], 0, "Chelou est le verlan de louche."),
        ("Quelle phrase est standard ?", ["Veuillez agréer mes salutations distinguées.", "Est-ce que vous avez un moment ?", "T'as deux minutes ?"], 1, "Elle est claire sans être trop formelle ni trop familière."),
        ("Quel mot québécois peut désigner une voiture ?", ["char", "panosse", "septante"], 0, "Au Québec, char peut désigner une voiture."),
        ("Quel mot belge signifie soixante-dix ?", ["septante", "huitante", "natel"], 0, "Septante est courant en Belgique."),
        ("« C'est relou » veut dire :", ["c'est pénible", "c'est officiel", "c'est silencieux"], 0, "Relou vient de lourd en verlan."),
        ("Quel marqueur oral peut organiser une conclusion rapide ?", ["du coup", "quoique", "cependant que"], 0, "Du coup est fréquent à l'oral, mais à limiter en contexte formel."),
        ("Quelle phrase respecte un contexte professionnel neutre ?", ["Je suis très fatigué.", "Chuis mort.", "Je suis vénère."], 0, "La formulation standard reste la plus sûre."),
        ("« Meuf » signifie :", ["femme", "feu", "ami"], 0, "Meuf est un verlan très familier."),
        ("Quelle expression sénégalaise marque la solidarité ?", ["on est ensemble", "c'est chaud", "pantoute"], 0, "On est ensemble peut signaler proximité et solidarité."),
        ("Dans une présentation académique, il vaut mieux éviter :", ["genre répété à chaque phrase", "un exemple clair", "une définition"], 0, "Les marqueurs oraux trop répétés affaiblissent le registre académique."),
        ("Quelle phrase est familière ?", ["Je souhaiterais obtenir un renseignement.", "Pourriez-vous patienter ?", "Y'a un souci."], 2, "Y'a est une réduction orale de il y a."),
        ("« C'est ouf » signifie :", ["c'est fou", "c'est froid", "c'est fermé"], 0, "Ouf est le verlan de fou."),
        ("Quelle compétence résume le thème ?", ["adapter son registre à la situation", "traduire chaque mot mot à mot", "parler toujours en argot"], 0, "Le thème vise la compétence sociolinguistique."),
    ]
    q_js = json.dumps([{"prompt": p, "options": o, "answer": a, "feedback": f} for p, o, a, f in questions], ensure_ascii=False)
    return f"""{header("Atelier - Registres et français oral | Français Niveau 8", ".layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.34fr);gap:1.25rem}.question-list{display:grid;gap:1rem}.question-card{background:#fff;border-radius:8px;box-shadow:var(--shadow);padding:1rem}.question-card.correct{border:1px solid rgba(35,136,111,.45);background:#f4fffb}.question-card.incorrect{border:1px solid rgba(214,40,57,.42);background:#fff8f8}.option-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.65rem;margin-top:.9rem}.option input{position:absolute;opacity:0}.option span{min-height:58px;display:flex;align-items:center;justify-content:center;text-align:center;padding:.65rem;border-radius:12px;border:2px solid #dbe6f5;background:#fff;color:var(--blue-dark);font-weight:900;cursor:pointer}.option input:checked+span{border-color:var(--blue);background:#eef5ff}.feedback{display:none;margin-top:.85rem;padding:.85rem;border-radius:12px;line-height:1.55}.question-card.correct .feedback,.question-card.incorrect .feedback{display:block}.summary-card{position:sticky;top:6.2rem}.score{font-size:3rem;font-weight:900;color:var(--blue-dark)}.status{display:none;margin-top:1rem;padding:1rem;border-radius:12px;font-weight:800;line-height:1.55}.status.show{display:block;background:#fff2d7;color:#6e5000}.status.success{background:#e9f8f2;color:#126047}@media(max-width:991px){.layout{grid-template-columns:1fr}.summary-card{position:static}.option-grid{grid-template-columns:1fr}}")}
<body>
  {nav("Ateliers")}
  <header class="hero" style="--hero-image:url('../img/themes/theme-08-francophonie-registres-hero.png')"><div class="container"><span class="badge-course"><i class="bi bi-ui-checks"></i> Grammaire · Thème 08</span><h1>Registres et français oral</h1><p class="hero-text">15 questions pour choisir la formulation adaptée, reconnaître le verlan et comprendre des variantes francophones sans les confondre avec des fautes.</p><div class="d-flex flex-wrap gap-3 mt-4"><a class="btn-main" href="#atelier"><i class="bi bi-play-circle"></i> Commencer</a><a class="btn-soft" href="../themes/francophonie-registres-francais-oral.html#structure"><i class="bi bi-book"></i> Revoir l'explication</a></div></div></header>
  <main id="atelier"><section><div class="container"><div class="layout"><section class="panel"><p class="section-kicker">Sélection de réponse</p><h2 class="section-title">Choisissez la forme correcte</h2><p class="section-text">Attention au contexte : un mot peut être correct dans une conversation familière et maladroit dans une présentation formelle.</p><div class="question-list" id="questionList"></div></section><aside class="panel summary-card"><p class="section-kicker">Correction</p><h2 class="h4 fw-bold text-primary">Résultat</h2><div><span class="score" id="scoreValue">0</span><strong>/15</strong></div><button class="btn-main w-100" type="button" id="checkBtn"><i class="bi bi-check2-circle"></i> Vérifier</button><button class="btn-soft w-100 mt-2" type="button" id="resetBtn"><i class="bi bi-arrow-counterclockwise"></i> Recommencer</button><div class="status" id="statusBox"></div></aside></div></div></section></main>
  <footer><div class="container d-flex flex-wrap justify-content-between gap-3"><div><h2 class="h4 fw-bold">Atelier 08G · Registres</h2><p class="mb-0 opacity-75">Renforcement pour comprendre et utiliser le français oral authentique.</p></div><a href="../ateliers-activites.html#theme-08"><i class="bi bi-arrow-left"></i> Retour aux ateliers</a></div></footer>
  <script src="../../../assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
  <script>
    const questions={q_js};
    const list=document.getElementById("questionList"),scoreValue=document.getElementById("scoreValue"),statusBox=document.getElementById("statusBox");
    function esc(v){{return String(v).replace(/[&<>"']/g,c=>({{"&":"&amp;","<":"&lt;",">":"&gt;","\\\"":"&quot;","'":"&#39;"}}[c]));}}
    function render(){{list.innerHTML=questions.map((q,i)=>`<article class="question-card" id="q${{i}}"><h3 class="h6 fw-bold text-primary">Question ${{i+1}}</h3><p>${{esc(q.prompt)}}</p><div class="option-grid">${{q.options.map((o,j)=>`<label class="option"><input type="radio" name="q${{i}}" value="${{j}}"><span>${{esc(o)}}</span></label>`).join("")}}</div><div class="feedback" id="f${{i}}"></div></article>`).join("");}}
    function check(){{let score=0;questions.forEach((q,i)=>{{const card=document.getElementById(`q${{i}}`),feedback=document.getElementById(`f${{i}}`),selected=document.querySelector(`input[name="q${{i}}"]:checked`),ok=selected&&Number(selected.value)===q.answer;card.classList.remove("correct","incorrect");if(ok){{score++;card.classList.add("correct");feedback.innerHTML=`<strong>Correct.</strong> ${{esc(q.feedback)}}`;}}else{{card.classList.add("incorrect");feedback.innerHTML=`<strong>À corriger.</strong> Réponse : <strong>${{esc(q.options[q.answer])}}</strong>. ${{esc(q.feedback)}}`;}}}});scoreValue.textContent=score;statusBox.className=`status show ${{score>=12?"success":""}}`;statusBox.textContent=score>=12?"Très bien. Vous pouvez passer au Studio des registres.":"Relisez les erreurs : demandez-vous qui parle, à qui, où et dans quel but.";statusBox.scrollIntoView({{behavior:"smooth",block:"center"}});}}
    function reset(){{render();scoreValue.textContent="0";statusBox.className="status";statusBox.textContent="";}}
    document.getElementById("checkBtn").addEventListener("click",check);document.getElementById("resetBtn").addEventListener("click",reset);render();
  </script>
  <script src="../../../assets/js/google-auth-config.js"></script>
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <script src="../../../assets/js/google-auth.js"></script>
  <script src="/assets/js/course-switcher.js?v=20260628-cours"></script>
</body>
</html>"""


def conversation_page() -> str:
    return f"""{header("Conversation 08R - Studio des registres | Français Niveau 8", ".studio{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,.5fr);gap:1.25rem}.scenario{border-left:7px solid var(--green);background:#f8fbff;border-radius:8px;padding:1rem;margin:1rem 0;line-height:1.7}.spin-row{display:flex;flex-wrap:wrap;gap:.7rem;margin:1rem 0}.role-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1rem}.role-card{background:#fff;border-radius:8px;box-shadow:var(--shadow);padding:1rem}.role-card h3{font-size:1.05rem;font-weight:900;color:var(--blue-dark)}.role-card span{display:inline-flex;border-radius:999px;background:#eef5ff;color:var(--blue-dark);font-weight:900;padding:.35rem .6rem;margin-bottom:.55rem}.phrase-bank{display:grid;gap:.7rem}.phrase-bank button{border:1px solid rgba(31,78,140,.16);background:#fff;border-radius:8px;text-align:left;padding:.8rem;color:var(--blue-dark);font-weight:800}.timer{font-size:2.8rem;font-weight:900;color:var(--blue-dark);font-variant-numeric:tabular-nums}.checklist{display:grid;gap:.55rem}.checklist label{display:flex;gap:.55rem;align-items:flex-start;line-height:1.45;color:var(--muted);font-weight:800}@media(max-width:900px){.studio{grid-template-columns:1fr}}")}
<body>
  {nav("Ateliers")}
  <header class="hero" style="--hero-image:url('../img/themes/theme-08-francophonie-registres-hero.png')"><div class="container"><span class="badge-course"><i class="bi bi-people-fill"></i> Conversation · 08R</span><h1>Studio des registres</h1><p class="hero-text">Une activité type rulette : le système tire une situation, un interlocuteur, un registre cible et une expression idiomatique. L'étudiant doit reformuler son message pour parler naturellement sans perdre la précision.</p><div class="d-flex flex-wrap gap-3 mt-4"><a class="btn-main" href="#activite"><i class="bi bi-play-circle"></i> Lancer le studio</a><a class="btn-soft" href="../themes/francophonie-registres-francais-oral.html"><i class="bi bi-book"></i> Revoir le thème</a></div></div></header>
  <main id="activite"><section><div class="container"><div class="studio"><section class="panel"><p class="section-kicker">Situation tirée</p><h2 class="section-title">Préparez deux versions de votre message</h2><p class="section-text">Vous devez produire une version standard ou soutenue, puis une version familière contrôlée. Utilisez une expression du thème : <em>c'est chaud</em>, <em>c'est ouf</em>, <em>c'est relou</em>, <em>être vénère</em> ou <em>on est ensemble</em>.</p><div class="scenario" id="scenarioBox">Cliquez sur le bouton pour tirer une situation.</div><div class="spin-row"><button class="btn-main" id="newScenario" type="button"><i class="bi bi-shuffle"></i> Nouveau scénario</button><button class="btn-soft" id="startTimer" type="button"><i class="bi bi-stopwatch"></i> 2 minutes</button><button class="btn-soft" id="resetTimer" type="button"><i class="bi bi-arrow-counterclockwise"></i> Reset</button></div><div class="timer" id="timer">02:00</div><hr><h3 class="h4 fw-bold text-primary">Rôles possibles</h3><div class="role-grid" id="roleGrid"></div></section><aside class="panel"><p class="section-kicker">Appui oral</p><h2 class="h4 fw-bold text-primary">Banque de phrases</h2><div class="phrase-bank" id="phraseBank"></div><hr><p class="section-kicker">Auto-contrôle</p><div class="checklist"><label><input type="checkbox"> J'ai identifié le contexte avant de choisir le registre.</label><label><input type="checkbox"> J'ai produit une version claire et une version plus orale.</label><label><input type="checkbox"> J'ai utilisé une expression idiomatique du thème.</label><label><input type="checkbox"> J'ai évité l'argot dans la version formelle.</label></div></aside></div></div></section></main>
  <footer><div class="container d-flex flex-wrap justify-content-between gap-3"><div><h2 class="h4 fw-bold">Conversation 08R · Studio des registres</h2><p class="mb-0 opacity-75">Pratique orale de la compétence sociolinguistique.</p></div><a href="../ateliers-activites.html#theme-08"><i class="bi bi-arrow-left"></i> Retour aux ateliers</a></div></footer>
  <script src="../../../assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
  <script>
    const situations=["Vous devez demander deux minutes à un professeur après le cours.","Vous expliquez à un ami qu'un projet est très compliqué.","Vous présentez une chanson qui mélange français littéraire et verlan.","Vous comparez un mot québécois avec son équivalent en France.","Vous répondez à une personne qui juge le verlan comme une faute."];
    const interlocuteurs=["professeur","ami proche","journaliste culturel","étudiant québécois","responsable administratif","camarade de classe"];
    const registres=["soutenu puis familier","standard puis familier","familier puis standard","standard avec variante francophone","formel sans argot"];
    const expressions=["c'est chaud","c'est ouf","c'est relou","être vénère","on est ensemble"];
    const phrases=["Version standard : Est-ce que vous auriez un moment pour discuter de ce point ?","Version familière : T'as deux minutes ? J'te parle d'un truc, c'est chaud.","Je comprends la critique, mais le verlan peut être une création linguistique.","Dans mon contexte, cette expression serait naturelle; dans un courriel officiel, je l'éviterais.","On est ensemble : l'idée est de rester clair, pas de parler comme un dictionnaire."];
    const roles=["Animateur radio","Étudiant international","Rappeur invité","Professeur de français","Ami parisien","Étudiante québécoise"];
    const scenarioBox=document.getElementById("scenarioBox"),roleGrid=document.getElementById("roleGrid"),phraseBank=document.getElementById("phraseBank"),timer=document.getElementById("timer");
    function pick(list){{return list[Math.floor(Math.random()*list.length)];}}
    function renderRoles(){{roleGrid.innerHTML=roles.map((role,index)=>`<article class="role-card"><span>Rôle ${{index+1}}</span><h3>${{role}}</h3><p class="section-text mb-0">Adaptez le vocabulaire à ce point de vue et expliquez votre choix de registre.</p></article>`).join("");}}
    function renderPhrases(){{phraseBank.innerHTML=phrases.map((p)=>`<button type="button">${{p}}</button>`).join("");}}
    function newScenario(){{scenarioBox.innerHTML=`<strong>Situation :</strong> ${{pick(situations)}}<br><strong>Interlocuteur :</strong> ${{pick(interlocuteurs)}}<br><strong>Registre demandé :</strong> ${{pick(registres)}}<br><strong>Expression obligatoire :</strong> ${{pick(expressions)}}.`;}}
    let seconds=120,handle=null;function show(){{timer.textContent=`${{String(Math.floor(seconds/60)).padStart(2,"0")}}:${{String(seconds%60).padStart(2,"0")}}`;}}function start(){{clearInterval(handle);handle=setInterval(()=>{{seconds=Math.max(0,seconds-1);show();if(seconds===0)clearInterval(handle);}},1000);}}function reset(){{clearInterval(handle);seconds=120;show();}}
    document.getElementById("newScenario").addEventListener("click",newScenario);document.getElementById("startTimer").addEventListener("click",start);document.getElementById("resetTimer").addEventListener("click",reset);renderRoles();renderPhrases();show();
  </script>
  <script src="../../../assets/js/google-auth-config.js"></script>
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <script src="../../../assets/js/google-auth.js"></script>
  <script src="/assets/js/course-switcher.js?v=20260628-cours"></script>
</body>
</html>"""


def production_page() -> str:
    return f"""{header("Production 08E - Portrait de langue | Français Niveau 8", ".task-list{display:grid;gap:.8rem}.task-list li{background:#fff;border:1px solid rgba(31,78,140,.12);border-radius:8px;padding:.85rem;line-height:1.6}.rubric{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1rem}.rubric article{background:#fff;border-radius:8px;box-shadow:var(--shadow);padding:1rem}.rubric strong{color:var(--blue-dark)}textarea{width:100%;min-height:260px;border:1px solid rgba(31,78,140,.2);border-radius:8px;padding:1rem;line-height:1.6}.notice{background:#fff4d6;border-left:7px solid var(--yellow);border-radius:8px;padding:1rem;color:#6f5200;font-weight:800}")}
<body>
  {nav("Ateliers")}
  <header class="hero" style="--hero-image:url('../img/ateliers/listening-08c-rappeur-langue.png')"><div class="container"><span class="badge-course"><i class="bi bi-pencil-square"></i> Production · 08E</span><h1>Portrait de langue</h1><p class="hero-text">Écrivez un court portrait linguistique, puis enregistrez votre lecture. Le texte doit intégrer au moins une expression idiomatique du thème et montrer une différence de registre.</p><div class="d-flex flex-wrap gap-3 mt-4"><a class="btn-main" href="#consigne"><i class="bi bi-play-circle"></i> Lire la consigne</a><a class="btn-soft" href="../themes/francophonie-registres-francais-oral.html"><i class="bi bi-book"></i> Revoir le thème</a></div></div></header>
  <main><section id="consigne"><div class="container"><div class="row g-4"><div class="col-lg-7"><div class="panel"><p class="section-kicker">Consigne évaluative</p><h2 class="section-title">Rédiger puis enregistrer</h2><p class="section-text">Rédigez entre 180 et 230 mots. Vous pouvez présenter un artiste, un ami francophone imaginaire, un étudiant en échange ou vous-même comme personne qui change de registre selon la situation.</p><ol class="task-list"><li>Présentez la personne et son contexte linguistique.</li><li>Donnez un exemple de registre standard ou soutenu.</li><li>Donnez un exemple de registre familier ou de français oral authentique.</li><li>Expliquez pourquoi le choix du registre est pertinent.</li><li>Utilisez au moins une expression : <strong>c'est chaud</strong>, <strong>c'est ouf</strong>, <strong>c'est relou</strong>, <strong>être vénère</strong> ou <strong>on est ensemble</strong>.</li></ol><textarea id="draftText" placeholder="Écrivez votre texte ici avant de l'enregistrer..."></textarea><p class="notice mt-3">Après validation en classe, l'audio est sauvegardé pour que le professeur puisse écouter la dernière version et donner un feedback.</p></div></div><div class="col-lg-5"><div class="panel"><p class="section-kicker">Critères</p><div class="rubric"><article><strong>Contenu</strong><p>Portrait clair, exemples cohérents et thème respecté.</p></article><article><strong>Registre</strong><p>Différence compréhensible entre standard/soutenu et familier/oral.</p></article><article><strong>Expression</strong><p>Expression idiomatique intégrée naturellement.</p></article><article><strong>Oral</strong><p>Lecture fluide, intelligible et prête pour feedback.</p></article></div><a class="btn-main w-100 mt-3" href="prononciation-08d-francais-oral.html"><i class="bi bi-mic-fill"></i> Passer au recorder</a></div></div></div></div></section></main>
  <footer><div class="container d-flex flex-wrap justify-content-between gap-3"><div><h2 class="h4 fw-bold">Production 08E · Portrait de langue</h2><p class="mb-0 opacity-75">Écriture guidée et préparation orale pour feedback professeur.</p></div><a href="../ateliers-activites.html#theme-08"><i class="bi bi-arrow-left"></i> Retour aux ateliers</a></div></footer>
  {scripts()}
</body>
</html>"""


def pronunciation_page() -> str:
    # Keep the DOM contract used by the reusable per-theme pronunciation script.
    source = read(ATELIERS / "prononciation-07d-justice-sociale.html")
    source = source.replace("Theme 07 · Prononciation 07D", "Thème 08 · Prononciation 08D")
    source = source.replace("Bien que l'egalite reste fragile", "J'sais pas, c'est chaud")
    source = source.replace("Travaillez les enchainements, les groupes rythmiques et les liaisons dans une prise de position sur la justice sociale.", "Travaillez les réductions orales, le rythme du français familier contrôlé et le passage vers le registre soutenu.")
    source = source.replace("../ateliers-activites.html#theme-07", "../ateliers-activites.html#theme-08")
    source = source.replace("Theme 07", "Thème 08")
    source = source.replace("../audio/pronunciation/theme-07/n8-07d-justice-sociale-modele-france.mp3", "../audio/pronunciation/theme-08/n8-08d-francais-oral-modele-france.mp3")
    source = source.replace("Voix modele · francais de France", "Voix modèle · français de France")
    source = source.replace("Audio professionnel genere avec ElevenLabs", "Audio professionnel généré avec ElevenLabs")
    source = source.replace("4 sections guidees", "4 sections guidées")
    source = source.replace("Lisez le paragraphe", "Lisez les phrases de registre")
    source = source.replace("Avancez sans stress : lisez une courte section, observez la correction et votre note, puis passez a la suivante. Le paragraphe complet arrive seulement dans le defi final.", "Avancez par petites sections : écoutez le modèle, lisez la phrase, observez la transcription et reprenez les réductions sans avaler les mots importants.")
    source = source.replace("listening-07b-engagement-citoyen.png", "listening-08a-parler-parisien.png")
    source = source.replace("prononciation-07d-justice-sociale.html", "prononciation-08d-francais-oral.html")
    source = source.replace("french8-pronunciation-theme07.js?v=20260701-theme07-elevenlabs", "french8-pronunciation-theme08.js?v=20260701-theme08-elevenlabs")
    source = source.replace("Justice sociale", "Français oral")
    return source


def pronunciation_js() -> str:
    source = read(ASSETS_JS / "french8-pronunciation-theme07.js")
    replacements = {
        "../audio/pronunciation/theme-07/section-1.mp3": "../audio/pronunciation/theme-08/section-1.mp3",
        "../audio/pronunciation/theme-07/section-2.mp3": "../audio/pronunciation/theme-08/section-2.mp3",
        "../audio/pronunciation/theme-07/section-3.mp3": "../audio/pronunciation/theme-08/section-3.mp3",
        "../audio/pronunciation/theme-07/section-4.mp3": "../audio/pronunciation/theme-08/section-4.mp3",
        "../audio/pronunciation/theme-07/n8-07d-justice-sociale-modele-france.mp3": "../audio/pronunciation/theme-08/n8-08d-francais-oral-modele-france.mp3",
        "Bien que l'ascenseur social semble en panne, il ne faut pas baisser les bras.": "A l'oral, je dis souvent : j'sais pas, y'a du bruit, t'as deux minutes ?",
        "Meme si les obstacles sont nombreux, certaines initiatives ouvrent des portes.": "En registre soutenu, je dirais plutot : pourriez-vous m'accorder un instant ?",
        "Quoique les resultats soient encore limites, le debat citoyen avance.": "Le verlan change le rythme : c'est ouf, c'est chelou, parfois c'est relou.",
        "Malgre le plafond de verre, des parcours inspirants montrent que l'egalite reste un combat.": "Mais le bon registre au bon moment, c'est la cle pour rester clair.",
        "Bien que l'ascenseur social semble en panne, il ne faut pas baisser les bras. Meme si les obstacles sont nombreux, certaines initiatives ouvrent des portes. Quoique les resultats soient encore limites, le debat citoyen avance. Malgre le plafond de verre, des parcours inspirants montrent que l'egalite reste un combat.": "A l'oral, je dis souvent : j'sais pas, y'a du bruit, t'as deux minutes ? En registre soutenu, je dirais plutot : pourriez-vous m'accorder un instant ? Le verlan change le rythme : c'est ouf, c'est chelou, parfois c'est relou. Mais le bon registre au bon moment, c'est la cle pour rester clair.",
        "jaralingua:french8:pronunciation-07d:v1": "jaralingua:french8:pronunciation-08d:v1",
        'evaluationId: "pronunciation07d"': 'evaluationId: "pronunciation08d"',
        'title: "Prononciation 07D - Justice sociale et citoyennete"': 'title: "Prononciation 08D - Francais oral authentique"',
        "prononciation-07d-justice-sociale.html": "prononciation-08d-francais-oral.html",
        "Bien que l'egalite reste fragile": "J'sais pas, c'est chaud",
        "Justice sociale": "Francais oral",
    }
    for old, new in replacements.items():
        source = source.replace(old, new)
    extra_homophones = {
        '"ia": "il y a",': '"ia": "il y a",\n      "ya": "il y a",\n      "sais": "sais",\n      "chai": "sais",\n      "chais": "sais",',
    }
    for old, new in extra_homophones.items():
        source = source.replace(old, new)
    return source


def pronunciation_script() -> str:
    sections = [
        ("pronunciation/theme-08/section-1.mp3", "Claire: A l'oral, je dis souvent : j'sais pas, y'a du bruit, t'as deux minutes ?"),
        ("pronunciation/theme-08/section-2.mp3", "Claire: En registre soutenu, je dirais plutot : pourriez-vous m'accorder un instant ?"),
        ("pronunciation/theme-08/section-3.mp3", "Claire: Le verlan change le rythme : c'est ouf, c'est chelou, parfois c'est relou."),
        ("pronunciation/theme-08/section-4.mp3", "Claire: Mais le bon registre au bon moment, c'est la cle pour rester clair."),
        ("pronunciation/theme-08/n8-08d-francais-oral-modele-france.mp3", "Claire: A l'oral, je dis souvent : j'sais pas, y'a du bruit, t'as deux minutes ? En registre soutenu, je dirais plutot : pourriez-vous m'accorder un instant ? Le verlan change le rythme : c'est ouf, c'est chelou, parfois c'est relou. Mais le bon registre au bon moment, c'est la cle pour rester clair."),
    ]
    parts = ["# Prononciation 08D - Français oral authentique", "", "Voix cible : français de France. Les apostrophes orales sont volontairement présentes pour entraîner la reconnaissance de l'oral authentique."]
    for index, (file, text) in enumerate(sections, 1):
        title = "Défi final" if "modele" in file else f"Section {index}"
        parts.extend(["", f"## {title}", "", f"File: `{file}`", "", text])
    return "\n".join(parts)


def update_listening_data() -> None:
    path = ASSETS_JS / "french8-listening-activity-data.js"
    text = read(path)
    if '"08a"' in text:
        return
    additions = []
    for aid, item in LISTENINGS.items():
        additions.append(f'    "{aid}": {json.dumps(item["questions_quebec"], ensure_ascii=False, indent=6)}')
    insert = ",\n" + ",\n".join(additions)
    text = text.replace("\n  };\n})();", insert + "\n  };\n})();")
    path.write_text(text, encoding="utf-8")


def update_themes_portal() -> None:
    path = N8 / "themes-du-cours.html"
    text = read(path)
    pattern = re.compile(r'<article class="theme-card"><div class="theme-image"><img src="../Niveau%207/img/ecoute-culture-quebecoise.png" alt="Francophonie, registres et français oral authentique"><div class="theme-number">08</div></div><div class="theme-body">.*?</div></article>', re.S)
    repl = '<article class="theme-card"><div class="theme-image"><img src="img/themes/theme-08-francophonie-registres-hero.png" alt="Francophonie, registres et français oral authentique"><div class="theme-number">08</div></div><div class="theme-body"><span class="grammar-pill"><i class="bi bi-braces"></i>Registres et verlan</span><h3>Francophonie, registres et français oral authentique</h3><p>Comprendre les registres de langue, le français familier, les réductions orales et le verlan en contexte.</p><p class="section-text mb-0">Registres soutenu/standard/familier; marqueurs oraux; réductions fréquentes; variantes francophones.</p><a class="status-pill" href="themes/francophonie-registres-francais-oral.html" style="text-decoration:none;width:max-content;"><i class="bi bi-box-arrow-up-right"></i>Page détaillée disponible</a></div></article>'
    new = pattern.sub(repl, text, count=1)
    if new == text and "Page détaillée à construire" in text:
        new = text.replace("Page détaillée à construire", "Page détaillée disponible")
    path.write_text(new, encoding="utf-8")


def update_ateliers_portal() -> None:
    path = N8 / "ateliers-activites.html"
    text = read(path)
    if 'id="theme-08"' in text:
        return
    block = """    <article class="practice-theme" id="theme-08"><div class="practice-theme-head"><p>Thème 08</p><h2>Francophonie, registres et français oral authentique</h2></div><div class="practice-grid">
      <a class="practice-card" href="ateliers/comprehension-orale-08a-parler-parisien.html?audio-variants=2"><img src="img/ateliers/listening-08a-parler-parisien.png" alt="Conversation sur le français parisien oral"><div class="practice-card-body"><b>Compréhension orale · 08A</b><h3>Parler comme un Parisien</h3><p>Audio B2 sur réductions orales, verlan, registres et expressions familières.</p><span>Ouvrir <i class="bi bi-arrow-right"></i></span></div></a>
      <a class="practice-card" href="ateliers/comprehension-orale-08b-francophonie-mouvement.html?audio-variants=2"><img src="img/ateliers/listening-08b-francophonie-mouvement.png" alt="Carte de la francophonie en mouvement"><div class="practice-card-body"><b>Compréhension orale · 08B</b><h3>La francophonie en mouvement</h3><p>Audio B2 sur variantes belges, suisses, québécoises et africaines.</p><span>Ouvrir <i class="bi bi-arrow-right"></i></span></div></a>
      <a class="practice-card" href="ateliers/comprehension-orale-08c-rappeur-langue.html?audio-variants=2"><img src="img/ateliers/listening-08c-rappeur-langue.png" alt="Rappeur travaillant les registres en studio"><div class="practice-card-body"><b>Compréhension orale · 08C</b><h3>Un rappeur et la langue</h3><p>Portrait culturel sur registre littéraire, oralité, verlan et identité.</p><span>Ouvrir <i class="bi bi-arrow-right"></i></span></div></a>
      <a class="practice-card" href="ateliers/atelier-registres-francais-oral.html"><img src="img/themes/theme-08-francophonie-registres-hero.png" alt="Atelier sur registres et français oral"><div class="practice-card-body"><b>Grammaire · 08G</b><h3>Registres et français oral</h3><p>15 questions pour choisir la formulation adaptée et comprendre le sens.</p><span>S'entraîner <i class="bi bi-ui-checks"></i></span></div></a>
      <a class="practice-card" href="ateliers/studio-registres-francophones.html"><img src="img/themes/theme-08-francophonie-registres-hero.png" alt="Studio de conversation sur les registres"><div class="practice-card-body"><b>Expression orale · 08R</b><h3>Studio des registres</h3><p>Activité type rulette avec situation, interlocuteur, registre et expression idiomatique.</p><span>Parler <i class="bi bi-people-fill"></i></span></div></a>
      <a class="practice-card" href="ateliers/production-08e-portrait-langue.html"><img src="img/ateliers/listening-08c-rappeur-langue.png" alt="Production écrite et orale sur un portrait de langue"><div class="practice-card-body"><b>Production · 08E</b><h3>Portrait de langue</h3><p>Texte guidé, expression idiomatique obligatoire et audio pour feedback.</p><span>Produire <i class="bi bi-pencil-square"></i></span></div></a>
      <a class="practice-card" href="ateliers/prononciation-08d-francais-oral.html"><img src="img/ateliers/listening-08a-parler-parisien.png" alt="Prononciation guidée du français oral authentique"><div class="practice-card-body"><b>Prononciation · 08D</b><h3>J'sais pas, c'est chaud</h3><p>Réductions orales, rythme, verlan et défi final sauvegardé pour feedback.</p><span>S'entraîner <i class="bi bi-mic-fill"></i></span></div></a>
    </div></article>"""
    text = text.replace("    </div></article>  </div></div></section></main>", "    </div></article>\n" + block + "  </div></div></section></main>")
    path.write_text(text, encoding="utf-8")


def update_expressions() -> None:
    path = N8 / "expressions-idiomatiques.html"
    text = read(path)
    if "c'est chaud" in text and "on est ensemble" in text:
        return
    marker = "const idioms = ["
    addition = """
        { theme: 'Thème 08', expression: "c'est chaud", meaning: "c'est difficile, tendu ou compliqué", example: "Demander un service sans contexte, c'est chaud." },
        { theme: 'Thème 08', expression: "c'est ouf", meaning: "c'est fou, surprenant ou impressionnant", example: "Son passage du verlan au registre littéraire, c'est ouf." },
        { theme: 'Thème 08', expression: "c'est relou", meaning: "c'est pénible ou agaçant", example: "Répéter genre à chaque phrase, c'est relou dans une présentation." },
        { theme: 'Thème 08', expression: "être vénère", meaning: "être énervé, en registre familier", example: "Il était vénère parce qu'on avait mal compris son accent." },
        { theme: 'Thème 08', expression: "on est ensemble", meaning: "formule de solidarité et de proximité", example: "Même si nos accents changent, on est ensemble." },
"""
    if marker in text:
        text = text.replace(marker, marker + addition, 1)
        text = text.replace("Pour le theme 07, reutilisez", "Pour les themes 07 et 08, reutilisez")
    path.write_text(text, encoding="utf-8")


def update_audit_script() -> None:
    path = ROOT / "tools" / "audit_french8_stt.py"
    text = read(path)
    entry = '    AUDIO_ROOT / "pronunciation-francais-oral-script.md",'
    if entry not in text:
        text = text.replace('    AUDIO_ROOT / "pronunciation-justice-sociale-script.md",\n]', '    AUDIO_ROOT / "pronunciation-justice-sociale-script.md",\n' + entry + '\n]')
    path.write_text(text, encoding="utf-8")


def main() -> None:
    write(THEMES / "francophonie-registres-francais-oral.html", theme_page())
    for aid, item in LISTENINGS.items():
        write(ATELIERS / item["page"], listening_page(aid, item))
    write(ATELIERS / "atelier-registres-francais-oral.html", grammar_page())
    write(ATELIERS / "studio-registres-francophones.html", conversation_page())
    write(ATELIERS / "production-08e-portrait-langue.html", production_page())
    write(ATELIERS / "prononciation-08d-francais-oral.html", pronunciation_page())
    write(ASSETS_JS / "french8-pronunciation-theme08.js", pronunciation_js())
    write(AUDIO / "pronunciation-francais-oral-script.md", pronunciation_script())
    update_listening_data()
    update_themes_portal()
    update_ateliers_portal()
    update_expressions()
    update_audit_script()


if __name__ == "__main__":
    main()
