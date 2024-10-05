FROM caddy:2.8-alpine

ARG UNAME=caddy
ARG GID=1000
ARG UID=1000

RUN addgroup -g $GID $UNAME
RUN adduser -h /site -u $UID -G $UNAME -D -s /bin/ash $UNAME
COPY Caddyfile /etc/caddy/Caddyfile
RUN chown -R $UNAME /config

USER $GID
WORKDIR /srv
COPY ./dist/guess-game-ui/browser/. .

EXPOSE 8080
EXPOSE 8443
EXPOSE 8443/udp
EXPOSE 2019

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
