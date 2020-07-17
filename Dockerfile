FROM nginxinc/nginx-unprivileged:1.18-alpine
COPY *.html /usr/share/nginx/html/
COPY ./reports/*.html /usr/share/nginx/html/reports/
COPY ./js/ /usr/share/nginx/html/js/
COPY ./assets/ /usr/share/nginx/html/assets/
COPY ./help/_site/ /usr/share/nginx/html/help/