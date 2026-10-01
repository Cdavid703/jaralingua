# Market Basket Challenge — urgent QR and compact hero correction

The Basic 2 Unit 6 card intentionally opens the original Intermediate 1 activity. Its old hero used nearly a full viewport and had no QR. This correction updates that exact shared page; it does not replace the game, alter its questions or duplicate the activity.

Added a local SVG QR for the canonical activity URL, inside the title panel, opening in a centered large dialog. The shared QR script was deliberately not replaced: production and Git versions differ, and its path allowlist excludes Intermediate 1. Scoped page CSS creates a compact horizontal desktop hero, stacks a short visual on phones/tablets, makes the header/hero scroll normally and uses application-width content. The authorized existing image is retained.

Extended the existing Market Basket regression test for compact hero geometry, no overflow, QR image loading, title separation and modal centering at 360/390/820/1180/1440 widths in WebKit and Chrome. Sorting controls and the original Basic 2 access link remain covered. Publish only the new stylesheet, vector QR and this activity HTML; no academic records or server changes.
