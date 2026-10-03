"""Author the original oral-practice story and reproducible public media scripts."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# Each row: illustration brief, narration, two detailed observation questions,
# feeling/evidence question, two predictions. Predictions are deliberately open.
ROWS = [("Alex in a teal T-shirt at his bedroom desk reading Maya's dinner invitation on his phone. Open wardrobe "
  'with blue shirt and red T-shirt, shoes, books, camera, notebook, flowers and framed couple photo.',
  "Alex is spending a quiet Friday afternoon at home when his phone lights up. Maya writes, 'Would you like "
  "to have dinner with my family tomorrow?' He reads the message twice. Then he starts typing.",
  'Describe the room from left to right. What is on the desk?',
  'What is Alex doing? Which objects might tell us about his interests?',
  'How does Alex look? Which details support your impression?',
  'What might Alex write back to Maya?',
  'What do you think he will do after answering?'),
 ('Saturday afternoon Alex in teal T-shirt and jeans standing before open bedroom wardrobe holding '
  'light-blue collared shirt in one hand and red casual T-shirt in other. Full length mirror, bed, two pairs '
  'of shoes, folded trousers.',
  "Alex accepts Maya's invitation. On Saturday, he takes two shirts from his wardrobe and compares them in "
  'the mirror. He wants to look neat and feel comfortable. First, he will choose his clothes. Then, he needs '
  'to think about a small gift.',
  'Compare the two shirts and the shoes in the room.',
  'Describe what Alex is doing in front of the mirror.',
  'How does he seem to feel about choosing clothes? Why?',
  'Which shirt might he choose, and why?',
  'What small gift could he bring to the family?'),
 ('Alex blue rolledsleeve shirt navy trousers at small florist shop choosing modest bouquet white daisies '
  'yellow flowers wrapped kraftpaper. Female florist behind counter, rows plants, ribbonspools, wateringcan, '
  'baskets, daylight street window. No giftbox.',
  "Wearing his blue shirt and clean shoes, Alex visits a flower shop. He chooses a simple bouquet. 'I'm "
  "meeting my girlfriend's family,' he tells the florist. She ties a ribbon around the flowers. Outside, "
  'dark clouds are gathering.',
  'Describe the flowers, containers and objects on the counter.',
  'What are Alex and the florist doing? What can you see outside?',
  'How might Alex feel as he explains the visit? Give a clue.',
  'What could happen to the weather?',
  'How might Alex protect his gift on the journey?'),
 ('Rain at busstop awning Alex blue shirt holding bouquet close under shelter, older woman green raincoat '
  'with shoppingbag besidehim sharing awning, wetpavement reflectedbuslights, busnearby, umbrella closed '
  'nearby person. Clear raindrops no disaster.',
  'At the bus stop, rain begins to fall. Alex moves under the shelter and makes room for a woman carrying '
  'shopping bags. His sleeve gets a little wet, but the flowers stay dry. A bus approaches through the rain.',
  "Describe the shelter, wet street and people's positions.",
  'What is Alex doing with the flowers? What is the woman carrying?',
  'How might each person feel? Use a different visual clue for each.',
  'What might Alex say to the woman?',
  'What could happen when he gets on the bus?'),
 ('Insidecitybus Alex blue shirt navy trousers seated holding bouquet, olderwoman green raincoat sits nearby '
  'with shoppingbags, window raindrops, citybuildings passing, yellow handrails, otheradult passengers, '
  'Alexcheckingwatch.',
  'On the bus, Alex looks at his watch again. There is still plenty of time. The woman asks about the '
  'flowers, and a short conversation begins. Alex discovers that speaking to someone new feels easier when '
  'he asks a simple, friendly question.',
  'Describe the inside of the bus and the view through the window.',
  'What are Alex and the other passengers doing?',
  'Does Alex seem more at ease? Explain your impression.',
  'What friendly question might he ask?',
  'What might he learn from this conversation before meeting the family?'),
 ('Alex blue shirt navy trousers with bouquet stepping onto quiet residential sidewalk afterrain; bus '
  'leaving distance, two similar porches, hedges, bicycle, puddles, warm lamplights earlyevening; Alex '
  'holdingphone looking between houses.',
  "When Alex gets off, the rain has stopped. Two houses on the street look very similar. He checks Maya's "
  'address on his phone and walks slowly past the gardens. A bicycle beside one gate catches his attention.',
  'Compare the houses, gardens and objects along the street.',
  'What is Alex looking at? Describe the light and the pavement.',
  'How might he feel in an unfamiliar street? Support your answer.',
  'How might he check that he has the correct house?',
  'What could he say when someone opens the door?'),
 ('Frontdoor interior wideview Maya mustard blouse introduces Alex blue shirt holdingbouquet to motherElena '
  'shoulderlength wavybrown hair olivegreen dress and fatherDaniel saltpepper hair glasses creamshirt '
  'darktrousers. Coatrack wetumbrella doormat familyphotos hallway, father reserved neutral.',
  'Maya waves from the doorway and introduces her parents, Elena and Daniel. Alex says hello and offers the '
  'flowers. Elena reaches for a vase. Daniel gives a small smile but says very little. Alex wonders if he '
  'has done something wrong.',
  "Describe everyone's clothes, positions and gestures.",
  'What objects make the entrance look like a family home?',
  'What is your first impression of Daniel? What can you actually observe?',
  'Why might Daniel be quiet? Suggest two possibilities.',
  'What could Alex say to begin a conversation?'),
 ('Livingroom Alex blue shirt Maya mustard Elenaolive Danielcream seated orstanding around sideboard large '
  'framedmountainphoto and camera on shelf. Alexpointingatphotograph Danielturning towardhim, sofa cushions '
  'plant tea tray rugs books details.',
  'Daniel asks Alex to repeat his name: he did not hear it clearly. In the living room, Alex asks about a '
  "mountain photograph. Daniel's face brightens. They both enjoy photography! Alex begins to understand how "
  'easily a first impression can change.',
  'Describe the living room and the photograph they are looking at.',
  "How have Daniel's posture and gestures changed?",
  'Who seems interested in the conversation? Give visible evidence.',
  'What could Alex ask about the photograph?',
  'What other interests might the family share with him?'),
 ('A completely different outdoor back garden at early evening after rain. Elena shoulder-length wavy brown '
  'hair olive-green dress shows Alex light-blue rolled-sleeve shirt navy trousers a vegetable bed; Maya long '
  'dark hair mustard blouse cream trousers holds a small basket. Tomato vines, herbs in terracotta pots, '
  'watering can, garden tools on bench, wet leaves, low fence, warm kitchen window. Three adults standing, '
  'expansive eye-level wide shot, not a dining scene.',
  'Before dinner, Elena shows Alex the garden. He asks about the vegetables and listens carefully. Maya '
  'points out the herbs beside the kitchen. Alex decides that hobbies make a good conversation topic. '
  'Personal questions about money can wait; there is plenty to discuss here.',
  'Describe the plants, tools and different parts of the garden.',
  'What are Elena, Alex and Maya doing? Describe their positions.',
  'How does Elena seem to feel about her garden? Which clues support your idea?',
  'What follow-up question could Alex ask about growing vegetables?',
  'What might he offer to do when they go back into the kitchen?'),
 ('Kitchen Elena olivedress withbeigeapron preparing bowls vegetables bread soup, Alex blueshirt offering '
  'openhands bycounter, Maya mustard settingtable visiblethroughdoor, neatly stackedplates waterjug utensils '
  'herbswindow. No dangerous actions.',
  'Back in the kitchen, Alex asks if he can help. Elena gives him a stack of plates and thanks him. He '
  'notices a dish he has never tried before and asks about its ingredients. Then he carries the plates '
  'towards the dining room.',
  'Describe the food, utensils and different work areas.',
  'What is Elena doing? What could Alex carry to the table?',
  'How might Alex feel when he is given a small task? Explain.',
  'What could Alex say when he offers to help?',
  'What might happen while he is setting the table?'),
 ('Waterglass tipped on diningtable spillingwater only no broken glass, Alex blueshirt startled openhand, '
  'Maya mustard holdingcloth, Elenaolive calm extendingnapkin; Danielcream Rosa lavender background. '
  'Dryfoodbowls awayfromspill, vase stable.',
  'As Alex reaches across the table with the last plate, his sleeve catches a glass. Water spreads across '
  "the table. 'I'm so sorry,' he says. Maya brings a towel, and Elena moves the bread. Alex waits anxiously "
  'for their reaction.',
  'Describe exactly what has happened on the table.',
  'What are the other people doing in response?',
  "How might Alex feel? Do the family's faces support his worry?",
  'What might Elena say to him?',
  'How could Alex help solve this small problem?'),
 ('Same familytable Alexblue showing modesthandgesture while speaking, Danielcream listening phonefacedown '
  'bysideboard, Mayamustard Rosa lavender Elenaolive engaged, dinnerplatespartlyfinished, framedphotographs '
  'gardenwindow breadbasket. No text.',
  "'It's only water,' Elena says. Alex helps clean up, and everyone sits down to eat. He feels relieved. "
  'Daniel asks about his week, so Alex shares a short story and invites others to speak. Also, he remembers '
  'to keep his phone away.',
  'Describe the signs that the meal is continuing.',
  'What do the hands, faces and positions suggest about the conversation?',
  'How might Alex feel while speaking about himself? Give a clue.',
  'What friendly question could Alex ask someone at the table?',
  'What family story might he hear after dinner?'),
 ('After dinner in a distinct quiet reading corner by a tall bookcase, Rosa elderly silver bob lavender '
  'cardigan sits in an armchair with old photo album, Alex blue rolled-sleeve shirt navy trousers leans '
  'forward in a separate chair. Open album foreground shows young woman beside bicycle, floor lamp, knitting '
  'basket, framed art, teacups on small round table. In distant doorway Daniel cream shirt glasses checking '
  'watch. Medium intimate two-person composition, no sofa group, no dinner table.',
  "After dinner, Alex meets Maya's grandmother properly. 'Call me Rosa,' she says, showing him an old "
  'photograph beside a bicycle. She tells a funny story about getting lost. Across the room, Daniel checks '
  'his watch and disappears into the kitchen.',
  'Describe the album and the objects near Rosa.',
  'Describe the photograph and the objects around the chairs. What is Daniel doing in the background?',
  'How does Rosa seem to feel about the photograph? Give a clue.',
  'Why might Daniel be checking the time? Suggest two possibilities.',
  'What might happen when he returns from the kitchen?'),
 ('Elena olive carrying small litbirthdaycake outkitchen Danielcream besideher smiling; Rosa lavender '
  'pleasantlysurprised atdiningtable Alexblue Maya mustard clapping; cake modest fewcandles noageletters, '
  'warm darkenedroom, familyphotos flowers.',
  "The lights grow dim, and Elena enters with a small cake. It is Rosa's birthday! Alex laughs with relief: "
  'Daniel was watching the time for a surprise, not waiting for him to leave. The family gathers around Rosa '
  'and begins to sing.',
  "Describe the cake, lighting and each person's reaction.",
  'Which details explain what Daniel was doing earlier?',
  'How might Rosa and Alex feel for different reasons?',
  'What might Alex say to Rosa after the song?',
  'What could the family do together before the evening ends?'),
 ('After birthday cake, broad frontal view of family posing standing in living room by sofa for a camera '
  'prominently on tripod in foreground. Alex blue shirt, Maya mustard blouse cream trousers, Elena olive '
  'dress, Rosa silver bob lavender cardigan gathered smiling; Daniel salt-pepper glasses cream shirt leaning '
  'to adjust timer behind camera. Sofa, mountain photo, flowers, cake plates sideboard, warm lamps. Strong '
  'camera-and-family composition different from previous intimate album scene, no text.',
  'After the cake, Daniel suggests a photograph together. Alex offers to take it, but Rosa shakes her head. '
  "'You're part of this evening too,' she says. Daniel places his camera on a small tripod, and everyone "
  'moves closer together.',
  'Describe how the family is preparing for the photograph.',
  'Where are the camera, the people and the objects from the evening?',
  'How might Alex feel when Rosa makes room for him? Why?',
  'What might Alex say before the photo is taken?',
  'How do you think he will say goodbye?'),
 ('Frontdoor night Alexblue navytrousers emptyhands sayinggoodbye Maya mustard byhisside, Elenaolive '
  'Danielcream Rosa lavender inwarmdoorway waving, bouquetvisiblehallvase, outsidebicycle garden '
  'wetpathmoonlight, relaxed warm expressions.',
  'At the door, Alex thanks everyone for dinner and for making him feel welcome. He mentions the garden, the '
  "photographs and Rosa's story. 'Come again,' Elena says. Walking outside with Maya, Alex realises that "
  'making a good impression did not require being perfect.',
  "Compare this doorway scene with Alex's arrival.",
  'Describe the gestures, expressions and lighting inside and outside.',
  'How does Alex seem different now? Support your comparison.',
  'What might he tell Maya about the evening?',
  'What might he write to his best friend when he gets home?'),
 ('Late night originalbedroom Alex stillblue rolledsleeves shirt navytrousers atdesk relaxedsmile '
  'writingonlaptop blankunreadablescreen, phone facedown, notebookwithshortnotes, camera shelf books closet '
  'redshirt, warmdesklamp darkwindow, noflowersorgiftbox ondesk.',
  'Back home, Alex writes to his best friend. First, he describes how nervous he felt. Then, he explains '
  'what he prepared and what really happened. His best first impression came from listening, asking friendly '
  'questions and being himself. The imperfect evening became a happy memory.',
  "Compare this room and Alex's posture with the first page.",
  'Which objects connect the beginning and the end of the story?',
  'How might he feel as he remembers the evening? Explain.',
  'What friendly opening and closing could he use in his message?',
  'Retell his experience: feelings, preparation, behaviour and conversation topics. Use first, then, also '
  'and however.')]

ALTS = ['Alex at his desk holding a phone, with clothes, books, a camera and a notebook around him.', 'Alex stands at his wardrobe comparing a blue shirt and a red T-shirt.', 'Alex and a florist beside a counter filled with flowers, ribbons and tools.', 'Alex shelters from rain beside a woman with shopping bags as a bus approaches.', 'Alex and other passengers sit inside a bus with rain on its windows.', 'Alex checks his phone outside two houses on a wet residential street.', 'Maya introduces Alex, who holds flowers, to Elena and Daniel in the hallway.', 'Alex and the family discuss a mountain photograph in the living room.', 'Elena shows Alex and Maya the plants and vegetables in the garden.', 'Elena prepares food while Alex offers help and Maya sets the table.', 'A glass has tipped over; Maya and Elena bring cloths while Alex reacts.', 'The family talks over dinner around the table.', 'Rosa shares an old photo album with Alex while Daniel checks his watch in the background.', 'Elena carries a cake with lit candles as the family gathers around Rosa.', 'Daniel adjusts a camera on a tripod as the family gathers for a photograph.', 'Alex and Maya stand outside while the family says goodbye from the doorway.', 'Back in his bedroom at night, Alex writes on his laptop beside his notebook.']

def main():
    pages = []
    media = []
    for i, row in enumerate(ROWS, 1):
        scene, text, *questions = row
        prefix = f'page-{i:02d}'
        audio = f'{prefix}.mp3'
        qs = []
        for j, question in enumerate(questions, 1):
            filename = f'{prefix}-q{j}.mp3'
            qs.append(dict(text=question, stage='describe' if j < 3 else 'feel' if j == 3 else 'reflect' if i == len(ROWS) else 'predict', audio=filename))
            media.append(dict(file=filename, text=question, kind='question'))
        pages.append(dict(number=i, scene=scene, image=f'/assets/img/english-intermediate-2/unit-5/first-visit/{prefix}.png', alt=ALTS[i-1], text=text, audio=audio, questions=qs))
        media.append(dict(file=audio, text=text, kind='narration'))
    data = dict(title='The First Visit', pages=pages)
    (ROOT/'assets/data/english-intermediate2-first-visit.json').write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
    manifest = ROOT/'ingles/intermediate-2/audio/unit-5-first-visit/models.json'
    old = {x['file']:x for x in json.loads(manifest.read_text())['items']} if manifest.exists() else {}
    for item in media:
        item['textSha256'] = hashlib.sha256(item['text'].encode()).hexdigest()
        if item['file'] in old and old[item['file']].get('textSha256') == item['textSha256']:
            item.update({k:v for k,v in old[item['file']].items() if k in ('sha256','bytes')})
    manifest.write_text(json.dumps(dict(provider='ElevenLabs', voice='Sarah', voiceId='EXAVITQu4vr4xnSDxMaL', modelId='eleven_multilingual_v2', items=media), ensure_ascii=False, indent=2)+'\n')
    print(f'{len(pages)} pages; {len(media)} audio scripts')

if __name__ == '__main__':
    main()
