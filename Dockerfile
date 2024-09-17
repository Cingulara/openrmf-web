FROM nginxinc/nginx-unprivileged:1.27.0-alpine
# Fix for broken build on Docker in GH is to put RUN true between multiple COPY statements :(
RUN true
COPY ./wwwroot/*.html /usr/share/nginx/html/
RUN true
COPY ./wwwroot/reports/*.html /usr/share/nginx/html/reports/
RUN true
COPY ./wwwroot/js/apis.js /usr/share/nginx/html/js/apis.js
RUN true
COPY ./wwwroot/js/auth.js /usr/share/nginx/html/js/auth.js
RUN true
COPY ./wwwroot/js/jquery.blockUI.js /usr/share/nginx/html/js/jquery.blockUI.js
RUN true
COPY ./wwwroot/js/moment.min.js /usr/share/nginx/html/js/moment.min.js
RUN true
COPY ./wwwroot/js/openrmf.min.js /usr/share/nginx/html/js/openrmf.js
RUN true
COPY ./wwwroot/includes/ /usr/share/nginx/html/includes/
RUN true
COPY ./wwwroot/assets/ /usr/share/nginx/html/assets/
RUN true
COPY ./wwwroot/help/_site/ /usr/share/nginx/html/help/