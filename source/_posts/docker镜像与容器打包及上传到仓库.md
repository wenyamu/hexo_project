title: docker镜像与容器打包及上传到仓库
author: Ljs
tags:
  - docker
categories:
  - docker
abbrlink: f255ffad
date: 2022-01-09 18:00:00
---
https://docs.docker.com/engine/reference/commandline/build/

### 用容器生成镜像
```shell
docker commit -a "oner" -m "aaa123" 38731354b329 wpa:1.0
```
> -a 为作者
> -m 为描述信息
> 38731354b329 运行中的容器的ID
> wpa:1.0 生成镜像名:版本号
<!-- more -->
### 为本地镜像设置新标签tag
在上传之前，先给本地镜像打个tag标签，相当于重新复制镜像并重命名为docker账户名/仓库名称:新标签名
```
#docker tag 本地镜像:tagname docker账号/docker仓库:tagname
docker tag centos:7 xxx/centos:7.9
# 还可以
docker tag centos:7 xxx/linuxos:centos-v7
```
### 登录docker仓库

docker login
Username: xxx
Password: yyy
Login Succeeded

### 上传本地镜像到镜像仓库
```
#docker push docker 账号/仓库名称:tagname
docker push xxx/linuxos:centos-v7
```
### 将一个或多个镜像打包
> /diyimages/目录要事先存在
> 如果不指定镜像的标签tag，会将此镜像的所有标签tag全部打包

```shell
docker image save nginxsync:1.0 php-fpm > /diyimages/nginxdiy.tar

# 或者
#docker save -o /diyimages/nginxdiy.tar nginxsync:1.0 php-fpm

# 或者 使用 gzip 压缩
#docker save nginxsync:1.0 php-fpm | gzip > /diyimages/myimage_latest.tar.gz

```

### 导入镜像文件

```shell
docker image load < /diyimages/nginxdiy.tar

# 或者
#docker load -i /diyimages/nginxdiy.tar

#导入的镜像id也与之前一样
```
### 其它容器命令
```shell
#输出所有容器的id
docker ps -a -q

#强制删除容器(包括正在运行的)
docker rm -f 容器名或id

#强制删除所有容器(包括正在运行的)
docker rm -f $(docker ps -a -q)
```

### 在容器外操作容器内的命令
```shell
# 先创建一个容器
docker run -itd --name ngtest --hostname nghost nginx:1.24.0

# nginx
docker exec -it ngtest /bin/bash -c 'cd /home; echo "hi, I am in docker"'

docker exec -it ngtest /bin/bash -c 'nginx -s reload'

docker exec -it ngtest /bin/bash -c 'service nginx status'

# php-fpm
docker exec -it phpfpm4 /bin/bash -c 'supervisord -c /www/supervisor_php.conf'

```