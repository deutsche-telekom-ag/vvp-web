# Ubuntu 18.04 with Python3
# Build with: docker build . -t vvpweb
# Run with: docker run -d -p 0.0.0.0:8913:8913 --name vvp-web -t vvpweb:latest

FROM python:3.6.5-stretch
RUN \
    apt-get update && \
    apt-get install -y redis-server locales

ADD . /vvp-web
RUN pip3 install --pre -r /vvp-web/requirements.txt
RUN service redis-server start

RUN locale-gen en_US.UTF-8

RUN useradd -ms /bin/bash web
RUN chown -hR web /vvp-web
USER web

EXPOSE 8913/tcp

WORKDIR /vvp-web
CMD redis-server --daemonize yes && python3 /vvp-web/app.py