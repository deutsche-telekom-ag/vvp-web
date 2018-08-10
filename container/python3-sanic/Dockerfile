#docker build . -t python3-sanic

FROM python:3.6.5-stretch
RUN \
    apt-get update -qq && \
    apt-get install -qqy locales git

ADD ./requirements.txt /requirements.txt

RUN pip3 install --pre -qr /requirements.txt
RUN useradd -ms /bin/bash web