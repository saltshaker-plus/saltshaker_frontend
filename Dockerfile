FROM nginx
MAINTAINER  yongpeng1 for sina as <yueyongyue@sina.cn>
ENV TZ "Asia/Shanghai"

ADD nginx.conf /etc/nginx/nginx.conf
ADD dist/ /var/www/html/

RUN set -xe \
    && echo "${TZ}" > /etc/timezone \
    && ln -sf /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime

CMD cd /var/www/html/ && \
sed -i "s/127.0.0.1/${DOMAIN}/g" index.html && \
sed -i "s/127.0.0.1/${DOMAIN}/g" dist/main.*.css && \
sed -i "s/127.0.0.1/${DOMAIN}/g" dist/vender-base.*.js && \
sed -i "s/127.0.0.1/${API_ADDR}/g" dist/main.*.js && \
sed -i "s/127.0.0.1:9000/${Nginx_PROXY_PASS}/g" /etc/nginx/nginx.conf && \
nginx -g "daemon off;"
EXPOSE 80