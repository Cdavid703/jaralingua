"""Apply the approved vocabulary banks and repair French final-exam text.

The source for the vocabulary questions is the teacher document received on
2026-07-20.  The script keeps the remaining sections intact, updates the exam
version, and validates the 50-point structure before writing UTF-8 JSON.
"""

from __future__ import annotations

import json
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
FRENCH1_PATH = ROOT / "data" / "french1-final-exam.local.json"
FRENCH2_PATH = ROOT / "data" / "french2-final-exam.local.json"
FRENCH2_AUDIO_SCRIPT_PATH = ROOT / "server" / "private_assets" / "french2-final-exam-audio-script.md"
EXAM_VERSION = "2026-07-20-teacher-vocabulary"

FRENCH2_TRANSCRIPT_PARAGRAPHS = [
    (
        "Bonjour, je m’appelle Nora. Aujourd’hui, je vais passer une journée à Envigado "
        "avec mon ami Malik. Le matin, je vais à la pharmacie parce que j’ai mal à la gorge."
    ),
    (
        "Ensuite, nous allons déjeuner dans un petit restaurant près du parc. Je voudrais "
        "une soupe, du riz et de l’eau. Malik préfère une salade avec du poulet. Il ne veut "
        "pas de dessert parce qu’il n’a pas très faim."
    ),
    (
        "À midi, il va faire chaud. L’après-midi, il va y avoir du vent et quelques nuages. "
        "Je vais porter un pantalon noir et une chemise blanche. Malik va mettre une veste "
        "légère parce qu’il a souvent froid quand il y a du vent."
    ),
    (
        "Après le déjeuner, nous allons visiter un appartement pour sa cousine. Il est plus "
        "grand que son studio, mais il coûte plus cher. La cuisine est à droite du salon, "
        "la salle de bains est en face de la chambre et le bureau est près de la fenêtre."
    ),
    (
        "À la fin de la journée, nous allons retrouver deux camarades à la gare. Pour y aller, "
        "il faut continuer tout droit, tourner à gauche et traverser la rue. Si mon téléphone "
        "n’a plus de batterie, nous allons demander notre chemin à quelqu’un."
    ),
]

FRENCH2_READING_PARAGRAPHS = [
    (
        "Salut Nora. Demain matin, je vais passer à la pharmacie avec toi parce que tu as mal "
        "à la gorge. Ensuite, nous allons déjeuner au restaurant près du parc. Je vais prendre "
        "une salade avec du poulet et un verre d’eau. Je ne veux pas de dessert parce que je "
        "préfère manger léger."
    ),
    (
        "L’après-midi, nous allons visiter l’appartement de ma cousine. Il est plus grand que "
        "mon studio, mais il coûte plus cher. La chambre est en face de la salle de bains, et le "
        "bureau est près de la fenêtre. S’il y a du vent, je vais porter une veste légère. Après "
        "la visite, nous allons à la gare. Elle est à deux pas du restaurant."
    ),
]


def mcq(question_id: str, prompt: str, options: list[str], answer: int) -> dict:
    return {
        "id": question_id,
        "type": "mcq",
        "prompt": prompt,
        "options": options,
        "answer": answer,
        "points": 1,
    }


def french1_vocabulary_questions() -> list[dict]:
    # Two source items were pedagogically ambiguous. Their wording is narrowed
    # without changing the vocabulary supplied by the teacher.
    return [
        mcq("v1", "C’est la mère de ma mère.", ["grand-mère", "belle-mère", "tante"], 0),
        mcq("v2", "On va au cinéma pour voir un film.", ["hôtel", "cinéma", "musée"], 1),
        mcq("v3", "Une personne qui travaille dans un restaurant est un(e)…", ["serveur / serveuse", "policier / policière", "architecte"], 0),
        mcq("v4", "Une personne qui enseigne à l’école est un(e)…", ["médecin", "professeur / professeure", "boulanger / boulangère"], 1),
        mcq("v5", "On prend une douche dans la…", ["cuisine", "salle de bains", "chambre"], 1),
        mcq("v6", "C’est le fils de mes parents, mais ce n’est pas moi.", ["oncle", "cousin", "frère"], 2),
        mcq("v7", "Dans la cuisine, quel appareil sert à faire cuire les aliments ?", ["table", "four", "lavabo"], 1),
        mcq("v8", "On y va pour acheter des médicaments.", ["pharmacie", "école", "banque"], 0),
        mcq("v9", "Une personne qui vend du pain est un(e)…", ["boulanger / boulangère", "avocat / avocate", "dentiste"], 0),
        mcq("v10", "On mange dans la…", ["chambre", "salle de bains", "salle à manger"], 2),
        mcq("v11", "C’est le frère de mon père ou de ma mère.", ["oncle", "beau-père", "frère"], 0),
        mcq("v12", "On regarde dehors par la…", ["chaise", "fenêtre", "armoire"], 1),
        mcq("v13", "On y va quand on est malade.", ["banque", "hôpital", "parc"], 1),
        mcq("v14", "Pour conserver les aliments au froid, on utilise…", ["réfrigérateur", "placard", "porte"], 0),
        mcq("v15", "Dans la chambre, on dort dans un…", ["lit", "table", "chaise"], 0),
    ]


