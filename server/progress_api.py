#!/usr/bin/env python3
import json
import base64
import binascii
import hashlib
import hmac
import os
import re
import secrets
import tempfile
import threading
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


CLIENT_ID = os.environ.get("JARALINGUA_GOOGLE_CLIENT_ID", "").strip()
MICROSOFT_CLIENT_ID = os.environ.get("JARALINGUA_MICROSOFT_CLIENT_ID", "4e729f8a-d101-4c5d-af68-609d749bc95a").strip()
MICROSOFT_TENANT_ID = os.environ.get("JARALINGUA_MICROSOFT_TENANT_ID", "e1664f47-3c02-4a23-a559-0f33d25d8f86").strip()
GLOBAL_ADMIN_EMAILS = {
    normalize.strip().lower()
    for normalize in os.environ.get("JARALINGUA_ADMIN_EMAILS", "cdavid.jaramillo@gmail.com").split(",")
    if normalize.strip()
}
DATA_PATH = os.environ.get("JARALINGUA_PROGRESS_DATA", "/var/lib/jaralingua/progress.json")
FRENCH7_GRADES_PATH = os.environ.get("JARALINGUA_FRENCH7_GRADES_DATA", "/var/lib/jaralingua/french7-grades.json")
FRENCH1_GRADES_PATH = os.environ.get("JARALINGUA_FRENCH1_GRADES_DATA", "/var/lib/jaralingua/french1-grades.json")
FRENCH2_GRADES_PATH = os.environ.get("JARALINGUA_FRENCH2_GRADES_DATA", "/var/lib/jaralingua/french2-grades.json")
FRENCH8_GRADES_PATH = os.environ.get("JARALINGUA_FRENCH8_GRADES_DATA", "/var/lib/jaralingua/french8-grades.json")
FRENCH8_PRONUNCIATION_AUDIO_DIR = os.environ.get("JARALINGUA_FRENCH8_PRONUNCIATION_AUDIO_DIR", "/var/lib/jaralingua/french8-pronunciation-audio")
FRENCH8_HYPOTHESES_ACTIVITY_ID = "writingActivity"
FRENCH8_QUIZ_PATH = os.environ.get("JARALINGUA_FRENCH8_QUIZ_DATA", "/var/lib/jaralingua/french8-quiz-ville-intelligente.json")
FRENCH8_QUIZ_SUBMISSIONS_PATH = os.environ.get("JARALINGUA_FRENCH8_QUIZ_SUBMISSIONS", "/var/lib/jaralingua/french8-quiz-ville-intelligente-submissions.json")
FRENCH8_QUIZ_AUDIO_PATH = os.environ.get("JARALINGUA_FRENCH8_QUIZ_AUDIO", "/var/lib/jaralingua/french8-quiz-ville-intelligente-audio.mp3")
FRENCH7_FINAL_EXAM_PATH = os.environ.get("JARALINGUA_FRENCH7_FINAL_EXAM_DATA", "/var/lib/jaralingua/french7-final-exam.json")
FRENCH7_FINAL_EXAM_SUBMISSIONS_PATH = os.environ.get("JARALINGUA_FRENCH7_FINAL_EXAM_SUBMISSIONS", "/var/lib/jaralingua/french7-final-exam-submissions.json")
FRENCH7_FINAL_EXAM_AUDIO_PATH = os.environ.get("JARALINGUA_FRENCH7_FINAL_EXAM_AUDIO", "/var/lib/jaralingua/french7-final-exam-audio.mp3")
FRENCH1_FINAL_EXAM_PATH = os.environ.get("JARALINGUA_FRENCH1_FINAL_EXAM_DATA", "/var/lib/jaralingua/french1-final-exam.json")
FRENCH1_FINAL_EXAM_SUBMISSIONS_PATH = os.environ.get("JARALINGUA_FRENCH1_FINAL_EXAM_SUBMISSIONS", "/var/lib/jaralingua/french1-final-exam-submissions.json")
FRENCH1_FINAL_EXAM_AUDIO_PATH = os.environ.get("JARALINGUA_FRENCH1_FINAL_EXAM_AUDIO", "/var/lib/jaralingua/french1-final-exam-audio.mp3")
FRENCH2_FINAL_EXAM_PATH = os.environ.get("JARALINGUA_FRENCH2_FINAL_EXAM_DATA", "/var/lib/jaralingua/french2-final-exam.json")
FRENCH2_FINAL_EXAM_SUBMISSIONS_PATH = os.environ.get("JARALINGUA_FRENCH2_FINAL_EXAM_SUBMISSIONS", "/var/lib/jaralingua/french2-final-exam-submissions.json")
FRENCH2_FINAL_EXAM_AUDIO_PATH = os.environ.get("JARALINGUA_FRENCH2_FINAL_EXAM_AUDIO", "/var/lib/jaralingua/french2-final-exam-audio.mp3")
BASIC_ENGLISH_GRADES_PATH = os.environ.get("JARALINGUA_BASIC_ENGLISH_GRADES_DATA", "/var/lib/jaralingua/basic-english-grades.json")
BASIC_INTEGRATED_TASK_PATH = os.environ.get("JARALINGUA_BASIC_INTEGRATED_TASK_DATA", "/var/lib/jaralingua/basic-integrated-task.json")
BASIC_INTEGRATED_TASK_SUBMISSIONS_PATH = os.environ.get("JARALINGUA_BASIC_INTEGRATED_TASK_SUBMISSIONS", "/var/lib/jaralingua/basic-integrated-task-submissions.json")
BASIC_INTEGRATED_TASK_AUDIO_PATH = os.environ.get("JARALINGUA_BASIC_INTEGRATED_TASK_AUDIO", "/var/lib/jaralingua/basic-integrated-task-real.mp3")
BASIC_ANDRES_RETAKE_SUBMISSIONS_PATH = os.environ.get("JARALINGUA_BASIC_ANDRES_RETAKE_SUBMISSIONS", "/var/lib/jaralingua/basic-integrated-task-andres-munoz-retake-submissions.json")
BASIC_ANDRES_RETAKE_AUDIO_PATH = os.environ.get("JARALINGUA_BASIC_ANDRES_RETAKE_AUDIO", "/var/lib/jaralingua/basic-integrated-task-andres-munoz-retake.mp3")
BASIC_UNIT6_NEIGHBORHOOD_GALLERY_PATH = os.environ.get("JARALINGUA_BASIC_UNIT6_NEIGHBORHOOD_GALLERY", "/var/lib/jaralingua/basic-unit6-neighborhood-gallery.json")
BASIC_UNIT6_NEIGHBORHOOD_IMAGE_DIR = os.environ.get("JARALINGUA_BASIC_UNIT6_NEIGHBORHOOD_IMAGE_DIR", "/var/lib/jaralingua/basic-unit6-neighborhood-images")
BASIC_UNIT6_NEIGHBORHOOD_TEST_EMAILS = {
    normalize.strip().lower()
    for normalize in os.environ.get("JARALINGUA_BASIC_UNIT6_NEIGHBORHOOD_TEST_EMAILS", "cdavid.jaramillo@hotmail.com").split(",")
    if normalize.strip()
}
OPENAI_IMAGES_MODEL = os.environ.get("JARALINGUA_OPENAI_IMAGES_MODEL", "gpt-image-2").strip() or "gpt-image-2"
INTERMEDIATE_ENGLISH_GRADES_PATH = os.environ.get("JARALINGUA_INTERMEDIATE_ENGLISH_GRADES_DATA", "/var/lib/jaralingua/intermediate-english-grades.json")
INTERMEDIATE_UNIT4_EXPRESSION_WALL_PATH = os.environ.get("JARALINGUA_INTERMEDIATE_UNIT4_EXPRESSION_WALL_DATA", "/var/lib/jaralingua/intermediate-unit4-expression-wall.json")
INTERMEDIATE_UNIT5_MARKET_BASKET_LIVE_PATH = os.environ.get("JARALINGUA_INTERMEDIATE_UNIT5_MARKET_BASKET_LIVE_DATA", "/var/lib/jaralingua/intermediate-unit5-market-basket-live.json")
INTERMEDIATE_PRONUNCIATION_AUDIO_DIR = os.environ.get("JARALINGUA_INTERMEDIATE_PRONUNCIATION_AUDIO_DIR", "/var/lib/jaralingua/intermediate-pronunciation-audio")
INTERMEDIATE_UNIT2_CATCHING_UP_ID = "unit2CatchingUpListening"
INTERMEDIATE_UNIT2_TIMELINE_ID = "unit2TimelineCatchUpWriting"
INTERMEDIATE_UNIT2_READING_ID = "unit2LetterNeverSentReading"
INTERMEDIATE_UNIT2_GOAL_SUPPORT_ID = "unit2GoalSupportInterview"
INTERMEDIATE_UNIT4_LISTENING_ID = "unit4SundayDinnerListening"
INTERMEDIATE_UNIT4_MEMORY_BOX_ID = "unit4MemoryBoxReading"
INTERMEDIATE_UNIT4_MEMORY_BLOG_ID = "unit4FamilyMemoryBlog"
INTERMEDIATE_UNIT4_PRONUNCIATION_ID = "unit4FamilyStoriesPronunciation"
INTERMEDIATE_UNIT5_MARKET_BASKET_ID = "unit5MarketBasketChallenge"
INTERMEDIATE_UNIT5_LISTENING_ID = "unit5MarketDinnerListening"
INTERMEDIATE_UNIT5_READING_ID = "unit5DishHistoryReading"
INTERMEDIATE_UNIT5_DINNER_PLAN_ID = "unit5HealthyDinnerPlanner"
INTERMEDIATE_UNIT5_PRONUNCIATION_ID = "unit5FoodQuantitiesPronunciation"
INTERMEDIATE_UNIT5_SNACK_REVIEW_ID = "unit5GlobalSnackReview"
BASIC_UNIT6_NEIGHBORHOOD_AI_ID = "unit6NeighborhoodAiImageLab"
LOCAL_AUTH_SECRET_PATH = os.environ.get("JARALINGUA_LOCAL_AUTH_SECRET_PATH", "/var/lib/jaralingua/local-auth-secret")
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BUNDLED_FRENCH7_FINAL_EXAM_PATH = os.path.join(REPO_ROOT, "data", "french7-final-exam.local.json")
BUNDLED_FRENCH7_FINAL_EXAM_AUDIO_PATH = os.path.join(REPO_ROOT, "frances", "Niveau 7", "audio", "examen-final-refuge-universitaire-b1.mp3")
BUNDLED_FRENCH1_FINAL_EXAM_PATH = os.path.join(REPO_ROOT, "data", "french1-final-exam.local.json")
BUNDLED_FRENCH1_FINAL_EXAM_AUDIO_PATH = os.path.join(REPO_ROOT, "server", "private_assets", "french1-final-exam-audio.mp3")
BUNDLED_FRENCH2_FINAL_EXAM_PATH = os.path.join(REPO_ROOT, "data", "french2-final-exam.local.json")
BUNDLED_FRENCH2_FINAL_EXAM_AUDIO_PATH = os.path.join(REPO_ROOT, "server", "private_assets", "french2-final-exam-audio.mp3")
BUNDLED_FRENCH8_QUIZ_PATH = os.path.join(REPO_ROOT, "data", "french8-quiz-ville-intelligente.local.json")
BUNDLED_FRENCH8_QUIZ_AUDIO_PATH = os.path.join(REPO_ROOT, "server", "private_assets", "french8-quiz-ville-intelligente-energie-batiments.mp3")
BUNDLED_BASIC_INTEGRATED_TASK_PATH = os.path.join(REPO_ROOT, "data", "basic-integrated-task.local.json")
BUNDLED_BASIC_INTEGRATED_TASK_AUDIO_PATH = os.path.join(REPO_ROOT, "data", "basic-integrated-task-real.local.mp3")
BUNDLED_BASIC_ANDRES_RETAKE_AUDIO_PATH = os.path.join(REPO_ROOT, "ingles", "basico", "audio", "integrated-task", "basic-integrated-task-andres-munoz-retake.mp3")
HOST = os.environ.get("JARALINGUA_PROGRESS_HOST", "127.0.0.1")
PORT = int(os.environ.get("JARALINGUA_PROGRESS_PORT", "8787"))
MAX_BODY_BYTES = 32 * 1024 * 1024
FRENCH8_PRONUNCIATION_DEADLINES = {
    "pronunciation01d": {
        "date": "2026-06-29",
        "utc": "2026-06-30T05:00:00Z",
        "epoch": 1782795600,
        "label": "lundi 29 juin 2026 jusqu'a 23 h 59 (heure de Bogota)"
    },
    "pronunciation02d": {
        "date": "2026-07-05",
        "utc": "2026-07-06T05:00:00Z",
        "epoch": 1783314000,
        "label": "dimanche 5 juillet 2026 jusqu'a 23 h 59 (heure de Bogota)"
    },
    "pronunciation03d": {
        "date": "2026-07-12",
        "utc": "2026-07-13T05:00:00Z",
        "epoch": 1783918800,
        "label": "dimanche 12 juillet 2026 jusqu'a 23 h 59 (heure de Bogota)"
    },
    "pronunciation04d": {
        "date": "2026-07-19",
        "utc": "2026-07-20T05:00:00Z",
        "epoch": 1784523600,
        "label": "dimanche 19 juillet 2026 jusqu'a 23 h 59 (heure de Bogota)"
    },
    "pronunciation09d": {
        "date": "2026-07-26",
        "utc": "2026-07-27T05:00:00Z",
        "epoch": 1785128400,
        "label": "dimanche 26 juillet 2026 jusqu'a 23 h 59 (heure de Bogota)"
    }
}

FRENCH8_PRONUNCIATION_EVALUATIONS = {
    "pronunciation01d": {
        "id": "pronunciation01d",
        "title": "Prononciation 01D - Conditionnel passe",
        "weight": 5,
        "type": "Prononciation",
        "date": FRENCH8_PRONUNCIATION_DEADLINES["pronunciation01d"]["date"],
        "displayDate": "Date limite : " + FRENCH8_PRONUNCIATION_DEADLINES["pronunciation01d"]["label"],
        "description": "Defi final de prononciation. Apres la date limite, l'envoi au professeur ne sera plus possible."
    },
    "pronunciation02d": {
        "id": "pronunciation02d",
        "title": "Prononciation 02D - Hypotheses irreelles",
        "weight": 5,
        "type": "Prononciation",
        "date": FRENCH8_PRONUNCIATION_DEADLINES["pronunciation02d"]["date"],
        "displayDate": "Date limite : " + FRENCH8_PRONUNCIATION_DEADLINES["pronunciation02d"]["label"],
        "description": "Defi final de prononciation. Apres la date limite, l'envoi au professeur ne sera plus possible."
    },
    "pronunciation03d": {
        "id": "pronunciation03d",
        "title": "Prononciation 03D - Subjonctif passe",
        "weight": 5,
        "type": "Prononciation",
        "date": FRENCH8_PRONUNCIATION_DEADLINES["pronunciation03d"]["date"],
        "displayDate": "Date limite : " + FRENCH8_PRONUNCIATION_DEADLINES["pronunciation03d"]["label"],
        "description": "Defi final de prononciation. Apres la date limite, l'envoi au professeur ne sera plus possible."
    },
    "pronunciation04d": {
        "id": "pronunciation04d",
        "title": "Prononciation 04D - Discours rapporte",
        "weight": 5,
        "type": "Prononciation",
        "date": FRENCH8_PRONUNCIATION_DEADLINES["pronunciation04d"]["date"],
        "displayDate": "Date limite : " + FRENCH8_PRONUNCIATION_DEADLINES["pronunciation04d"]["label"],
        "description": "Defi final de prononciation. Apres la date limite, l'envoi au professeur ne sera plus possible."
    },
    "pronunciation09d": {
        "id": "pronunciation09d",
        "title": "Prononciation 09D - Precision syntaxique B2",
        "weight": 0,
        "type": "Prononciation formative",
        "date": FRENCH8_PRONUNCIATION_DEADLINES["pronunciation09d"]["date"],
        "displayDate": "Date limite : " + FRENCH8_PRONUNCIATION_DEADLINES["pronunciation09d"]["label"],
        "description": "Pratique avancee avec audio sauvegarde pour feedback professeur. Poids 0 : n'ajoute pas de pourcentage a la note finale."
    }
}

INTERMEDIATE_UNIT2_CATCHING_UP_EVALUATION = {
    "id": INTERMEDIATE_UNIT2_CATCHING_UP_ID,
    "title": "Unit 2 Listening - Catching Up After Years",
    "weight": 0,
    "type": "Listening follow-up",
    "description": "Seguimiento enviable al profesor. La nota aparece como referencia, pero su peso es 0 y no afecta el promedio acumulado."
}

INTERMEDIATE_UNIT2_TIMELINE_EVALUATION = {
    "id": INTERMEDIATE_UNIT2_TIMELINE_ID,
    "title": "Unit 2 Writing - Timeline Catch-Up",
    "weight": 0,
    "type": "Writing follow-up",
    "description": "Seguimiento enviable al profesor. La nota de referencia no afecta el promedio acumulado."
}

INTERMEDIATE_UNIT2_READING_EVALUATION = {
    "id": INTERMEDIATE_UNIT2_READING_ID,
    "title": "Unit 2 Reading - The Letter I Never Sent",
    "weight": 0,
    "type": "Reading follow-up",
    "description": "Seguimiento de lectura enviable al profesor. La nota aparece como referencia y su peso es 0."
}

INTERMEDIATE_UNIT2_GOAL_SUPPORT_EVALUATION = {
    "id": INTERMEDIATE_UNIT2_GOAL_SUPPORT_ID,
    "title": "Unit 2 Speaking/Writing - Goal Support Interview",
    "weight": 0,
    "type": "Interview follow-up",
    "description": "Producto de entrevista enviable al profesor. La entrega queda visible con peso 0."
}

INTERMEDIATE_UNIT4_LISTENING_EVALUATION = {
    "id": INTERMEDIATE_UNIT4_LISTENING_ID,
    "title": "Unit 4 Listening - Sunday Dinner Negotiation",
    "weight": 0,
    "type": "Listening follow-up",
    "description": "Seguimiento enviable al profesor. La nota aparece como referencia, pero su peso es 0 y no afecta el promedio acumulado."
}

INTERMEDIATE_UNIT4_PRONUNCIATION_EVALUATION = {
    "id": INTERMEDIATE_UNIT4_PRONUNCIATION_ID,
    "title": "Unit 4 Pronunciation - Family Stories",
    "weight": 0,
    "type": "Pronunciation follow-up",
    "description": "Seguimiento oral enviable al profesor. La calificacion aparece como referencia, pero su peso es 0 y no afecta el promedio acumulado."
}

INTERMEDIATE_UNIT5_MARKET_BASKET_EVALUATION = {
    "id": INTERMEDIATE_UNIT5_MARKET_BASKET_ID,
    "title": "Unit 5 Grammar - Market Basket Challenge",
    "weight": 0,
    "type": "Grammar follow-up",
    "description": "Reto de cantidades enviable al profesor. La nota aparece como referencia, pero su peso es 0 y no afecta el promedio acumulado."
}

INTERMEDIATE_UNIT5_LISTENING_EVALUATION = {
    "id": INTERMEDIATE_UNIT5_LISTENING_ID,
    "title": "Unit 5 Listening - Market Dinner Plan",
    "weight": 0,
    "type": "Listening follow-up",
    "description": "Seguimiento enviable al profesor. La nota aparece como referencia, pero su peso es 0 y no afecta el promedio acumulado."
}

INTERMEDIATE_UNIT5_READING_EVALUATION = {
    "id": INTERMEDIATE_UNIT5_READING_ID,
    "title": "Unit 5 Reading - A Dish with a History",
    "weight": 0,
    "type": "Reading follow-up",
    "description": "Seguimiento de lectura enviable al profesor. La nota aparece como referencia y su peso es 0."
}

INTERMEDIATE_UNIT5_DINNER_PLAN_EVALUATION = {
    "id": INTERMEDIATE_UNIT5_DINNER_PLAN_ID,
    "title": "Unit 5 Writing - Healthy Dinner Planner",
    "weight": 0,
    "type": "Writing follow-up",
    "description": "Producto de planificacion enviable al profesor. La entrega queda visible con peso 0."
}

INTERMEDIATE_UNIT5_PRONUNCIATION_EVALUATION = {
    "id": INTERMEDIATE_UNIT5_PRONUNCIATION_ID,
    "title": "Unit 5 Pronunciation - Food Quantities",
    "weight": 0,
    "type": "Pronunciation follow-up",
    "description": "Seguimiento oral enviable al profesor. La calificacion aparece como referencia, pero su peso es 0 y no afecta el promedio acumulado."
}

INTERMEDIATE_UNIT5_SNACK_REVIEW_EVALUATION = {
    "id": INTERMEDIATE_UNIT5_SNACK_REVIEW_ID,
    "title": "Unit 5 Writing - Global Snack Review",
    "weight": 0,
    "type": "Writing follow-up",
    "description": "Resena cultural enviable al profesor. La entrega queda visible con peso 0."
}

BASIC_UNIT6_NEIGHBORHOOD_AI_EVALUATION = {
    "id": BASIC_UNIT6_NEIGHBORHOOD_AI_ID,
    "title": "Unit 6 Follow-up - My Ideal Neighborhood AI Image Lab",
    "weight": 0,
    "type": "AI image / Speaking follow-up",
    "description": "Seguimiento enviable al profesor. La entrega queda visible en la grilla, pero su peso es 0 y no afecta el promedio."
}

