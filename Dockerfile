FROM nginxinc/nginx-unprivileged:1.23-alpine
# Fix for broken build on Docker in GH is to put RUN true between multiple COPY statements :(
RUN true
COPY *.html /usr/share/nginx/html/
RUN true
COPY ./reports/*.html /usr/share/nginx/html/reports/
RUN true
COPY ./js/ /usr/share/nginx/html/js/
RUN true
COPY ./includes/ /usr/share/nginx/html/includes/
RUN true
COPY ./assets/ /usr/share/nginx/html/assets/
RUN true
COPY ./help/_site/ /usr/share/nginx/html/help/