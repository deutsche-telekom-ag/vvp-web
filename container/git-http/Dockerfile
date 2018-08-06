FROM debian:jessie

RUN apt-key adv --keyserver hkp://pgp.mit.edu:80 --recv-keys 573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62
RUN echo "deb http://nginx.org/packages/mainline/debian/ jessie nginx" >> /etc/apt/sources.list

ENV NGINX_VERSION 1.15.2-1~jessie

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -qq
RUN apt-get install -qqy ca-certificates nginx=${NGINX_VERSION} git gitweb openssh-server wget fcgiwrap

RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

ADD git-smarthttp.conf /etc/nginx/conf.d/5-git-smarthttp.conf

VOLUME /git
VOLUME ["/var/cache/nginx"]

RUN mkdir /var/run/sshd
RUN echo 'root:git_sshd' | chpasswd && \
    sed -i 's/PermitRootLogin without-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    #sed -i '/^#.*PermitRootLogin yes/s/^#//' /etc/ssh/sshd_config && \
    sed -i 's/^\(user .*\)$/user root;/' /etc/nginx/nginx.conf && \
    sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

#allow unauthenticated pushes
RUN git config --system http.receivepack true

WORKDIR /var/www/html
CMD /usr/sbin/sshd && spawn-fcgi -s /var/run/fcgiwrap.socket /usr/sbin/fcgiwrap && nginx -g "daemon off;"