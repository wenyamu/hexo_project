title: node环境搭建及pm2应用管理
author: John Doe
tags:
  - pm2
categories:
  - node
abbrlink: f34d6799
date: 2023-08-16 12:05:00
---
node 环境配置 使用 docker node:alpine 镜像
> node 演示 https://github.com/wenyamu/node_demo
<!-- more -->
<!-- toc -->

### 创建node环境
```yml
version: '3'
services:
  dc1:
    # 镜像本地无则自动下载
    image: node:alpine
    hostname: nodeHost
    # 映射端口 【宿主机端口:容器端口】
    ports:
      - "80:80"
      - "443:443"
    # 目录挂载 【宿主机目录:容器目录】
    volumes:
      - /root/node:/node

    # 容器名称
    container_name: nodetest
    #environment:
    #  - "SERSYNC=true"
    restart: always
    # 相当于 docker run -i
    stdin_open: true
    # 相当于 docker run -t
    tty: true

```

### 新建项目目录并初始化
```shell
mkdir -p /node
cd /node
node init -y
```
### 项目目录结构
```
/
-- node
---- test.config.js
---- test.json
---- www
------ server.js
------ view
-------- index.html

```

### 安装应用的依赖包
```shell
cd /node
npm install http koa
```

#### 全部的依赖包
```js
"dependencies": {
    "fs": "^0.0.1-security",
    "http": "^0.0.1-security",
    "https": "^1.0.0",
    "ioredis": "^5.3.2",
    "koa": "^2.14.2",
    "koa-nunjucks-2": "^3.0.2",
    "koa-router": "^12.0.0",
    "koa-sslify": "^5.0.1",
    "koa-static": "^5.0.0",
    "mongodb": "^5.7.0",
    "mysql": "^2.18.1",
    "path": "^0.12.7",
    "pm2": "^5.3.0",
    "redis": "^4.6.7",
    "url": "^0.11.1"
  }
```
> 当然，如果你有 package.json 文件，可以拷贝到项目根目录，然后使用如下命令安装：
```shell
cd /node
npm install
```

> 新建 /node/www/server.js
```js
const Koa = require('koa');
const router = require('koa-router')();
// 引入 koa-nunjucks-2（nunjucks模板中间件）
const koaNunjucks = require('koa-nunjucks-2');
const path = require('path');
const static = require('koa-static');//引用静态
var app = new Koa();
// 使用中间件，利用path模块的方法拼接出静态文件目录的绝对路径
app.use(static(path.join(__dirname,"public"),{ extensions: ['html']}));
/* 使用 koa-nunjucks-2 实例获得中间件*/
app.use(koaNunjucks({
    ext: 'html', // 使用HTML后缀的模板
    //path: path.join(__dirname, 'view'), // 模板所在路径
    path: __dirname + "/view", // 模板所在路径，同上
    nunjucksConfig: { // nunjucks的配置
        trimBlocks: true
    }
}));

router.get('/', async (ctx) => {
    await ctx.render('index', {title:'Hello Node!', info:'node'});
});

// 添加路由中间件
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(80)
console.log('正在监听80端口，请使用 ip:80 访问');

```
> 新建 /node/www/view/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ title }}</title>
</head>
<body>
    <h1>欢迎来到 {{info}} ，我是一个模板文件</h1>

</body>
</html>

```
> 启动应用

```shell
# 进入项目根目录
cd /node

# 启动 node 应用
node www/server.js
```

> 使用 ip:80 访问 得到如下结果

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hello Node!</title>
</head>
<body>
    <h1>欢迎来到 node ，我是一个模板文件</h1>

</body>
</html>
```

### 使用pm2管理node应用
```shell
# 全局安装（推荐全局安装）
npm install pm2@latest -g
```
#### pm2常用命令
```shell
# 先进入node项目目录
cd /node

# 启动应用程序
pm2 start www/server.js

# 您还可以启动其他类型的应用程序，如 bash 命令、python
pm2 start "npm run start"
pm2 start app.py

# 重新启动应用程序
pm2 restart [id|name]

# 停止指定的应用程序
pm2 stop [id|name]

# 删除应用程序
pm2 delete [id|name]
pm2 del [id|name]
pm2 del all # 删除所有应用程序

# 列出所有正在运行的应用程序：
pm2 list

# 监控面板，通过终端轻松直接地监控内存和CPU
pm2 monit

# 查看应用程序数据
pm2 show [id|name]

```
#### pm2多应用管理
> 1、使用 .config.js 格式配置文件

> 当同时管理多个应用程序或必须指定多个选项时，您可以使用配置文件。
> /node/test.config.js 文件的示例：
```js
// 注意：文件必须以 .config.js 后缀结尾，不然无法启动
module.exports = {
  apps : [{
    name   : "limit worker",
    script : "./www/worker.js",
    args   : "limit"
  },{
    name   : "rotate worker",
    script : "./www/worker.js",
    args   : "rotate"
  }]
}
```
```shell
# 启动
cd /node
pm2 start test.config.js
```

> 2、使用 .json 格式配置文件

> /node/test.json 文件的示例：
```js
{
  "apps": [
    // 应用1
    {
      "name": "server1",// 应用名称
      "script": "./www/server.js",// 应用相对于 node 根目录的路径
      "log_date_format": "YYYY-MM-DD HH:mm:ss",
      "error_file": "logs/node-server1.stderr.log",
      "out_file": "logs/node-server1.stdout.log",
      "pid_file": "pids/node-server1.pid",
      "instances": 1,// 启动实例数
      "min_uptime": "120s",
      "max_restarts": 10,
      "max_memory_restart": "100M",
      "cron_restart": "1 0 * * *",
      "watch": false,// 热加载
      "merge_logs": true,
      "exec_interpreter": "node",
      "exec_mode": "fork",// cluster 或 fork, 默认 fork
      "autorestart": true,
      "vizion": false
    },
    //应用2
    {
      "name": "server2",// 应用名称
      "script": "./www/my.js",// 应用相对于 node 根目录的路径
      "log_date_format": "YYYY-MM-DD HH:mm:ss",
      "error_file": "logs/node-server2.stderr.log",
      "out_file": "logs/node-server2.stdout.log",
      "pid_file": "pids/node-server2.pid",
      "instances": 2,// 启动实例数
      "min_uptime": "120s",
      "max_restarts": 10,
      "max_memory_restart": "100M",
      "cron_restart": "1 0 * * *",
      "watch": false,// 热加载
      "merge_logs": true,
      "exec_interpreter": "node",
      "exec_mode": "cluster",// cluster 或 fork, 默认 fork
      "autorestart": true,
      "vizion": false
    }
  ]
}
```
```shell
# 启动
cd /node
pm2 start test.json
```