INTERMEDIATE_UNIT2_CATCHING_UP_ANSWERS = [1, 2, 0, 1, 0, 2, 1, 0, 2, 1, 0, 2, 2, 1, 0, 2, 0, 1, 2, 1]
INTERMEDIATE_UNIT2_READING_ANSWERS = [1, 2, 0, 1, 2, 0, 1, 2, 1, 0, 2, 1, 0, 2]
INTERMEDIATE_UNIT4_LISTENING_ANSWERS = [1, 2, 2, 0, 1, 2, 0, 1, 2, 1, 0, 2, 1, 0, 2, 0, 1, 2]
INTERMEDIATE_UNIT4_MEMORY_BOX_ANSWERS = [1, 2, 1, 2, 0, 0, 1, 1, 2, 1, 2, 0, 2, 2]
INTERMEDIATE_UNIT5_MARKET_BASKET_ANSWERS = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 0, 0, 1, 1, 0, 2, 1]
INTERMEDIATE_UNIT5_LISTENING_ANSWERS = [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
INTERMEDIATE_UNIT5_READING_ANSWERS = [0, 1, 0, 2, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0]
INTERMEDIATE_UNIT4_EXPRESSION_ITEMS = [
    {
        "id": "bring-up",
        "type": "Phrasal verb",
        "label": "bring up",
        "spanish": "mencionar / sacar un tema",
        "meaning": "To introduce a topic in a conversation, especially a sensitive topic.",
        "teacherPrompt": "Create one respectful sentence about a family member bringing up a responsibility, memory, or problem.",
        "example": "Maya needs to bring up the phone rule before dinner.",
        "variants": ["bring up", "brings up", "brought up", "bringing up"]
    },
    {
        "id": "work-out",
        "type": "Phrasal verb",
        "label": "work out",
        "spanish": "resolver / encontrar una solución",
        "meaning": "To solve a problem or make an agreement after discussion.",
        "teacherPrompt": "Create one sentence about a family working out a fair plan.",
        "example": "The Riveras worked out a fair plan for Sunday dinner.",
        "variants": ["work out", "works out", "worked out", "working out"]
    },
    {
        "id": "pitch-in",
        "type": "Phrasal verb",
        "label": "pitch in",
        "spanish": "colaborar / ayudar entre todos",
        "meaning": "To help with a shared task, especially when several people are involved.",
        "teacherPrompt": "Create one sentence about someone pitching in with chores, dinner, or homework.",
        "example": "Leo has to pitch in by setting the table.",
        "variants": ["pitch in", "pitches in", "pitched in", "pitching in"]
    },
    {
        "id": "clear-the-air",
        "type": "Idiom",
        "label": "clear the air",
        "spanish": "aclarar las cosas / bajar la tensión",
        "meaning": "To discuss a conflict honestly so people feel less tense.",
        "teacherPrompt": "Create one sentence about a family clearing the air after a misunderstanding.",
        "example": "Ana asked everyone to clear the air before dinner.",
        "variants": ["clear the air", "clears the air", "cleared the air", "clearing the air"]
    },
    {
        "id": "meet-halfway",
        "type": "Idiom",
        "label": "meet someone halfway",
        "spanish": "ceder un poco / llegar a un punto medio",
        "meaning": "To compromise by accepting part of what another person wants.",
        "teacherPrompt": "Create one sentence about two relatives meeting each other halfway.",
        "example": "Carlos met Leo halfway and followed the phone rule too.",
        "variants": [
            "meet someone halfway",
            "meet each other halfway",
            "meet him halfway",
            "meet her halfway",
            "meet them halfway",
            "meet me halfway",
            "meet us halfway",
            "meet halfway",
            "met halfway",
            "met him halfway",
            "met her halfway",
            "met them halfway",
            "met each other halfway",
            "meeting halfway"
        ]
    },
    {
        "id": "patch-things-up",
        "type": "Idiom",
        "label": "patch things up",
        "spanish": "arreglar las cosas / reconciliarse",
        "meaning": "To repair a relationship after an argument or tense moment.",
        "teacherPrompt": "Create one sentence about relatives patching things up after a disagreement.",
        "example": "Maya and Leo patched things up after they made a homework plan.",
        "variants": ["patch things up", "patches things up", "patched things up", "patching things up", "patch it up", "patched it up"]
    }
]

INTERMEDIATE_UNIT4_LISTENING_TRANSCRIPT = """Narrator: The Rivera family is having Sunday dinner. Before they eat, they need to solve a small family problem.

Ana: Dinner is almost ready, but I cannot do everything alone. Everyone has to help for twenty minutes.

Leo: I already took out the trash. Why do I have to set the table too?

Maya: Because I have to finish my history presentation before Monday. I want you to set the table while I make the salad.

Carlos: And I want everyone to put their phones in the basket. We used to talk during dinner. Now everybody checks messages every two minutes.

Leo: That is not fair. You won't let us use phones, but you answer work messages at the table.

Carlos: You are right. I have one work message tonight, but I can answer it after dinner.

Rosa: When your father was a teenager, we used to cook together on Sundays. We didn't use to have perfect dinners, but we listened to each other.

Ana: I like that memory, but we need a realistic plan. Carlos, can you wash the dishes later?

Carlos: Yes. I can do that, and I don't have to answer the message until eight.

Maya: If Leo sets the table, I can make the salad quickly. After dinner, I need forty minutes for my presentation.

Leo: Fine, but I want Maya to help me with my English homework tomorrow. And I want Dad to follow the phone rule too.

Carlos: Fair. I won't let phones stay on the table, including mine. The basket rule is for everyone.

Rosa: Good. A rule is easier to accept when adults follow it too.

Ana: So the agreement is clear. Leo sets the table, Maya makes the salad, Carlos washes the dishes, and phones stay in the basket for the first thirty minutes.

Leo: And tomorrow Maya helps me with English?

Maya: Yes, after school. But you have to bring your notebook.

Narrator: The Rivera family does not solve every problem forever, but they make one respectful agreement for tonight."""

INTERMEDIATE_UNIT5_LISTENING_TRANSCRIPT = """Narrator: Three classmates are planning a healthy dinner for a small international food fair. They have to choose ingredients, quantities, and one cultural connection.

Sara: We need a dinner for six people. It should be healthy, but it should also feel Colombian.

Mateo: What about a rice bowl with beans, avocado, vegetables, and grilled chicken? It is not exactly bandeja paisa, but it uses familiar ingredients in a lighter way.

Nina: I like that. How much rice do we need?

Mateo: For six people, we need about three cups of cooked rice. Rice is uncountable, so we say some rice or a cup of rice, not three rices.

Sara: Good point. We also need two cans of beans, six small pieces of chicken, and a lot of vegetables.

Nina: Do we have any lettuce?

Sara: No, we do not have any lettuce yet, but we have some tomatoes, some corn, and two avocados.

Mateo: Let's buy a head of lettuce, a bag of carrots, and a bottle of lime juice. The dressing can be made with lime, a little oil, salt, and cilantro.

Nina: Should we add something sweet?

Sara: Maybe a fruit salad. We can use some mango, a few strawberries, and a little yogurt. It gives color without too much sugar.

Mateo: I want the presentation to explain culture too. We can say the bowl is inspired by Colombian home food, but it is arranged like a modern healthy bowl.

Nina: And we can compare it with a global rice bowl. Many cultures use rice, beans, vegetables, and sauces, but the flavors change.

Sara: Exactly. Our final menu has rice, beans, chicken, lettuce, tomato, corn, avocado, lime dressing, and fruit salad.

Mateo: Wait. Do we need any bread?

Nina: I do not think so. There is already rice. If we add bread, the meal may feel too heavy.

Sara: So our dinner is balanced: some grains, some protein, a lot of vegetables, a little healthy fat, and a light dessert.

Narrator: Their plan is not only a list of food. It includes quantities, countable and uncountable nouns, ingredients, health reasons, and a cultural comparison."""

FRENCH8_BASE_EVALUATIONS = {
    "finalExam": {
        "id": "finalExam",
        "title": "Examen final",
        "weight": 20,
        "type": "Examen",
        "date": "2026-07-01",
        "displayDate": "A definir",
        "description": "Examen final del curso."
    },
    "courseProject": {
        "id": "courseProject",
        "title": "Projet final - La ville intelligente",
        "weight": 20,
        "type": "Projet oral",
        "date": "2026-07-01",
        "displayDate": "Evaluation manuelle en classe",
        "description": "Exposition orale de 3 a 5 minutes avec support audiovisuel. Evaluation manuelle par le professeur; aucune remise web."
    },
    "quiz": {
        "id": "quiz",
        "title": "Quiz 10% - Ville intelligente",
        "weight": 10,
        "type": "Quiz",
        "date": "2026-07-06",
        "displayDate": "Ouverture par le professeur",
        "description": "Quiz ferme sur les themes 01 et 02: grammaire, lecture et ecoute autour de la ville intelligente."
    },
    "debate1": {
        "id": "debate1",
        "title": "Debate 1",
        "weight": 10,
        "type": "Debat",
        "date": "2026-07-01",
        "displayDate": "A definir",
        "description": "Primer debate calificable."
    },
    "debate2": {
        "id": "debate2",
        "title": "Debate 2",
        "weight": 10,
        "type": "Debat",
        "date": "2026-07-01",
        "displayDate": "A definir",
        "description": "Segundo debate calificable."
    },
    "writingActivity": {
        "id": "writingActivity",
        "title": "Production ecrite et orale - Hypotheses irreelles",
        "weight": 10,
        "type": "Ecriture et oral",
        "date": "2026-07-01",
        "displayDate": "A definir",
        "description": "Texte ecrit avec hypothese irreelle dans le passe, expression idiomatique obligatoire et audio pour feedback."
    }
}

FRENCH8_EXCHANGE_STUDENT = {
    "id": "23209116",
    "fullName": "Javier Armando Malpica Vega",
    "level": "Niveau 8",
    "email": "23209116@uan.edu.mx",
    "emailAliases": [],
    "contact": "Alumno de Mexico de intercambio",
    "bookDate": None,
    "grades": {}
}

FRENCH1_PRONUNCIATION_EVALUATIONS = {
    "pronunciationTheme1": {
        "id": "pronunciationTheme1",
        "title": "Prononciation thème 1 - Premiers contacts",
        "weight": 5,
        "type": "Prononciation",
        "displayDate": "Semaine du thème 1",
        "description": "Défi final de prononciation du thème 1. Envoi autorisé à partir de 50/100."
    },
    "pronunciationTheme3": {
        "id": "pronunciationTheme3",
        "title": "Prononciation thème 3 - Verbes essentiels",
        "weight": 5,
        "type": "Prononciation",
        "displayDate": "Semaine du thème 3",
        "description": "Défi final de prononciation du thème 3. Envoi autorisé à partir de 50/100."
    },
    "pronunciationTheme5": {
        "id": "pronunciationTheme5",
        "title": "Prononciation thème 5 - Description et professions",
        "weight": 5,
        "type": "Prononciation",
        "displayDate": "Semaine du thème 5",
        "description": "Défi final de prononciation du thème 5. Envoi autorisé à partir de 50/100."
    },
    "pronunciationTheme7": {
        "id": "pronunciationTheme7",
        "title": "Prononciation thème 7 - Maison et localisation",
        "weight": 5,
        "type": "Prononciation",
        "displayDate": "Semaine du thème 7",
        "description": "Défi final de prononciation du thème 7. Envoi autorisé à partir de 50/100."
    }
}

FRENCH2_PRONUNCIATION_EVALUATIONS = {
    "pronunciationTheme1": {
        "id": "pronunciationTheme1",
        "title": "Prononciation theme 1 - Routines quotidiennes",
        "weight": 5,
        "type": "Prononciation",
        "displayDate": "Semaine du theme 1",
        "description": "Defi final de prononciation du theme 1. Envoi autorise a partir de 50/100."
    },
    "pronunciationTheme3": {
        "id": "pronunciationTheme3",
        "title": "Prononciation theme 3 - Logement",
        "weight": 5,
        "type": "Prononciation",
        "displayDate": "Semaine du theme 3",
        "description": "Defi final de prononciation du theme 3. Envoi autorise a partir de 50/100."
    },
    "pronunciationTheme5": {
        "id": "pronunciationTheme5",
        "title": "Prononciation theme 5 - Sante",
        "weight": 5,
        "type": "Prononciation",
        "displayDate": "Semaine du theme 5",
        "description": "Defi final de prononciation du theme 5. Envoi autorise a partir de 50/100."
    },
    "pronunciationTheme7": {
        "id": "pronunciationTheme7",
        "title": "Prononciation theme 7 - Ville et directions",
        "weight": 5,
        "type": "Prononciation",
        "displayDate": "Semaine du theme 7",
        "description": "Defi final de prononciation du theme 7. Envoi autorise a partir de 50/100."
    }
}

FRENCH1_CORE_EVALUATIONS = {
    "finalExam": {
        "id": "finalExam",
        "title": "Examen final A1.1",
        "weight": 20,
        "type": "Examen final",
        "displayDate": "Séance d'examen",
        "description": "Examen final verrouillé. La note est calculée automatiquement sur 5."
    },
    "projetFinal": {
        "id": "projetFinal",
        "title": "Projet final A1.1",
        "weight": 20,
        "type": "Projet",
        "description": "Présentation personnelle finale : identité, famille, description, maison et routine simple."
    },
    "evaluationLibre40": {
        "id": "evaluationLibre40",
        "title": "Évaluation libre à définir",
        "weight": 40,
        "type": "À définir",
        "description": "Espace réservé aux évaluations libres que le professeur définira ensuite."
    },
    "evaluationApreciser15": {
        "id": "evaluationApreciser15",
        "title": "Évaluation à préciser",
        "weight": 15,
        "type": "À préciser",
        "description": "Pourcentage restant à préciser afin que le carnet totalise 100%."
    }
}

FRENCH1_CORE_EVALUATIONS.pop("evaluationApreciser15", None)

data_lock = threading.Lock()
token_cache = {}


def now_iso():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def json_response(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def binary_response(handler, status, body, content_type):
    handler.send_response(status)
    handler.send_header("Content-Type", content_type)
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def read_store():
    if not os.path.exists(DATA_PATH):
        return {"users": {}}
    with open(DATA_PATH, "r", encoding="utf-8") as handle:
        try:
            data = json.load(handle)
        except json.JSONDecodeError:
            return {"users": {}}
    if not isinstance(data, dict):
        return {"users": {}}
    users = data.get("users")
    if not isinstance(users, dict):
        data["users"] = {}
    return data


def write_store(data):
    directory = os.path.dirname(DATA_PATH)
    os.makedirs(directory, exist_ok=True)
    fd, temp_path = tempfile.mkstemp(prefix=".progress-", suffix=".json", dir=directory)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(data, handle, ensure_ascii=False, indent=2, sort_keys=True)
            handle.write("\n")
        os.replace(temp_path, DATA_PATH)
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)


def write_json_file(path, data, prefix):
    directory = os.path.dirname(path)
    os.makedirs(directory, exist_ok=True)
    fd, temp_path = tempfile.mkstemp(prefix=prefix, suffix=".json", dir=directory)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(data, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        os.replace(temp_path, path)
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)


def read_json_file(path, default):
    if not os.path.exists(path):
        return default
    with open(path, "r", encoding="utf-8-sig") as handle:
        try:
            data = json.load(handle)
        except json.JSONDecodeError:
            return default
    return data if isinstance(data, dict) else default


def read_basic_unit6_neighborhood_gallery():
    data = read_json_file(BASIC_UNIT6_NEIGHBORHOOD_GALLERY_PATH, {"submissions": []})
    if not isinstance(data.get("submissions"), list):
        data["submissions"] = []
    return data


def write_basic_unit6_neighborhood_gallery(data):
    write_json_file(BASIC_UNIT6_NEIGHBORHOOD_GALLERY_PATH, data, ".basic-unit6-neighborhood-gallery-")


def basic_unit6_image_path(image_id, extension="png"):
    extension = str(extension or "png").lower().strip().lstrip(".")
    if extension not in {"png", "jpg", "jpeg", "webp"}:
        extension = "png"
    filename = safe_filename_token(image_id, 80) + "." + extension
    root = os.path.abspath(BASIC_UNIT6_NEIGHBORHOOD_IMAGE_DIR)
    path = os.path.abspath(os.path.join(root, filename))
    if not path.startswith(root + os.sep):
        return ""
    return path


def basic_unit6_image_file_for_id(image_id):
    for extension, content_type in (
        ("png", "image/png"),
        ("jpg", "image/jpeg"),
        ("jpeg", "image/jpeg"),
        ("webp", "image/webp")
    ):
        path = basic_unit6_image_path(image_id, extension)
        if path and os.path.exists(path):
            return path, content_type
    return "", ""


def decode_basic_unit6_image_data_url(data_url):
    if not isinstance(data_url, str):
        raise ValueError("image_required")
    match = re.match(r"^data:(image/(?:png|jpeg|jpg|webp));base64,(.+)$", data_url, re.DOTALL | re.IGNORECASE)
    if not match:
        raise ValueError("image_type_invalid")
    content_type = match.group(1).lower()
    if content_type == "image/jpg":
        content_type = "image/jpeg"
    extension = "jpg" if content_type == "image/jpeg" else content_type.split("/", 1)[1]
    try:
        image_bytes = base64.b64decode(match.group(2), validate=True)
    except (binascii.Error, ValueError):
        raise ValueError("image_invalid")
    if not image_bytes:
        raise ValueError("image_required")
    if len(image_bytes) > 20_000_000:
        raise ValueError("image_too_large")
    return image_bytes, extension, content_type


def public_basic_unit6_neighborhood_item(item, include_owner=False):
    public_item = {
        "id": clean_text(item.get("id"), 80),
        "groupName": clean_text(item.get("groupName"), 100),
        "neighborhoodName": clean_text(item.get("neighborhoodName"), 100),
        "description": clean_text(item.get("description"), 2400),
        "prompt": clean_text(item.get("prompt"), 2400),
        "imageUrl": clean_text(item.get("imageUrl"), 240),
        "studentName": clean_text(item.get("studentName"), 160),
        "submittedAt": clean_text(item.get("submittedAt"), 40)
    }
    if include_owner:
        public_item["studentId"] = clean_text(item.get("studentId"), 40)
        public_item["studentEmail"] = clean_email(item.get("studentEmail"))
    return public_item


def is_basic_unit6_neighborhood_test_profile(profile):
    return clean_email(profile.get("email")) in BASIC_UNIT6_NEIGHBORHOOD_TEST_EMAILS


def basic_unit6_neighborhood_owner_id(profile, role, student):
    if isinstance(student, dict):
        return clean_text(student.get("id"), 40)
    email_token = safe_filename_token(profile.get("email"), 60)
    if role in ("admin", "teacher"):
        return "staff-" + email_token
    if is_basic_unit6_neighborhood_test_profile(profile):
        return "test-" + email_token
    return ""


def basic_unit6_neighborhood_gallery_payload(profile, grades_data, gallery):
    role = grade_user_role(profile, grades_data)
    student = matched_student_for_profile(profile, grades_data)
    owner_id = basic_unit6_neighborhood_owner_id(profile, role, student)
    is_staff = role in ("admin", "teacher")
    items = []
    for item in gallery.get("submissions", []):
        if not isinstance(item, dict):
            continue
        if is_staff or (owner_id and clean_text(item.get("studentId"), 40) == owner_id):
            items.append(public_basic_unit6_neighborhood_item(item, is_staff))
    items.sort(key=lambda entry: entry.get("submittedAt") or "", reverse=True)
    return {
        "role": role,
        "testAccount": is_basic_unit6_neighborhood_test_profile(profile),
        "student": student_public_view(student) if isinstance(student, dict) else None,
        "submissions": items[:80],
        "generationAvailable": bool(os.environ.get("OPENAI_API_KEY", "").strip())
    }


def call_openai_image_generation(prompt):
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise ValueError("openai_key_missing")
    request_body = json.dumps({
        "model": OPENAI_IMAGES_MODEL,
        "prompt": prompt,
        "size": "1024x1024"
    }).encode("utf-8")
    request = urllib.request.Request(
        "https://api.openai.com/v1/images/generations",
        data=request_body,
        headers={
            "Authorization": "Bearer " + api_key,
            "Content-Type": "application/json"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = ""
        try:
            detail = error.read().decode("utf-8")[:600]
        except Exception:
            detail = str(error)
        raise ValueError("openai_image_error:" + detail)
    except (urllib.error.URLError, TimeoutError) as error:
        raise ValueError("openai_connection_error:" + str(error))

    data = payload.get("data") if isinstance(payload, dict) else None
    first = data[0] if isinstance(data, list) and data else None
    b64_value = first.get("b64_json") if isinstance(first, dict) else ""
    if not b64_value:
        raise ValueError("openai_image_missing")
    try:
        return base64.b64decode(b64_value)
    except (binascii.Error, ValueError):
        raise ValueError("openai_image_invalid")


def user_record(store, profile):
    users = store.setdefault("users", {})
    subject = profile["sub"]
    record = users.setdefault(subject, {})
    record["sub"] = subject
    record["email"] = profile.get("email", "")
    record["name"] = profile.get("name", "")
    record["picture"] = profile.get("picture", "")
    record.setdefault("progress", {"pages": {}, "lastPage": None})
    record.setdefault("activities", {})
    record["lastSeenAt"] = now_iso()
    return record


def bearer_token(headers):
    value = headers.get("Authorization", "")
    if not value.lower().startswith("bearer "):
        return ""
    return value.split(" ", 1)[1].strip()


def b64url_encode(value):
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def b64url_decode(value):
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def local_auth_secret():
    configured = os.environ.get("JARALINGUA_LOCAL_AUTH_SECRET", "").strip()
    if configured:
        return configured.encode("utf-8")
    if os.path.exists(LOCAL_AUTH_SECRET_PATH):
        with open(LOCAL_AUTH_SECRET_PATH, "rb") as handle:
            saved = handle.read().strip()
            if saved:
                return saved
    os.makedirs(os.path.dirname(LOCAL_AUTH_SECRET_PATH), exist_ok=True)
    secret = secrets.token_urlsafe(48).encode("utf-8")
    with open(LOCAL_AUTH_SECRET_PATH, "wb") as handle:
        handle.write(secret)
        handle.write(b"\n")
    try:
        os.chmod(LOCAL_AUTH_SECRET_PATH, 0o600)
    except OSError:
        pass
    return secret


def sign_local_profile(profile):
    payload = dict(profile)
    payload["exp"] = int(time.time()) + 12 * 60 * 60
    body = b64url_encode(json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8"))
    signature = hmac.new(local_auth_secret(), body.encode("ascii"), hashlib.sha256).digest()
    return body + "." + b64url_encode(signature), payload["exp"]


def validate_local_token(token):
    try:
        body, signature = token.split(".", 1)
    except ValueError as error:
        raise ValueError("Local token is malformed.") from error
    expected = b64url_encode(hmac.new(local_auth_secret(), body.encode("ascii"), hashlib.sha256).digest())
    if not hmac.compare_digest(signature, expected):
        raise ValueError("Local token signature does not match.")
    try:
        profile = json.loads(b64url_decode(body).decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as error:
        raise ValueError("Local token payload is invalid.") from error
    if int(profile.get("exp", 0)) <= int(time.time()):
        raise ValueError("Local token expired.")
    if profile.get("provider") != "local-gradebook":
        raise ValueError("Local token provider is invalid.")
    email = normalize_email(profile.get("email"))
    if not email:
        raise ValueError("Local token has no email.")
    return {
        "sub": clean_text(profile.get("sub"), 160) or "local-gradebook:" + email,
        "email": email,
        "name": clean_text(profile.get("name"), 200) or email,
        "picture": "",
        "provider": "local-gradebook"
    }


def gradebook_path_for_login(path):
    if path == "/api/basic/grades/login":
        return ("basic", "Basic English Course 1", BASIC_ENGLISH_GRADES_PATH)
    if path == "/api/french1/grades/login":
        return ("french1", "Français Niveau 1", FRENCH1_GRADES_PATH)
    if path == "/api/french2/grades/login":
        return ("french2", "Français Niveau 2", FRENCH2_GRADES_PATH)
    return None


def local_gradebook_login(payload, grades_data, level_key, level_label):
    email = normalize_email(payload.get("email"))
    password = str(payload.get("password") or "")
    if not email or not password:
        raise ValueError("missing_credentials")
    student = next((item for item in grades_data.get("students", []) if isinstance(item, dict) and email_matches_student(item, email)), None)
    if not isinstance(student, dict):
        raise ValueError("student_not_found")
    private_details = student.get("gradeDetails", {}) if isinstance(student.get("gradeDetails"), dict) else {}
    expected_password = str(private_details.get("localPassword") or student.get("localPassword") or (str(student.get("id", "")).strip() + "*"))
    if not expected_password or not hmac.compare_digest(password, expected_password):
        raise ValueError("invalid_credentials")
    profile = {
        "provider": "local-gradebook",
        "sub": "local-gradebook:" + level_key + ":" + email,
        "email": email,
        "name": clean_text(student.get("fullName"), 200) or email,
        "level": level_label
    }
    token, exp = sign_local_profile(profile)
    return {
        "token": token,
        "exp": exp,
        "user": {
            "provider": "local",
            "email": profile["email"],
            "name": profile["name"],
            "level": level_label
        }
    }


def validate_google_token(token):
    if not CLIENT_ID:
        raise ValueError("Google client id is not configured.")
    cached = token_cache.get(token)
    if cached and cached.get("exp", 0) > time.time() + 30:
        return cached["profile"]

    url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + urllib.parse.quote(token)
    try:
        with urllib.request.urlopen(url, timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, json.JSONDecodeError) as error:
        raise ValueError("Could not validate Google token.") from error

    if payload.get("aud") != CLIENT_ID:
        raise ValueError("Google token audience does not match.")
    if str(payload.get("email_verified", "")).lower() not in ("true", "1"):
        raise ValueError("Google email is not verified.")

    exp = int(payload.get("exp", "0"))
    if exp <= int(time.time()):
        raise ValueError("Google token expired.")

    profile = {
        "sub": payload.get("sub", ""),
        "email": payload.get("email", ""),
        "name": payload.get("name") or payload.get("email", ""),
        "picture": payload.get("picture", "")
    }
    if not profile["sub"]:
        raise ValueError("Google token has no subject.")

    token_cache[token] = {"exp": exp, "profile": profile}
    return profile


def validate_microsoft_token(token):
    if not MICROSOFT_CLIENT_ID or not MICROSOFT_TENANT_ID:
        raise ValueError("Microsoft sign-in is not configured.")
    cache_key = "microsoft:" + token
    cached = token_cache.get(cache_key)
    if cached and cached.get("exp", 0) > time.time() + 30:
        return cached["profile"]

    url = "https://graph.microsoft.com/v1.0/me?" + urllib.parse.urlencode({
        "$select": "id,displayName,mail,userPrincipalName"
    })
    request = urllib.request.Request(url, headers={
        "Authorization": "Bearer " + token,
        "Accept": "application/json"
    })
    try:
        with urllib.request.urlopen(request, timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, json.JSONDecodeError) as error:
        raise ValueError("Could not validate Microsoft token.") from error

    subject = payload.get("id", "")
    email = payload.get("mail") or payload.get("userPrincipalName") or ""
    if not subject:
        raise ValueError("Microsoft token has no subject.")
    if not email:
        raise ValueError("Microsoft account has no email.")

    profile = {
        "sub": "microsoft:" + subject,
        "email": email,
        "name": payload.get("displayName") or email,
        "picture": ""
    }
    token_cache[cache_key] = {"exp": time.time() + 300, "profile": profile}
    return profile


def sanitize_progress(value):
    if not isinstance(value, dict):
        return {"pages": {}, "lastPage": None}
    pages = value.get("pages")
    if not isinstance(pages, dict):
        pages = {}
    clean_pages = {}
    for key, page in pages.items():
        if isinstance(key, str) and isinstance(page, dict):
            clean_pages[key[:500]] = page
    last_page = value.get("lastPage")
    if last_page is not None and not isinstance(last_page, dict):
        last_page = None
    return {"pages": clean_pages, "lastPage": last_page}


def sanitize_activity(value):
    if not isinstance(value, dict):
        return {"fields": {}, "updatedAt": None}
    fields = value.get("fields")
    if not isinstance(fields, dict):
        fields = {}
    return {
        "fields": fields,
        "updatedAt": value.get("updatedAt") if isinstance(value.get("updatedAt"), str) else None
    }


def normalize_email(value):
    return str(value or "").strip().lower()


def normalize_name(value):
    return " ".join(str(value or "").strip().lower().split())


def email_matches_student(student, email):
    if normalize_email(student.get("email")) == email:
        return True
    aliases = student.get("emailAliases", [])
    if not isinstance(aliases, list):
        return False
    return email in {normalize_email(item) for item in aliases}


def name_matches_student(student, profile):
    email = normalize_email(profile.get("email"))
    if not email.endswith("@gmail.com"):
        return False
    profile_name = normalize_name(profile.get("name"))
    if not profile_name:
        return False
    aliases = student.get("nameAliases", [])
    if not isinstance(aliases, list):
        return False
    for alias in aliases:
        normalized_alias = normalize_name(alias)
        if normalized_alias and (profile_name == normalized_alias or normalized_alias in profile_name):
            return True
    return False


def read_grades_data(path):
    if not os.path.exists(path):
        return {
            "adminEmails": [],
            "teacherEmails": [],
            "students": [],
            "evaluations": [],
            "bonusEvent": None,
            "allowStudentIdClaim": False
        }
    with open(path, "r", encoding="utf-8-sig") as handle:
        try:
            data = json.load(handle)
        except json.JSONDecodeError:
            return {
                "adminEmails": [],
                "teacherEmails": [],
                "students": [],
                "evaluations": [],
                "bonusEvent": None,
                "allowStudentIdClaim": False
            }
    if not isinstance(data, dict):
        return {
            "adminEmails": [],
            "teacherEmails": [],
            "students": [],
            "evaluations": [],
            "bonusEvent": None,
            "allowStudentIdClaim": False
        }
    data.setdefault("adminEmails", [])
    data.setdefault("teacherEmails", [])
    data.setdefault("students", [])
    data.setdefault("evaluations", [])
    data.setdefault("bonusEvent", None)
    data.setdefault("allowStudentIdClaim", False)
    return data


def clean_text(value, limit=200):
    return " ".join(str(value or "").strip().split())[:limit]


def normalize_text(value):
    text = unicodedata.normalize("NFD", str(value or "").lower())
    text = "".join(char for char in text if unicodedata.category(char) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def clean_email(value):
    email = normalize_email(value)
    if "@" not in email or len(email) > 200:
        return ""
    return email


def clean_grade(value):
    if value in (None, ""):
        return None
    try:
        grade = float(value)
    except (TypeError, ValueError):
        return None
    if grade < 0 or grade > 5:
        return None
    return round(grade, 2)


def clean_weight(value):
    try:
        weight = float(value)
    except (TypeError, ValueError):
        return 0
    if weight < 0:
        weight = 0
    if weight > 100:
        weight = 100
    return int(weight) if weight.is_integer() else round(weight, 2)


def clean_gradebook_payload(payload, existing):
    if not isinstance(payload, dict):
        raise ValueError("invalid_payload")
    evaluations = payload.get("evaluations")
    students = payload.get("students")
    if not isinstance(evaluations, list) or not isinstance(students, list):
        raise ValueError("invalid_gradebook")

    clean_evaluations = []
    seen_ids = set()
    for item in evaluations[:80]:
        if not isinstance(item, dict):
            continue
        raw_id = clean_text(item.get("id"), 80)
        eval_id = "".join(ch for ch in raw_id if ch.isalnum() or ch in ("-", "_"))
        title = clean_text(item.get("title"), 160)
        if not eval_id or not title or eval_id in seen_ids:
            continue
        seen_ids.add(eval_id)
        clean_evaluation = {
            "id": eval_id,
            "title": title,
            "weight": clean_weight(item.get("weight")),
            "type": clean_text(item.get("type") or "Assessment", 80),
            "description": clean_text(item.get("description"), 300)
        }
        if "date" in item:
            clean_evaluation["date"] = clean_text(item.get("date"), 40) or None
        if "displayDate" in item:
            clean_evaluation["displayDate"] = clean_text(item.get("displayDate"), 80)
        clean_evaluations.append(clean_evaluation)

    existing_by_id = {}
    existing_by_email = {}
    for student in existing.get("students", []):
        if not isinstance(student, dict):
            continue
        student_id = clean_text(student.get("id"), 40)
        student_email = clean_email(student.get("email"))
        if student_id:
            existing_by_id[student_id] = student
        if student_email:
            existing_by_email[student_email] = student

    clean_students = []
    for item in students[:300]:
        if not isinstance(item, dict):
            continue
        student_id = clean_text(item.get("id"), 40)
        full_name = clean_text(item.get("fullName"), 160)
        if not student_id or not full_name:
            continue
        grades = {}
        raw_grades = item.get("grades", {})
        if isinstance(raw_grades, dict):
            for evaluation in clean_evaluations:
                grade = clean_grade(raw_grades.get(evaluation["id"]))
                if grade is not None:
                    grades[evaluation["id"]] = grade
        original = existing_by_id.get(student_id) or existing_by_email.get(clean_email(item.get("email"))) or {}
        clean_student = {
            "id": student_id,
            "fullName": full_name,
            "level": clean_text(item.get("level") or "Basic English Course 1", 100),
            "email": clean_email(item.get("email")),
            "emailAliases": [clean_email(email) for email in item.get("emailAliases", []) if clean_email(email)] if isinstance(item.get("emailAliases"), list) else [],
            "contact": clean_text(item.get("contact"), 100),
            "bookDate": clean_text(item.get("bookDate"), 40) or None,
            "grades": grades
        }
        if isinstance(original.get("gradeDetails"), dict):
            clean_student["gradeDetails"] = original["gradeDetails"]
        clean_students.append(clean_student)

    return {
        "adminEmails": existing.get("adminEmails", []),
        "teacherEmails": existing.get("teacherEmails", []),
        "allowStudentIdClaim": existing.get("allowStudentIdClaim") is True,
        "students": clean_students,
        "evaluations": clean_evaluations,
        "bonusEvent": existing.get("bonusEvent")
    }


def grade_user_role(profile, grades_data):
    email = normalize_email(profile.get("email"))
    if email in GLOBAL_ADMIN_EMAILS:
        return "admin"
    admin_emails = {normalize_email(item) for item in grades_data.get("adminEmails", [])}
    teacher_emails = {normalize_email(item) for item in grades_data.get("teacherEmails", [])}
    if email in admin_emails:
        return "admin"
    if email in teacher_emails:
        return "teacher"
    return "student"


def public_grade_details(student):
    details = student.get("gradeDetails", {})
    if not isinstance(details, dict):
        return {}
    return {key: value for key, value in details.items() if key not in ("localPassword", "password")}


def student_public_view(student):
    return {
        "id": student.get("id", ""),
        "level": student.get("level", ""),
        "bookDate": student.get("bookDate"),
        "grades": student.get("grades", {}),
        "gradeDetails": public_grade_details(student)
    }


def staff_student_view(student):
    return {
        "id": student.get("id", ""),
        "fullName": student.get("fullName", ""),
        "level": student.get("level", ""),
        "email": student.get("email", ""),
        "emailAliases": student.get("emailAliases", []),
        "contact": student.get("contact", ""),
        "bookDate": student.get("bookDate"),
        "grades": student.get("grades", {}),
        "gradeDetails": public_grade_details(student)
    }


def matched_student_for_profile(profile, grades_data):
    students = grades_data.get("students", [])
    email = normalize_email(profile.get("email"))
    direct_match = next(
        (item for item in students if isinstance(item, dict) and email_matches_student(item, email)),
        None
    )
    if direct_match:
        return direct_match
    name_match = next(
        (item for item in students if isinstance(item, dict) and name_matches_student(item, profile)),
        None
    )
    if name_match:
        return name_match
    claimed_id = "".join(ch for ch in str(profile.get("_studentIdClaim", "")) if ch.isdigit())
    if not claimed_id or not email:
        return None
    claimed_student = next(
        (
            item for item in students
            if isinstance(item, dict) and "".join(ch for ch in str(item.get("id", "")) if ch.isdigit()) == claimed_id
        ),
        None
    )
    if not isinstance(claimed_student, dict):
        return None
    current_email = normalize_email(claimed_student.get("email"))
    if not current_email:
        claimed_student["email"] = email
    elif current_email != email:
        aliases = claimed_student.get("emailAliases")
        if not isinstance(aliases, list):
            aliases = []
        if email not in {normalize_email(item) for item in aliases}:
            aliases.append(email)
            claimed_student["emailAliases"] = aliases
    return claimed_student

def grade_payload_for(profile, grades_data, query):
    role = grade_user_role(profile, grades_data)
    students = grades_data.get("students", [])
    email = normalize_email(profile.get("email"))
    response = {
        "role": role,
        "allowStudentIdClaim": grades_data.get("allowStudentIdClaim") is True,
        "evaluations": grades_data.get("evaluations", []),
        "bonusEvent": grades_data.get("bonusEvent"),
        "students": [],
        "student": None
    }

    if role in ("admin", "teacher"):
        response["students"] = [staff_student_view(item) for item in students if isinstance(item, dict)]
        return response

    direct_match = next(
        (item for item in students if isinstance(item, dict) and email_matches_student(item, email)),
        None
    )
    if direct_match:
        response["student"] = student_public_view(direct_match)
        return response

    name_match = next(
        (item for item in students if isinstance(item, dict) and name_matches_student(item, profile)),
        None
    )
    if name_match:
        response["student"] = student_public_view(name_match)
        return response

    requested_id = (query.get("studentId") or [""])[0]
    clean_id = "".join(ch for ch in requested_id if ch.isdigit())
    if clean_id and grades_data.get("allowStudentIdClaim") is True:
        id_match = next(
            (item for item in students if isinstance(item, dict) and str(item.get("id", "")) == clean_id),
            None
        )
        if id_match:
            response["student"] = student_public_view(id_match)
            return response

    return response


def ensure_french8_pronunciation_evaluation(grades_data, evaluation_id):
    template = FRENCH8_PRONUNCIATION_EVALUATIONS.get(evaluation_id)
    if not template:
        return False
    evaluations = grades_data.setdefault("evaluations", [])
    existing = next((item for item in evaluations if isinstance(item, dict) and item.get("id") == evaluation_id), None)
    if existing:
        for key, value in template.items():
            existing.setdefault(key, value)
        return False
    evaluations.append(dict(template))
    return True


def ensure_french8_pronunciation_evaluations(grades_data):
    changed = False
    for evaluation_id in FRENCH8_PRONUNCIATION_EVALUATIONS:
        if ensure_french8_pronunciation_evaluation(grades_data, evaluation_id):
            changed = True
    return changed


def normalize_french8_base_evaluation_weights(grades_data):
    changed = False
    evaluations = grades_data.setdefault("evaluations", [])
    if not isinstance(evaluations, list):
        evaluations = []
        grades_data["evaluations"] = evaluations
        changed = True

    existing_by_id = {
        item.get("id"): item
        for item in evaluations
        if isinstance(item, dict) and item.get("id")
    }
    templates = list(FRENCH8_PRONUNCIATION_EVALUATIONS.values()) + list(FRENCH8_BASE_EVALUATIONS.values())
    next_evaluations = []
    for template in templates:
        evaluation = dict(existing_by_id.get(template["id"], {}))
        for key, value in template.items():
            if evaluation.get(key) != value:
                evaluation[key] = value
                changed = True
        next_evaluations.append(evaluation)

    if evaluations != next_evaluations:
        grades_data["evaluations"] = next_evaluations
        changed = True
    return changed


def ensure_french8_exchange_student(grades_data):
    students = grades_data.setdefault("students", [])
    if not isinstance(students, list):
        students = []
        grades_data["students"] = students

    target_email = normalize_email(FRENCH8_EXCHANGE_STUDENT["email"])
    target_id = FRENCH8_EXCHANGE_STUDENT["id"]
    student = next(
        (
            item for item in students
            if isinstance(item, dict)
            and (
                str(item.get("id", "")).strip() == target_id
                or email_matches_student(item, target_email)
            )
        ),
        None
    )
    if not student:
        students.append(dict(FRENCH8_EXCHANGE_STUDENT))
        return True

    changed = False
    for key in ("id", "fullName", "level", "email", "contact"):
        expected = FRENCH8_EXCHANGE_STUDENT[key]
        if student.get(key) != expected:
            student[key] = expected
            changed = True
    if not isinstance(student.get("emailAliases"), list):
        student["emailAliases"] = []
        changed = True
    if "bookDate" not in student:
        student["bookDate"] = None
        changed = True
    if not isinstance(student.get("grades"), dict):
        student["grades"] = {}
        changed = True
    return changed


def ensure_french8_gradebook_structure(grades_data):
    changed = ensure_french8_pronunciation_evaluations(grades_data)
    if normalize_french8_base_evaluation_weights(grades_data):
        changed = True
    if ensure_french8_exchange_student(grades_data):
        changed = True
    return changed


def french8_pronunciation_grade_from_payload(payload):
    evaluation_id = clean_text(payload.get("evaluationId"), 80)
    if evaluation_id not in FRENCH8_PRONUNCIATION_EVALUATIONS:
        raise ValueError("invalid_evaluation")
    try:
        score100 = float(payload.get("score100"))
    except (TypeError, ValueError):
        raise ValueError("invalid_score")
    if score100 < 50:
        raise ValueError("score_too_low")
    if score100 > 100:
        raise ValueError("invalid_score")
    grade = round((score100 / 20.0) * 100) / 100
    return evaluation_id, int(round(score100)), grade


def clean_text_list(value, item_limit=30, char_limit=80):
    if not isinstance(value, list):
        return []
    items = []
    for item in value[:item_limit]:
        text = clean_text(item, char_limit)
        if text:
            items.append(text)
    return items


def clean_score_metric(value, minimum=0, maximum=100):
    try:
        metric = float(value)
    except (TypeError, ValueError):
        return None
    if metric < minimum:
        metric = minimum
    if metric > maximum:
        metric = maximum
    return round(metric, 2)


def clean_pronunciation_submission_details(payload, evaluation_id, score100, grade):
    details = payload.get("details")
    if not isinstance(details, dict):
        details = {}
    liaison = details.get("liaison")
    clean_liaison = {}
    if isinstance(liaison, dict):
        clean_liaison = {
            "checked": clean_text_list(liaison.get("checked"), 30, 120),
            "confirmed": clean_text_list(liaison.get("confirmed"), 30, 120),
            "missed": clean_text_list(liaison.get("missed"), 30, 120),
            "message": clean_text(liaison.get("message"), 500)
        }
    clean_details = {
        "evaluationId": evaluation_id,
        "activityTitle": clean_text(payload.get("activityTitle"), 180),
        "submittedAt": now_iso(),
        "score100": score100,
        "grade": grade,
        "overall": clean_score_metric(details.get("overall")),
        "accuracy": clean_score_metric(details.get("accuracy")),
        "completeness": clean_score_metric(details.get("completeness")),
        "fluency": clean_score_metric(details.get("fluency")),
        "wpm": clean_score_metric(details.get("wpm"), 0, 300),
        "stageLabel": clean_text(details.get("stageLabel"), 120),
        "final": details.get("final") is True,
        "transcript": clean_text(details.get("transcript"), 3000),
        "referenceText": clean_text(details.get("referenceText"), 3000),
        "missedWords": clean_text_list(details.get("missedWords"), 30, 80),
        "liaison": clean_liaison
    }
    return {key: value for key, value in clean_details.items() if value not in ("", None, [], {})}


def safe_filename_token(value, limit=80):
    token = re.sub(r"[^A-Za-z0-9_.-]+", "-", str(value or "").strip())[:limit].strip(".-")
    return token or "item"


def audio_extension_for_type(content_type):
    content_type = str(content_type or "").split(";", 1)[0].strip().lower()
    if content_type in ("audio/webm", "video/webm"):
        return "webm"
    if content_type in ("audio/mp4", "audio/x-m4a", "audio/m4a"):
        return "m4a"
    if content_type in ("audio/mpeg", "audio/mp3"):
        return "mp3"
    if content_type == "audio/wav":
        return "wav"
    if content_type == "audio/ogg":
        return "ogg"
    return ""


def remove_french8_pronunciation_audio(audio_ref):
    if not isinstance(audio_ref, dict):
        return
    filename = safe_filename_token(audio_ref.get("file"), 160)
    if not filename:
        return
    path = os.path.abspath(os.path.join(FRENCH8_PRONUNCIATION_AUDIO_DIR, filename))
    root = os.path.abspath(FRENCH8_PRONUNCIATION_AUDIO_DIR)
    if not path.startswith(root + os.sep):
        return
    try:
        if os.path.exists(path):
            os.remove(path)
    except OSError:
        pass


def save_french8_pronunciation_audio(student, evaluation_id, payload):
    details = payload.get("details")
    if not isinstance(details, dict):
        return None
    data_url = details.get("audioDataUrl")
    if not isinstance(data_url, str) or not data_url.startswith("data:"):
        return None
    match = re.match(r"^data:([^;,]+)(?:;[^,]*)?;base64,(.+)$", data_url, re.DOTALL)
    if not match:
        return None
    content_type = match.group(1).strip().lower()
    extension = audio_extension_for_type(content_type)
    if not extension:
        return None
    try:
        audio_bytes = base64.b64decode(match.group(2), validate=True)
    except (ValueError, binascii.Error):
        return None
    if not audio_bytes or len(audio_bytes) > 4 * 1024 * 1024:
        return None
    os.makedirs(FRENCH8_PRONUNCIATION_AUDIO_DIR, exist_ok=True)
    student_token = safe_filename_token(student.get("id") or student.get("email") or "student")
    evaluation_token = safe_filename_token(evaluation_id)
    filename = f"{student_token}-{evaluation_token}-{int(time.time())}-{secrets.token_hex(4)}.{extension}"
    path = os.path.join(FRENCH8_PRONUNCIATION_AUDIO_DIR, filename)
    with open(path, "wb") as handle:
        handle.write(audio_bytes)
    return {
        "file": filename,
        "contentType": content_type,
        "bytes": len(audio_bytes),
        "uploadedAt": now_iso()
    }


def remove_intermediate_pronunciation_audio(audio_ref):
    if not isinstance(audio_ref, dict):
        return
    filename = safe_filename_token(audio_ref.get("file"), 160)
    if not filename:
        return
    path = os.path.abspath(os.path.join(INTERMEDIATE_PRONUNCIATION_AUDIO_DIR, filename))
    root = os.path.abspath(INTERMEDIATE_PRONUNCIATION_AUDIO_DIR)
    if not path.startswith(root + os.sep):
        return
    try:
        if os.path.exists(path):
            os.remove(path)
    except OSError:
        pass


def save_intermediate_pronunciation_audio(student, evaluation_id, payload):
    details = payload.get("details")
    if not isinstance(details, dict):
        return None
    data_url = details.get("audioDataUrl")
    if not isinstance(data_url, str) or not data_url.startswith("data:"):
        return None
    match = re.match(r"^data:([^;,]+)(?:;[^,]*)?;base64,(.+)$", data_url, re.DOTALL)
    if not match:
        return None
    content_type = match.group(1).strip().lower()
    extension = audio_extension_for_type(content_type)
    if not extension:
        return None
    try:
        audio_bytes = base64.b64decode(match.group(2), validate=True)
    except (ValueError, binascii.Error):
        return None
    if not audio_bytes or len(audio_bytes) > 4 * 1024 * 1024:
        return None
    os.makedirs(INTERMEDIATE_PRONUNCIATION_AUDIO_DIR, exist_ok=True)
    student_token = safe_filename_token(student.get("id") or student.get("email") or "student")
    evaluation_token = safe_filename_token(evaluation_id)
    filename = f"{student_token}-{evaluation_token}-{int(time.time())}-{secrets.token_hex(4)}.{extension}"
    path = os.path.join(INTERMEDIATE_PRONUNCIATION_AUDIO_DIR, filename)
    with open(path, "wb") as handle:
        handle.write(audio_bytes)
    return {
        "file": filename,
        "contentType": content_type,
        "bytes": len(audio_bytes),
        "uploadedAt": now_iso()
    }


def normalized_activity_text(value):
    return clean_text(value, 5000)


def simple_word_count(value):
    return len([word for word in re.split(r"\s+", str(value or "").strip()) if word])


def text_contains_expression(text, expression):
    normalized_text = normalize_text(text)
    normalized_expression = normalize_text(expression)
    return bool(normalized_expression and normalized_expression in normalized_text)


def clean_french8_hypotheses_submission_details(payload, audio_ref):
    text = normalized_activity_text(payload.get("text"))
    idiom = clean_text(payload.get("idiom"), 140)
    details = {
        "evaluationId": FRENCH8_HYPOTHESES_ACTIVITY_ID,
        "activityTitle": "Production ecrite et orale - Hypotheses irreelles",
        "submittedAt": now_iso(),
        "submissionText": text,
        "idiom": idiom,
        "wordCount": simple_word_count(text),
        "promptVersion": clean_text(payload.get("promptVersion") or "20260629-hypotheses-final", 80),
        "audio": audio_ref
    }
    return {key: value for key, value in details.items() if value not in ("", None, [], {})}


def ensure_evaluation_template(grades_data, template):
    evaluations = grades_data.setdefault("evaluations", [])
    existing = next((item for item in evaluations if isinstance(item, dict) and item.get("id") == template.get("id")), None)
    if existing:
        changed = False
        for key, value in template.items():
            if existing.get(key) != value:
                existing[key] = value
                changed = True
        return changed
    evaluations.append(dict(template))
    return True


def ensure_french1_gradebook_structure(grades_data):
    changed = False
    obsolete_ids = {"participation", "ecoute", "lecture", "prononciation", "evaluationApreciser15"}
    evaluations = grades_data.setdefault("evaluations", [])
    filtered = [item for item in evaluations if not (isinstance(item, dict) and item.get("id") in obsolete_ids)]
    if len(filtered) != len(evaluations):
        grades_data["evaluations"] = filtered
        changed = True
    for student in grades_data.get("students", []):
        if not isinstance(student, dict) or not isinstance(student.get("grades"), dict):
            continue
        for obsolete_id in obsolete_ids:
            if obsolete_id in student["grades"]:
                student["grades"].pop(obsolete_id, None)
                changed = True
    for template in FRENCH1_CORE_EVALUATIONS.values():
        if ensure_evaluation_template(grades_data, template):
            changed = True
    for template in FRENCH1_PRONUNCIATION_EVALUATIONS.values():
        if ensure_evaluation_template(grades_data, template):
            changed = True
    return changed


def ensure_french2_gradebook_structure(grades_data):
    changed = False
    obsolete_ids = {"interaction-orale"}
    evaluations = grades_data.setdefault("evaluations", [])
    filtered = [item for item in evaluations if not (isinstance(item, dict) and item.get("id") in obsolete_ids)]
    if len(filtered) != len(evaluations):
        grades_data["evaluations"] = filtered
        changed = True
    for student in grades_data.get("students", []):
        if not isinstance(student, dict) or not isinstance(student.get("grades"), dict):
            continue
        for obsolete_id in obsolete_ids:
            if obsolete_id in student["grades"]:
                student["grades"].pop(obsolete_id, None)
                changed = True
    for template in FRENCH2_PRONUNCIATION_EVALUATIONS.values():
        if ensure_evaluation_template(grades_data, template):
            changed = True
    return changed


def ensure_intermediate_gradebook_structure(grades_data):
    changed = ensure_evaluation_template(grades_data, INTERMEDIATE_UNIT2_CATCHING_UP_EVALUATION)
    if ensure_evaluation_template(grades_data, INTERMEDIATE_UNIT2_TIMELINE_EVALUATION):
        changed = True
    if ensure_evaluation_template(grades_data, INTERMEDIATE_UNIT2_READING_EVALUATION):
        changed = True
    if ensure_evaluation_template(grades_data, INTERMEDIATE_UNIT2_GOAL_SUPPORT_EVALUATION):
        changed = True
    if ensure_evaluation_template(grades_data, INTERMEDIATE_UNIT4_LISTENING_EVALUATION):
        changed = True
    if ensure_evaluation_template(grades_data, INTERMEDIATE_UNIT4_PRONUNCIATION_EVALUATION):
        changed = True
    if ensure_evaluation_template(grades_data, INTERMEDIATE_UNIT5_MARKET_BASKET_EVALUATION):
        changed = True
    if ensure_evaluation_template(grades_data, INTERMEDIATE_UNIT5_LISTENING_EVALUATION):
        changed = True
    if ensure_evaluation_template(grades_data, INTERMEDIATE_UNIT5_READING_EVALUATION):
        changed = True
    if ensure_evaluation_template(grades_data, INTERMEDIATE_UNIT5_DINNER_PLAN_EVALUATION):
        changed = True
    if ensure_evaluation_template(grades_data, INTERMEDIATE_UNIT5_PRONUNCIATION_EVALUATION):
        changed = True
    if ensure_evaluation_template(grades_data, INTERMEDIATE_UNIT5_SNACK_REVIEW_EVALUATION):
        changed = True
    return changed


def ensure_basic_gradebook_structure(grades_data):
    return ensure_evaluation_template(grades_data, BASIC_UNIT6_NEIGHBORHOOD_AI_EVALUATION)


def score_intermediate_unit2_catching_up(payload):
    return score_intermediate_fixed_answers(payload, INTERMEDIATE_UNIT2_CATCHING_UP_ANSWERS)


def score_intermediate_unit2_reading(payload):
    return score_intermediate_fixed_answers(payload, INTERMEDIATE_UNIT2_READING_ANSWERS)


def score_intermediate_unit4_listening(payload):
    return score_intermediate_fixed_answers(payload, INTERMEDIATE_UNIT4_LISTENING_ANSWERS)


def score_intermediate_unit4_memory_box(payload):
    return score_intermediate_fixed_answers(payload, INTERMEDIATE_UNIT4_MEMORY_BOX_ANSWERS)


def score_intermediate_unit5_market_basket(payload):
    return score_intermediate_fixed_answers(payload, INTERMEDIATE_UNIT5_MARKET_BASKET_ANSWERS)


def intermediate_unit5_market_basket_review(result):
    incorrect = result.get("incorrect", [])
    sort_errors = len([item for item in incorrect if 1 <= item <= 12])
    quantity_errors = len([item for item in incorrect if 13 <= item <= 20])
    review_summary = []
    if sort_errors:
        review_summary.append(f"Review countable and uncountable food sorting: {sort_errors} item(s).")
    if quantity_errors:
        review_summary.append(f"Review quantity phrases, containers, much/many, a little/a few: {quantity_errors} item(s).")
    if not review_summary:
        review_summary.append("Grammar decisions were accurate in this attempt.")
    return {
        "sortErrors": sort_errors,
        "quantityErrors": quantity_errors,
        "reviewSummary": review_summary
    }


def score_intermediate_unit5_listening(payload):
    return score_intermediate_fixed_answers(payload, INTERMEDIATE_UNIT5_LISTENING_ANSWERS)


def score_intermediate_unit5_reading(payload):
    return score_intermediate_fixed_answers(payload, INTERMEDIATE_UNIT5_READING_ANSWERS)


def intermediate_pronunciation_grade_from_payload(payload):
    try:
        score100 = float(payload.get("score100"))
    except (TypeError, ValueError):
        raise ValueError("invalid_score")
    if score100 < 0 or score100 > 100:
        raise ValueError("invalid_score")
    grade = round((score100 / 20.0) * 100) / 100
    return int(round(score100)), grade


def score_intermediate_fixed_answers(payload, answer_key):
    raw_answers = payload.get("answers")
    if not isinstance(raw_answers, list):
        raise ValueError("invalid_answers")
    if len(raw_answers) != len(answer_key):
        raise ValueError("incomplete_answers")
    answers = []
    score = 0
    incorrect = []
    for index, correct in enumerate(answer_key):
        try:
            answer = int(raw_answers[index])
        except (TypeError, ValueError):
            raise ValueError("invalid_answers")
        if answer < 0 or answer > 2:
            raise ValueError("invalid_answers")
        answers.append(answer)
        if answer == correct:
            score += 1
        else:
            incorrect.append(index + 1)
    total = len(answer_key)
    grade = round((score / total) * 5, 2)
    return {
        "answers": answers,
        "score": score,
        "total": total,
        "grade": grade,
        "incorrect": incorrect
    }


def clean_intermediate_text_followup(payload, text_key, min_words, max_words):
    text = clean_text(payload.get(text_key), 5000)
    word_count = simple_word_count(text)
    if word_count < min_words:
        raise ValueError("text_too_short")
    if word_count > max_words:
        raise ValueError("text_too_long")
    return text, word_count


def save_intermediate_text_followup(student, evaluation_id, detail):
    previous = student.get("gradeDetails", {}).get(evaluation_id) if isinstance(student.get("gradeDetails"), dict) else None
    try:
        attempt_count = int(previous.get("attemptCount", 0)) + 1 if isinstance(previous, dict) else 1
    except (TypeError, ValueError):
        attempt_count = 1
    submitted_at = now_iso()
    if not isinstance(student.get("gradeDetails"), dict):
        student["gradeDetails"] = {}
    next_detail = dict(detail)
    next_detail.update({
        "submittedAt": submitted_at,
        "attemptCount": attempt_count,
        "status": "submitted",
        "weight": 0,
        "doesNotAffectAverage": True,
        "followUpOnly": True
    })
    student["gradeDetails"][evaluation_id] = next_detail
    return submitted_at, attempt_count


def intermediate_unit4_expression_by_id(expression_id):
    return next(
        (item for item in INTERMEDIATE_UNIT4_EXPRESSION_ITEMS if item.get("id") == expression_id),
        None
    )


def default_intermediate_unit4_expression_wall():
    return {
        "activeExpressionId": None,
        "openedAt": None,
        "openedBy": None,
        "updatedAt": None,
        "submissions": []
    }


def read_intermediate_unit4_expression_wall():
    data = read_json_file(INTERMEDIATE_UNIT4_EXPRESSION_WALL_PATH, default_intermediate_unit4_expression_wall())
    if not isinstance(data.get("submissions"), list):
        data["submissions"] = []
    data.setdefault("activeExpressionId", None)
    data.setdefault("openedAt", None)
    data.setdefault("openedBy", None)
    data.setdefault("updatedAt", None)
    if data.get("activeExpressionId") and not intermediate_unit4_expression_by_id(data.get("activeExpressionId")):
        data["activeExpressionId"] = None
    return data


def write_intermediate_unit4_expression_wall(data):
    write_json_file(INTERMEDIATE_UNIT4_EXPRESSION_WALL_PATH, data, ".intermediate-unit4-expression-wall-")


def default_intermediate_unit5_market_basket_live():
    return {
        "isOpen": False,
        "launchedAt": None,
        "launchedBy": None,
        "updatedAt": None,
        "students": {}
    }


def read_intermediate_unit5_market_basket_live():
    data = read_json_file(INTERMEDIATE_UNIT5_MARKET_BASKET_LIVE_PATH, default_intermediate_unit5_market_basket_live())
    if not isinstance(data.get("students"), dict):
        data["students"] = {}
    data.setdefault("isOpen", False)
    data.setdefault("launchedAt", None)
    data.setdefault("launchedBy", None)
    data.setdefault("updatedAt", None)
    return data


def write_intermediate_unit5_market_basket_live(data):
    write_json_file(INTERMEDIATE_UNIT5_MARKET_BASKET_LIVE_PATH, data, ".intermediate-unit5-market-basket-live-")


def clean_intermediate_unit5_team(value):
    team = clean_text(value, 40)
    return team if team in {"Team Teal", "Team Gold", "Team Green"} else ""


def public_intermediate_unit5_market_basket_live(profile, grades_data, live):
    role = grade_user_role(profile, grades_data)
    is_staff = role in ("admin", "teacher")
    teams = {
        "Team Teal": {"team": "Team Teal", "students": 0, "submitted": 0, "scoreTotal": 0, "gradeTotal": 0.0, "checklistReady": 0},
        "Team Gold": {"team": "Team Gold", "students": 0, "submitted": 0, "scoreTotal": 0, "gradeTotal": 0.0, "checklistReady": 0},
        "Team Green": {"team": "Team Green", "students": 0, "submitted": 0, "scoreTotal": 0, "gradeTotal": 0.0, "checklistReady": 0}
    }
    stage_counts = {"Sort": 0, "Measure": 0, "Build": 0, "Send": 0}
    students = []
    for student_id, item in live.get("students", {}).items():
        if not isinstance(item, dict):
            continue
        team = item.get("team") if item.get("team") in teams else ""
        stage = item.get("stage") if item.get("stage") in stage_counts else "Sort"
        stage_counts[stage] += 1
        checklist_ready = bool(item.get("checklistReady"))
        submitted = bool(item.get("submitted"))
        if team:
            teams[team]["students"] += 1
            if submitted:
                teams[team]["submitted"] += 1
            if checklist_ready:
                teams[team]["checklistReady"] += 1
            try:
                teams[team]["scoreTotal"] += int(item.get("score", 0))
            except (TypeError, ValueError):
                pass
            try:
                teams[team]["gradeTotal"] += float(item.get("grade", 0))
            except (TypeError, ValueError):
                pass
        if is_staff:
            students.append({
                "studentId": student_id,
                "studentName": item.get("studentName", "Student"),
                "email": item.get("email", ""),
                "team": team,
                "stage": stage,
                "sorted": item.get("sorted", 0),
                "measured": item.get("measured", 0),
                "score": item.get("score"),
                "grade": item.get("grade"),
                "submitted": submitted,
                "checklistReady": checklist_ready,
                "updatedAt": item.get("updatedAt", "")
            })
    team_payload = []
    for item in teams.values():
        average_grade = round(item["gradeTotal"] / item["submitted"], 2) if item["submitted"] else None
        team_payload.append({
            "team": item["team"],
            "students": item["students"],
            "submitted": item["submitted"],
            "averageGrade": average_grade,
            "checklistReady": item["checklistReady"]
        })
    students.sort(key=lambda item: item.get("updatedAt") or "", reverse=True)
    return {
        "role": role,
        "isTeacher": is_staff,
        "isOpen": bool(live.get("isOpen")),
        "launchedAt": live.get("launchedAt"),
        "launchedBy": live.get("launchedBy"),
        "updatedAt": live.get("updatedAt"),
        "stageCounts": stage_counts,
        "teams": team_payload,
        "students": students if is_staff else []
    }


def sentence_matches_intermediate_expression(sentence, expression):
    normalized_sentence = normalize_text(sentence)
    expression_id = expression.get("id") if isinstance(expression, dict) else ""
    if expression_id == "bring-up" and re.search(r"\b(bring|brings|brought|bringing)\b(?:\s+\w+){0,6}\s+up\b", normalized_sentence):
        return True
    if expression_id == "work-out" and re.search(r"\b(work|works|worked|working)\b(?:\s+\w+){0,6}\s+out\b", normalized_sentence):
        return True
    if expression_id == "meet-halfway" and re.search(r"\b(meet|meets|met|meeting)\b(?:\s+\w+){0,8}\s+halfway\b", normalized_sentence):
        return True
    if expression_id == "patch-things-up" and re.search(r"\b(patch|patches|patched|patching)\b(?:\s+\w+){0,6}\s+up\b", normalized_sentence):
        return True
    variants = expression.get("variants") if isinstance(expression, dict) else []
    if not isinstance(variants, list):
        variants = []
    return any(normalize_text(variant) in normalized_sentence for variant in variants)


def public_intermediate_expression_submission(submission, is_staff):
    public = {
        "id": submission.get("id", ""),
        "expressionId": submission.get("expressionId", ""),
        "expressionLabel": submission.get("expressionLabel", ""),
        "sentence": submission.get("sentence", ""),
        "studentName": submission.get("studentName", "Student"),
        "submittedAt": submission.get("submittedAt", "")
    }
    if is_staff:
        public["studentId"] = submission.get("studentId", "")
        public["studentEmail"] = submission.get("studentEmail", "")
    return public


def intermediate_unit4_expression_wall_payload(profile, grades_data, wall):
    role = grade_user_role(profile, grades_data)
    student = matched_student_for_profile(profile, grades_data)
    is_staff = role in ("admin", "teacher")
    active_expression = intermediate_unit4_expression_by_id(wall.get("activeExpressionId"))
    submissions = []
    for item in wall.get("submissions", []):
        if isinstance(item, dict):
            submissions.append(public_intermediate_expression_submission(item, is_staff))
    submissions.sort(key=lambda item: item.get("submittedAt") or "")
    return {
        "role": role,
        "student": {
            "id": student.get("id", ""),
            "fullName": student.get("fullName", "")
        } if isinstance(student, dict) else None,
        "canSubmit": isinstance(student, dict) and not is_staff,
        "expressions": INTERMEDIATE_UNIT4_EXPRESSION_ITEMS,
        "activeExpressionId": wall.get("activeExpressionId"),
        "activeExpression": active_expression,
        "openedAt": wall.get("openedAt"),
        "openedBy": wall.get("openedBy"),
        "updatedAt": wall.get("updatedAt"),
        "submissions": submissions
    }


def pronunciation_grade_from_payload(payload, evaluations):
    evaluation_id = clean_text(payload.get("evaluationId"), 80)
    if evaluation_id not in evaluations:
        raise ValueError("invalid_evaluation")
    try:
        score100 = float(payload.get("score100"))
    except (TypeError, ValueError):
        raise ValueError("invalid_score")
    if score100 < 50:
        raise ValueError("score_too_low")
    if score100 > 100:
        raise ValueError("invalid_score")
    grade = round((score100 / 20.0) * 100) / 100
    return evaluation_id, int(round(score100)), grade


def french1_pronunciation_grade_from_payload(payload):
    return pronunciation_grade_from_payload(payload, FRENCH1_PRONUNCIATION_EVALUATIONS)


def french2_pronunciation_grade_from_payload(payload):
    return pronunciation_grade_from_payload(payload, FRENCH2_PRONUNCIATION_EVALUATIONS)


def default_final_exam_bundle():
    return {
        "state": {
            "isOpen": False,
            "openedAt": None,
            "closedAt": None,
            "openedBy": None,
            "updatedAt": None
        },
        "exam": {
            "id": "french7-final-exam",
            "title": "Examen final",
            "totalPoints": 50,
            "sections": []
        }
    }


def read_final_exam_bundle():
    source_path = FRENCH7_FINAL_EXAM_PATH if os.path.exists(FRENCH7_FINAL_EXAM_PATH) else BUNDLED_FRENCH7_FINAL_EXAM_PATH
    data = read_json_file(source_path, default_final_exam_bundle())
    if not isinstance(data.get("state"), dict):
        data["state"] = default_final_exam_bundle()["state"]
    if not isinstance(data.get("exam"), dict):
        data["exam"] = default_final_exam_bundle()["exam"]
    data["state"].setdefault("isOpen", False)
    data["state"].setdefault("openedAt", None)
    data["state"].setdefault("closedAt", None)
    data["state"].setdefault("openedBy", None)
    data["state"].setdefault("updatedAt", None)
    data["exam"].setdefault("sections", [])
    data["exam"].setdefault("totalPoints", 50)
    return data


def write_final_exam_bundle(data):
    write_json_file(FRENCH7_FINAL_EXAM_PATH, data, ".french7-final-exam-")


def read_final_exam_submissions():
    data = read_json_file(FRENCH7_FINAL_EXAM_SUBMISSIONS_PATH, {"submissions": {}})
    if not isinstance(data.get("submissions"), dict):
        data["submissions"] = {}
    return data


def write_final_exam_submissions(data):
    write_json_file(FRENCH7_FINAL_EXAM_SUBMISSIONS_PATH, data, ".french7-final-submissions-")


def default_french1_final_exam_bundle():
    return {
        "state": {
            "isOpen": False,
            "openedAt": None,
            "closedAt": None,
            "openedBy": None,
            "updatedAt": None
        },
        "exam": {
            "id": "french1-final-exam",
            "title": "Examen final A1.1",
            "totalPoints": 50,
            "transcript": "",
            "sections": []
        }
    }


def read_french1_final_exam_bundle():
    source_path = FRENCH1_FINAL_EXAM_PATH if os.path.exists(FRENCH1_FINAL_EXAM_PATH) else BUNDLED_FRENCH1_FINAL_EXAM_PATH
    data = read_json_file(source_path, default_french1_final_exam_bundle())
    if not isinstance(data.get("state"), dict):
        data["state"] = default_french1_final_exam_bundle()["state"]
    if not isinstance(data.get("exam"), dict):
        data["exam"] = default_french1_final_exam_bundle()["exam"]
    data["state"].setdefault("isOpen", False)
    data["state"].setdefault("openedAt", None)
    data["state"].setdefault("closedAt", None)
    data["state"].setdefault("openedBy", None)
    data["state"].setdefault("updatedAt", None)
    data["exam"].setdefault("sections", [])
    data["exam"].setdefault("totalPoints", 50)
    data["exam"].setdefault("transcript", "")
    return data


def write_french1_final_exam_bundle(data):
    write_json_file(FRENCH1_FINAL_EXAM_PATH, data, ".french1-final-exam-")


def read_french1_final_exam_submissions():
    data = read_json_file(FRENCH1_FINAL_EXAM_SUBMISSIONS_PATH, {"submissions": {}})
    if not isinstance(data.get("submissions"), dict):
        data["submissions"] = {}
    return data


def write_french1_final_exam_submissions(data):
    write_json_file(FRENCH1_FINAL_EXAM_SUBMISSIONS_PATH, data, ".french1-final-submissions-")


def default_french2_final_exam_bundle():
    return {
        "state": {
            "isOpen": False,
            "openedAt": None,
            "closedAt": None,
            "openedBy": None,
            "updatedAt": None
        },
        "exam": {
            "id": "french2-final-exam",
            "title": "Examen final A1.2",
            "totalPoints": 50,
            "transcript": "",
            "sections": []
        }
    }


def read_french2_final_exam_bundle():
    source_path = FRENCH2_FINAL_EXAM_PATH if os.path.exists(FRENCH2_FINAL_EXAM_PATH) else BUNDLED_FRENCH2_FINAL_EXAM_PATH
    data = read_json_file(source_path, default_french2_final_exam_bundle())
    if not isinstance(data.get("state"), dict):
        data["state"] = default_french2_final_exam_bundle()["state"]
    if not isinstance(data.get("exam"), dict):
        data["exam"] = default_french2_final_exam_bundle()["exam"]
    data["state"].setdefault("isOpen", False)
    data["state"].setdefault("openedAt", None)
    data["state"].setdefault("closedAt", None)
    data["state"].setdefault("openedBy", None)
    data["state"].setdefault("updatedAt", None)
    data["exam"].setdefault("sections", [])
    data["exam"].setdefault("totalPoints", 50)
    data["exam"].setdefault("transcript", "")
    return data


def write_french2_final_exam_bundle(data):
    write_json_file(FRENCH2_FINAL_EXAM_PATH, data, ".french2-final-exam-")


def read_french2_final_exam_submissions():
    data = read_json_file(FRENCH2_FINAL_EXAM_SUBMISSIONS_PATH, {"submissions": {}})
    if not isinstance(data.get("submissions"), dict):
        data["submissions"] = {}
    return data


def write_french2_final_exam_submissions(data):
    write_json_file(FRENCH2_FINAL_EXAM_SUBMISSIONS_PATH, data, ".french2-final-submissions-")


def default_french8_quiz_bundle():
    return {
        "state": {
            "isOpen": False,
            "openedAt": None,
            "closedAt": None,
            "openedBy": None,
            "updatedAt": None
        },
        "exam": {
            "id": "french8-quiz-ville-intelligente",
            "title": "Quiz 10% - Ville intelligente",
            "version": "local",
            "totalPoints": 26,
            "sections": []
        }
    }


def read_french8_quiz_bundle():
    source_path = FRENCH8_QUIZ_PATH if os.path.exists(FRENCH8_QUIZ_PATH) else BUNDLED_FRENCH8_QUIZ_PATH
    data = read_json_file(source_path, default_french8_quiz_bundle())
    if not isinstance(data.get("state"), dict):
        data["state"] = default_french8_quiz_bundle()["state"]
    if not isinstance(data.get("exam"), dict):
        data["exam"] = default_french8_quiz_bundle()["exam"]
    data["state"].setdefault("isOpen", False)
    data["state"].setdefault("openedAt", None)
    data["state"].setdefault("closedAt", None)
    data["state"].setdefault("openedBy", None)
    data["state"].setdefault("updatedAt", None)
    data["exam"].setdefault("sections", [])
    data["exam"].setdefault("totalPoints", 26)
    data["exam"].setdefault("version", "local")
    return data


def write_french8_quiz_bundle(data):
    write_json_file(FRENCH8_QUIZ_PATH, data, ".french8-quiz-")


def read_french8_quiz_submissions():
    data = read_json_file(FRENCH8_QUIZ_SUBMISSIONS_PATH, {"submissions": {}})
    if not isinstance(data.get("submissions"), dict):
        data["submissions"] = {}
    return data


def write_french8_quiz_submissions(data):
    write_json_file(FRENCH8_QUIZ_SUBMISSIONS_PATH, data, ".french8-quiz-submissions-")


def french8_quiz_submission_public(submission):
    if not isinstance(submission, dict):
        return None
    return {
        "studentId": submission.get("studentId"),
        "studentName": submission.get("studentName"),
        "scorePoints": submission.get("scorePoints"),
        "totalPoints": submission.get("totalPoints"),
        "grade": submission.get("grade"),
        "sectionScores": submission.get("sectionScores"),
        "submittedAt": submission.get("submittedAt"),
        "quizVersion": submission.get("quizVersion")
    }


def french8_quiz_state_payload(profile, grades_data, bundle, submissions):
    payload = final_exam_state_payload(profile, grades_data, bundle, submissions)
    payload["submitted"] = french8_quiz_submission_public(payload.get("submitted"))
    role = payload.get("role")
    if role in ("admin", "teacher"):
        students = [item for item in grades_data.get("students", []) if isinstance(item, dict)]
        submitted_ids = {
            clean_text(student_id, 40)
            for student_id in submissions.get("submissions", {})
            if clean_text(student_id, 40)
        }
        total_students = len(students)
        submitted_count = sum(1 for student in students if clean_text(student.get("id"), 40) in submitted_ids)
        payload["stats"] = {
            "totalStudents": total_students,
            "submittedCount": submitted_count,
            "pendingCount": max(total_students - submitted_count, 0)
        }
    return payload


def french1_final_exam_submission_public(submission):
    if not isinstance(submission, dict):
        return None
    return {
        "studentId": submission.get("studentId"),
        "studentName": submission.get("studentName"),
        "scorePoints": submission.get("scorePoints"),
        "totalPoints": submission.get("totalPoints"),
        "grade": submission.get("grade"),
        "submittedAt": submission.get("submittedAt")
    }


def final_exam_public_question(question):
    public = {
        "id": clean_text(question.get("id"), 80),
        "type": clean_text(question.get("type"), 40),
        "prompt": clean_text(question.get("prompt"), 1000),
        "points": question.get("points", 1)
    }
    for optional in ("block", "title"):
        if question.get(optional):
            public[optional] = clean_text(question.get(optional), 300)
    if isinstance(question.get("options"), list):
        public["options"] = [clean_text(item, 500) for item in question.get("options", [])[:8]]
    if isinstance(question.get("bank"), list):
        public["bank"] = [clean_text(item, 800) for item in question.get("bank", [])[:10]]
    return public


def final_exam_public_payload(bundle):
    exam = bundle.get("exam", {})
    sections = []
    for section in exam.get("sections", []):
        if not isinstance(section, dict):
            continue
        questions = section.get("questions", [])
        sections.append({
            "id": clean_text(section.get("id"), 80),
            "title": clean_text(section.get("title"), 200),
            "subtitle": clean_text(section.get("subtitle"), 300),
            "points": section.get("points", 0),
            "instructions": clean_text(section.get("instructions"), 500),
            "readingTitle": clean_text(section.get("readingTitle"), 200),
            "readingText": [clean_text(item, 1400) for item in section.get("readingText", [])] if isinstance(section.get("readingText"), list) else [],
            "audioTitle": clean_text(section.get("audioTitle"), 200),
            "audioText": clean_text(section.get("audioText"), 500),
            "audioSrc": clean_text(section.get("audioSrc"), 300),
            "questions": [final_exam_public_question(item) for item in questions if isinstance(item, dict)]
        })
    return {
        "id": clean_text(exam.get("id") or "french7-final-exam", 80),
        "title": clean_text(exam.get("title") or "Examen final", 200),
        "totalPoints": exam.get("totalPoints", 50),
        "sections": sections
    }


def final_exam_state_payload(profile, grades_data, bundle, submissions):
    role = grade_user_role(profile, grades_data)
    student = matched_student_for_profile(profile, grades_data)
    student_id = clean_text(student.get("id"), 40) if isinstance(student, dict) else ""
    return {
        "role": role,
        "state": bundle.get("state", {}),
        "student": student_public_view(student) if isinstance(student, dict) else None,
        "submitted": submissions.get("submissions", {}).get(student_id) if student_id else None
    }


def final_exam_allowed_student(profile, grades_data):
    email = normalize_email(profile.get("email"))
    if not email.endswith("@gmail.com"):
        return None
    return matched_student_for_profile(profile, grades_data)


def normalize_answer(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, int):
        return value
    if isinstance(value, list):
        normalized = []
        for item in value[:20]:
            try:
                normalized.append(int(item))
            except (TypeError, ValueError):
                normalized.append(item)
        return normalized
    if isinstance(value, str):
        stripped = value.strip().lower()
        if stripped == "true":
            return True
        if stripped == "false":
            return False
        try:
            return int(stripped)
        except ValueError:
            return stripped[:500]
    return None


def score_final_exam(exam, answers):
    if not isinstance(answers, dict):
        answers = {}
    score = 0
    total = 0
    section_scores = {}
    details = {}
    for section in exam.get("sections", []):
        if not isinstance(section, dict):
            continue
        section_id = clean_text(section.get("id"), 80)
        section_score = 0
        section_total = 0
        for question in section.get("questions", []):
            if not isinstance(question, dict):
                continue
            question_id = clean_text(question.get("id"), 80)
            points = question.get("points", 1)
            try:
                points = float(points)
            except (TypeError, ValueError):
                points = 1
            normalized = normalize_answer(answers.get(question_id))
            expected = normalize_answer(question.get("answer"))
            is_correct = normalized == expected
            if is_correct:
                score += points
                section_score += points
            total += points
            section_total += points
            details[question_id] = {
                "answer": normalized,
                "correct": is_correct,
                "points": points if is_correct else 0
            }
        section_scores[section_id] = {
            "score": clean_exam_number(section_score),
            "total": clean_exam_number(section_total)
        }
    grade = round((score / total) * 5, 2) if total else 0
    return {
        "scorePoints": clean_exam_number(score),
        "totalPoints": clean_exam_number(total),
        "grade": grade,
        "sectionScores": section_scores,
        "details": details
    }


def clean_exam_number(value):
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return 0
    return int(numeric) if numeric.is_integer() else round(numeric, 2)


def ensure_final_exam_evaluation(grades_data):
    evaluations = grades_data.setdefault("evaluations", [])
    if any(isinstance(item, dict) and item.get("id") == "finalExam" for item in evaluations):
        return
    evaluations.insert(0, {
        "id": "finalExam",
        "title": "Examen final",
        "weight": 20,
        "type": "Examen",
        "date": "2026-06-05",
        "displayDate": "Vendredi 5 juin",
        "description": "Evaluation finale sur les themes principaux du cours."
    })



def default_basic_integrated_task_bundle():
    return {
        "state": {"isOpen": False, "openedAt": None, "closedAt": None, "updatedAt": None, "openedBy": None, "reopenUntilEpoch": None, "reopenUntilLabel": "", "reopenStudentIds": [], "reopenResetPlays": False},
        "exam": {
            "id": "basic-course-1-integrated-task",
            "title": "BASIC COURSE 1 – INTEGRATED TASK (20%)",
            "totalPoints": 50,
            "listeningPoints": 25,
            "writingPoints": 25,
            "maxAudioPlays": 3,
            "questions": []
        }
    }


def read_basic_integrated_task_bundle():
    source = BASIC_INTEGRATED_TASK_PATH if os.path.exists(BASIC_INTEGRATED_TASK_PATH) else BUNDLED_BASIC_INTEGRATED_TASK_PATH
    data = read_json_file(source, default_basic_integrated_task_bundle())
    if not isinstance(data.get("state"), dict):
        data["state"] = default_basic_integrated_task_bundle()["state"]
    if not isinstance(data.get("exam"), dict):
        data["exam"] = default_basic_integrated_task_bundle()["exam"]
    for key, value in default_basic_integrated_task_bundle()["state"].items():
        data["state"].setdefault(key, value)
    data["exam"].setdefault("questions", [])
    data["exam"].setdefault("totalPoints", 50)
    data["exam"].setdefault("listeningPoints", 25)
    data["exam"].setdefault("writingPoints", 25)
    return data


def write_basic_integrated_task_bundle(data):
    write_json_file(BASIC_INTEGRATED_TASK_PATH, data, ".basic-integrated-task-")


def read_basic_integrated_task_submissions():
    data = read_json_file(BASIC_INTEGRATED_TASK_SUBMISSIONS_PATH, {"submissions": {}, "events": []})
    if not isinstance(data.get("submissions"), dict):
        data["submissions"] = {}
    if not isinstance(data.get("events"), list):
        data["events"] = []
    return data


def write_basic_integrated_task_submissions(data):
    write_json_file(BASIC_INTEGRATED_TASK_SUBMISSIONS_PATH, data, ".basic-integrated-submissions-")


BASIC_ANDRES_RETAKE_STUDENT_ID = "005"
BASIC_ANDRES_RETAKE_OPEN_EPOCH = 1782968400
BASIC_ANDRES_RETAKE_CLOSE_EPOCH = 1783141200
BASIC_ANDRES_RETAKE_WINDOW_LABEL = "Available July 2 and July 3, 2026, until 11:59 p.m. Bogotá time"


def basic_andres_retake_exam():
    return {
        "id": "basic-course-1-integrated-task-andres-munoz-retake",
        "title": "Basic Course 1 - Integrated Task Special Retake",
        "totalPoints": 50,
        "listeningPoints": 25,
        "writingPoints": 25,
        "maxAudioPlays": None,
        "availabilityLabel": BASIC_ANDRES_RETAKE_WINDOW_LABEL,
        "questions": [
            {"id": "r1", "prompt": "What time does Luis usually get up?", "options": ["5:15 a.m.", "6:15 a.m.", "7:30 a.m.", "8:00 a.m."], "answer": 1, "points": 2.5},
            {"id": "r2", "prompt": "What does Luis have for breakfast?", "options": ["Fruit and tea", "Bread and milk", "Eggs and coffee", "Cereal and juice"], "answer": 2, "points": 2.5},
            {"id": "r3", "prompt": "How does Luis go to work?", "options": ["By bus", "By car", "By bicycle", "On foot"], "answer": 0, "points": 2.5},
            {"id": "r4", "prompt": "Where does Luis work?", "options": ["At a school", "At a small restaurant", "At a hospital", "At a supermarket"], "answer": 1, "points": 2.5},
            {"id": "r5", "prompt": "What is near Luis's workplace?", "options": ["A bank", "A church", "A park", "A gym"], "answer": 2, "points": 2.5},
            {"id": "r6", "prompt": "What time does Luis finish work?", "options": ["At two o'clock", "At three o'clock", "At four o'clock", "At five o'clock"], "answer": 2, "points": 2.5},
            {"id": "r7", "prompt": "What does Luis do after work?", "options": ["He plays soccer.", "He goes home and rests.", "He cooks dinner at the restaurant.", "He visits his friends."], "answer": 1, "points": 2.5},
            {"id": "r8", "prompt": "When does Luis study English?", "options": ["On Mondays and Thursdays", "On Tuesdays and Fridays", "Every morning", "Only on weekends"], "answer": 0, "points": 2.5},
            {"id": "r9", "prompt": "What does Luis do on weekends?", "options": ["He watches horror shows.", "He works all day.", "He runs in the park and visits his mother.", "He studies at the library."], "answer": 2, "points": 2.5},
            {"id": "r10", "prompt": "What is Luis's opinion about his routine?", "options": ["It is boring.", "It is relaxed.", "It is busy but interesting.", "It is very difficult."], "answer": 2, "points": 2.5}
        ]
    }


def read_basic_andres_retake_submissions():
    data = read_json_file(BASIC_ANDRES_RETAKE_SUBMISSIONS_PATH, {"submissions": {}})
    if not isinstance(data.get("submissions"), dict):
        data["submissions"] = {}
    return data


def basic_integrated_reopen_active(state):
    if not isinstance(state, dict):
        return False
    try:
        reopen_until = int(state.get("reopenUntilEpoch") or 0)
    except (TypeError, ValueError):
        reopen_until = 0
    return reopen_until > 0 and int(time.time()) < reopen_until


def basic_integrated_student_has_reopen(state, student_id):
    if not student_id or not basic_integrated_reopen_active(state):
        return False
    allowed_ids = state.get("reopenStudentIds", [])
    if not isinstance(allowed_ids, list):
        return False
    normalized = {clean_text(item, 40) for item in allowed_ids}
    return "*" in normalized or clean_text(student_id, 40) in normalized


def basic_integrated_can_take(role, state, student_id):
    if role in ("admin", "teacher"):
        return True
    if isinstance(state, dict) and state.get("isOpen") is True:
        return True
    return basic_integrated_student_has_reopen(state, student_id)


def write_basic_andres_retake_submissions(data):
    write_json_file(BASIC_ANDRES_RETAKE_SUBMISSIONS_PATH, data, ".basic-andres-retake-submissions-")


def basic_andres_retake_is_open():
    current = int(time.time())
    return BASIC_ANDRES_RETAKE_OPEN_EPOCH <= current < BASIC_ANDRES_RETAKE_CLOSE_EPOCH


def basic_andres_retake_student_allowed(profile, grades_data):
    student = matched_student_for_profile(profile, grades_data)
    if not isinstance(student, dict):
        return None
    if clean_text(student.get("id"), 40) != BASIC_ANDRES_RETAKE_STUDENT_ID:
        return None
    return student


def basic_andres_retake_public_submission(submission):
    if not isinstance(submission, dict):
        return None
    keys = (
        "receiptId", "studentId", "studentName", "email", "courseCode", "clientDate",
        "submittedAt", "audioPlays", "listeningPoints", "writingPoints", "finalPoints",
        "grade", "status", "writing", "answers", "teacherComments"
    )
    return {key: submission.get(key) for key in keys}


def basic_andres_retake_payload(profile, grades_data, submissions):
    role = grade_user_role(profile, grades_data)
    student = basic_andres_retake_student_allowed(profile, grades_data)
    is_staff = role in ("admin", "teacher")
    is_open = basic_andres_retake_is_open()
    if not is_staff and not isinstance(student, dict):
        return None
    if not is_staff and not is_open:
        return {
            "status": "closed",
            "role": role,
            "isOpen": False,
            "availabilityLabel": BASIC_ANDRES_RETAKE_WINDOW_LABEL,
            "student": basic_integrated_student_identity(student)
        }
    student_id = clean_text(student.get("id"), 40) if isinstance(student, dict) else BASIC_ANDRES_RETAKE_STUDENT_ID
    submitted = submissions.get("submissions", {}).get(student_id)
    exam = basic_andres_retake_exam()
    public_exam = {
        "id": exam["id"],
        "title": exam["title"],
        "totalPoints": exam["totalPoints"],
        "listeningPoints": exam["listeningPoints"],
        "writingPoints": exam["writingPoints"],
        "maxAudioPlays": exam["maxAudioPlays"],
        "availabilityLabel": exam["availabilityLabel"],
        "questions": [basic_integrated_public_question(item) for item in exam["questions"]]
    }
    return {
        "status": "submitted" if submitted else ("open" if is_open else "staff-preview"),
        "role": role,
        "isOpen": is_open,
        "availabilityLabel": BASIC_ANDRES_RETAKE_WINDOW_LABEL,
        "student": basic_integrated_student_identity(student) if isinstance(student, dict) else {"id": BASIC_ANDRES_RETAKE_STUDENT_ID, "fullName": "Andres Felipe Muñoz", "level": "Basic English Course 1"},
        "exam": public_exam,
        "submitted": basic_andres_retake_public_submission(submitted)
    }


def basic_integrated_student_identity(student):
    if not isinstance(student, dict):
        return None
    return {
        "id": clean_text(student.get("id"), 40),
        "fullName": clean_text(student.get("fullName"), 200),
        "level": clean_text(student.get("level"), 120)
    }


def basic_integrated_public_question(question):
    return {
        "id": clean_text(question.get("id"), 80),
        "prompt": clean_text(question.get("prompt"), 500),
        "options": [clean_text(item, 300) for item in question.get("options", [])[:6]],
        "points": clean_exam_number(question.get("points", 2.5))
    }


def basic_integrated_public_exam(bundle):
    exam = bundle.get("exam", {})
    return {
        "id": clean_text(exam.get("id") or "basic-course-1-integrated-task", 80),
        "title": clean_text(exam.get("title") or "BASIC COURSE 1 – INTEGRATED TASK (20%)", 200),
        "totalPoints": clean_exam_number(exam.get("totalPoints", 50)),
        "listeningPoints": clean_exam_number(exam.get("listeningPoints", 25)),
        "writingPoints": clean_exam_number(exam.get("writingPoints", 25)),
        "maxAudioPlays": 3,
        "questions": [basic_integrated_public_question(item) for item in exam.get("questions", []) if isinstance(item, dict)]
    }


def basic_integrated_submission_public(submission):
    if not isinstance(submission, dict):
        return None
    keys = (
        "receiptId", "studentId", "studentName", "email", "courseCode", "clientDate",
        "submittedAt", "audioPlays", "listeningPoints", "writingPoints", "finalPoints",
        "grade", "status", "writing", "rubric", "teacherComments", "gradedAt", "gradedBy"
    )
    return {key: submission.get(key) for key in keys}


def basic_integrated_append_event(submissions, event_type, profile=None, student_id="", detail=None):
    if not isinstance(submissions, dict):
        return
    events = submissions.setdefault("events", [])
    if not isinstance(events, list):
        events = []
        submissions["events"] = events
    actor = normalize_email((profile or {}).get("email"))
    events.append({
        "type": clean_text(event_type, 80),
        "studentId": clean_text(student_id, 40),
        "actor": actor,
        "detail": clean_text(detail, 500),
        "at": now_iso()
    })
    submissions["events"] = events[-500:]


def basic_integrated_event_public(event):
    if not isinstance(event, dict):
        return None
    return {
        "type": clean_text(event.get("type"), 80),
        "studentId": clean_text(event.get("studentId"), 40),
        "actor": clean_text(event.get("actor"), 180),
        "detail": clean_text(event.get("detail"), 500),
        "at": clean_text(event.get("at"), 80)
    }


def basic_integrated_state_payload(profile, grades_data, bundle, submissions):
    role = grade_user_role(profile, grades_data)
    student = matched_student_for_profile(profile, grades_data)
    student_id = clean_text(student.get("id"), 40) if isinstance(student, dict) else ""
    submitted = submissions.get("submissions", {}).get(student_id) if student_id else None
    state = bundle.get("state", {})
    return {
        "role": role,
        "state": state,
        "student": basic_integrated_student_identity(student),
        "submitted": basic_integrated_submission_public(submitted),
        "canTake": basic_integrated_can_take(role, state, student_id),
        "reopenActive": basic_integrated_student_has_reopen(state, student_id)
    }


def basic_integrated_health_payload(grades_data, bundle, submissions):
    state = bundle.get("state", {})
    submission_items = submissions.get("submissions", {})
    if not isinstance(submission_items, dict):
        submission_items = {}
    students = []
    counts = {"total": 0, "submitted": 0, "pendingWriting": 0, "graded": 0, "notSubmitted": 0, "reopenActive": 0}
    for student in grades_data.get("students", []):
        if not isinstance(student, dict):
            continue
        student_id = clean_text(student.get("id"), 40)
        submission = submission_items.get(student_id)
        grade = (student.get("grades") or {}).get("integratedTask20") if isinstance(student.get("grades"), dict) else None
        detail = (student.get("gradeDetails") or {}).get("integratedTask20") if isinstance(student.get("gradeDetails"), dict) else None
        status = "not-submitted"
        if isinstance(submission, dict):
            status = "graded" if submission.get("status") == "graded" else "pending-writing"
        elif isinstance(grade, (int, float)):
            status = "graded"
        reopen_active = basic_integrated_student_has_reopen(state, student_id)
        counts["total"] += 1
        if status == "graded":
            counts["graded"] += 1
            counts["submitted"] += 1
        elif status == "pending-writing":
            counts["pendingWriting"] += 1
            counts["submitted"] += 1
        else:
            counts["notSubmitted"] += 1
        if reopen_active:
            counts["reopenActive"] += 1
        students.append({
            "id": student_id,
            "fullName": clean_text(student.get("fullName"), 200),
            "email": normalize_email(student.get("email")),
            "status": status,
            "grade": grade if isinstance(grade, (int, float)) else None,
            "detail": detail if isinstance(detail, dict) else None,
            "submission": basic_integrated_submission_public(submission) if isinstance(submission, dict) else None,
            "canTake": basic_integrated_can_take("student", state, student_id),
            "reopenActive": reopen_active
        })
    events = [basic_integrated_event_public(item) for item in submissions.get("events", [])[-80:] if isinstance(item, dict)]
    events = [item for item in events if item]
    events.reverse()
    return {
        "state": state,
        "counts": counts,
        "students": students,
        "events": events
    }


def apply_basic_integrated_submission_status_to_gradebook(grades_data, submissions):
    if not isinstance(grades_data, dict) or not isinstance(submissions, dict):
        return False
    changed = False
    submission_items = submissions.get("submissions", {})
    if not isinstance(submission_items, dict):
        return False
    students = grades_data.get("students", [])
    if not isinstance(students, list):
        return False
    for student in students:
        if not isinstance(student, dict):
            continue
        student_id = clean_text(student.get("id"), 40)
        submission = submission_items.get(student_id)
        if not isinstance(submission, dict):
            continue
        grades = student.get("grades", {})
        if isinstance(grades, dict) and isinstance(grades.get("integratedTask20"), (int, float)):
            continue
        details = student.setdefault("gradeDetails", {})
        if not isinstance(details, dict):
            details = {}
            student["gradeDetails"] = details
        next_detail = {
            "evaluationId": "integratedTask20",
            "activityTitle": "BASIC COURSE 1 – INTEGRATED TASK (20%)",
            "status": clean_text(submission.get("status") or "submitted", 80),
            "submittedAt": clean_text(submission.get("submittedAt"), 80),
            "receiptId": clean_text(submission.get("receiptId"), 80),
            "listeningPoints": clean_exam_number(submission.get("listeningPoints")),
            "pendingTeacherReview": submission.get("status") != "graded",
            "weight": 20
        }
        if details.get("integratedTask20") != next_detail:
            details["integratedTask20"] = next_detail
            changed = True
    return changed


def basic_integrated_score(exam, answers):
    if not isinstance(answers, dict):
        answers = {}
    score = 0.0
    details = {}
    for question in exam.get("questions", []):
        if not isinstance(question, dict):
            continue
        question_id = clean_text(question.get("id"), 80)
        try:
            points = float(question.get("points", 2.5))
        except (TypeError, ValueError):
            points = 2.5
        supplied = normalize_answer(answers.get(question_id))
        expected = normalize_answer(question.get("answer"))
        correct = supplied == expected
        if correct:
            score += points
        details[question_id] = {
            "answer": supplied,
            "correct": correct,
            "points": clean_exam_number(points if correct else 0)
        }
    return {"score": clean_exam_number(score), "details": details}


def clean_basic_writing(value):
    return str(value or "").replace("\r\n", "\n").replace("\r", "\n").strip()[:6000]


def basic_word_count(value):
    return len(re.findall(r"\b[\w'-]+\b", value or "", flags=re.UNICODE))


def ensure_basic_integrated_task_evaluation(grades_data):
    evaluations = grades_data.setdefault("evaluations", [])
    if any(isinstance(item, dict) and item.get("id") == "integratedTask20" for item in evaluations):
        return False
    evaluations.append({
        "id": "integratedTask20",
        "title": "BASIC COURSE 1 – INTEGRATED TASK (20%)",
        "weight": 20,
        "type": "Integrated task",
        "description": "Listening and integrated writing assessment. Writing is reviewed with the institutional rubric."
    })
    return True


def clean_basic_rubric(value):
    if not isinstance(value, dict):
        return None
    rubric = {}
    for key in ("content", "composing", "vocabulary", "structure", "mechanics"):
        try:
            score = int(value.get(key))
        except (TypeError, ValueError):
            return None
        if score < 1 or score > 5:
            return None
        rubric[key] = score
    return rubric


class ProgressHandler(BaseHTTPRequestHandler):
    server_version = "JaraLinguaProgress/1.0"

    def log_message(self, fmt, *args):
        print("%s - - [%s] %s" % (self.client_address[0], self.log_date_time_string(), fmt % args))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "https://www.jaralingua.com")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Jaralingua-Auth-Provider")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/health":
            json_response(self, 200, {"ok": True})
            return

        if parsed.path == "/api/basic/unit6-neighborhood-image/file":
            query = urllib.parse.parse_qs(parsed.query)
            image_id = clean_text((query.get("id") or [""])[0], 80)
            image_path, content_type = basic_unit6_image_file_for_id(image_id)
            if not image_id or not image_path or not os.path.exists(image_path):
                json_response(self, 404, {"error": "image_not_found"})
                return
            with open(image_path, "rb") as handle:
                binary_response(self, 200, handle.read(), content_type or "image/png")
            return

        profile = self.require_user()
        if not profile:
            return

        if parsed.path == "/api/progress":
            with data_lock:
                store = read_store()
                record = user_record(store, profile)
                write_store(store)
                json_response(self, 200, {
                    "progress": record.get("progress", {"pages": {}, "lastPage": None}),
                    "activities": record.get("activities", {})
                })
            return

        if parsed.path == "/api/activity":
            query = urllib.parse.parse_qs(parsed.query)
            page_path = (query.get("path") or [""])[0]
            with data_lock:
                store = read_store()
                record = user_record(store, profile)
                write_store(store)
                json_response(self, 200, {
                    "draft": record.get("activities", {}).get(page_path, {"fields": {}, "updatedAt": None})
                })
            return

        if parsed.path == "/api/french7/grades":
            grades_data = read_grades_data(FRENCH7_GRADES_PATH)
            query = urllib.parse.parse_qs(parsed.query)
            json_response(self, 200, grade_payload_for(profile, grades_data, query))
            return

        if parsed.path == "/api/french1/grades":
            with data_lock:
                grades_data = read_grades_data(FRENCH1_GRADES_PATH)
                if ensure_french1_gradebook_structure(grades_data):
                    write_json_file(FRENCH1_GRADES_PATH, grades_data, ".french1-grades-")
                query = urllib.parse.parse_qs(parsed.query)
                json_response(self, 200, grade_payload_for(profile, grades_data, query))
            return

        if parsed.path == "/api/french2/grades":
            with data_lock:
                grades_data = read_grades_data(FRENCH2_GRADES_PATH)
                if ensure_french2_gradebook_structure(grades_data):
                    write_json_file(FRENCH2_GRADES_PATH, grades_data, ".french2-grades-")
                query = urllib.parse.parse_qs(parsed.query)
                json_response(self, 200, grade_payload_for(profile, grades_data, query))
            return

        if parsed.path == "/api/french8/grades":
            with data_lock:
                grades_data = read_grades_data(FRENCH8_GRADES_PATH)
                if ensure_french8_gradebook_structure(grades_data):
                    write_json_file(FRENCH8_GRADES_PATH, grades_data, ".french8-grades-")
                query = urllib.parse.parse_qs(parsed.query)
                json_response(self, 200, grade_payload_for(profile, grades_data, query))
            return

        if parsed.path == "/api/french8/quiz-ville-intelligente/state":
            with data_lock:
                grades_data = read_grades_data(FRENCH8_GRADES_PATH)
                if ensure_french8_gradebook_structure(grades_data):
                    write_json_file(FRENCH8_GRADES_PATH, grades_data, ".french8-grades-")
                bundle = read_french8_quiz_bundle()
                submissions = read_french8_quiz_submissions()
                json_response(self, 200, french8_quiz_state_payload(profile, grades_data, bundle, submissions))
            return

        if parsed.path == "/api/french8/quiz-ville-intelligente":
            with data_lock:
                grades_data = read_grades_data(FRENCH8_GRADES_PATH)
                if ensure_french8_gradebook_structure(grades_data):
                    write_json_file(FRENCH8_GRADES_PATH, grades_data, ".french8-grades-")
                role = grade_user_role(profile, grades_data)
                student = matched_student_for_profile(profile, grades_data)
                bundle = read_french8_quiz_bundle()
                submissions = read_french8_quiz_submissions()
                state = bundle.get("state", {})
                student_id = clean_text(student.get("id"), 40) if isinstance(student, dict) else ""
                submitted = submissions.get("submissions", {}).get(student_id) if student_id else None

                if role not in ("admin", "teacher") and not isinstance(student, dict):
                    json_response(self, 403, {"error": "not_authorized"})
                    return
                if submitted:
                    json_response(self, 200, {
                        "status": "submitted",
                        "state": state,
                        "result": french8_quiz_submission_public(submitted)
                    })
                    return
                if role not in ("admin", "teacher") and state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "quiz_closed", "state": state})
                    return

                json_response(self, 200, {
                    "status": "open" if state.get("isOpen") is True else "staff-preview",
                    "role": role,
                    "state": state,
                    "student": student_public_view(student) if isinstance(student, dict) else None,
                    "exam": final_exam_public_payload(bundle)
                })
            return

        if parsed.path == "/api/french8/quiz-ville-intelligente/audio":
            with data_lock:
                grades_data = read_grades_data(FRENCH8_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                student = matched_student_for_profile(profile, grades_data)
                bundle = read_french8_quiz_bundle()
                state = bundle.get("state", {})
                if role not in ("admin", "teacher") and not isinstance(student, dict):
                    json_response(self, 403, {"error": "not_authorized"})
                    return
                if role not in ("admin", "teacher") and state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "quiz_closed"})
                    return
                audio_path = FRENCH8_QUIZ_AUDIO_PATH
                if not os.path.exists(audio_path):
                    audio_path = BUNDLED_FRENCH8_QUIZ_AUDIO_PATH
            if not os.path.exists(audio_path):
                json_response(self, 404, {"error": "audio_not_found"})
                return
            with open(audio_path, "rb") as handle:
                binary_response(self, 200, handle.read(), "audio/mpeg")
            return

        if parsed.path == "/api/french8/pronunciation-audio":
            query = urllib.parse.parse_qs(parsed.query)
            student_id = clean_text((query.get("studentId") or [""])[0], 40)
            evaluation_id = clean_text((query.get("evaluationId") or [""])[0], 80)
            with data_lock:
                grades_data = read_grades_data(FRENCH8_GRADES_PATH)
                students = grades_data.get("students", [])
                target = next(
                    (
                        item for item in students
                        if isinstance(item, dict) and clean_text(item.get("id"), 40) == student_id
                    ),
                    None
                )
                role = grade_user_role(profile, grades_data)
                current_student = matched_student_for_profile(profile, grades_data)
                is_self = isinstance(current_student, dict) and clean_text(current_student.get("id"), 40) == student_id
                if not isinstance(target, dict) or (role not in ("admin", "teacher") and not is_self):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                details = target.get("gradeDetails", {}).get(evaluation_id) if isinstance(target.get("gradeDetails"), dict) else None
                audio_ref = details.get("audio") if isinstance(details, dict) else None
                filename = safe_filename_token(audio_ref.get("file"), 160) if isinstance(audio_ref, dict) else ""
                content_type = audio_ref.get("contentType", "audio/webm") if isinstance(audio_ref, dict) else "audio/webm"
            path = os.path.abspath(os.path.join(FRENCH8_PRONUNCIATION_AUDIO_DIR, filename))
            root = os.path.abspath(FRENCH8_PRONUNCIATION_AUDIO_DIR)
            if not filename or not path.startswith(root + os.sep) or not os.path.exists(path):
                json_response(self, 404, {"error": "audio_not_found"})
                return
            with open(path, "rb") as handle:
                binary_response(self, 200, handle.read(), content_type)
            return

        if parsed.path == "/api/french7/final-exam/state":
            with data_lock:
                grades_data = read_grades_data(FRENCH7_GRADES_PATH)
                bundle = read_final_exam_bundle()
                submissions = read_final_exam_submissions()
                json_response(self, 200, final_exam_state_payload(profile, grades_data, bundle, submissions))
            return

        if parsed.path == "/api/french7/final-exam":
            with data_lock:
                grades_data = read_grades_data(FRENCH7_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                student = final_exam_allowed_student(profile, grades_data)
                bundle = read_final_exam_bundle()
                submissions = read_final_exam_submissions()
                state = bundle.get("state", {})
                student_id = clean_text(student.get("id"), 40) if isinstance(student, dict) else ""
                submitted = submissions.get("submissions", {}).get(student_id) if student_id else None

                if role not in ("admin", "teacher") and not student:
                    json_response(self, 403, {"error": "not_authorized"})
                    return
                if submitted:
                    json_response(self, 200, {"status": "submitted", "state": state, "result": submitted})
                    return
                if role not in ("admin", "teacher") and state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "exam_closed", "state": state})
                    return

                json_response(self, 200, {
                    "status": "open" if state.get("isOpen") is True else "admin-preview",
                    "role": role,
                    "state": state,
                    "student": student_public_view(student) if isinstance(student, dict) else None,
                    "exam": final_exam_public_payload(bundle)
                })
            return

        if parsed.path == "/api/french7/final-exam/audio":
            with data_lock:
                grades_data = read_grades_data(FRENCH7_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                student = final_exam_allowed_student(profile, grades_data)
                bundle = read_final_exam_bundle()
                state = bundle.get("state", {})
                if role not in ("admin", "teacher") and not student:
                    json_response(self, 403, {"error": "not_authorized"})
                    return
                if role not in ("admin", "teacher") and state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "exam_closed"})
                    return
                audio_path = FRENCH7_FINAL_EXAM_AUDIO_PATH
                if not os.path.exists(audio_path):
                    audio_path = BUNDLED_FRENCH7_FINAL_EXAM_AUDIO_PATH
            if not os.path.exists(audio_path):
                json_response(self, 404, {"error": "audio_not_found"})
                return
            with open(audio_path, "rb") as handle:
                binary_response(self, 200, handle.read(), "audio/mpeg")
            return

        if parsed.path == "/api/french1/final-exam/state":
            with data_lock:
                grades_data = read_grades_data(FRENCH1_GRADES_PATH)
                if ensure_french1_gradebook_structure(grades_data):
                    write_json_file(FRENCH1_GRADES_PATH, grades_data, ".french1-grades-")
                bundle = read_french1_final_exam_bundle()
                submissions = read_french1_final_exam_submissions()
                raw_payload = final_exam_state_payload(profile, grades_data, bundle, submissions)
                raw_payload["submitted"] = french1_final_exam_submission_public(raw_payload.get("submitted"))
                json_response(self, 200, raw_payload)
            return

        if parsed.path == "/api/french1/final-exam":
            with data_lock:
                grades_data = read_grades_data(FRENCH1_GRADES_PATH)
                if ensure_french1_gradebook_structure(grades_data):
                    write_json_file(FRENCH1_GRADES_PATH, grades_data, ".french1-grades-")
                role = grade_user_role(profile, grades_data)
                student = matched_student_for_profile(profile, grades_data)
                bundle = read_french1_final_exam_bundle()
                submissions = read_french1_final_exam_submissions()
                state = bundle.get("state", {})
                student_id = clean_text(student.get("id"), 40) if isinstance(student, dict) else ""
                submitted = submissions.get("submissions", {}).get(student_id) if student_id else None

                if role not in ("admin", "teacher") and not isinstance(student, dict):
                    json_response(self, 403, {"error": "not_authorized"})
                    return
                if submitted:
                    json_response(self, 200, {"status": "submitted", "state": state, "result": french1_final_exam_submission_public(submitted)})
                    return
                if role not in ("admin", "teacher") and state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "exam_closed", "state": state})
                    return

                json_response(self, 200, {
                    "status": "open" if state.get("isOpen") is True else "staff-preview",
                    "role": role,
                    "state": state,
                    "student": student_public_view(student) if isinstance(student, dict) else None,
                    "exam": final_exam_public_payload(bundle)
                })
            return

        if parsed.path == "/api/french1/final-exam/audio":
            with data_lock:
                grades_data = read_grades_data(FRENCH1_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                student = matched_student_for_profile(profile, grades_data)
                bundle = read_french1_final_exam_bundle()
                state = bundle.get("state", {})
                if role not in ("admin", "teacher") and not isinstance(student, dict):
                    json_response(self, 403, {"error": "not_authorized"})
                    return
                if role not in ("admin", "teacher") and state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "exam_closed"})
                    return
                audio_path = FRENCH1_FINAL_EXAM_AUDIO_PATH
                if not os.path.exists(audio_path):
                    audio_path = BUNDLED_FRENCH1_FINAL_EXAM_AUDIO_PATH
            if not os.path.exists(audio_path):
                json_response(self, 404, {"error": "audio_not_found"})
                return
            with open(audio_path, "rb") as handle:
                binary_response(self, 200, handle.read(), "audio/mpeg")
            return

        if parsed.path == "/api/french1/final-exam/transcript":
            with data_lock:
                grades_data = read_grades_data(FRENCH1_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                if role not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                bundle = read_french1_final_exam_bundle()
                transcript = clean_text(bundle.get("exam", {}).get("transcript"), 5000)
                json_response(self, 200, {"transcript": transcript})
            return

        if parsed.path == "/api/french2/final-exam/state":
            with data_lock:
                grades_data = read_grades_data(FRENCH2_GRADES_PATH)
                bundle = read_french2_final_exam_bundle()
                submissions = read_french2_final_exam_submissions()
                raw_payload = final_exam_state_payload(profile, grades_data, bundle, submissions)
                raw_payload["submitted"] = french1_final_exam_submission_public(raw_payload.get("submitted"))
                json_response(self, 200, raw_payload)
            return

        if parsed.path == "/api/french2/final-exam":
            with data_lock:
                grades_data = read_grades_data(FRENCH2_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                student = matched_student_for_profile(profile, grades_data)
                bundle = read_french2_final_exam_bundle()
                submissions = read_french2_final_exam_submissions()
                state = bundle.get("state", {})
                student_id = clean_text(student.get("id"), 40) if isinstance(student, dict) else ""
                submitted = submissions.get("submissions", {}).get(student_id) if student_id else None

                if role not in ("admin", "teacher") and not isinstance(student, dict):
                    json_response(self, 403, {"error": "not_authorized"})
                    return
                if submitted:
                    json_response(self, 200, {"status": "submitted", "state": state, "result": french1_final_exam_submission_public(submitted)})
                    return
                if role not in ("admin", "teacher") and state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "exam_closed", "state": state})
                    return

                json_response(self, 200, {
                    "status": "open" if state.get("isOpen") is True else "staff-preview",
                    "role": role,
                    "state": state,
                    "student": student_public_view(student) if isinstance(student, dict) else None,
                    "exam": final_exam_public_payload(bundle)
                })
            return

        if parsed.path == "/api/french2/final-exam/audio":
            with data_lock:
                grades_data = read_grades_data(FRENCH2_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                student = matched_student_for_profile(profile, grades_data)
                bundle = read_french2_final_exam_bundle()
                state = bundle.get("state", {})
                if role not in ("admin", "teacher") and not isinstance(student, dict):
                    json_response(self, 403, {"error": "not_authorized"})
                    return
                if role not in ("admin", "teacher") and state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "exam_closed"})
                    return
                audio_path = FRENCH2_FINAL_EXAM_AUDIO_PATH
                if not os.path.exists(audio_path):
                    audio_path = BUNDLED_FRENCH2_FINAL_EXAM_AUDIO_PATH
            if not os.path.exists(audio_path):
                json_response(self, 404, {"error": "audio_not_found"})
                return
            with open(audio_path, "rb") as handle:
                binary_response(self, 200, handle.read(), "audio/mpeg")
            return

        if parsed.path == "/api/french2/final-exam/transcript":
            with data_lock:
                grades_data = read_grades_data(FRENCH2_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                if role not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                bundle = read_french2_final_exam_bundle()
                transcript = clean_text(bundle.get("exam", {}).get("transcript"), 5000)
                json_response(self, 200, {"transcript": transcript})
            return


        if parsed.path == "/api/basic/integrated-task/state":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                bundle = read_basic_integrated_task_bundle()
                submissions = read_basic_integrated_task_submissions()
                json_response(self, 200, basic_integrated_state_payload(profile, grades_data, bundle, submissions))
            return

        if parsed.path == "/api/basic/integrated-task":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                student = matched_student_for_profile(profile, grades_data)
                bundle = read_basic_integrated_task_bundle()
                submissions = read_basic_integrated_task_submissions()
                state = bundle.get("state", {})
                student_id = clean_text(student.get("id"), 40) if isinstance(student, dict) else ""
                submitted = submissions.get("submissions", {}).get(student_id) if student_id else None
                if role not in ("admin", "teacher") and not isinstance(student, dict):
                    json_response(self, 403, {"error": "not_authorized"})
                    return
                if submitted:
                    json_response(self, 200, {"status": "submitted", "state": state, "result": basic_integrated_submission_public(submitted)})
                    return
                if not basic_integrated_can_take(role, state, student_id):
                    json_response(self, 403, {"error": "exam_closed", "state": state})
                    return
                json_response(self, 200, {
                    "status": "open" if state.get("isOpen") is True else ("reopen-window" if basic_integrated_student_has_reopen(state, student_id) else "staff-preview"),
                    "role": role,
                    "state": state,
                    "student": basic_integrated_student_identity(student),
                    "exam": basic_integrated_public_exam(bundle)
                })
            return

        if parsed.path == "/api/basic/integrated-task/audio":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                student = matched_student_for_profile(profile, grades_data)
                bundle = read_basic_integrated_task_bundle()
                state = bundle.get("state", {})
                if role not in ("admin", "teacher") and not isinstance(student, dict):
                    json_response(self, 403, {"error": "not_authorized"})
                    return
                student_id = clean_text(student.get("id"), 40) if isinstance(student, dict) else ""
                if not basic_integrated_can_take(role, state, student_id):
                    json_response(self, 403, {"error": "exam_closed"})
                    return
                audio_path = BASIC_INTEGRATED_TASK_AUDIO_PATH
                if not os.path.exists(audio_path):
                    audio_path = BUNDLED_BASIC_INTEGRATED_TASK_AUDIO_PATH
            if not os.path.exists(audio_path):
                json_response(self, 404, {"error": "audio_not_found"})
                return
            with open(audio_path, "rb") as handle:
                binary_response(self, 200, handle.read(), "audio/mpeg")
            return

        if parsed.path == "/api/basic/integrated-task-andres-munoz-retake":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                submissions = read_basic_andres_retake_submissions()
                payload = basic_andres_retake_payload(profile, grades_data, submissions)
                if payload is None:
                    json_response(self, 403, {"error": "not_authorized"})
                    return
                json_response(self, 200, payload)
            return

        if parsed.path == "/api/basic/integrated-task-andres-munoz-retake/audio":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                student = basic_andres_retake_student_allowed(profile, grades_data)
                is_staff = role in ("admin", "teacher")
                if not is_staff and not isinstance(student, dict):
                    json_response(self, 403, {"error": "not_authorized"})
                    return
                if not is_staff and not basic_andres_retake_is_open():
                    json_response(self, 403, {"error": "exam_closed", "availabilityLabel": BASIC_ANDRES_RETAKE_WINDOW_LABEL})
                    return
                audio_path = BASIC_ANDRES_RETAKE_AUDIO_PATH
                if not os.path.exists(audio_path):
                    audio_path = BUNDLED_BASIC_ANDRES_RETAKE_AUDIO_PATH
            if not os.path.exists(audio_path):
                json_response(self, 404, {"error": "audio_not_found"})
                return
            with open(audio_path, "rb") as handle:
                binary_response(self, 200, handle.read(), "audio/mpeg")
            return

        if parsed.path == "/api/basic/integrated-task-andres-munoz-retake/submissions":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                if role not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                submissions = read_basic_andres_retake_submissions().get("submissions", {})
                items = [basic_andres_retake_public_submission(item) for item in submissions.values() if isinstance(item, dict)]
                json_response(self, 200, {"role": role, "submissions": items})
            return

        if parsed.path == "/api/basic/integrated-task/submissions":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                if role not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                if ensure_basic_gradebook_structure(grades_data):
                    write_json_file(BASIC_ENGLISH_GRADES_PATH, grades_data, ".basic-grades-")
                bundle = read_basic_integrated_task_bundle()
                submissions_data = read_basic_integrated_task_submissions()
                if apply_basic_integrated_submission_status_to_gradebook(grades_data, submissions_data):
                    write_json_file(BASIC_ENGLISH_GRADES_PATH, grades_data, ".basic-grades-")
                submissions = submissions_data.get("submissions", {})
                items = [basic_integrated_submission_public(item) for item in submissions.values() if isinstance(item, dict)]
                items.sort(key=lambda item: item.get("submittedAt") or "", reverse=True)
                health = basic_integrated_health_payload(grades_data, bundle, submissions_data)
                json_response(self, 200, {"role": role, "submissions": items, "health": health})
            return

        if parsed.path == "/api/basic/grades":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                gradebook_changed = ensure_basic_gradebook_structure(grades_data)
                submissions = read_basic_integrated_task_submissions()
                if apply_basic_integrated_submission_status_to_gradebook(grades_data, submissions):
                    gradebook_changed = True
                if gradebook_changed:
                    write_json_file(BASIC_ENGLISH_GRADES_PATH, grades_data, ".basic-grades-")
                query = urllib.parse.parse_qs(parsed.query)
                json_response(self, 200, grade_payload_for(profile, grades_data, query))
            return

        if parsed.path == "/api/basic/unit6-neighborhood-gallery":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                if ensure_basic_gradebook_structure(grades_data):
                    write_json_file(BASIC_ENGLISH_GRADES_PATH, grades_data, ".basic-grades-")
                gallery = read_basic_unit6_neighborhood_gallery()
                role = grade_user_role(profile, grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if role not in ("admin", "teacher") and not isinstance(student, dict):
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                json_response(self, 200, basic_unit6_neighborhood_gallery_payload(profile, grades_data, gallery))
            return

        if parsed.path == "/api/intermediate/grades":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                if ensure_intermediate_gradebook_structure(grades_data):
                    write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                query = urllib.parse.parse_qs(parsed.query)
                json_response(self, 200, grade_payload_for(profile, grades_data, query))
            return

        if parsed.path == "/api/intermediate/pronunciation-audio":
            query = urllib.parse.parse_qs(parsed.query)
            student_id = clean_text((query.get("studentId") or [""])[0], 40)
            evaluation_id = clean_text((query.get("evaluationId") or [""])[0], 80)
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                students = grades_data.get("students", [])
                target = next(
                    (
                        item for item in students
                        if isinstance(item, dict) and clean_text(item.get("id"), 40) == student_id
                    ),
                    None
                )
                role = grade_user_role(profile, grades_data)
                current_student = matched_student_for_profile(profile, grades_data)
                is_self = isinstance(current_student, dict) and clean_text(current_student.get("id"), 40) == student_id
                if not isinstance(target, dict) or (role not in ("admin", "teacher") and not is_self):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                details = target.get("gradeDetails", {}).get(evaluation_id) if isinstance(target.get("gradeDetails"), dict) else None
                audio_ref = details.get("audio") if isinstance(details, dict) else None
                filename = safe_filename_token(audio_ref.get("file"), 160) if isinstance(audio_ref, dict) else ""
                content_type = audio_ref.get("contentType", "audio/webm") if isinstance(audio_ref, dict) else "audio/webm"
            path = os.path.abspath(os.path.join(INTERMEDIATE_PRONUNCIATION_AUDIO_DIR, filename))
            root = os.path.abspath(INTERMEDIATE_PRONUNCIATION_AUDIO_DIR)
            if not filename or not path.startswith(root + os.sep) or not os.path.exists(path):
                json_response(self, 404, {"error": "audio_not_found"})
                return
            with open(path, "rb") as handle:
                binary_response(self, 200, handle.read(), content_type)
            return

        if parsed.path == "/api/intermediate/unit4-expression-wall/state":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                wall = read_intermediate_unit4_expression_wall()
                json_response(self, 200, intermediate_unit4_expression_wall_payload(profile, grades_data, wall))
            return

        if parsed.path == "/api/intermediate/unit5-market-basket/live":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                live = read_intermediate_unit5_market_basket_live()
                json_response(self, 200, public_intermediate_unit5_market_basket_live(profile, grades_data, live))
            return

        if parsed.path == "/api/intermediate/unit4-sunday-dinner/transcript":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                if role not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "teacher_only"})
                    return
                json_response(self, 200, {
                    "title": "Sunday Dinner Negotiation",
                    "transcript": INTERMEDIATE_UNIT4_LISTENING_TRANSCRIPT
                })
            return

        if parsed.path == "/api/intermediate/unit5-market-dinner/transcript":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                if role not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "teacher_only"})
                    return
                json_response(self, 200, {
                    "title": "Market Dinner Plan",
                    "transcript": INTERMEDIATE_UNIT5_LISTENING_TRANSCRIPT
                })
            return

        json_response(self, 404, {"error": "not_found"})

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        local_login_target = gradebook_path_for_login(parsed.path)
        if local_login_target:
            payload = self.read_json_body()
            if payload is None:
                return
            level_key, level_label, grades_path = local_login_target
            with data_lock:
                grades_data = read_grades_data(grades_path)
            try:
                json_response(self, 200, local_gradebook_login(payload, grades_data, level_key, level_label))
            except ValueError as error:
                json_response(self, 401, {"error": str(error)})
            return

        profile = self.require_user()
        if not profile:
            return
        payload = self.read_json_body()
        if payload is None:
            return
        if parsed.path.startswith("/api/intermediate/") and isinstance(payload, dict):
            profile = dict(profile)
            profile["_studentIdClaim"] = payload.get("studentIdClaim") or payload.get("studentId") or payload.get("idClaim") or ""

        if parsed.path == "/api/intermediate/unit4-expression-wall/activate":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                if role not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "teacher_only"})
                    return
                expression_id = clean_text(payload.get("expressionId"), 80)
                wall = read_intermediate_unit4_expression_wall()
                timestamp = now_iso()
                if expression_id:
                    expression = intermediate_unit4_expression_by_id(expression_id)
                    if not expression:
                        json_response(self, 400, {"error": "invalid_expression"})
                        return
                    wall["activeExpressionId"] = expression_id
                    wall["openedAt"] = timestamp
                    wall["openedBy"] = profile.get("email", "")
                else:
                    wall["activeExpressionId"] = None
                    wall["openedAt"] = None
                    wall["openedBy"] = None
                wall["updatedAt"] = timestamp
                write_intermediate_unit4_expression_wall(wall)
                json_response(self, 200, intermediate_unit4_expression_wall_payload(profile, grades_data, wall))
            return

        if parsed.path == "/api/intermediate/unit4-expression-wall/submit":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                wall = read_intermediate_unit4_expression_wall()
                active_expression_id = wall.get("activeExpressionId")
                expression_id = clean_text(payload.get("expressionId"), 80)
                if not active_expression_id:
                    json_response(self, 403, {"error": "no_active_expression"})
                    return
                if expression_id != active_expression_id:
                    json_response(self, 409, {"error": "expression_not_active", "activeExpressionId": active_expression_id})
                    return
                expression = intermediate_unit4_expression_by_id(active_expression_id)
                if not expression:
                    json_response(self, 400, {"error": "invalid_expression"})
                    return
                sentence = clean_text(payload.get("sentence"), 280)
                word_count = basic_word_count(sentence)
                if word_count < 6:
                    json_response(self, 400, {"error": "sentence_too_short", "wordCount": word_count})
                    return
                if word_count > 35:
                    json_response(self, 400, {"error": "sentence_too_long", "wordCount": word_count})
                    return
                if not sentence_matches_intermediate_expression(sentence, expression):
                    json_response(self, 400, {"error": "expression_missing", "expression": expression.get("label", "")})
                    return
                submitted_at = now_iso()
                submissions = wall.setdefault("submissions", [])
                if not isinstance(submissions, list):
                    submissions = []
                    wall["submissions"] = submissions
                submissions.append({
                    "id": secrets.token_hex(8),
                    "expressionId": expression.get("id", ""),
                    "expressionLabel": expression.get("label", ""),
                    "sentence": sentence,
                    "wordCount": word_count,
                    "studentId": student.get("id", ""),
                    "studentName": student.get("fullName") or profile.get("name") or "Student",
                    "studentEmail": normalize_email(student.get("email") or profile.get("email")),
                    "submittedAt": submitted_at
                })
                wall["submissions"] = submissions[-500:]
                wall["updatedAt"] = submitted_at
                write_intermediate_unit4_expression_wall(wall)
                json_response(self, 200, intermediate_unit4_expression_wall_payload(profile, grades_data, wall))
            return

        if parsed.path == "/api/intermediate/unit5-market-basket/launch":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                if role not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "teacher_only"})
                    return
                live = read_intermediate_unit5_market_basket_live()
                timestamp = now_iso()
                live["isOpen"] = bool(payload.get("isOpen", True))
                if payload.get("reset"):
                    live["students"] = {}
                live["launchedAt"] = timestamp if live["isOpen"] else live.get("launchedAt")
                live["launchedBy"] = profile.get("email", "") if live["isOpen"] else live.get("launchedBy")
                live["updatedAt"] = timestamp
                write_intermediate_unit5_market_basket_live(live)
                json_response(self, 200, public_intermediate_unit5_market_basket_live(profile, grades_data, live))
            return

        if parsed.path == "/api/intermediate/unit5-market-basket/progress":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                live = read_intermediate_unit5_market_basket_live()
                timestamp = now_iso()
                stage = clean_text(payload.get("stage"), 24)
                if stage not in {"Sort", "Measure", "Build", "Send"}:
                    stage = "Sort"
                student_id = clean_text(student.get("id"), 40)
                try:
                    sorted_count = max(0, min(12, int(payload.get("sorted", 0))))
                except (TypeError, ValueError):
                    sorted_count = 0
                try:
                    measured_count = max(0, min(8, int(payload.get("measured", 0))))
                except (TypeError, ValueError):
                    measured_count = 0
                try:
                    score_value = int(payload.get("score")) if payload.get("score") is not None else None
                except (TypeError, ValueError):
                    score_value = None
                live.setdefault("students", {})[student_id] = {
                    "studentName": clean_text(student.get("fullName"), 160) or "Student",
                    "email": clean_text(student.get("email"), 180),
                    "team": clean_intermediate_unit5_team(payload.get("team")),
                    "stage": stage,
                    "sorted": sorted_count,
                    "measured": measured_count,
                    "score": score_value,
                    "checklistReady": bool(payload.get("checklistReady")),
                    "submitted": bool(payload.get("submitted")),
                    "updatedAt": timestamp
                }
                live["updatedAt"] = timestamp
                write_intermediate_unit5_market_basket_live(live)
                json_response(self, 200, public_intermediate_unit5_market_basket_live(profile, grades_data, live))
            return

        if parsed.path == "/api/intermediate/unit4-pronunciation/submit":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                changed = ensure_intermediate_gradebook_structure(grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                try:
                    score100, grade = intermediate_pronunciation_grade_from_payload(payload)
                except ValueError as error:
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 400, {"error": str(error)})
                    return
                audio_ref = save_intermediate_pronunciation_audio(student, INTERMEDIATE_UNIT4_PRONUNCIATION_ID, payload)
                if not audio_ref:
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 400, {"error": "missing_audio"})
                    return
                previous = student.get("gradeDetails", {}).get(INTERMEDIATE_UNIT4_PRONUNCIATION_ID) if isinstance(student.get("gradeDetails"), dict) else None
                if isinstance(previous, dict) and isinstance(previous.get("audio"), dict):
                    remove_intermediate_pronunciation_audio(previous.get("audio"))
                try:
                    attempt_count = int(previous.get("attemptCount", 0)) + 1 if isinstance(previous, dict) else 1
                except (TypeError, ValueError):
                    attempt_count = 1
                details = payload.get("details") if isinstance(payload.get("details"), dict) else {}
                submitted_at = now_iso()
                student.setdefault("grades", {})[INTERMEDIATE_UNIT4_PRONUNCIATION_ID] = grade
                if not isinstance(student.get("gradeDetails"), dict):
                    student["gradeDetails"] = {}
                student["gradeDetails"][INTERMEDIATE_UNIT4_PRONUNCIATION_ID] = {
                    "submittedAt": submitted_at,
                    "score100": score100,
                    "grade": grade,
                    "overall": clean_score_metric(details.get("overall")),
                    "accuracy": clean_score_metric(details.get("accuracy")),
                    "completeness": clean_score_metric(details.get("completeness")),
                    "fluency": clean_score_metric(details.get("fluency")),
                    "wpm": clean_score_metric(details.get("wpm"), 0, 300),
                    "stageLabel": clean_text(details.get("stageLabel"), 120),
                    "transcript": clean_text(details.get("transcript"), 3000),
                    "referenceText": clean_text(details.get("referenceText"), 3000),
                    "missedWords": clean_text_list(details.get("missedWords"), 30, 80),
                    "audio": audio_ref,
                    "attemptCount": attempt_count,
                    "status": "submitted",
                    "weight": 0,
                    "doesNotAffectAverage": True,
                    "followUpOnly": True,
                    "activity": "Family Stories Pronunciation",
                    "activityType": "Pronunciation follow-up"
                }
                write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": INTERMEDIATE_UNIT4_PRONUNCIATION_ID,
                    "score100": score100,
                    "grade": grade,
                    "submittedAt": submitted_at,
                    "attemptCount": attempt_count,
                    "followUpOnly": True,
                    "weight": 0
                })
            return

        if parsed.path == "/api/intermediate/unit5-pronunciation/submit":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                changed = ensure_intermediate_gradebook_structure(grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                try:
                    score100, grade = intermediate_pronunciation_grade_from_payload(payload)
                except ValueError as error:
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 400, {"error": str(error)})
                    return
                audio_ref = save_intermediate_pronunciation_audio(student, INTERMEDIATE_UNIT5_PRONUNCIATION_ID, payload)
                if not audio_ref:
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 400, {"error": "missing_audio"})
                    return
                previous = student.get("gradeDetails", {}).get(INTERMEDIATE_UNIT5_PRONUNCIATION_ID) if isinstance(student.get("gradeDetails"), dict) else None
                if isinstance(previous, dict) and isinstance(previous.get("audio"), dict):
                    remove_intermediate_pronunciation_audio(previous.get("audio"))
                try:
                    attempt_count = int(previous.get("attemptCount", 0)) + 1 if isinstance(previous, dict) else 1
                except (TypeError, ValueError):
                    attempt_count = 1
                details = payload.get("details") if isinstance(payload.get("details"), dict) else {}
                submitted_at = now_iso()
                student.setdefault("grades", {})[INTERMEDIATE_UNIT5_PRONUNCIATION_ID] = grade
                if not isinstance(student.get("gradeDetails"), dict):
                    student["gradeDetails"] = {}
                student["gradeDetails"][INTERMEDIATE_UNIT5_PRONUNCIATION_ID] = {
                    "submittedAt": submitted_at,
                    "score100": score100,
                    "grade": grade,
                    "overall": clean_score_metric(details.get("overall")),
                    "accuracy": clean_score_metric(details.get("accuracy")),
                    "completeness": clean_score_metric(details.get("completeness")),
                    "fluency": clean_score_metric(details.get("fluency")),
                    "wpm": clean_score_metric(details.get("wpm"), 0, 300),
                    "stageLabel": clean_text(details.get("stageLabel"), 120),
                    "transcript": clean_text(details.get("transcript"), 3000),
                    "referenceText": clean_text(details.get("referenceText"), 3000),
                    "missedWords": clean_text_list(details.get("missedWords"), 30, 80),
                    "audio": audio_ref,
                    "attemptCount": attempt_count,
                    "status": "submitted",
                    "weight": 0,
                    "doesNotAffectAverage": True,
                    "followUpOnly": True,
                    "activity": "Food Quantities Pronunciation",
                    "activityType": "Pronunciation follow-up"
                }
                write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": INTERMEDIATE_UNIT5_PRONUNCIATION_ID,
                    "score100": score100,
                    "grade": grade,
                    "submittedAt": submitted_at,
                    "attemptCount": attempt_count,
                    "followUpOnly": True,
                    "weight": 0
                })
            return

        if parsed.path == "/api/intermediate/unit2-timeline/submit":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                changed = ensure_intermediate_gradebook_structure(grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                try:
                    final_script, word_count = clean_intermediate_text_followup(payload, "finalScript", 60, 240)
                except ValueError as error:
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 400, {"error": str(error), "wordCount": simple_word_count(payload.get("finalScript"))})
                    return
                events = clean_text_list(payload.get("events"), 8, 220)
                questions = clean_text_list(payload.get("followUpQuestions"), 6, 160)
                submitted_at, attempt_count = save_intermediate_text_followup(student, INTERMEDIATE_UNIT2_TIMELINE_ID, {
                    "activity": "Timeline Catch-Up Writing",
                    "activityType": "Writing follow-up",
                    "response": final_script,
                    "wordCount": word_count,
                    "events": events,
                    "followUpQuestions": questions
                })
                write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": INTERMEDIATE_UNIT2_TIMELINE_ID,
                    "wordCount": word_count,
                    "submittedAt": submitted_at,
                    "attemptCount": attempt_count,
                    "weight": 0
                })
            return

        if parsed.path == "/api/intermediate/unit2-goal-support/submit":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                changed = ensure_intermediate_gradebook_structure(grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                try:
                    response, word_count = clean_intermediate_text_followup(payload, "response", 70, 260)
                except ValueError as error:
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 400, {"error": str(error), "wordCount": simple_word_count(payload.get("response"))})
                    return
                submitted_at, attempt_count = save_intermediate_text_followup(student, INTERMEDIATE_UNIT2_GOAL_SUPPORT_ID, {
                    "activity": "Goal Support Interview",
                    "activityType": "Interview follow-up",
                    "response": response,
                    "wordCount": word_count,
                    "partnerName": clean_text(payload.get("partnerName"), 100),
                    "myGoal": clean_text(payload.get("myGoal"), 260),
                    "partnerGoal": clean_text(payload.get("partnerGoal"), 260),
                    "supportAction": clean_text(payload.get("supportAction"), 260)
                })
                write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": INTERMEDIATE_UNIT2_GOAL_SUPPORT_ID,
                    "wordCount": word_count,
                    "submittedAt": submitted_at,
                    "attemptCount": attempt_count,
                    "weight": 0
                })
            return

        if parsed.path == "/api/intermediate/unit2-letter-never-sent/submit":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                changed = ensure_intermediate_gradebook_structure(grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                try:
                    result = score_intermediate_unit2_reading(payload)
                except ValueError as error:
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 400, {"error": str(error)})
                    return
                submitted_at = now_iso()
                previous = student.get("gradeDetails", {}).get(INTERMEDIATE_UNIT2_READING_ID) if isinstance(student.get("gradeDetails"), dict) else None
                try:
                    attempt_count = int(previous.get("attemptCount", 0)) + 1 if isinstance(previous, dict) else 1
                except (TypeError, ValueError):
                    attempt_count = 1
                student.setdefault("grades", {})[INTERMEDIATE_UNIT2_READING_ID] = result["grade"]
                if not isinstance(student.get("gradeDetails"), dict):
                    student["gradeDetails"] = {}
                student["gradeDetails"][INTERMEDIATE_UNIT2_READING_ID] = {
                    "submittedAt": submitted_at,
                    "score": result["score"],
                    "total": result["total"],
                    "grade": result["grade"],
                    "incorrectQuestions": result["incorrect"],
                    "answers": result["answers"],
                    "attemptCount": attempt_count,
                    "status": "submitted",
                    "weight": 0,
                    "doesNotAffectAverage": True,
                    "followUpOnly": True,
                    "activity": "The Letter I Never Sent",
                    "activityType": "Reading follow-up"
                }
                write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": INTERMEDIATE_UNIT2_READING_ID,
                    "score": result["score"],
                    "total": result["total"],
                    "grade": result["grade"],
                    "incorrectQuestions": result["incorrect"],
                    "submittedAt": submitted_at,
                    "attemptCount": attempt_count,
                    "weight": 0
                })
            return

        if parsed.path == "/api/intermediate/unit2-catching-up/submit":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                changed = ensure_intermediate_gradebook_structure(grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                try:
                    result = score_intermediate_unit2_catching_up(payload)
                except ValueError as error:
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 400, {"error": str(error)})
                    return
                submitted_at = now_iso()
                previous = student.get("gradeDetails", {}).get(INTERMEDIATE_UNIT2_CATCHING_UP_ID) if isinstance(student.get("gradeDetails"), dict) else None
                try:
                    attempt_count = int(previous.get("attemptCount", 0)) + 1 if isinstance(previous, dict) else 1
                except (TypeError, ValueError):
                    attempt_count = 1
                student.setdefault("grades", {})[INTERMEDIATE_UNIT2_CATCHING_UP_ID] = result["grade"]
                if not isinstance(student.get("gradeDetails"), dict):
                    student["gradeDetails"] = {}
                student["gradeDetails"][INTERMEDIATE_UNIT2_CATCHING_UP_ID] = {
                    "submittedAt": submitted_at,
                    "score": result["score"],
                    "total": result["total"],
                    "grade": result["grade"],
                    "incorrectQuestions": result["incorrect"],
                    "answers": result["answers"],
                    "attemptCount": attempt_count,
                    "status": "submitted",
                    "weight": 0,
                    "doesNotAffectAverage": True,
                    "followUpOnly": True,
                    "activity": "Catching Up After Years",
                    "activityType": "Listening follow-up"
                }
                write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": INTERMEDIATE_UNIT2_CATCHING_UP_ID,
                    "score": result["score"],
                    "total": result["total"],
                    "grade": result["grade"],
                    "incorrectQuestions": result["incorrect"],
                    "submittedAt": submitted_at,
                    "attemptCount": attempt_count,
                    "weight": 0
                })
            return

        if parsed.path == "/api/intermediate/unit4-sunday-dinner/submit":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                changed = ensure_intermediate_gradebook_structure(grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                try:
                    result = score_intermediate_unit4_listening(payload)
                except ValueError as error:
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 400, {"error": str(error)})
                    return
                submitted_at = now_iso()
                previous = student.get("gradeDetails", {}).get(INTERMEDIATE_UNIT4_LISTENING_ID) if isinstance(student.get("gradeDetails"), dict) else None
                try:
                    attempt_count = int(previous.get("attemptCount", 0)) + 1 if isinstance(previous, dict) else 1
                except (TypeError, ValueError):
                    attempt_count = 1
                student.setdefault("grades", {})[INTERMEDIATE_UNIT4_LISTENING_ID] = result["grade"]
                if not isinstance(student.get("gradeDetails"), dict):
                    student["gradeDetails"] = {}
                student["gradeDetails"][INTERMEDIATE_UNIT4_LISTENING_ID] = {
                    "submittedAt": submitted_at,
                    "score": result["score"],
                    "total": result["total"],
                    "grade": result["grade"],
                    "incorrectQuestions": result["incorrect"],
                    "answers": result["answers"],
                    "attemptCount": attempt_count,
                    "status": "submitted",
                    "weight": 0,
                    "doesNotAffectAverage": True,
                    "activity": "Sunday Dinner Negotiation"
                }
                write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": INTERMEDIATE_UNIT4_LISTENING_ID,
                    "score": result["score"],
                    "total": result["total"],
                    "grade": result["grade"],
                    "incorrectQuestions": result["incorrect"],
                    "submittedAt": submitted_at,
                    "attemptCount": attempt_count,
                    "weight": 0
                })
            return

        if parsed.path == "/api/intermediate/unit4-memory-box/submit":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                try:
                    result = score_intermediate_unit4_memory_box(payload)
                except ValueError as error:
                    json_response(self, 400, {"error": str(error)})
                    return
                submitted_at = now_iso()
                previous = student.get("gradeDetails", {}).get(INTERMEDIATE_UNIT4_MEMORY_BOX_ID) if isinstance(student.get("gradeDetails"), dict) else None
                try:
                    attempt_count = int(previous.get("attemptCount", 0)) + 1 if isinstance(previous, dict) else 1
                except (TypeError, ValueError):
                    attempt_count = 1
                if not isinstance(student.get("gradeDetails"), dict):
                    student["gradeDetails"] = {}
                student["gradeDetails"][INTERMEDIATE_UNIT4_MEMORY_BOX_ID] = {
                    "submittedAt": submitted_at,
                    "score": result["score"],
                    "total": result["total"],
                    "grade": result["grade"],
                    "incorrectQuestions": result["incorrect"],
                    "answers": result["answers"],
                    "attemptCount": attempt_count,
                    "status": "submitted",
                    "weight": 0,
                    "doesNotAffectAverage": True,
                    "followUpOnly": True,
                    "activity": "The Memory Box",
                    "activityType": "Reading follow-up"
                }
                write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": INTERMEDIATE_UNIT4_MEMORY_BOX_ID,
                    "score": result["score"],
                    "total": result["total"],
                    "grade": result["grade"],
                    "incorrectQuestions": result["incorrect"],
                    "submittedAt": submitted_at,
                    "attemptCount": attempt_count,
                    "followUpOnly": True,
                    "weight": 0
                })
            return

        if parsed.path == "/api/intermediate/unit4-memory-blog/submit":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                title = clean_text(payload.get("title"), 120)
                blog_text = clean_basic_writing(payload.get("blogText"))
                word_count = basic_word_count(blog_text)
                if word_count < 90:
                    json_response(self, 400, {"error": "text_too_short", "wordCount": word_count})
                    return
                if word_count > 220:
                    json_response(self, 400, {"error": "text_too_long", "wordCount": word_count})
                    return
                used_to_count = len(re.findall(r"\bused\s+to\b|\bdidn['’]?t\s+use\s+to\b", blog_text, flags=re.IGNORECASE))
                present_markers = len(re.findall(r"\bnow\b|\btoday\b|\bthese days\b", blog_text, flags=re.IGNORECASE))
                submitted_at = now_iso()
                previous = student.get("gradeDetails", {}).get(INTERMEDIATE_UNIT4_MEMORY_BLOG_ID) if isinstance(student.get("gradeDetails"), dict) else None
                try:
                    attempt_count = int(previous.get("attemptCount", 0)) + 1 if isinstance(previous, dict) else 1
                except (TypeError, ValueError):
                    attempt_count = 1
                if not isinstance(student.get("gradeDetails"), dict):
                    student["gradeDetails"] = {}
                student["gradeDetails"][INTERMEDIATE_UNIT4_MEMORY_BLOG_ID] = {
                    "submittedAt": submitted_at,
                    "title": title or "Family Memory Blog",
                    "blogText": blog_text,
                    "wordCount": word_count,
                    "usedToCount": used_to_count,
                    "presentMarkerCount": present_markers,
                    "attemptCount": attempt_count,
                    "status": "submitted",
                    "weight": 0,
                    "doesNotAffectAverage": True,
                    "followUpOnly": True,
                    "activity": "Family Memory Blog Workshop",
                    "activityType": "Writing follow-up"
                }
                write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": INTERMEDIATE_UNIT4_MEMORY_BLOG_ID,
                    "submittedAt": submitted_at,
                    "wordCount": word_count,
                    "usedToCount": used_to_count,
                    "presentMarkerCount": present_markers,
                    "attemptCount": attempt_count,
                    "followUpOnly": True,
                    "weight": 0
                })
            return

        if parsed.path == "/api/intermediate/unit5-market-basket/submit":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                changed = ensure_intermediate_gradebook_structure(grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                try:
                    result = score_intermediate_unit5_market_basket(payload)
                    response, word_count = clean_intermediate_text_followup(payload, "response", 35, 180)
                except ValueError as error:
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 400, {"error": str(error), "wordCount": simple_word_count(payload.get("response"))})
                    return
                submitted_at = now_iso()
                previous = student.get("gradeDetails", {}).get(INTERMEDIATE_UNIT5_MARKET_BASKET_ID) if isinstance(student.get("gradeDetails"), dict) else None
                try:
                    attempt_count = int(previous.get("attemptCount", 0)) + 1 if isinstance(previous, dict) else 1
                except (TypeError, ValueError):
                    attempt_count = 1
                review = intermediate_unit5_market_basket_review(result)
                checklist = payload.get("checklist") if isinstance(payload.get("checklist"), dict) else {}
                student.setdefault("grades", {})[INTERMEDIATE_UNIT5_MARKET_BASKET_ID] = result["grade"]
                if not isinstance(student.get("gradeDetails"), dict):
                    student["gradeDetails"] = {}
                student["gradeDetails"][INTERMEDIATE_UNIT5_MARKET_BASKET_ID] = {
                    "submittedAt": submitted_at,
                    "score": result["score"],
                    "total": result["total"],
                    "grade": result["grade"],
                    "incorrectQuestions": result["incorrect"],
                    "answers": result["answers"],
                    "response": response,
                    "wordCount": word_count,
                    "shoppingList": clean_text(payload.get("shoppingList"), 600),
                    "dishName": clean_text(payload.get("dishName"), 140),
                    "team": clean_text(payload.get("team"), 40),
                    "missionChecklist": {
                        "team": bool(checklist.get("team")),
                        "dish": bool(checklist.get("dish")),
                        "quantities": bool(checklist.get("quantities")),
                        "countable": bool(checklist.get("countable")),
                        "uncountable": bool(checklist.get("uncountable")),
                        "reason": bool(checklist.get("reason"))
                    },
                    "reviewSummary": review["reviewSummary"],
                    "sortErrors": review["sortErrors"],
                    "quantityErrors": review["quantityErrors"],
                    "attemptCount": attempt_count,
                    "status": "submitted",
                    "weight": 0,
                    "doesNotAffectAverage": True,
                    "followUpOnly": True,
                    "activity": "Market Basket Challenge",
                    "activityType": "Grammar follow-up"
                }
                live = read_intermediate_unit5_market_basket_live()
                student_id = clean_text(student.get("id"), 40)
                live.setdefault("students", {})[student_id] = {
                    "studentName": clean_text(student.get("fullName"), 160) or "Student",
                    "email": clean_text(student.get("email"), 180),
                    "team": clean_intermediate_unit5_team(payload.get("team")),
                    "stage": "Send",
                    "sorted": 12,
                    "measured": 8,
                    "score": result["score"],
                    "grade": result["grade"],
                    "checklistReady": True,
                    "submitted": True,
                    "updatedAt": submitted_at
                }
                live["updatedAt"] = submitted_at
                write_intermediate_unit5_market_basket_live(live)
                write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": INTERMEDIATE_UNIT5_MARKET_BASKET_ID,
                    "score": result["score"],
                    "total": result["total"],
                    "grade": result["grade"],
                    "incorrectQuestions": result["incorrect"],
                    "reviewSummary": review["reviewSummary"],
                    "sortErrors": review["sortErrors"],
                    "quantityErrors": review["quantityErrors"],
                    "wordCount": word_count,
                    "submittedAt": submitted_at,
                    "attemptCount": attempt_count,
                    "followUpOnly": True,
                    "weight": 0
                })
            return

        if parsed.path == "/api/intermediate/unit5-market-dinner/submit":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                changed = ensure_intermediate_gradebook_structure(grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                try:
                    result = score_intermediate_unit5_listening(payload)
                    listening_note, word_count = clean_intermediate_text_followup(payload, "listeningNote", 35, 130)
                except ValueError as error:
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 400, {"error": str(error), "wordCount": simple_word_count(payload.get("listeningNote"))})
                    return
                submitted_at = now_iso()
                previous = student.get("gradeDetails", {}).get(INTERMEDIATE_UNIT5_LISTENING_ID) if isinstance(student.get("gradeDetails"), dict) else None
                try:
                    attempt_count = int(previous.get("attemptCount", 0)) + 1 if isinstance(previous, dict) else 1
                except (TypeError, ValueError):
                    attempt_count = 1
                student.setdefault("grades", {})[INTERMEDIATE_UNIT5_LISTENING_ID] = result["grade"]
                if not isinstance(student.get("gradeDetails"), dict):
                    student["gradeDetails"] = {}
                student["gradeDetails"][INTERMEDIATE_UNIT5_LISTENING_ID] = {
                    "submittedAt": submitted_at,
                    "score": result["score"],
                    "total": result["total"],
                    "grade": result["grade"],
                    "incorrectQuestions": result["incorrect"],
                    "answers": result["answers"],
                    "response": listening_note,
                    "wordCount": word_count,
                    "attemptCount": attempt_count,
                    "status": "submitted",
                    "weight": 0,
                    "doesNotAffectAverage": True,
                    "followUpOnly": True,
                    "activity": "Market Dinner Plan",
                    "activityType": "Listening follow-up"
                }
                write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": INTERMEDIATE_UNIT5_LISTENING_ID,
                    "score": result["score"],
                    "total": result["total"],
                    "grade": result["grade"],
                    "incorrectQuestions": result["incorrect"],
                    "wordCount": word_count,
                    "submittedAt": submitted_at,
                    "attemptCount": attempt_count,
                    "followUpOnly": True,
                    "weight": 0
                })
            return

        if parsed.path == "/api/intermediate/unit5-dish-history/submit":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                changed = ensure_intermediate_gradebook_structure(grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                try:
                    result = score_intermediate_unit5_reading(payload)
                    reading_response, word_count = clean_intermediate_text_followup(payload, "readingResponse", 40, 140)
                except ValueError as error:
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 400, {"error": str(error), "wordCount": simple_word_count(payload.get("readingResponse"))})
                    return
                submitted_at = now_iso()
                previous = student.get("gradeDetails", {}).get(INTERMEDIATE_UNIT5_READING_ID) if isinstance(student.get("gradeDetails"), dict) else None
                try:
                    attempt_count = int(previous.get("attemptCount", 0)) + 1 if isinstance(previous, dict) else 1
                except (TypeError, ValueError):
                    attempt_count = 1
                student.setdefault("grades", {})[INTERMEDIATE_UNIT5_READING_ID] = result["grade"]
                if not isinstance(student.get("gradeDetails"), dict):
                    student["gradeDetails"] = {}
                student["gradeDetails"][INTERMEDIATE_UNIT5_READING_ID] = {
                    "submittedAt": submitted_at,
                    "score": result["score"],
                    "total": result["total"],
                    "grade": result["grade"],
                    "incorrectQuestions": result["incorrect"],
                    "answers": result["answers"],
                    "response": reading_response,
                    "wordCount": word_count,
                    "attemptCount": attempt_count,
                    "status": "submitted",
                    "weight": 0,
                    "doesNotAffectAverage": True,
                    "followUpOnly": True,
                    "activity": "A Dish with a History",
                    "activityType": "Reading follow-up"
                }
                write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": INTERMEDIATE_UNIT5_READING_ID,
                    "score": result["score"],
                    "total": result["total"],
                    "grade": result["grade"],
                    "incorrectQuestions": result["incorrect"],
                    "wordCount": word_count,
                    "submittedAt": submitted_at,
                    "attemptCount": attempt_count,
                    "followUpOnly": True,
                    "weight": 0
                })
            return

        if parsed.path == "/api/intermediate/unit5-healthy-dinner/submit":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                changed = ensure_intermediate_gradebook_structure(grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                try:
                    response, word_count = clean_intermediate_text_followup(payload, "response", 90, 260)
                except ValueError as error:
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 400, {"error": str(error), "wordCount": simple_word_count(payload.get("response"))})
                    return
                submitted_at, attempt_count = save_intermediate_text_followup(student, INTERMEDIATE_UNIT5_DINNER_PLAN_ID, {
                    "activity": "Healthy Dinner Planner",
                    "activityType": "Writing follow-up",
                    "response": response,
                    "wordCount": word_count,
                    "groupSize": clean_text(payload.get("groupSize"), 140),
                    "mainDish": clean_text(payload.get("mainDish"), 160),
                    "ingredients": clean_text(payload.get("ingredients"), 500),
                    "healthReason": clean_text(payload.get("healthReason"), 260),
                    "culturalConnection": clean_text(payload.get("culturalConnection"), 260)
                })
                write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": INTERMEDIATE_UNIT5_DINNER_PLAN_ID,
                    "wordCount": word_count,
                    "submittedAt": submitted_at,
                    "attemptCount": attempt_count,
                    "followUpOnly": True,
                    "weight": 0
                })
            return

        if parsed.path == "/api/intermediate/unit5-snack-review/submit":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                changed = ensure_intermediate_gradebook_structure(grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                try:
                    response, word_count = clean_intermediate_text_followup(payload, "response", 90, 250)
                except ValueError as error:
                    if changed:
                        write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                    json_response(self, 400, {"error": str(error), "wordCount": simple_word_count(payload.get("response"))})
                    return
                submitted_at, attempt_count = save_intermediate_text_followup(student, INTERMEDIATE_UNIT5_SNACK_REVIEW_ID, {
                    "activity": "Global Snack Review",
                    "activityType": "Writing follow-up",
                    "response": response,
                    "wordCount": word_count,
                    "snackName": clean_text(payload.get("snackName"), 120),
                    "origin": clean_text(payload.get("origin"), 180),
                    "rating": clean_text(payload.get("rating"), 20),
                    "ingredients": clean_text(payload.get("ingredients"), 320)
                })
                write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, grades_data, ".intermediate-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": INTERMEDIATE_UNIT5_SNACK_REVIEW_ID,
                    "wordCount": word_count,
                    "submittedAt": submitted_at,
                    "attemptCount": attempt_count,
                    "followUpOnly": True,
                    "weight": 0
                })
            return


        if parsed.path == "/api/basic/unit6-neighborhood-image/generate":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                if ensure_basic_gradebook_structure(grades_data):
                    write_json_file(BASIC_ENGLISH_GRADES_PATH, grades_data, ".basic-grades-")
                role = grade_user_role(profile, grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if role not in ("admin", "teacher") and not isinstance(student, dict) and not is_basic_unit6_neighborhood_test_profile(profile):
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return

            group_name = clean_text(payload.get("groupName"), 100)
            neighborhood_name = clean_text(payload.get("neighborhoodName"), 100)
            description = clean_text(payload.get("description"), 2400)
            prompt = clean_text(payload.get("prompt"), 2400)
            word_count = simple_word_count(description)
            if not group_name:
                group_name = "Unit 6 Team"
            if not neighborhood_name:
                neighborhood_name = "Fictional Neighborhood"

            try:
                image_bytes, image_extension, image_content_type = decode_basic_unit6_image_data_url(payload.get("imageDataUrl"))
            except ValueError as error:
                message = str(error)
                json_response(self, 400, {"error": message[:80]})
                return

            image_id = secrets.token_urlsafe(18)
            image_path = basic_unit6_image_path(image_id, image_extension)
            if not image_path:
                json_response(self, 500, {"error": "invalid_image_path"})
                return
            os.makedirs(os.path.dirname(image_path), exist_ok=True)
            with open(image_path, "wb") as handle:
                handle.write(image_bytes)
            image_url = "/api/basic/unit6-neighborhood-image/file?id=" + urllib.parse.quote(image_id)

            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                gradebook_changed = ensure_basic_gradebook_structure(grades_data)
                role = grade_user_role(profile, grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if role not in ("admin", "teacher") and not isinstance(student, dict) and not is_basic_unit6_neighborhood_test_profile(profile):
                    try:
                        os.unlink(image_path)
                    except OSError:
                        pass
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                student_id = basic_unit6_neighborhood_owner_id(profile, role, student)
                gallery = read_basic_unit6_neighborhood_gallery()
                submitted_at = now_iso()
                item = {
                    "id": image_id,
                    "groupName": group_name,
                    "neighborhoodName": neighborhood_name,
                    "description": description,
                    "prompt": prompt,
                    "imageUrl": image_url,
                    "imageContentType": image_content_type,
                    "studentId": student_id,
                    "studentName": clean_text(student.get("fullName"), 160) if isinstance(student, dict) else clean_text(profile.get("name"), 160),
                    "studentEmail": clean_email(student.get("email")) if isinstance(student, dict) else clean_email(profile.get("email")),
                    "submittedAt": submitted_at
                }
                submissions = gallery.setdefault("submissions", [])
                replaced = False
                if role not in ("admin", "teacher"):
                    for index, existing_item in enumerate(submissions):
                        if isinstance(existing_item, dict) and clean_text(existing_item.get("studentId"), 40) == student_id:
                            old_path, _old_content_type = basic_unit6_image_file_for_id(clean_text(existing_item.get("id"), 80))
                            submissions[index] = item
                            replaced = True
                            if old_path and old_path != image_path:
                                try:
                                    os.unlink(old_path)
                                except OSError:
                                    pass
                            break
                if not replaced:
                    submissions.append(item)
                gallery["submissions"] = submissions[-300:]
                gallery["updatedAt"] = submitted_at
                write_basic_unit6_neighborhood_gallery(gallery)
                if isinstance(student, dict):
                    if not isinstance(student.get("gradeDetails"), dict):
                        student["gradeDetails"] = {}
                    student["gradeDetails"][BASIC_UNIT6_NEIGHBORHOOD_AI_ID] = {
                        "evaluationId": BASIC_UNIT6_NEIGHBORHOOD_AI_ID,
                        "activityTitle": BASIC_UNIT6_NEIGHBORHOOD_AI_EVALUATION["title"],
                        "submittedAt": submitted_at,
                        "status": "submitted",
                        "weight": 0,
                        "doesNotAffectAverage": True,
                        "followUpOnly": True,
                        "groupName": group_name,
                        "neighborhoodName": neighborhood_name,
                        "description": description,
                        "prompt": prompt,
                        "imageUrl": image_url,
                        "galleryId": image_id,
                        "wordCount": word_count
                    }
                    gradebook_changed = True
                if gradebook_changed:
                    write_json_file(BASIC_ENGLISH_GRADES_PATH, grades_data, ".basic-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "result": public_basic_unit6_neighborhood_item(item, role in ("admin", "teacher")),
                    "gallery": basic_unit6_neighborhood_gallery_payload(profile, grades_data, gallery)
                })
            return


        if parsed.path == "/api/basic/integrated-task/submit":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                bundle = read_basic_integrated_task_bundle()
                state = bundle.get("state", {})
                student_id = clean_text(student.get("id"), 40)
                if not basic_integrated_can_take("student", state, student_id):
                    json_response(self, 403, {"error": "exam_closed", "state": state})
                    return
                submissions = read_basic_integrated_task_submissions()
                existing = submissions.get("submissions", {}).get(student_id)
                if existing:
                    json_response(self, 409, {"error": "already_submitted", "result": basic_integrated_submission_public(existing)})
                    return
                writing = clean_basic_writing(payload.get("writing"))
                if basic_word_count(writing) < 60:
                    json_response(self, 400, {"error": "writing_too_short", "wordCount": basic_word_count(writing)})
                    return
                result = basic_integrated_score(bundle.get("exam", {}), payload.get("answers"))
                try:
                    audio_plays = max(0, min(3, int(payload.get("audioPlays", 0))))
                except (TypeError, ValueError):
                    audio_plays = 0
                submitted_at = now_iso()
                submission = {
                    "receiptId": "BIT-" + secrets.token_hex(5).upper(),
                    "studentId": student_id,
                    "studentName": clean_text(student.get("fullName"), 200),
                    "email": normalize_email(profile.get("email")),
                    "courseCode": clean_text(payload.get("courseCode"), 40),
                    "clientDate": clean_text(payload.get("clientDate"), 30),
                    "submittedAt": submitted_at,
                    "audioPlays": audio_plays,
                    "listeningPoints": result["score"],
                    "writingPoints": None,
                    "finalPoints": None,
                    "grade": None,
                    "status": "pending-writing",
                    "writing": writing,
                    "answers": result["details"],
                    "rubric": None,
                    "teacherComments": "",
                    "gradedAt": None,
                    "gradedBy": ""
                }
                submissions.setdefault("submissions", {})[student_id] = submission
                gradebook_changed = ensure_basic_integrated_task_evaluation(grades_data)
                if apply_basic_integrated_submission_status_to_gradebook(grades_data, submissions):
                    gradebook_changed = True
                basic_integrated_append_event(submissions, "submitted", profile, student_id, "Student submitted the Integrated Task")
                write_basic_integrated_task_submissions(submissions)
                if gradebook_changed:
                    write_json_file(BASIC_ENGLISH_GRADES_PATH, grades_data, ".basic-grades-")
                json_response(self, 200, {"ok": True, "result": basic_integrated_submission_public(submission)})
            return

        if parsed.path == "/api/basic/integrated-task-andres-munoz-retake/submit":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                student = basic_andres_retake_student_allowed(profile, grades_data)
                if not isinstance(student, dict):
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                if not basic_andres_retake_is_open():
                    json_response(self, 403, {"error": "exam_closed", "availabilityLabel": BASIC_ANDRES_RETAKE_WINDOW_LABEL})
                    return
                submissions = read_basic_andres_retake_submissions()
                student_id = clean_text(student.get("id"), 40)
                existing = submissions.get("submissions", {}).get(student_id)
                if existing:
                    json_response(self, 409, {"error": "already_submitted", "result": basic_andres_retake_public_submission(existing)})
                    return
                writing = clean_basic_writing(payload.get("writing"))
                if basic_word_count(writing) < 60:
                    json_response(self, 400, {"error": "writing_too_short", "wordCount": basic_word_count(writing)})
                    return
                exam = basic_andres_retake_exam()
                result = basic_integrated_score(exam, payload.get("answers"))
                try:
                    audio_plays = max(0, int(payload.get("audioPlays", 0)))
                except (TypeError, ValueError):
                    audio_plays = 0
                submitted_at = now_iso()
                submission = {
                    "receiptId": "BIR-" + secrets.token_hex(5).upper(),
                    "studentId": student_id,
                    "studentName": clean_text(student.get("fullName"), 200),
                    "email": normalize_email(profile.get("email")),
                    "courseCode": clean_text(payload.get("courseCode"), 40),
                    "clientDate": clean_text(payload.get("clientDate"), 30),
                    "submittedAt": submitted_at,
                    "audioPlays": audio_plays,
                    "listeningPoints": result["score"],
                    "writingPoints": None,
                    "finalPoints": None,
                    "grade": None,
                    "status": "pending-writing-review",
                    "writing": writing,
                    "answers": result["details"],
                    "rubric": None,
                    "teacherComments": "",
                    "source": "andres-munoz-special-retake"
                }
                submissions.setdefault("submissions", {})[student_id] = submission
                write_basic_andres_retake_submissions(submissions)
                json_response(self, 200, {"ok": True, "result": basic_andres_retake_public_submission(submission)})
            return

        if parsed.path == "/api/french7/final-exam/submit":
            provider = normalize_email(self.headers.get("X-Jaralingua-Auth-Provider"))
            if provider != "google":
                json_response(self, 403, {"error": "google_required"})
                return

            with data_lock:
                grades_data = read_grades_data(FRENCH7_GRADES_PATH)
                student = final_exam_allowed_student(profile, grades_data)
                if not isinstance(student, dict):
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return

                bundle = read_final_exam_bundle()
                state = bundle.get("state", {})
                if state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "exam_closed", "state": state})
                    return

                submissions = read_final_exam_submissions()
                student_id = clean_text(student.get("id"), 40)
                if submissions.get("submissions", {}).get(student_id):
                    json_response(self, 409, {
                        "error": "already_submitted",
                        "result": submissions["submissions"][student_id]
                    })
                    return

                result = score_final_exam(bundle.get("exam", {}), payload.get("answers"))
                submitted_at = now_iso()
                submission = {
                    "studentId": student_id,
                    "studentName": student.get("fullName", ""),
                    "email": normalize_email(profile.get("email")),
                    "scorePoints": result["scorePoints"],
                    "totalPoints": result["totalPoints"],
                    "grade": result["grade"],
                    "sectionScores": result["sectionScores"],
                    "submittedAt": submitted_at,
                    "answers": result["details"]
                }
                submissions.setdefault("submissions", {})[student_id] = submission

                ensure_final_exam_evaluation(grades_data)
                student.setdefault("grades", {})["finalExam"] = result["grade"]
                write_final_exam_submissions(submissions)
                write_json_file(FRENCH7_GRADES_PATH, grades_data, ".french7-grades-")
                json_response(self, 200, {"ok": True, "result": submission})
            return

        if parsed.path == "/api/french1/final-exam/submit":
            with data_lock:
                grades_data = read_grades_data(FRENCH1_GRADES_PATH)
                if ensure_french1_gradebook_structure(grades_data):
                    write_json_file(FRENCH1_GRADES_PATH, grades_data, ".french1-grades-")
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return

                bundle = read_french1_final_exam_bundle()
                state = bundle.get("state", {})
                if state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "exam_closed", "state": state})
                    return

                submissions = read_french1_final_exam_submissions()
                student_id = clean_text(student.get("id"), 40)
                existing = submissions.get("submissions", {}).get(student_id)
                if existing:
                    json_response(self, 409, {
                        "error": "already_submitted",
                        "result": french1_final_exam_submission_public(existing)
                    })
                    return

                result = score_final_exam(bundle.get("exam", {}), payload.get("answers"))
                submitted_at = now_iso()
                submission = {
                    "studentId": student_id,
                    "studentName": student.get("fullName", ""),
                    "email": normalize_email(profile.get("email")),
                    "scorePoints": result["scorePoints"],
                    "totalPoints": result["totalPoints"],
                    "grade": result["grade"],
                    "sectionScores": result["sectionScores"],
                    "submittedAt": submitted_at,
                    "answers": result["details"]
                }
                submissions.setdefault("submissions", {})[student_id] = submission

                ensure_evaluation_template(grades_data, FRENCH1_CORE_EVALUATIONS["finalExam"])
                student.setdefault("grades", {})["finalExam"] = result["grade"]
                write_french1_final_exam_submissions(submissions)
                write_json_file(FRENCH1_GRADES_PATH, grades_data, ".french1-grades-")
                json_response(self, 200, {"ok": True, "result": french1_final_exam_submission_public(submission)})
            return

        if parsed.path == "/api/french2/final-exam/submit":
            with data_lock:
                grades_data = read_grades_data(FRENCH2_GRADES_PATH)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return

                bundle = read_french2_final_exam_bundle()
                state = bundle.get("state", {})
                if state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "exam_closed", "state": state})
                    return

                submissions = read_french2_final_exam_submissions()
                student_id = clean_text(student.get("id"), 40)
                existing = submissions.get("submissions", {}).get(student_id)
                if existing:
                    json_response(self, 409, {
                        "error": "already_submitted",
                        "result": french1_final_exam_submission_public(existing)
                    })
                    return

                result = score_final_exam(bundle.get("exam", {}), payload.get("answers"))
                submitted_at = now_iso()
                submission = {
                    "studentId": student_id,
                    "studentName": student.get("fullName", ""),
                    "email": normalize_email(profile.get("email")),
                    "scorePoints": result["scorePoints"],
                    "totalPoints": result["totalPoints"],
                    "grade": result["grade"],
                    "sectionScores": result["sectionScores"],
                    "submittedAt": submitted_at,
                    "answers": result["details"]
                }
                submissions.setdefault("submissions", {})[student_id] = submission

                ensure_final_exam_evaluation(grades_data)
                student.setdefault("grades", {})["finalExam"] = result["grade"]
                write_french2_final_exam_submissions(submissions)
                write_json_file(FRENCH2_GRADES_PATH, grades_data, ".french2-grades-")
                json_response(self, 200, {"ok": True, "result": french1_final_exam_submission_public(submission)})
            return

        if parsed.path == "/api/french8/quiz-ville-intelligente/submit":
            with data_lock:
                grades_data = read_grades_data(FRENCH8_GRADES_PATH)
                if ensure_french8_gradebook_structure(grades_data):
                    write_json_file(FRENCH8_GRADES_PATH, grades_data, ".french8-grades-")
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return

                bundle = read_french8_quiz_bundle()
                state = bundle.get("state", {})
                if state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "quiz_closed", "state": state})
                    return

                submissions = read_french8_quiz_submissions()
                student_id = clean_text(student.get("id"), 40)
                attempt_id = clean_text(payload.get("attemptId"), 120)
                existing = submissions.get("submissions", {}).get(student_id)
                if existing:
                    if attempt_id and clean_text(existing.get("attemptId"), 120) == attempt_id:
                        json_response(self, 200, {
                            "ok": True,
                            "duplicate": True,
                            "result": french8_quiz_submission_public(existing)
                        })
                    else:
                        json_response(self, 409, {
                            "error": "already_submitted",
                            "result": french8_quiz_submission_public(existing)
                        })
                    return

                exam = bundle.get("exam", {})
                result = score_final_exam(exam, payload.get("answers"))
                submitted_at = now_iso()
                submission = {
                    "studentId": student_id,
                    "studentName": student.get("fullName", ""),
                    "email": normalize_email(profile.get("email")),
                    "scorePoints": result["scorePoints"],
                    "totalPoints": result["totalPoints"],
                    "grade": result["grade"],
                    "sectionScores": result["sectionScores"],
                    "submittedAt": submitted_at,
                    "quizVersion": clean_text(exam.get("version"), 80),
                    "attemptId": attempt_id,
                    "answers": result["details"],
                    "source": "french8-quiz-ville-intelligente"
                }
                submissions.setdefault("submissions", {})[student_id] = submission

                student.setdefault("grades", {})["quiz"] = result["grade"]
                if not isinstance(student.get("gradeDetails"), dict):
                    student["gradeDetails"] = {}
                student["gradeDetails"]["quiz"] = {
                    "evaluationId": "quiz",
                    "status": "submitted",
                    "submittedAt": submitted_at,
                    "scorePoints": result["scorePoints"],
                    "totalPoints": result["totalPoints"],
                    "grade": result["grade"],
                    "sectionScores": result["sectionScores"],
                    "quizVersion": clean_text(exam.get("version"), 80),
                    "attemptId": attempt_id,
                    "source": "french8-quiz-ville-intelligente"
                }

                write_french8_quiz_submissions(submissions)
                write_json_file(FRENCH8_GRADES_PATH, grades_data, ".french8-grades-")
                json_response(self, 200, {"ok": True, "result": french8_quiz_submission_public(submission)})
            return

        if parsed.path == "/api/french1/pronunciation-grade":
            with data_lock:
                grades_data = read_grades_data(FRENCH1_GRADES_PATH)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                try:
                    evaluation_id, score100, grade = french1_pronunciation_grade_from_payload(payload)
                except ValueError as error:
                    json_response(self, 400, {"error": str(error)})
                    return
                ensure_french1_gradebook_structure(grades_data)
                student.setdefault("grades", {})[evaluation_id] = grade
                write_json_file(FRENCH1_GRADES_PATH, grades_data, ".french1-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": evaluation_id,
                    "score100": score100,
                    "grade": grade,
                    "updatedAt": now_iso()
                })
            return

        if parsed.path == "/api/french2/pronunciation-grade":
            with data_lock:
                grades_data = read_grades_data(FRENCH2_GRADES_PATH)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                try:
                    evaluation_id, score100, grade = french2_pronunciation_grade_from_payload(payload)
                except ValueError as error:
                    json_response(self, 400, {"error": str(error)})
                    return
                ensure_french2_gradebook_structure(grades_data)
                student.setdefault("grades", {})[evaluation_id] = grade
                write_json_file(FRENCH2_GRADES_PATH, grades_data, ".french2-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": evaluation_id,
                    "score100": score100,
                    "grade": grade,
                    "updatedAt": now_iso()
                })
            return

        if parsed.path == "/api/french8/pronunciation-grade":
            with data_lock:
                grades_data = read_grades_data(FRENCH8_GRADES_PATH)
                changed = ensure_french8_gradebook_structure(grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    if changed:
                        write_json_file(FRENCH8_GRADES_PATH, grades_data, ".french8-grades-")
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                try:
                    evaluation_id, score100, grade = french8_pronunciation_grade_from_payload(payload)
                except ValueError as error:
                    json_response(self, 400, {"error": str(error)})
                    return
                deadline = FRENCH8_PRONUNCIATION_DEADLINES.get(evaluation_id)
                if deadline and time.time() >= deadline["epoch"]:
                    json_response(self, 403, {
                        "error": "deadline_closed",
                        "deadlineAt": deadline["utc"],
                        "deadlineLabel": deadline["label"]
                    })
                    return
                student.setdefault("grades", {})[evaluation_id] = grade
                if not isinstance(student.get("gradeDetails"), dict):
                    student["gradeDetails"] = {}
                previous_detail = student["gradeDetails"].get(evaluation_id)
                audio_ref = save_french8_pronunciation_audio(student, evaluation_id, payload)
                next_detail = clean_pronunciation_submission_details(payload, evaluation_id, score100, grade)
                if audio_ref:
                    if isinstance(previous_detail, dict):
                        remove_french8_pronunciation_audio(previous_detail.get("audio"))
                    next_detail["audio"] = audio_ref
                elif isinstance(previous_detail, dict) and isinstance(previous_detail.get("audio"), dict):
                    next_detail["audio"] = previous_detail["audio"]
                student["gradeDetails"][evaluation_id] = next_detail
                write_json_file(FRENCH8_GRADES_PATH, grades_data, ".french8-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": evaluation_id,
                    "score100": score100,
                    "grade": grade,
                    "updatedAt": now_iso()
                })
            return

        if parsed.path == "/api/french8/hypotheses-submission":
            with data_lock:
                grades_data = read_grades_data(FRENCH8_GRADES_PATH)
                changed = ensure_french8_gradebook_structure(grades_data)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    if changed:
                        write_json_file(FRENCH8_GRADES_PATH, grades_data, ".french8-grades-")
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                text = normalized_activity_text(payload.get("text"))
                idiom = clean_text(payload.get("idiom"), 140)
                if simple_word_count(text) < 120:
                    json_response(self, 400, {"error": "text_too_short", "wordCount": simple_word_count(text)})
                    return
                if not idiom:
                    json_response(self, 400, {"error": "missing_idiom"})
                    return
                if not text_contains_expression(text, idiom):
                    json_response(self, 400, {"error": "idiom_not_found"})
                    return
                audio_payload = {"details": {"audioDataUrl": payload.get("audioDataUrl")}}
                audio_ref = save_french8_pronunciation_audio(student, FRENCH8_HYPOTHESES_ACTIVITY_ID, audio_payload)
                if not audio_ref:
                    json_response(self, 400, {"error": "missing_audio"})
                    return
                if not isinstance(student.get("gradeDetails"), dict):
                    student["gradeDetails"] = {}
                previous_detail = student["gradeDetails"].get(FRENCH8_HYPOTHESES_ACTIVITY_ID)
                if isinstance(previous_detail, dict):
                    remove_french8_pronunciation_audio(previous_detail.get("audio"))
                next_detail = clean_french8_hypotheses_submission_details(payload, audio_ref)
                if isinstance(previous_detail, dict) and previous_detail.get("feedback"):
                    next_detail["previousFeedback"] = previous_detail.get("feedback")
                student["gradeDetails"][FRENCH8_HYPOTHESES_ACTIVITY_ID] = next_detail
                write_json_file(FRENCH8_GRADES_PATH, grades_data, ".french8-grades-")
                json_response(self, 200, {
                    "ok": True,
                    "evaluationId": FRENCH8_HYPOTHESES_ACTIVITY_ID,
                    "wordCount": next_detail.get("wordCount"),
                    "submittedAt": next_detail.get("submittedAt")
                })
            return

        json_response(self, 404, {"error": "not_found"})

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        profile = self.require_user()
        if not profile:
            return
        payload = self.read_json_body()
        if payload is None:
            return

        if parsed.path == "/api/progress":
            progress = sanitize_progress(payload.get("progress"))
            with data_lock:
                store = read_store()
                record = user_record(store, profile)
                record["progress"] = progress
                record["updatedAt"] = now_iso()
                write_store(store)
            json_response(self, 200, {"ok": True})
            return

        if parsed.path == "/api/activity":
            page_path = str(payload.get("path") or "")[:500]
            if not page_path:
                json_response(self, 400, {"error": "missing_path"})
                return
            draft = sanitize_activity(payload.get("draft"))
            with data_lock:
                store = read_store()
                record = user_record(store, profile)
                record.setdefault("activities", {})[page_path] = draft
                record["updatedAt"] = now_iso()
                write_store(store)
            json_response(self, 200, {"ok": True})
            return

        if parsed.path == "/api/french7/grades":
            with data_lock:
                grades_data = read_grades_data(FRENCH7_GRADES_PATH)
                if grade_user_role(profile, grades_data) != "admin":
                    json_response(self, 403, {"error": "forbidden"})
                    return
                try:
                    next_data = clean_gradebook_payload(payload, grades_data)
                except ValueError as error:
                    json_response(self, 400, {"error": str(error)})
                    return
                write_json_file(FRENCH7_GRADES_PATH, next_data, ".french7-grades-")
                json_response(self, 200, {"ok": True, "updatedAt": now_iso()})
            return

        if parsed.path == "/api/french1/grades":
            with data_lock:
                grades_data = read_grades_data(FRENCH1_GRADES_PATH)
                if grade_user_role(profile, grades_data) not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                try:
                    next_data = clean_gradebook_payload(payload, grades_data)
                except ValueError as error:
                    json_response(self, 400, {"error": str(error)})
                    return
                write_json_file(FRENCH1_GRADES_PATH, next_data, ".french1-grades-")
                json_response(self, 200, {"ok": True, "updatedAt": now_iso()})
            return

        if parsed.path == "/api/french2/grades":
            with data_lock:
                grades_data = read_grades_data(FRENCH2_GRADES_PATH)
                if grade_user_role(profile, grades_data) not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                try:
                    next_data = clean_gradebook_payload(payload, grades_data)
                except ValueError as error:
                    json_response(self, 400, {"error": str(error)})
                    return
                write_json_file(FRENCH2_GRADES_PATH, next_data, ".french2-grades-")
                json_response(self, 200, {"ok": True, "updatedAt": now_iso()})
            return

        if parsed.path == "/api/french8/grades":
            with data_lock:
                grades_data = read_grades_data(FRENCH8_GRADES_PATH)
                if grade_user_role(profile, grades_data) not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                try:
                    next_data = clean_gradebook_payload(payload, grades_data)
                except ValueError as error:
                    json_response(self, 400, {"error": str(error)})
                    return
                ensure_french8_gradebook_structure(next_data)
                write_json_file(FRENCH8_GRADES_PATH, next_data, ".french8-grades-")
                json_response(self, 200, {"ok": True, "updatedAt": now_iso()})
            return

        if parsed.path == "/api/french8/hypotheses-feedback":
            with data_lock:
                grades_data = read_grades_data(FRENCH8_GRADES_PATH)
                if grade_user_role(profile, grades_data) not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                student_id = clean_text(payload.get("studentId"), 40)
                student = next(
                    (
                        item for item in grades_data.get("students", [])
                        if isinstance(item, dict) and clean_text(item.get("id"), 40) == student_id
                    ),
                    None
                )
                if not isinstance(student, dict):
                    json_response(self, 404, {"error": "student_not_found"})
                    return
                if not isinstance(student.get("gradeDetails"), dict):
                    student["gradeDetails"] = {}
                detail = student["gradeDetails"].setdefault(FRENCH8_HYPOTHESES_ACTIVITY_ID, {
                    "evaluationId": FRENCH8_HYPOTHESES_ACTIVITY_ID,
                    "activityTitle": "Production ecrite et orale - Hypotheses irreelles"
                })
                feedback = clean_text(payload.get("feedback"), 1600)
                detail["feedback"] = feedback
                detail["feedbackAt"] = now_iso()
                detail["feedbackBy"] = normalize_email(profile.get("email"))
                grade = clean_grade(payload.get("grade"))
                if grade is not None:
                    student.setdefault("grades", {})[FRENCH8_HYPOTHESES_ACTIVITY_ID] = grade
                write_json_file(FRENCH8_GRADES_PATH, grades_data, ".french8-grades-")
                json_response(self, 200, {"ok": True, "updatedAt": detail["feedbackAt"], "grade": grade})
            return


        if parsed.path == "/api/basic/integrated-task/state":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                if grade_user_role(profile, grades_data) != "admin":
                    json_response(self, 403, {"error": "forbidden"})
                    return
                bundle = read_basic_integrated_task_bundle()
                state = bundle.setdefault("state", {})
                desired_open = payload.get("isOpen") is True
                timestamp = now_iso()
                state["isOpen"] = desired_open
                state["updatedAt"] = timestamp
                if desired_open:
                    state["openedAt"] = timestamp
                    state["openedBy"] = normalize_email(profile.get("email"))
                    state["closedAt"] = None
                else:
                    state["closedAt"] = timestamp
                write_basic_integrated_task_bundle(bundle)
                submissions = read_basic_integrated_task_submissions()
                basic_integrated_append_event(submissions, "exam-opened" if desired_open else "exam-closed", profile, "", "Global exam availability changed")
                write_basic_integrated_task_submissions(submissions)
                json_response(self, 200, {"ok": True, "state": state})
            return

        if parsed.path == "/api/basic/integrated-task/student-action":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                if role not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                student_id = clean_text(payload.get("studentId"), 40)
                action = clean_text(payload.get("action"), 80)
                student = next((item for item in grades_data.get("students", []) if isinstance(item, dict) and clean_text(item.get("id"), 40) == student_id), None)
                if not isinstance(student, dict):
                    json_response(self, 404, {"error": "student_not_found"})
                    return
                bundle = read_basic_integrated_task_bundle()
                state = bundle.setdefault("state", {})
                submissions = read_basic_integrated_task_submissions()
                changed_grades = False
                changed_bundle = False
                detail = ""
                if action in ("reset", "reset-and-reopen"):
                    submissions.setdefault("submissions", {}).pop(student_id, None)
                    if isinstance(student.get("grades"), dict):
                        student["grades"].pop("integratedTask20", None)
                    if isinstance(student.get("gradeDetails"), dict):
                        student["gradeDetails"].pop("integratedTask20", None)
                    changed_grades = True
                    detail = "Submission and Integrated Task grade state reset"
                    basic_integrated_append_event(submissions, "student-reset", profile, student_id, detail)
                if action in ("reopen", "reset-and-reopen"):
                    try:
                        hours = max(1, min(168, int(payload.get("hours", 48))))
                    except (TypeError, ValueError):
                        hours = 48
                    allowed_ids = state.setdefault("reopenStudentIds", [])
                    if not isinstance(allowed_ids, list):
                        allowed_ids = []
                    if student_id not in {clean_text(item, 40) for item in allowed_ids}:
                        allowed_ids.append(student_id)
                    state["reopenStudentIds"] = allowed_ids
                    state["reopenUntilEpoch"] = int(time.time()) + hours * 3600
                    state["reopenUntilLabel"] = "Available only for selected students for " + str(hours) + " hours from " + now_iso()
                    state["reopenResetPlays"] = True
                    state["updatedAt"] = now_iso()
                    state["openedBy"] = normalize_email(profile.get("email"))
                    changed_bundle = True
                    detail = "Student reopened for " + str(hours) + " hours"
                    basic_integrated_append_event(submissions, "student-reopened", profile, student_id, detail)
                if action == "close-reopen":
                    allowed_ids = state.get("reopenStudentIds", [])
                    if isinstance(allowed_ids, list):
                        state["reopenStudentIds"] = [item for item in allowed_ids if clean_text(item, 40) != student_id]
                    state["updatedAt"] = now_iso()
                    changed_bundle = True
                    detail = "Student removed from individual reopen list"
                    basic_integrated_append_event(submissions, "student-reopen-closed", profile, student_id, detail)
                if action not in ("reset", "reopen", "reset-and-reopen", "close-reopen"):
                    json_response(self, 400, {"error": "invalid_action"})
                    return
                write_basic_integrated_task_submissions(submissions)
                if changed_grades:
                    write_json_file(BASIC_ENGLISH_GRADES_PATH, grades_data, ".basic-grades-")
                if changed_bundle:
                    write_basic_integrated_task_bundle(bundle)
                health = basic_integrated_health_payload(grades_data, bundle, submissions)
                json_response(self, 200, {"ok": True, "health": health, "detail": detail})
            return

        if parsed.path == "/api/basic/integrated-task/submissions/grade":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                if role not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                rubric = clean_basic_rubric(payload.get("rubric"))
                if rubric is None:
                    json_response(self, 400, {"error": "invalid_rubric"})
                    return
                student_id = clean_text(payload.get("studentId"), 40)
                submissions = read_basic_integrated_task_submissions()
                submission = submissions.get("submissions", {}).get(student_id)
                if not isinstance(submission, dict):
                    json_response(self, 404, {"error": "submission_not_found"})
                    return
                student = next((item for item in grades_data.get("students", []) if isinstance(item, dict) and clean_text(item.get("id"), 40) == student_id), None)
                if not isinstance(student, dict):
                    json_response(self, 404, {"error": "student_not_found"})
                    return
                writing_points = sum(rubric.values())
                listening_points = float(submission.get("listeningPoints", 0))
                final_points = clean_exam_number(listening_points + writing_points)
                grade = round(float(final_points) / 10.0, 2)
                submission["rubric"] = rubric
                submission["writingPoints"] = writing_points
                submission["finalPoints"] = final_points
                submission["grade"] = grade
                submission["status"] = "graded"
                submission["teacherComments"] = str(payload.get("teacherComments") or "").strip()[:2000]
                submission["gradedAt"] = now_iso()
                submission["gradedBy"] = normalize_email(profile.get("email"))
                ensure_basic_integrated_task_evaluation(grades_data)
                student.setdefault("grades", {})["integratedTask20"] = grade
                details = student.setdefault("gradeDetails", {})
                if isinstance(details, dict):
                    details["integratedTask20"] = {
                        "evaluationId": "integratedTask20",
                        "activityTitle": "BASIC COURSE 1 – INTEGRATED TASK (20%)",
                        "status": "graded",
                        "submittedAt": clean_text(submission.get("submittedAt"), 80),
                        "gradedAt": clean_text(submission.get("gradedAt"), 80),
                        "receiptId": clean_text(submission.get("receiptId"), 80),
                        "listeningPoints": clean_exam_number(submission.get("listeningPoints")),
                        "writingPoints": clean_exam_number(writing_points),
                        "finalPoints": clean_exam_number(final_points),
                        "grade": grade,
                        "pendingTeacherReview": False,
                        "weight": 20
                    }
                basic_integrated_append_event(submissions, "graded", profile, student_id, "Teacher saved rubric and final grade")
                write_basic_integrated_task_submissions(submissions)
                write_json_file(BASIC_ENGLISH_GRADES_PATH, grades_data, ".basic-grades-")
                json_response(self, 200, {"ok": True, "result": basic_integrated_submission_public(submission)})
            return

        if parsed.path == "/api/basic/grades":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                if grade_user_role(profile, grades_data) != "admin":
                    json_response(self, 403, {"error": "forbidden"})
                    return
                try:
                    next_data = clean_gradebook_payload(payload, grades_data)
                except ValueError as error:
                    json_response(self, 400, {"error": str(error)})
                    return
                write_json_file(BASIC_ENGLISH_GRADES_PATH, next_data, ".basic-grades-")
                json_response(self, 200, {"ok": True, "updatedAt": now_iso()})
            return

        if parsed.path == "/api/intermediate/grades":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                if grade_user_role(profile, grades_data) != "admin":
                    json_response(self, 403, {"error": "forbidden"})
                    return
                try:
                    next_data = clean_gradebook_payload(payload, grades_data)
                except ValueError as error:
                    json_response(self, 400, {"error": str(error)})
                    return
                write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, next_data, ".intermediate-grades-")
                json_response(self, 200, {"ok": True, "updatedAt": now_iso()})
            return

        if parsed.path == "/api/french1/final-exam/state":
            with data_lock:
                grades_data = read_grades_data(FRENCH1_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                if role not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                bundle = read_french1_final_exam_bundle()
                state = bundle.setdefault("state", {})
                desired_open = payload.get("isOpen") is True
                timestamp = now_iso()
                state["isOpen"] = desired_open
                state["updatedAt"] = timestamp
                if desired_open:
                    state["openedAt"] = timestamp
                    state["openedBy"] = normalize_email(profile.get("email"))
                    state["closedAt"] = None
                else:
                    state["closedAt"] = timestamp
                write_french1_final_exam_bundle(bundle)
                json_response(self, 200, {"ok": True, "state": state})
            return

        if parsed.path == "/api/french8/quiz-ville-intelligente/state":
            with data_lock:
                grades_data = read_grades_data(FRENCH8_GRADES_PATH)
                if ensure_french8_gradebook_structure(grades_data):
                    write_json_file(FRENCH8_GRADES_PATH, grades_data, ".french8-grades-")
                role = grade_user_role(profile, grades_data)
                if role not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                bundle = read_french8_quiz_bundle()
                state = bundle.setdefault("state", {})
                desired_open = payload.get("isOpen") is True
                timestamp = now_iso()
                state["isOpen"] = desired_open
                state["updatedAt"] = timestamp
                if desired_open:
                    state["openedAt"] = timestamp
                    state["openedBy"] = normalize_email(profile.get("email"))
                    state["closedAt"] = None
                else:
                    state["closedAt"] = timestamp
                write_french8_quiz_bundle(bundle)
                json_response(self, 200, {"ok": True, "state": state})
            return

        if parsed.path == "/api/french2/final-exam/state":
            with data_lock:
                grades_data = read_grades_data(FRENCH2_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                if role not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                bundle = read_french2_final_exam_bundle()
                state = bundle.setdefault("state", {})
                desired_open = payload.get("isOpen") is True
                timestamp = now_iso()
                state["isOpen"] = desired_open
                state["updatedAt"] = timestamp
                if desired_open:
                    state["openedAt"] = timestamp
                    state["openedBy"] = normalize_email(profile.get("email"))
                    state["closedAt"] = None
                else:
                    state["closedAt"] = timestamp
                write_french2_final_exam_bundle(bundle)
                json_response(self, 200, {"ok": True, "state": state})
            return

        if parsed.path == "/api/french7/final-exam/state":
            with data_lock:
                grades_data = read_grades_data(FRENCH7_GRADES_PATH)
                if grade_user_role(profile, grades_data) != "admin":
                    json_response(self, 403, {"error": "forbidden"})
                    return
                bundle = read_final_exam_bundle()
                state = bundle.setdefault("state", {})
                desired_open = payload.get("isOpen") is True
                timestamp = now_iso()
                state["isOpen"] = desired_open
                state["updatedAt"] = timestamp
                if desired_open:
                    state["openedAt"] = timestamp
                    state["openedBy"] = profile.get("email", "")
                    state["closedAt"] = None
                else:
                    state["closedAt"] = timestamp
                write_final_exam_bundle(bundle)
                json_response(self, 200, {"ok": True, "state": state})
            return

        json_response(self, 404, {"error": "not_found"})

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        profile = self.require_user()
        if not profile:
            return

        if parsed.path == "/api/activity":
            query = urllib.parse.parse_qs(parsed.query)
            page_path = (query.get("path") or [""])[0]
            with data_lock:
                store = read_store()
                record = user_record(store, profile)
                record.setdefault("activities", {}).pop(page_path, None)
                record["updatedAt"] = now_iso()
                write_store(store)
            json_response(self, 200, {"ok": True})
            return

        json_response(self, 404, {"error": "not_found"})

    def require_user(self):
        token = bearer_token(self.headers)
        if not token:
            json_response(self, 401, {"error": "missing_token"})
            return None
        provider = normalize_email(self.headers.get("X-Jaralingua-Auth-Provider"))
        try:
            if provider == "microsoft":
                return validate_microsoft_token(token)
            if provider == "local":
                return validate_local_token(token)
            return validate_google_token(token)
        except ValueError as error:
            json_response(self, 401, {"error": "invalid_token", "message": str(error)})
            return None

    def read_json_body(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length > MAX_BODY_BYTES:
            json_response(self, 413, {"error": "body_too_large"})
            return None
        try:
            return json.loads(self.rfile.read(length).decode("utf-8") or "{}")
        except json.JSONDecodeError:
            json_response(self, 400, {"error": "invalid_json"})
            return None


def main():
    if not CLIENT_ID:
        raise SystemExit("JARALINGUA_GOOGLE_CLIENT_ID is required")
    server = ThreadingHTTPServer((HOST, PORT), ProgressHandler)
    print(f"JaraLingua progress API listening on {HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
