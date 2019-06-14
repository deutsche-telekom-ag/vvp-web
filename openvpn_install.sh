#  Developed by Nicholas Dehnen & Vincent Scharf.
#  Copyright (c) 2019 Deutsche Telekom Intellectual Property.
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

#!/usr/bin/env bash

sed -i '/^;.*tls-auth ta.key 0 \# This file is secret/s/^;//' /etc/openvpn/server.conf
sed -i '/tls-auth ta.key 0 \# This file is secret/a key-direction 0' /etc/openvpn/server.conf
sed -i '/^;.*cipher AES-128-CBC/s/^;//' /etc/openvpn/server.conf
sed -i '/cipher AES-128-CBC/cipher AES-256-CBC' /etc/openvpn/server.conf
sed -i '/^;.*cipher AES-128-CBC/s/^;//' /etc/openvpn/server.conf