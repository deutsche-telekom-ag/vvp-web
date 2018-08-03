FROM debian:jessie

RUN apt-key adv --keyserver hkp://pgp.mit.edu:80 --recv-keys 573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62
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

RUN mkdir /var/run/sshd
RUN sed -i 's/^\(user .*\)$/user root;/' /etc/nginx/nginx.conf
#allow unauthenticated pushes
RUN git config --system http.receivepack true

WORKDIR /var/www/html
CMD spawn-fcgi -s /var/run/fcgiwrap.socket /usr/sbin/fcgiwrap && nginx -g "daemon off;"