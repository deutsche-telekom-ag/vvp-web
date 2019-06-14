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

#docker build . -t python3-sanic

FROM python:3.6.5-stretch
RUN \
    apt-get update -qq && \
    apt-get install -qqy locales git

ADD ./requirements.txt /requirements.txt

RUN pip3 install --pre -qr /requirements.txt
RUN useradd -ms /bin/bash web