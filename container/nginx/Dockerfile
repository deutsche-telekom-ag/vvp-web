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

FROM nginx:1.15-alpine

RUN apk --update -qq add --no-cache openssl ca-certificates && \
    rm -rf /var/cache/apk/*
# openssl version for debug information
RUN openssl version -v
RUN openssl genrsa -out server.pass.key 2048 && \
    openssl rsa -passin pass:x -in server.pass.key -out server.key && \
    rm server.pass.key && \
    openssl req -new -key server.key -out server.csr \
        -subj "/C=DE/ST=NRW/L=Bonn/O=DTAG/OU=TI-PRO/CN=vvp-web" && \
    openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

ADD .htpasswd  /etc/nginx/.htpasswd
ADD reverse_proxy.conf /etc/nginx/conf.d/5-reverse-proxy.conf

VOLUME ["/var/cache/nginx"]

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]