def french2_vocabulary_questions() -> list[dict]:
    return [
        mcq("v1", "En hiver, on porte un…", ["chaise", "lit", "manteau"], 2),
        mcq("v2", "Pour être propre, on…", ["prend une douche", "prend un livre", "prend une chaise"], 0),
        mcq("v3", "Je bois de l’…", ["eau", "pomme", "pain"], 0),
        mcq("v4", "Après le petit déjeuner, on…", ["se brosse les dents", "se couche", "se promène"], 0),
        mcq("v5", "Pour aller à l’école, on peut prendre le…", ["lit", "bus", "pain"], 1),
        mcq("v6", "On attend le bus à l’…", ["arrêt", "chambre", "cuisine"], 0),
        mcq("v7", "Le soir, on va au…", ["table", "lit", "chaise"], 1),
        mcq("v8", "On achète du pain à la…", ["boulangerie", "pharmacie", "école"], 0),
        mcq("v9", "On va au… pour voir un film.", ["gare", "cinéma", "banque"], 1),
        mcq("v10", "Le matin, avant d’aller à l’école, on prend le…", ["déjeuner", "petit déjeuner", "dîner"], 1),
        mcq("v11", "Quel vêtement porte-t-on quand il fait froid ?", ["t-shirt", "short", "veste"], 2),
        mcq("v12", "En été, il fait souvent…", ["chaud", "gris", "mouillé"], 0),
        mcq("v13", "Je mange une…", ["table", "lait", "banane"], 2),
        mcq("v14", "Aux pieds, on porte des…", ["chaussures", "lunettes", "chemises"], 0),
        mcq("v15", "Sur la tête, on peut porter une…", ["jupe", "robe", "casquette"], 2),
    ]


REPAIRS = {
    "journ?e": "journée",
    " ? Envigado": " à Envigado",
    "passer ? la": "passer à la",
    "mal ? la": "mal à la",
    "Apr?s": "Après",
    "apr?s": "après",
    "d?jeuner": "déjeuner",
    "pr?s": "près",
    "pr?f?re": "préfère",
    "tr?s": "très",
    "? midi": "À midi",
    "l?g?re": "légère",
    "co?te": "coûte",
    " ? droite": " à droite",
    "t?l?phone": "téléphone",
    "? la fin": "À la fin",
    " ? deux pas": " à deux pas",
    " ? quelqu'un": " à quelqu'un",
    "pr?cis": "précis",
    "r?ponse": "réponse",
    "d?pend": "dépend",
    "d?crire": "décrire",
    "m?t?o": "météo",
    "v?tement": "vêtement",
    "adapt?": "adapté",
    "th?me": "thème",
    "ferm?e": "fermée",
    "ch?re": "chère",
    "d?placement": "déplacement",
    "li?...": "lié…",
    "pr?vues": "prévues",
    "sympt?me": "symptôme",
    "quantit?": "quantité",
    "Compl?tez": "Complétez",
    "travaill?e": "travaillée",
    "N?gation": "Négation",
    "Pr?positions": "Prépositions",
    "Imp?ratif": "Impératif",
    "M?t?o": "Météo",
    "Quantit?": "Quantité",
    "Compr?hension ?crite": "Compréhension écrite",
    "v?rifient": "vérifient",
    "O?": "Où",
    "? c?t?": "À côté",
    "r?sume": "résume",
    "r?unit": "réunit",
    "Sant?": "Santé",
    "Compr?hension orale": "Compréhension orale",
    "?coutez": "Écoutez",
    "prot?g?": "protégé",
    "r?serv?": "réservé",
    "appara?tre": "apparaître",
    "annonc?": "annoncé",
    "?l?gant": "élégant",
    "d?crit": "décrit",
    "m?ne": "mène",
    "m?dicaments": "médicaments",
    "caf?": "café",
    "t?te": "tête",
    "achet?": "acheté",
    "ach?tent": "achètent",
    "r?ponses": "réponses",
    "fen?tre": "fenêtre",
    "isol?e": "isolée",
    "li?e": "liée",
    "probl?me": "problème",
    "l?ger": "léger",
    "Pr?s": "Près",
    "biblioth?que": "bibliothèque",
    "sant?": "santé",
    "compar?": "comparé",
    "pass? compos?": "passé composé",
}


