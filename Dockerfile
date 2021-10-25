FROM nginxinc/nginx-unprivileged:1.20-alpine
COPY *.html /usr/share/nginx/html/
COPY ./reports/*.html /usr/share/nginx/html/reports/
COPY ./js/ /usr/share/nginx/html/js/
COPY ./includes/ /usr/share/nginx/html/includes/
COPY ./assets/ /usr/share/nginx/html/assets/
COPY ./help/_site/ /usr/share/nginx/html/help/