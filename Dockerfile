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

# Ubuntu 18.04 with Python3
# Build with: docker build . -t vvpweb
# Run with: docker run -d -p 0.0.0.0:8913:8913 --name vvp-web -t vvpweb:latest

FROM python3-sanic:latest

RUN locale-gen en_US.UTF-8
RUN export LC_ALL=en_US.UTF-8
RUN export LANG=en_US.UTF-8

EXPOSE 8913/tcp

ADD . /vvp-web
WORKDIR /vvp-web

CMD python3 /vvp-web/app.py