EXACT_REPAIRS = {
    "? Il y aura du vent ?": "« Il y aura du vent »",
    "? Traverser la rue ?": "« Traverser la rue »",
    "? Retrouver deux camarades ?": "« Retrouver deux camarades »",
    "? La cuisine est ? droite du salon ?": "« La cuisine est à droite du salon »",
    "? Demander son chemin ?": "« Demander son chemin »",
    "? La gare est ? deux pas ?": "« La gare est à deux pas »",
}


def repair_text(value: str) -> str:
    for old, new in EXACT_REPAIRS.items():
        value = value.replace(old, new)
    for old, new in REPAIRS.items():
        value = value.replace(old, new)
    value = value.replace(" ? la description", " à la description")
    value = value.replace(" ? la commande", " à la commande")
    value = value.replace(" ? une veste", " à une veste")
    value = value.replace(" ? la pharmacie", " à la pharmacie")
    value = value.replace(" ? la gare", " à la gare")
    value = value.replace(" ? droite", " à droite")
    value = value.replace(" ? deux pas", " à deux pas")
    value = value.replace(" ? quelqu'un", " à quelqu'un")
    value = value.replace("tourner ? gauche", "tourner à gauche")
    value = value.replace("réservé ? l'", "réservé à l'")
    value = value.replace("A1.2 ? Une", "A1.2 — Une")
    value = value.replace("Message de Malik ? Nora", "Message de Malik à Nora")
    value = value.replace(
        "Que signifie à la gare est à deux pas ? dans le message ?",
        "Que signifie « la gare est à deux pas » dans le message ?",
    )
    value = value.replace("? droite de la gare", "À droite de la gare")
    return value


def repair_tree(value):
    if isinstance(value, str):
        return repair_text(value)
    if isinstance(value, list):
        return [repair_tree(item) for item in value]
    if isinstance(value, dict):
        return {key: repair_tree(item) for key, item in value.items()}
    return value


def find_section(exam: dict, section_id: str) -> dict:
    for section in exam.get("sections", []):
        if section.get("id") == section_id:
            return section
    raise ValueError(f"Missing section: {section_id}")


def validate(bundle: dict, expected_vocabulary_count: int) -> None:
    exam = bundle["exam"]
    sections = exam.get("sections", [])
    section_points = 0.0
    all_ids: set[str] = set()
    for section in sections:
        questions = section.get("questions", [])
        question_points = 0.0
        for question in questions:
            question_id = str(question.get("id") or "")
            if not question_id or question_id in all_ids:
                raise ValueError(f"Invalid or duplicate question id: {question_id!r}")
            all_ids.add(question_id)
            points = float(question.get("points", 0))
            question_points += points
            options = question.get("options")
            if isinstance(options, list):
                answer = question.get("answer")
                if not isinstance(answer, int) or not 0 <= answer < len(options):
                    raise ValueError(f"Invalid answer index for {question_id}")
        declared = float(section.get("points", 0))
        if question_points != declared:
            raise ValueError(
                f"Section {section.get('id')} has {question_points} question points, expected {declared}"
            )
        section_points += declared
    if section_points != float(exam.get("totalPoints", 0)):
        raise ValueError(f"Exam totals {section_points}, expected {exam.get('totalPoints')}")
    vocabulary = find_section(exam, "vocabulaire")
    if len(vocabulary.get("questions", [])) != expected_vocabulary_count:
        raise ValueError("Vocabulary question count is not 15")
    serialized = json.dumps(bundle, ensure_ascii=False)
    suspicious = re.findall(r"(?<!\s)\?|\?\s+\S", serialized)
    if suspicious:
        raise ValueError(f"Suspicious replacement markers remain: {sorted(set(suspicious))}")


