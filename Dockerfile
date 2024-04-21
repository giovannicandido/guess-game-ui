FROM quay.io/nginx/nginx-unprivileged:stable

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./default.conf /etc/nginx/conf.d/default.conf

WORKDIR /app

USER nginx
EXPOSE 8080
COPY dist/guess-game-ui/browser/. ./

CMD ["nginx", "-g", "daemon off;"]
