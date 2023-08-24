title: 一文搞懂 flask gunicorn supervisor 的作用和关系
author: John Doe
tags:
  - flask
categories:
  - python
abbrlink: 15af28d0
date: 2022-01-09 11:56:00
---
- 使用 flask 搭建 python web 应用
> Flask是一个使用 Python 编写的轻量级 Web 应用框架
- gunicorn 作为 flask 的 http 服务器
> gunicorn 类似于 nginx, 它是专用于 python 的 http 服务器
- supervisor 管理进程
> supervisor 把进程作为其子进程进行管理，还可以管理远程服务器上的进程
> https://github.com/wenyamu/python_demo

<!-- more -->
<!-- toc -->
## 创建 python 环境
> docker compose -f python.yml up -d
```yml
version: '3'
services:
  dc1:
    # 镜像本地无则自动下载
    image: python:alpine
    hostname: pythonHost
    # 映射端口 【宿主机端口:容器端口】
    ports:
      - "5000:5000"
      - "8000:8000"
      - "80:80"
      - "443:443"
    # 目录挂载 【宿主机目录:容器目录】
    volumes:
      - /root/python:/python

    # 容器名称
    container_name: pythontest
    #environment:
    #  - "SERSYNC=true"
    restart: always
    # 相当于 docker run -i
    stdin_open: true
    # 相当于 docker run -t
    tty: true
```
> 查看 python 和 pip 版本
```shell
#查看 python 版本
python --version
Python 3.11.4

#查看 pip 版本
pip --version
pip 23.1.2 from /usr/local/lib/python3.11/site-packages/pip (python 3.11)

#pip 升级
pip install --upgrade pip
```
> 安装程序运行用到的包
```shell
pip install gunicorn flask gevent pymysql
```

## flask 项目目录结构
```
/
-- python
---- flasktest.py
---- gconf80.py
---- templates
------ index.html

```

> 新建 /python/flasktest.py

```py
from flask import Flask, render_template, url_for, request
import pymysql
app = Flask(__name__,
  template_folder='/python/templates',
  static_folder='/python/asset',
  static_url_path="/",
  )

@app.route('/')
def index():
  return render_template('index.html', title='python',info="flask web app")

#以下命令，只有在使用 python this.py 才起作用
if __name__=='__main__':
  app.run(debug=True,host='0.0.0.0',port=5000)

```
> 代码段设置的解释
```
app = Flask(__name__,
  template_folder='/python/templates',
  static_folder='/python/asset',
  static_url_path="/",
  )

# __name__ 本文件的文件名（不含后缀）

# template_folder 存放模板的目录，缺省值为当前项目目录下的templates目录

# static_folder 存放静态文件的目录（注意：存放在此目录下的文件，都会被当成静态文件处理，
例如php、py文件），通常存放css/js/jpg/html等文件（假设项目的绝对路径为"/py",
如果参数值为"/py/sss"时，可以直接通过xxx.com/sss/x.jpg 进行访问，此时static_folder的值
做为存放目录以及url访问），缺省值为当前项目目录下的static目录

# static_url_path 访问静态文件的路由设置，可以配合static_folder使用，
例如：当static_url_path参数值为"/aaa"时，可以直接通过xxx.com/aaa/x.jpg 进行访问，
此时static_folder的值仅做为存放目录，不作为url访问
```

> 新建 /python/templates/index.html

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
### 启动 flask 应用

```shell
# 进入项目根目录
cd /python

# 使用 python 启动 flask 应用(仅用于开发环境)
python flasktest.py

# 使用 gunicorn 启动 flask 应用
gunicorn -w 4 -b 0.0.0.0:5000 flasktest:app
```

> 使用 ip:5000 访问 得到如下结果

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>python</title>
</head>
<body>
    <h1>欢迎来到 flask web app ，我是一个模板文件</h1>

</body>
</html>
```
## gunicorn 启动 flask 应用
> gunicorn 作用类似于 nginx，只不过它是专用于 python 的 http 服务器

```shell
# gunicorn 命令详解
gunicorn -w 4 -b 0.0.0.0:5000 -b [::]:5000 --reload flasktest:app

