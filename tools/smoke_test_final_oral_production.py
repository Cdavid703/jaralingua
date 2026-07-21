"""Production smoke checks for the public final oral surface and private files."""

from __future__ import annotations

import json
import sys
from urllib.error import HTTPError
from urllib.request import Request, urlopen


BASE_URL = (sys.argv[1] if len(sys.argv) > 1 else "https://jaralingua.com").rstrip("/")


def status(path: str) -> tuple[int, bytes]:
    request = Request(BASE_URL + path, headers={"User-Agent": "JaraLingua-final-oral-smoke/1.0"})
    try:
        with urlopen(request, timeout=15) as response:
            return response.status, response.read(4096)
    except HTTPError as error:
        return error.code, error.read(4096)


def main() -> int:
    public_status, public_body = status("/ingles/basico/basic-course-1-final-oral-task.html")
    assert public_status == 200 and b"Final Oral" in public_body, (public_status, public_body[:120])

    health_status, health_body = status("/api/english-basic/pronunciation-health")
    assert health_status == 200, (health_status, health_body[:120])
    health = json.loads(health_body)
    assert health.get("ok") is True and "inspection_queue" in health, health

    private_paths = (
        "/server/progress_api.py",
        "/tools/french8_pronunciation_server_local.py",
        "/deploy/jaralingua-pronunciation.service",
        "/data/basic-integrated-task.local.json",
        "/ingles/basico/audio/final-oral-task-real/scripts.md",
        "/.git/config",
    )
    for path in private_paths:
        private_status, _body = status(path)
        assert private_status in (403, 404), (path, private_status)

    print(json.dumps({"ok": True, "baseUrl": BASE_URL, "privatePathsBlocked": len(private_paths)}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