def write_bundle(path: Path, bundle: dict) -> None:
    path.write_text(json.dumps(bundle, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    french1 = json.loads(FRENCH1_PATH.read_text(encoding="utf-8-sig"))
    french2 = json.loads(FRENCH2_PATH.read_text(encoding="utf-8-sig"))

    french1["exam"]["version"] = EXAM_VERSION
    vocabulary1 = find_section(french1["exam"], "vocabulaire")
    vocabulary1.update(
        {
            "title": "I. Vocabulaire",
            "subtitle": "Choisissez le mot qui correspond à chaque définition ou situation.",
            "points": 15,
            "instructions": "Lisez attentivement le contexte, puis choisissez une seule réponse.",
            "questions": french1_vocabulary_questions(),
        }
    )
    grammar1_questions = {
        item.get("id"): item
        for item in find_section(french1["exam"], "grammaire").get("questions", [])
    }
    grammar1_questions["g9"]["prompt"] = "Camille dit : « Je parle de ___ sœur. »"
    grammar1_questions["g10"]["prompt"] = "Camille dit : « Je parle de ___ parents. »"
    grammar1_questions["g15"].update(
        {
            "block": "Futur proche",
            "prompt": "Demain, nous ___ prendre le bus.",
            "options": ["allons", "venons de", "sommes en train de"],
            "answer": 0,
        }
    )
    reading1 = find_section(french1["exam"], "lecture")
    reading1["readingText"] = [
        paragraph.replace("Nora est étudiante de français.", "Nora étudie le français.")
        for paragraph in reading1.get("readingText", [])
    ]

    french2 = repair_tree(french2)
    french2["exam"]["version"] = EXAM_VERSION
    french2["exam"]["transcript"] = "\n\n".join(FRENCH2_TRANSCRIPT_PARAGRAPHS)
    vocabulary2 = find_section(french2["exam"], "vocabulaire")
    vocabulary2.update(
        {
            "title": "I. Vocabulaire",
            "subtitle": "Choisissez le mot ou l’expression qui complète chaque situation.",
            "points": 15,
            "instructions": "Lisez chaque phrase et choisissez une seule réponse.",
            "questions": french2_vocabulary_questions(),
        }
    )
    grammar2 = find_section(french2["exam"], "grammaire")
    grammar2_questions = {item.get("id"): item for item in grammar2.get("questions", [])}
    grammar2_questions["g4"].update(
        {
            "block": "Accord de l’adjectif",
            "prompt": "Nora porte une chemise ___.",
            "options": ["blanche", "blanc", "blanches"],
            "answer": 0,
        }
    )
    grammar2_questions["g7"]["options"][0] = "à"
    grammar2_questions["g8"]["options"][1] = "à"
    grammar2_questions["g9"].update(
        {
            "block": "Négation élargie",
            "prompt": "Malik ne mange ___ de viande.",
            "options": ["jamais", "rien", "personne"],
            "answer": 0,
        }
    )
    grammar2_questions["g13"].update(
        {
            "block": "Verbes pronominaux",
            "prompt": "Le matin, Nora ___ à sept heures.",
            "options": ["se lève", "me lève", "se lèvent"],
            "answer": 0,
        }
    )
    grammar2_questions["g15"].update(
        {
            "block": "Il faut + infinitif",
            "prompt": "Pour aller à la gare, il ___ continuer tout droit.",
            "options": ["faut", "fait", "va"],
            "answer": 0,
        }
    )
    reading2 = find_section(french2["exam"], "lecture")
    reading2["readingText"] = FRENCH2_READING_PARAGRAPHS
    reading2_questions = {item.get("id"): item for item in reading2.get("questions", [])}
    reading2_questions["r10"].update(
        {
            "prompt": "Quelle pièce est en face de la salle de bains ?",
            "options": ["La chambre.", "La cuisine.", "Le bureau."],
            "answer": 0,
        }
    )
    listening2 = find_section(french2["exam"], "ecoute")
    listening2_questions = {item.get("id"): item for item in listening2.get("questions", [])}
    listening2_questions["l10"].update(
        {
            "prompt": "Que vont-ils faire si le téléphone n’a plus de batterie ?",
            "options": [
                "Ils vont demander leur chemin à quelqu’un.",
                "Ils vont commander un dessert.",
                "Ils vont annuler la visite de l’appartement.",
            ],
            "answer": 0,
        }
    )

    validate(french1, 15)
    validate(french2, 15)
    audio_turns = []
    for index, paragraph in enumerate(FRENCH2_TRANSCRIPT_PARAGRAPHS):
        pause = ' <break time="1.5s" />' if index < len(FRENCH2_TRANSCRIPT_PARAGRAPHS) - 1 else ""
        audio_turns.append(f"Narratrice: {paragraph}{pause}")
    audio_script = (
        "# Examen final A1.2 — Une journée pratique à Envigado\n\n"
        "File: `french2-final-exam-audio.mp3`\n\n"
        "## Script\n\n"
        + "\n\n".join(audio_turns)
    )
    if re.search(r"[A-Za-zÀ-ÿ]\?[A-Za-zÀ-ÿ]|\?[A-Za-zÀ-ÿ]", audio_script):
        raise ValueError("Suspicious replacement markers remain in the Niveau 2 audio script")

    write_bundle(FRENCH1_PATH, french1)
    write_bundle(FRENCH2_PATH, french2)
    FRENCH2_AUDIO_SCRIPT_PATH.write_text(audio_script.rstrip() + "\n", encoding="utf-8")
    print(f"Updated {FRENCH1_PATH}")
    print(f"Updated {FRENCH2_PATH}")
    print(f"Updated {FRENCH2_AUDIO_SCRIPT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
