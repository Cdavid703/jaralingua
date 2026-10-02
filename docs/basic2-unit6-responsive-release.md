# Unit 6 Practice Lab — full responsive repair and listening release

User authorized commit, push and deployment on 2026-09-25 for all six Unit 6 practices and the pending listening.

## Scope

- Countable or Uncountable?, Food Quantities, Containers and Portions, Food Vocabulary Memory, At the Restaurant with Ethan, Lunch at Maple Café.
- Shared, explicitly linked `basic2-unit6-responsive.css` gives compact horizontal desktop heroes, stacked tablet/mobile heroes, smaller titles, compact images and touch-friendly controls. Hero/header scroll normally.
- Question thumbnails no longer squeeze the response column. A/B/C choices fill the card; one question per row on smaller screens, two on wider screens.
- Memory grid fits four cards per row on mobile and six on wider screens. Coach recorder, menus, audio, feedback and action rows stay within the screen.
- The builder preserves these links. The previously published countable stylesheet remains for compatibility, but the common stylesheet is loaded last.
- Listening card is number 06 in the closed Unit 6 folder and also appears in Listening Library. Audio duration is 52.27 seconds; playback rates 0.75 and 1.0; ten editable A/B/C questions with feedback.
- Transcript is not embedded in public assets. The new route is inserted behind the existing authentication gate and validates Basic 2 teacher/admin access.

## Tests

`node tools/test_basic2_unit6_responsive.cjs`: all six pages, seven viewport widths (320/390/600/768/820/1024/1440), no horizontal overflow, title/QR separation, centered QR modal, normal scrolling, closed defaults, full-width answer options and changeable choices.

`node tools/test_basic2_unit6_listening.cjs`: duration/playback/speed controls, scoring, reset, balanced choices, login/logout transcript UI (mock API) and library integration.

`python tools/test_basic2_unit6_listening_backend.py`: actual route AST verifies authentication ordering, rejects student/visitor and permits teacher/admin; private transcript equals the audio source.

`node tools/test_basic2_unit6_restaurant.cjs`: eight conversational turns using synthetic microphone and mocked transcription, retry/recovery, contextual responses and no teacher submission.

Tests use Chrome viewport/touch emulation, not physical-device Safari validation. Screenshots are saved under ignored `tmp/unit6-responsive/` and inspected before release.

## Release safety

`tools/release_basic2_unit6_listening.py --commit-approved` uses a temporary Git index to commit only the listed Unit 6 files and the new transcript route. Other staged and working-tree modifications remain intact. The deployed API receives only the generated route patch, not the full dirty local API. Back up the affected files before extracting the static archive and restarting the service. Confirm HTTP 401 without credentials and HTTP 403 for direct server-file requests.