#flasktest:app flasktest指的是flasktest.py, app指的是flasktest.py中的app=Flask(...)
#-w 指启动的进程数
#-b 指绑定ip:端口号, 如果是本地端口 127.0.0.1:80 对应ipv6是 [::1]:80
#--reload 代码更新时将热载入（模板更新时，测试发现不太稳定，时好时坏，建议手动重启应用）

# 推荐把 gunicorn 的参数集中放入一个配置文件中(跟 nginx 启动一样，也是需要配置文件)
gunicorn -c /python/gconf80.py flasktest:app --preload

# --preload 运行前先检查是否有错误，有则直接输出错误信息
```
### gconf80.py 配置文件
```python
#gconf80.py 内容开始 与 gconf443.py 相比，端口80改成443，多了ssl配置

from gevent import monkey
monkey.patch_all()
import multiprocessing
#debug = True # 调试模式运行
daemon = False # 守护Gunicorn进程，默认False(即不让其在后台运行，而是使用supervisor管理进程)
# True，表示代码更新时将被热载入（不用手动重启进程了）。如果是直接运行gunicorn命令，直接加参数 --reload 即可
reload = True
#绑定与Nginx通信的端口ipv4、ipv6
bind = '0.0.0.0:80'
bind = '[::]:80'
workers = multiprocessing.cpu_count()
#workers = 3
#默认为sync阻塞模式，最好选择gevent模式，需要安装gevent模块
#Flask+gevent高效部署（基于gevent模块实现并发）：适用于io访问频繁的项目(比如对数据库的读写, 发送Http请求等等)，算法类型不适用
worker_class = 'gevent'

#设置环境变量(key=value)，将变量传递给flask
'''
# flask.py 中调用变量
import os
os.getenv('ljs1')
'''
raw_env=["ljs1=111","ljs2=bbb"]

#gunicorn 配置 ssl
#keyfile = '/python/689890/privkey.pem'
#certfile = '/python/689890/fullchain.pem'

#gconf80.py 内容结束
```
### gunicorn 的 gevent 模式
- 单进程直接运行 python http 服务时, 当有两个并发请求过来时, 进程只能先处理一个请求, 等第一个请求处理完成后, 才能处理第二个, 势必影响用户的体验。

- 那么单进程的时候, 如何能提高并发处理能力？

- 大多数情况下, 我们的服务中, 导致性能低下的原因是I/O, 比如对数据库的读写, 发送 http 请求等等, 当进程进行I/O的时候, 是不占用CPU时间的, 这个时候, CPU可以被腾出来处理其他请求。

- gevent 就是完成这个工作的。幸运的是, 我们不需要自己实现这部分功能, gunicorn 实现了 gevent 模式的运行方式(-k 参数指定), 允许你的 python web 更高性能的处理业务，例如：

```shell
gunicorn \
    -k gevent \
    -w 2 \
    -b 127.0.0.1:9889 \
    run:app
```


## supervisor 项目目录结构
```
/
-- python
---- flasktest.py
---- supervisor_flaskapp.conf
---- gconf80.py
---- supervisor_conf
------ flask80.conf
---- templates
------ index.html

```
### supervisor 管理进程
- supervisor是一个进程管理系统，它通过fork/exec的方式将这些被管理的进程当作它的子进程来启动，若该子进程异常中断，则父进程可以准确地获取子进程异常中断的信息。
- supervisor 可以通过 web 界面对进程进行启动、停止、重启操作

> 比如 Nginx 服务的配置示例参考
```
[program:nginx]
command = /usr/local/bin/nginx -g 'daemon off;' -c /usr/local/etc/nginx/nginx.conf
autostart = true
startsecs = 5
autorestart = true
startretries = 3
user = root
```
### 安装 supervisor
```shell
pip install supervisor
#生成默认配置文件，运行如下命令
mkdir -p /etc/supervisor
echo_supervisord_conf > /etc/supervisor/supervisord.conf #生成默认配置文件
```

> /python/supervisor_flaskapp.conf

```shell
#supervisor_flaskapp.conf 内容开始

