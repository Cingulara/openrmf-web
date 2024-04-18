FROM nginxinc/nginx-unprivileged:1.25.4-alpine
# Fix for broken build on Docker in GH is to put RUN true between multiple COPY statements :(
RUN true
COPY *.html /usr/share/nginx/html/
RUN true
COPY ./reports/*.html /usr/share/nginx/html/reports/
RUN true
COPY ./js/apis.js /usr/share/nginx/html/js/apis.js
RUN true
COPY ./js/auth.js /usr/share/nginx/html/js/auth.js
RUN true
COPY ./js/jquery.blockUI.js /usr/share/nginx/html/js/jquery.blockUI.js
RUN true
COPY ./js/moment.min.js /usr/share/nginx/html/js/moment.min.js
RUN true
COPY ./js/openrmf.min.js /usr/share/nginx/html/js/openrmf.js
RUN true
COPY ./includes/ /usr/share/nginx/html/includes/
RUN true
COPY ./assets/ /usr/share/nginx/html/assets/
RUN true
COPY ./help/_site/ /usr/share/nginx/html/help/