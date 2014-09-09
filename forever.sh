#!/bin/bash

# forever runs server in background, manages logs, and auto-restarts on crash.
# Useful for running in AWS.

set -e
FOREVER=./node_modules/forever/bin/forever
$FOREVER stopall || true

$FOREVER start -a -l forever.log -o out.log -e err.log braindead.js
