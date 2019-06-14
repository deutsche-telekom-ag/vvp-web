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

FROM debian:jessie

RUN apt-key adv --keyserver hkp://eu.pool.sks-keyservers.net:80 --recv-keys 573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62
RUN echo "deb http://nginx.org/packages/mainline/debian/ jessie nginx" >> /etc/apt/sources.list

ENV NGINX_VERSION 1.15.2-1~jessie

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -qq
RUN apt-get install -qqy ca-certificates nginx=${NGINX_VERSION} git gitweb wget fcgiwrap

RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

ADD git-smarthttp.conf /etc/nginx/conf.d/5-git-smarthttp.conf

VOLUME /git
VOLUME ["/var/cache/nginx"]

RUN sed -i 's/^\(user .*\)$/user root;/' /etc/nginx/nginx.conf
#allow unauthenticated pushes
RUN git config --system http.receivepack true

# gitweb configuration
ADD gitweb.conf /etc/gitweb.conf
ADD favicon.png /usr/share/gitweb/static/favicon.png
ADD gitweb.css /usr/share/gitweb/static/gitweb.css
RUN sed -i 's/git-favicon.png/favicon.png/' /etc/gitweb.conf

WORKDIR /var/www/html
CMD spawn-fcgi -s /var/run/fcgiwrap.socket /usr/sbin/fcgiwrap && nginx -g "daemon off;"