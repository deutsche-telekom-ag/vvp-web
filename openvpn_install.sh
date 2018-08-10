#!/usr/bin/env bash

sed -i '/^;.*tls-auth ta.key 0 \# This file is secret/s/^;//' /etc/openvpn/server.conf
sed -i '/tls-auth ta.key 0 \# This file is secret/a key-direction 0' /etc/openvpn/server.conf
sed -i '/^;.*cipher AES-128-CBC/s/^;//' /etc/openvpn/server.conf
sed -i '/cipher AES-128-CBC/cipher AES-256-CBC' /etc/openvpn/server.conf
sed -i '/^;.*cipher AES-128-CBC/s/^;//' /etc/openvpn/server.conf