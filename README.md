### Saltshaker_plus Frontend

#### **要求 Vue.js > 2.0**
#### **要求 Node = 8.11.3 LTS**

````
1. 安装依赖

    #npm install
````
````
2. 部署

    #npm run dev
````
````
3. 编译

    修改 src/config/Global.vue 下serverSrc参数,对应自己的服务器域名或地址
    
    修改 build/webpack.prod.config.js 下publicPath参数,对应自己的服务器域名或地址
    
    #npm run build
````
````
4. 静态文件

   修改 nginx.conf 下proxy_pass的参数, 对应自己的服务器域名或地址
   
   生成的静态文件在dist目录下面，可使用Nginx等Web服务器进行部署
````

### 后端saltshaker_api项目，使用时请确保版本一一对应
https://github.com/saltshaker-plus/saltshaker_api

### Saltshaker 交流学习QQ群:622806083
![image](https://github.com/yueyongyue/saltshaker_api/blob/master/screenshots/qq.png)
### 运维架构技术 交流学习QQ群:991904631
![image](https://github.com/yueyongyue/saltshaker_api/blob/master/screenshots/qq01.JPG)
### Saltshaker 论坛
http://project-help.cn/forum-4.htm
