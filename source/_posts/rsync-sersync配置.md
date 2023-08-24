title: rsync-sersync配置
abbrlink: c36c8db7
tags:
  - rsync
  - sersync
  - sync
categories:
  - linux
date: 2022-01-15 16:41:00
---
<!-- toc -->
## 创建数据源服务器
<!-- more -->
```shell
docker run -itd --name nginx-source -v /websource:/www -p 80:80 -p 443:443 -p 873:873 nginx
```
安装 rsync
```shell
docker exec -it nginx-source bash
apt install rsync -y
```

## 创建密码文件
> 只存在于源服务器上，文件只保存密码，并且只有一行，不要有用户名，像amdin:123456是不对的，只保存123456即可
```shell
echo "123456" > /etc/rsync.verify
chmod 600 /etc/rsync.verify
```
## 配置备份服务器
> 需要与源服务器同步的多个服务器都按如下这样配置

创建备份端服务器
```shell
docker run -itd --name nginx-back -v /webback:/wwwback -p 81:80 -p 444:443 -p 874:873 nginx
```

在备份服务器上安装
```shell
docker exec -it nginx-back bash
apt -y install rsync
```
### 创建rsyncd.conf配置文件
> rsyncd.conf配置文件在备份服务器上
```
#设置运行rsync 进程的用户
uid = root
#运行进程的组
gid = root
#ip这里指本机ip，即备份服务器的ip，可以省略
#address = 100.17.10.3
#本机端口，这里是875服务器的端口，如888，870等等只要不被占用，防火墙开启就可以
port = 873
#如果"use chroot"指定为true，那么rsync在传输文件以前首先chroot到path参数所指定的目录下。这样做的原因是实现额外的安全防护，但是缺 点是需要以roots权限，并且不能备份指向外部的符号连接所指向的目录文件。默认情况下chroot值为true(或yes)。
use chroot = yes
#最大连接数
max connections = 5
#CentOS7中yum安装不需指定pid file 否则报错
#pid file = /var/run/rsyncd.pid
lock file=/var/run/rsyncd.lock
#日志文件
log file = /var/log/rsyncd.log
#不同步的文件
#exclude = lost+found/
transfer logging = yes
#超时时间
timeout = 900
#同步时跳过没有权限的目录
ignore nonreadable = yes
#传输时不压缩的文件
dont compress = *.gz *.tgz *.zip *.z *.Z *.rpm *.deb *.bz2

#规则模块，可以多个规则模块，不可以重名
[wwwroot]
#同步的路径提前在备份服务器中创建好
path = /wwwback/
#规则描述，随便写
comment = rsync test
#忽略错误
ignore errors
#是否可以pull 设置服务端文件读写权限
read only = false
#是否可以push
#write only = false
#不显示服务端资源列表
list = false
#下面配置同步时候的身份，注意该身份是在rsync里面定义的，并非是本机实际用户。
#客户端获取文件的身份此用户并不是本机中确实存在的用户
#该选项指定由空格或逗号分隔的用户名列表，只有这些用户才允许连接该模块
auth users = admin ljs
#用来认证客户端的秘钥文件 格式 USERNAME:PASSWORD
#秘钥文件权限一定需要改为600，这里配置填写的是备份服务器的账户文件。
secrets file = /etc/rsync.password
#允许的主机访问 *代表所有
hosts allow = *
#创建rsyncd.conf配置文件 结束
```
原理：在备份服务器上使用配置文件 /etc/rsyncd.conf 来启动rsync，创建备份账户（像admin:123456的形式），最后把rsync以deamon方式运行（往下看有运行方法）

