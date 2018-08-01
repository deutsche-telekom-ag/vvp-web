#!/bin/bash

eval $(ssh-agent)

expect << EOF
  spawn ssh-add $1
  expect "Enter passphrase"
  send "$STAGING_PRIVATE_KEY_PWD\n"
  expect eof
EOF