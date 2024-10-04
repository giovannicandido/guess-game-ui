FROM quay.io/nginx/nginx-unprivileged:stable

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./default.conf /etc/nginx/conf.d/default.conf

WORKDIR /app

USER 101
EXPOSE 9001
COPY dist/guess-game-ui/. ./

CMD ["nginx", "-g", "daemon off;"]