> 自定义账户及密码，格式为user:password，每行一个
这个用户是虚拟用户，不是系统用户，只是用来验证同步操作是否合法
```shell
# 新建并添加一行
echo "admin:123456" > /etc/rsync.password
# 再增加一行
echo "ljs:123456" >> /etc/rsync.password
#设置权限
chmod 600 /etc/rsync.password
```
### 备份服务器上启动rsync
```shell
#加载备份服务器上的配置文件rsyncd.conf启动rsync服务
rsync --daemon --config=/etc/rsyncd.conf
#/etc/rsyncd.conf是缺省值，如果存在，则命令可以简写
rsync --daemon
```
## 备份测试
> 备份命令（在源服务器上执行同步命令）
把源服务器上的文件复制到备份服务器上
```shell
# 注意：/www/ 表示同步www目录下的文件和文件夹，/www表示把www文件夹也同步过去
rsync -avz /www/ admin@100.17.10.3::wwwroot

# --delete 表示当备份服务器上有，而源服务器上没有的文件，在同步时会被删除
rsync -avz --delete /www/ admin@100.17.10.3::wwwroot

#后面的 --password-file=/etc/rsync.verify 就是源服务器上的密码验证文件
#此验证文件只存在源服务器上，记得开启600权限。
#如果不加此参数项，则要求自行输入密码123456
rsync -avz --delete /www/ admin@100.17.10.3::wwwroot --password-file=/etc/rsync.verify

#不需要同步的文件和目录可以加上参数 --exclude
rsync -avz /www/ --exclude=".svn" --exclude="bbb" admin@100.17.10.3::wwwroot

rsync -vzrtopg --progress /www/ admin@100.17.10.3::wwwroot --password-file=/etc/rsync.verify
```
到这里linux的rsync同步就配置成功了，接下来再介绍一款网上比较推荐的一个软件，rsync搭配sersync一起使用。
## 配置sersync
> 在源服务器上进行sersync的配置

1、上传sersync2.5.4_64bit_binary_stable_final.tar.gz到源服务器 /usr/local/ 目录下
```shell
cd /usr/local

#解压后在当前目录中会有一个 GNU-Linux-x86 文件夹
tar xvf sersync2.5.4_64bit_binary_stable_final.tar.gz

#文件夹名字改成sersync,里面有两个文件,一个是二进制文件sersync2 ,一个是配置文件confxml.xml
mv GNU-Linux-x86 sersync
```
2、修改confxml.xml
```
#修改sersync部分
<sersync>
    #本地同步目录 监控源服务器上的目录变化
    <localpath watch="/www/">
        #rsync模块名称,可以配置多个
        <remote ip="100.17.10.3" name="wwwroot"/>
        <!--<remote ip="100.17.10.3" name="tongbu"/>-->
        <!--<remote ip="130.170.10.31" name="py"/>-->
    </localpath>
    #修改rsync认证部分【rsync密码认证】
    <rsync>
        <commonParams params="-artuz"/>
        <auth start="true" users="admin" passwordfile="/etc/rsync.verify"/>
        <userDefinedPort start="false" port="874"/><!-- port=874 -->
        <timeout start="false" time="100"/><!-- timeout=100 -->
        <ssh start="false"/>
    </rsync>
</sersync>
```
3、配置sersync开启sersync守护进程同步数据（运行如下命令）
```shell
/usr/local/sersync/sersync2 -d -r -o /usr/local/sersync/confxml.xml

# -o 指定/usr/local/sersync/confxml.xml作为配置文件
# -r 在实时监控前作一次整体同步
# -d 以守护进程方式在后台运行
```
4、测试
在源服务器上（watch="/www/"）目录下添加文件 看备份服务器上有没有变化
5、sersync 参数项详解
```
/usr/local/sersync/sersync2 -help
set the system param
execute：echo 50000000 > /proc/sys/fs/inotify/max_user_watches
execute：echo 327679 > /proc/sys/fs/inotify/max_queued_events
parse the command param
_______________________________________________________
参数-d:启用守护进程模式
参数-r:在监控前，将监控目录与远程主机用rsync命令推送一遍
c参数-n: 指定开启守护线程的数量，默认为10个
参数-o:指定配置文件，默认使用confxml.xml文件
参数-m:单独启用其他模块，使用 -m refreshCDN 开启刷新CDN模块
参数-m:单独启用其他模块，使用 -m socket 开启socket模块
参数-m:单独启用其他模块，使用 -m http 开启http模块
不加-m参数，则默认执行同步程序

#例如：
./sersync2 -n 8 -o abc.xml -r -d
#表示，设置线程池工作线程为8个，指定abc.xml作为配置文件，在实时监控前作一次整体同步，以守护进程方式在后台运行。
```

## 总结
> 1、源服务器上安装 sersync和rsync，其中rsync不需要配置文件/etc/rsyncd.conf，不需要后台运行，不需要用户名密码表文件/etc/rsync.password。sersync只需要配置文件confxml.xml和rsync密码验证文件/etc/rsync.verify

> 2、备份服务器上只安装rsync，只需要配置文件rsyncd.conf和用户名密码表/etc/rsync.password