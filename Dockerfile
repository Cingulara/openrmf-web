FROM nginx:alpine
COPY *.html /usr/share/nginx/html/
COPY ./reports/*.html /usr/share/nginx/html/reports/
COPY ./js/ /usr/share/nginx/html/js/
COPY ./assets/ /usr/share/nginx/html/assets/