#这里 /python/supervisor_conf/*.conf 类似于 nginx 中配置文件的引用方式

[include]
files = /etc/supervisor/supervisord.conf /python/supervisor_conf/*.conf

#你也可以在 /etc/supervisor/supervisord.conf 的底部，直接修改成如下：
#[include]
#files = /python/supervisor_conf/*.conf

#web管理界面
[inet_http_server]
port = 0.0.0.0:8000
username = admin
password = admin

#supervisor_flaskapp.conf 内容结束

```
> /python/supervisor_conf/flask80.conf

```shell
#flask80.conf 与 flask443.conf 不同之处
#1、gunicorn 引入的参数配置文件不同 gconf443.py
#2、[program:flask_app80]定义的程序名不同 flask_app443

#flask80.conf 内容开始 

#定义应用名称flask_app（一个配置文件中可以配置多个程序）
[program:flask_app80]
#创建该项目用户
user = root
#应用目录 flasktest.py 所在的目录
directory = /python

#把gunicorn 的参数集中放入一个配置文件中(跟 nginx 启动一样，也是需要配置文件)
command = /usr/local/bin/gunicorn -c /python/gconf80.py flasktest:app
autostart = true #在supervisord启动的时候也自动启动
autorestart = true #程序异常退出后自动重启
startsecs = 1 #自动重启间隔时间(秒)
#进程启动失败后，最大尝试的次数。当超过3次后，supervisor将把此进程的状态置为FAIL
startretries = 3
stopasgroup = true #确保关闭supervisord时停止所有相关子进程
killasgroup = true #确保关闭supervisord时停止所有相关子进程
stdout_logfile = /python/logs/supervisor_80_out.log
stderr_logfile = /python/logs/supervisor_80_err.log

#flask80.conf 内容结束

```

### 启动 supervisord 进程
```shell
/usr/local/bin/supervisord -c /python/supervisor_flaskapp.conf
```
> 打开 supervisor 进程管理界面 ip:8000

## gunicorn 与 supervisor 总结
> gconf80.py 作为 gunicorn 的配置文件，进程
gunicorn -c /python/gconf80.py flasktest:app

> gunicorn 进程写在 supervisor 配置文件中，进程
supervisord -c /python/supervisor_flaskapp.conf

> 所以 supervisord < gunicorn 套娃

## supervisor 远程管理进程

> http://www.supervisord.org/api.html

### 项目目录结构
```
/
-- python
---- supervisor_monit
------ monit.py
------ gconf_monit.py
---- templates
------ monit.html
---- asset
------ css
-------- css.css

```
### 监控程序
> /python/supervisor_monit/monit.py

```py
from flask import Flask, render_template, url_for, request, jsonify, redirect
from xmlrpc.client import ServerProxy
import signal
import os

app = Flask(__name__,
    template_folder='/python/supervisor_monit/templates',
    static_folder='/python/supervisor_monit/asset',
    static_url_path="/",
    )

@app.route("/getenv")
def index_getenv():
    return os.getenv('ljs2') # gunicorn 配置文件中定义的变量

# 字典形式
serverDict = {
    "pyweb1":{
        "host":"80.210.236.20",
        "port":"8000",
        "user":"admin",
        "passwd":"admin",
    },
    "pyweb2":{
        "host":"80.210.236.20",
        "port":"8001",
        "user":"admin",
        "passwd":"admin",
    }
}

def getUrlRpc(name, sdict):
    r = sdict[name]
    return "http://"+r["user"]+":"+r["passwd"]+"@"+r["host"]+":"+r["port"]+"/RPC2"

#定义一个函数,把它传递给前端
def getAllInfo(title):
    # 自定义函数获取rpc地址
    url = getUrlRpc(title, serverDict)
    server = ServerProxy(url)
    return server.supervisor.getAllProcessInfo()

# 为 getAllInfo 函数设置请求超时时长，超过自定义的时长，单位秒，则返回自定义内容
# 为了防止长时间获取不到 getAllProcessInfo 返回的信息，导致出错
# 使用 python 启动此监控程序时 会出错，所以只能用 gunicorn 启动监控
def getAllInfoTimeOut(n):
    def handler(signum, frame):
        raise AssertionError
    try:
        signal.signal(signal.SIGALRM, handler)
        signal.alarm(10) # 设置超时时长，单位秒
        return getAllInfo(n)
    except AssertionError: # 错误类似为 AssertionError 时，执行
        return []
    except: # 当上面没有匹配的错误类似时，执行此条，放在最后
        return []
    finally: # 此代码段不能删除，虽然对页面没有影响，但是后台日志会输出错误
        signal.alarm(0)
        signal.signal(signal.SIGALRM, signal.SIG_DFL)

@app.route("/")
def index():
    return render_template("monit.html", envtest=os.getenv('ljs2'), sdict=serverDict, funAllInfo=getAllInfoTimeOut)

# 重启 supervisor
@app.route("/restartSupervisor")
def restartSupervisor():
    # 自定义函数获取rpc地址
    title = request.args['title']
    url = getUrlRpc(title,serverDict)
    server = ServerProxy(url)
    server.supervisor.restart()
    return redirect(url_for('index',message="restartSupervisor_"+title))

# 开始或停止某个进程
@app.route("/one.html")
def index_one():
    para = request.args['name']
    method = request.args['method']
    title = request.args['title']
    # url = "http://admin:admin@80.210.236.20:5002/RPC2"
    url = getUrlRpc(title,serverDict)
    server = ServerProxy(url)
    calls = [
        {'methodName':method, 'params': [para]},
        
      ]

    server.system.multicall(calls)
    return redirect(url_for('index'))

# 重启全部进程
@app.route("/restartAll.html")
def index_restartAll():
    title = request.args['title']
    # url = "http://admin:admin@80.210.236.20:5002/RPC2"
    url = getUrlRpc(title,serverDict)
    server = ServerProxy(url)
    calls = [ 
        {'methodName':'supervisor.stopAllProcesses', 'params': []},
        {'methodName':'supervisor.startAllProcesses', 'params': []},
        
      ]

    server.system.multicall(calls)
    return redirect(url_for('index'))

# 重启某个进程
@app.route("/restartOne.html")
def index_restartOne():
    para = request.args['name']
    title = request.args['title']
    # url = "http://admin:admin@80.210.236.20:5002/RPC2"
    url = getUrlRpc(title,serverDict)
    server = ServerProxy(url)
    calls = [ 
        {'methodName':'supervisor.stopProcess', 'params': [para]},
        {'methodName':'supervisor.startProcess', 'params': [para]},
        
      ]

    server.system.multicall(calls)
    return redirect(url_for('index'))

#以下命令，只有在使用 python this.py 才起作用
if __name__=='__main__':
    app.run(debug=True,host='0.0.0.0',port=5000)

```
### 监控程序的模板文件
> /python/supervisor_monit/templates/monit.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="30;url={{ url_for('index') }}">
    <title>serverList</title>
    <link rel="stylesheet" type="text/css" href="{{ url_for('static', filename='css/css.css') }}">
</head>
<body>
{{ envtest }}
<h1>supervisor列表 </h1>
<ul>
{% for sn in sdict %}
    <h3>{{ sn }}@{{ sdict[sn]["host"] }}:{{ sdict[sn]["port"] }}--<a href="{{ url_for('restartSupervisor', title = sn) }}">重启Supervisor</a></h3>
    
    {% if funAllInfo(sn) == [] %}
    <li>此服务器不通，请检查设置！</li>
    {% else %}
    <li>
        <a href="{{ url_for('index_one', method = 'supervisor.stopAllProcesses', name = '', title = sn) }}">停止所有进程</a>

        <a href="{{ url_for('index_one', method = 'supervisor.startAllProcesses', name = '', title = sn) }}">启动所有进程</a>

        <a href="{{ url_for('index_restartAll', title = sn) }}">重启所有进程</a>
    </li>
    {% for snObj in funAllInfo(sn) %}
    <li>{{ snObj["name"] }}--{{ snObj["statename"] }}--{{ snObj["description"] }}
        <a href="{{ url_for('index_one', method = 'supervisor.stopProcess', name = snObj['name'], title = sn) }}">停止进程</a>
        <a href="{{ url_for('index_one', method = 'supervisor.startProcess', name = snObj['name'], title = sn) }}">启动进程</a>
        <a href="{{ url_for('index_restartOne', name = snObj['name'], title = sn) }}">重启进程</a>
    </li>
    {% endfor %}

    {% endif %}
    <hr/>
{% endfor %}
</ul>
</body>
</html>

```
### 监控程序的配置文件
> /python/supervisor_monit/gconf_monit.py

```py
#gconf_monit.py

from gevent import monkey
monkey.patch_all()
import multiprocessing

# 注意：True, False 必须首字母大写

#debug = True # 调试模式运行
# gunicorn 守护进程，默认False(即不让其在后台运行，而是使用supervisor管理进程)
daemon = False
# True，表示代码更新时将被热载入（修改代码后不用手动重启进程）。
#如果是直接运行gunicorn命令，直接加参数 --reload 即可
reload = True
#绑定与Nginx通信的端口ipv4、ipv6
bind = '0.0.0.0:5000'
#bind = '[::]:5000'
#workers = multiprocessing.cpu_count() # 根据计算的CPU数量设置进程数
workers = 1
threads = 1 #指定每个进程开启的线程数
#默认为sync阻塞模式，最好选择gevent模式，需要安装gevent模块
#Flask+gevent高效部署（基于gevent模块实现并发）
#适用于io访问频繁的项目(比如对数据库的读写, 发送Http请求等等)，算法类型不适用
worker_class = 'gevent'

#设置环境变量(key=value)，将变量传递给flask
'''
# flask.py 中调用变量
import os
os.getenv('ljs1')
'''
raw_env=["ljs1=111","ljs2=bbb"]

#日志级别，这个日志级别指的是错误日志的级别，而访问日志的级别无法设置
loglevel = 'info'

#设置gunicorn访问日志格式，错误日志无法设置
access_log_format = '%(t)s %(p)s %(h)s "%(r)s" %(s)s %(L)s %(b)s %(f)s" "%(a)s"'
'''
其每个选项的含义如下：
h  remote address
l  '-'
u  currently '-', may be user name in future releases
t  date of the request
r  status line (e.g. ``GET / HTTP/1.1``)
s  status
b  response length or '-'
f  referer
a  user agent
T  request time in seconds
D  request time in microseconds
L  request time in decimal seconds
p  process ID
'''
accesslog = "/python/logs/gunicorn_access_monit.log" #访问日志文件
errorlog  = "/python/logs/gunicorn_error_monit.log" #错误日志文件

#gconf_monit.py 内容结束

```
### 启动监控程序

```shell
# 当配置文件 gconf_monit.py 中未指定 chdir 时，
# 需要进入 monit.py 所在的目录，不然会出现错误提示
# ModuleNotFoundError: No module named 'monit'
cd /python/supervisor_monit
gunicorn -c /python/supervisor_monit/gconf_monit.py monit:app --preload
```
> 使用 ip:5000 查看监控

## 附件
> 其它 supervisor 命令
```shell
#启动、停止、重启应用、查看状态
supervisorctl start flask_app
supervisorctl stop flask_app
supervisorctl stop all #停止全部
supervisorctl restart flask_app # 重启，注意这里不会重新加载配置文件
supervisorctl status flask_app
supervisorctl status all

#重启主进程 supervisord，重新加载配置文件，重新启动正在运行的所有程序
# supervisord 进程的 pid 不会更新
supervisorctl reload

#终止supervisord进程和被supervisord管理的子进程
#如果gunicorn配置文件中daemon = False，则也会终止gunicorn
supervisorctl shutdown

supervisorctl reread && supervisorctl update

#预读取配置(会检测配置文件，找出配置有改动的程序，并列出程序名)
[root@localhost ~]# supervisorctl reread
flask_app: changed

#更新进程组:根据预读取的配置文件，启动新程序或重启配置有改动的程序
#配置没有改动的程序不会受影响
[root@localhost ~]# supervisorctl update
flask_app: stopped
flask_app: updated process group
[root@localhost ~]# 

```