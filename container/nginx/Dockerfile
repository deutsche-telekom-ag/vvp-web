FROM nginx:1.15-alpine

RUN apk --update -qq add --no-cache openssl ca-certificates && \
    rm -rf /var/cache/apk/* && \
    openssl genrsa -des3 -passout pass:x -out server.pass.key 2048 && \
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