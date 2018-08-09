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