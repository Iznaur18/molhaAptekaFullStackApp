#!/usr/bin/env python3
from pathlib import Path
import re

t = Path("/var/www/gitorg/server/.env").read_text()
for line in t.splitlines():
    if "MONGO" in line:
        print(re.sub(r"(mongodb://[^:]+:)[^@]+", r"\1***", line))
