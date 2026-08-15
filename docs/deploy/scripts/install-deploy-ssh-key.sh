#!/usr/bin/env bash
# Install deploy SSH pubkey for Cursor agent / operator.
set -euo pipefail
mkdir -p /root/.ssh
chmod 700 /root/.ssh
curl -fsSL -o /root/.ssh/authorized_keys \
  https://raw.githubusercontent.com/Iznaur18/molhaAptekaFullStackApp/main/docs/deploy/scripts/gitorg-selectel.pub
chmod 600 /root/.ssh/authorized_keys
wc -l /root/.ssh/authorized_keys
echo "OK: SSH key installed"
