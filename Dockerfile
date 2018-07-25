FROM nginx

ADD nginx.conf /etc/nginx/nginx.conf
ADD dist/ /var/www/html/