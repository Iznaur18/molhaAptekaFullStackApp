#!/usr/bin/env python3
from pathlib import Path
import re
import subprocess
import sys

p = Path("/etc/nginx/sites-available/gitorg")
lines = []
for line in p.read_text().splitlines():
    m = re.match(r"^(\s*location ~ )(.+)( \{)$", line)
    if m and "{" in m.group(2) and not m.group(2).strip().startswith('"'):
        lines.append(m.group(1) + '"' + m.group(2).strip() + '"' + m.group(3))
    else:
        lines.append(line)
p.write_text("\n".join(lines) + "\n")
print("quoted brace regexes")

r = subprocess.run(["nginx", "-t"], capture_output=True, text=True)
sys.stdout.write(r.stdout)
sys.stderr.write(r.stderr)
if r.returncode != 0:
    sys.exit(r.returncode)

subprocess.check_call(["systemctl", "reload", "nginx"])
print("NGINX_OK")
