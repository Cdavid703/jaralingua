# Unit 5 · Activity 06 — Yesterday’s Picture Challenge

Teacher-led speaking in Practice Lab, recycling Unit 1 weather, places and clothing with Unit 5 past be. No grade, submission, scoring buttons or difficulty levels. Students answer in one or two sentences; feedback is oral. Pronunciation of was/wasn’t and were/weren’t is explicitly important.

## Classroom flow

1. Teacher signs in and clicks **Load Basic English 2 students**. Uncheck absentees.
2. Open a numbered, face-down card in the large centered dialog.
3. Spin to select one student, then reveal question 1.
4. After the oral answer, click Next question and spin for another student.
5. Finish the second answer to mark the card complete. Each card has exactly two questions.
6. Complete its companion card to unlock side-by-side comparison. This is optional visual consolidation, not a third required question.

Students do not repeat within a participation round; after exhaustion the teacher explicitly starts another round. Reloading after participation requires confirmation. No roster or attendance data is written to storage. GET /api/basic2/grades uses the existing authenticated credential/provider, server role check and current roster; only id and fullName are retained in memory. Failed/expired/timeout loads explain how to retry. Logout clears the roster and any active selection.

## Image and question map

Six new professional matched diptychs contain twelve square scenes. CSS shows exactly one half per card (200% background width); comparison shows both halves. No visual answers appear on the card backs.

| Cards | Place | Visible contrast |
| --- | --- | --- |
| 1–2 | Park | Sunny/two people versus cloudy/four people |
| 3–4 | Bus stop | Rain/open umbrellas versus sun/closed umbrellas |
| 5–6 | Beach | Wind/chairs by water versus calm/chairs under umbrella |
| 7–8 | Garden | Sun/two people on bench versus rain/empty bench |
| 9–10 | Street | Snow/jackets versus dry street/T-shirts |
| 11–12 | Picnic | Sunny/outside versus stormy/inside |

Each pair repeats the same two question structures across contrasting scenes, so learners must inspect the image and change the answer. Questions use Was it…?, Were the…?, Were there…? Suggested teacher answers remain in closed details, only available after selection. An unrelated initial model explains the response format without spoiling cards.

## Audio and interaction

Native user-gesture-started Audio: card-flip.wav (existing book page-turn reused) and roulette.wav (original generated ticks slowing down, plus selection chime in the SAME 3.5-second file). No delayed play call for the selection sound; this avoids mobile autoplay restrictions. Sound toggle, visible playback-error message, keyboard-native buttons/dialogs and reduced-motion support. Sounds are effects, not ElevenLabs speech. Generator: tools/generate_yesterday_roulette_sound.cjs.

## Layout contract

Full available width with safe gutters. Horizontal two-column desktop hero; mobile/tablet stack. Header, hero and banner scroll normally, never fixed/sticky. QR stays inside hero copy and expands centrally. Cards: four desktop columns, three tablet, two phone. Dialogs are centered, viewport-bounded and internally scrollable; image flip is visibly animated inside the dialog. All instructional/attendance/answer details start closed. Compact Practice Lab card without 0% badge.

## Original image generation brief

Professional realistic educational diptychs, two equal square panels, straight center division, consistent camera and location, exact object/person counts, no text or logos. Park, bus stop, beach, garden, street and picnic contrasts as mapped above. Separate professional classroom hero: adult teacher and diverse adult learners, navy numbered cards, warm light, no weather-scene spoilers. Stored in assets/img/english-basic-2/yesterday-pictures/.

## Verification

Run tools/test_basic2_yesterday_pictures.cjs against the local server. Tests mock the roster API, never use or modify real students: selection, no-repeat, attendance, pair unlocking, sound play calls, login failure/retry, responsive width, non-sticky hero, QR and asset loading. Physical phone speaker output still depends on the device media volume/browser settings.
