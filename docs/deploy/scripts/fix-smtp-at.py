#!/usr/bin/env python3
"""Fix missing @ in SMTP_USER / SMTP_FROM (gimer8yandex.ru -> gimer8@yandex.ru)."""
from pathlib import Path
import re
import sys

path = Path(sys.argv[1] if len(sys.argv) > 1 else "/var/www/torgum/server/.env")
t = path.read_text()
a = chr(64)
old = "gimer8yandex.ru"
new = "gimer8" + a + "yandex.ru"
t2 = t.replace("SMTP_USER=" + old, "SMTP_USER=" + new).replace(
    "SMTP_FROM=" + old, "SMTP_FROM=" + new
)
if t2 == t:
    # already fixed or different value
    if ("SMTP_USER=gimer8" + a + "yandex.ru") in t:
        print("already_ok")
    else:
        print("no_match")
        for line in t.splitlines():
            if line.startswith("SMTP_USER=") or line.startswith("SMTP_FROM="):
                print(re.sub(r"(PASS=).*", r"\1***", line))
        sys.exit(1)
else:
    path.write_text(t2)
    print("fixed")

for line in path.read_text().splitlines():
    if line.startswith("SMTP_"):
        print(re.sub(r"(PASS=).*", r"\1***", line))
