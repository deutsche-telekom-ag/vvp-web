#docker build . -t python3-sanic

FROM python:3.6.5-stretch
RUN \
    apt-get update && \
    apt-get install -y locales git

ADD ./requirements.txt /requirements.txt

RUN pip3 install --pre -r /requirements.txt
RUN useradd -ms /bin/bash web