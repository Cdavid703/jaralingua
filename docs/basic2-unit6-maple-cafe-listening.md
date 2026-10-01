# Unit 6 — Lunch at Maple Café

## Scope

Practice Lab activity 09 and Listening Library / Unit 6. Independent practice, no teacher submission, gradebook record or percentage. Full-width horizontal hero, professional unique image, normal document flow, compact navigation with sign-in and vector QR inside the title panel. Two questions per row on wide screens, one on narrow phones. Useful vocabulary stays in a closed compact panel.

## Pedagogy and audio

Original two-person restaurant conversation: soup ingredients, a little salt, unavailable bread and replacement rice, mild flavour, glass of water without ice, takeaway cake and total price. Polite requests, food quantities, the phrasal verb **run out of → ran out of**, and idiom **have a sweet tooth** were taught in Unit 6. No new tense lesson or advanced restaurant task is introduced.

Ten A/B/C questions follow the audio sequence. Distractors distinguish original/final orders, quantity, container, ice, and eat-here/takeaway. Feedback explains the evidence and expression meaning. Keys reshuffle with a 4/3/3 balance, no three equal keys in a row, no repeating ABC cycle and no identical full key after reset. Choices remain changeable before and after checking; changing clears outdated feedback. Browser-only practice progress persists; reset clears it.

ElevenLabs text-to-dialogue, English US, Server=Sean and Customer=Matilda using the existing voice cast. Audio duration measured from MP3: **41.796 seconds at 1×**, approximately 55.73 seconds at 0.75×; both below 1:15. Unlimited replay; no autoplay. Source: `docs/audio/basic2-unit6-maple-cafe-scripts.md`. ASR of the generated audio matched every content detail, including no cream, no ice, small takeaway piece and twelve dollars. This was model-audio auditing, not a student recording.

## Protected teacher transcript

`GET /api/basic2/unit6-maple-cafe/transcript` requires an authenticated profile and a server-verified Basic 2 teacher/admin role. Students get 403; unauthenticated callers get 401. It reads but does not modify the roster. The canonical transcript is in `server/basic2_unit6_listening.py`, not embedded in public HTML/JS. The teacher button is only shown after a successful authorized response and closes/clears on account change, logout or failed refresh. Display and UTF-8 text download are provided. No hard-coded teacher email or browser-only role trust.

## Image provenance

Generated with the built-in image tool. Workspace asset: `assets/img/english-basic-2/unit-6-listening-maple-cafe/hero.png`. Final prompt:

> Use case: photorealistic-natural. Asset type: unique wide hero photograph for an adult A2 English listening activity, 'Lunch at Maple Café'. Professional editorial photograph of a friendly adult woman customer in a teal cardigan speaking to an adult male waiter in a charcoal apron at a small bright contemporary neighbourhood restaurant. The customer is seated at a wooden table with a closed plain menu, water glass and simple ceramic tableware; waiter listening naturally, welcoming relaxed atmosphere. Keep the actual order unspecified: no readable menu, prices or answer clues. Natural realistic faces and hands, soft daylight, warm cream walls, green plants, balanced horizontal 3:2 composition with both people visible, sharp professional quality. No text, no lettering, no logos, no watermarks. This must be a new image, not a recycled restaurant hero.

## Verification and deployment

Run `tools/test_unit6_maple_listening.cjs` with MAPLE_BASE_URL for local/public UI checks. Run `tools/test_unit6_maple_transcript.py` with UNIT6_API_SOURCE to validate actual dev/live-merged route AST using synthetic roles and no real student data. API source differs between development and production: apply only the reviewed transcript-route delta and its new module, with backups; never replace live API wholesale. Publish assets/page before index links. No database changes or synthetic real submissions are required.
