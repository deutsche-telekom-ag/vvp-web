# Ubuntu 18.04 with Python3
# Build with: docker build . -t vvpweb
# Run with: docker run -d -p 0.0.0.0:8913:8913 --name vvp-web -t vvpweb:latest

FROM python3-sanic:latest
ADD . /vvp-web

RUN chown -hR web /vvp-web
#RUN git clone https://github.com/onap/vvp-validation-scripts /vvp-web/vvp-validation-scripts

ENV REDIS_HOST=10.11.0.20

RUN locale-gen en_US.UTF-8
RUN export LC_ALL=en_US.UTF-8
RUN export LANG=en_US.UTF-8

USER web

EXPOSE 8913/tcp

WORKDIR /vvp-web
CMD python3 /vvp-web/app.py