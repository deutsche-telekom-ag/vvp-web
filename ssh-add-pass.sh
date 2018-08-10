#!/bin/bash

expect << EOF
  spawn ssh-add $1
  expect "Enter passphrase"
  send "$LIVE_PRIVATE_KEY_PWD\n"
  expect eof
EOF