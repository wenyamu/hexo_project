title: docker常用命令
author: John Doe
tags: []
categories:
  - docker
abbrlink: 749ad7d8
date: 2023-08-15 07:43:00
---
> 使用docker 
> docker 介绍
> docker 容器搭建
<!-- more -->
<!-- toc -->
### docker 基础命令

```shell
# 重启 docker 服务
systemctl restart docker

# 开启 docker 服务
systemctl start docker

# 查看 docker 服务状态
systemctl status docker

# 搜索镜像
docker search nginx

# 拉取镜像
docker pull nginx:1.24.0

# 查看本机存在的镜像
docker images

# 查看本机存在的容器
docker ps -a

# 查看本机正在运行的容器
docker ps
```

### docker 容器命令
```shell
docker run -itd \
  -p 80:80 \
  -p 443:443 \
  -e USERNAME=aaa \
  -e PASSWORD=bbb \
  -v /mnt/ftp:/home/vsftpd \
  --name=nginxweb \
  --restart=always \
  nginx:1.24.0

# run 创建容器后直接运行
# -it 表示交互, -d 表示后台运行。简写就是 -itd
# -p  表示端口映射，前面是宿主机端口，后面是容器端口
# -e  设置容器的变量名和值
# -v  表示目录映射，前面是宿主机目录，后面是容器目录
# --name=nginxweb 定义创建容器的名称为 nginxweb
# --restart=always 表示容器自动重启
# nginx:1.24.0 表示创建容器使用的镜像和镜像版本

# 进入容器
docker exec -it nginxweb bash

# 停止容器
docker stop nginxweb

# 启动容器
docker start nginxweb

# 重启容器
docker restart nginxweb

# 查看容器的ip地址
docker inspect nginxweb | grep '"IPAddress"'
docker inspect --format '{{ .NetworkSettings.Networks.bridge.IPAddress }}' nginxweb

# 删除容器 需要先停止容器
docker stop nginxweb && docker rm nginxweb

# 删除镜像 需要先删除使用此镜像的所有容器
docker stop nginxweb && docker rm nginxweb && docker rmi nginx:1.24.0

```

### docker 网络操作命令
```shell
docker network ls
docker network inspect mynet
docker network inspect mynet | grep '"Subnet"'
docker network inspect mynet | grep '"Gateway"'
docker network rm mynet

#不在同一网段内的容器，ping不通
#把容器 nginxtest 加入到 mynet 中，这时此容器有两个ip
docker network connect mynet nginxtest

```

### 通过 dockerfile 文件创建镜像
> 先进入 dockerfile 文件所在目录下执行命令
```shell
# 注意最后有一个.号
docker build -t nginxdiy:v1.0 .
# nginxdiy:v1.0 表示创建的镜像名称和版本号
```

### 使用 docker compose 创建容器
> 把所有docker命令写在compose.yml格式文件中，使用docker compose执行创建容器
```shell
docker compose -f compose.yml up -d
# -f 指定文件路径
# -d 表示后台运行
```
#### compose.yml 格式
```yml
version: '3'
networks:
  mynet:
  ipam:
    config:
    - subnet: 172.20.0.0/16
services:
  dc1: # 作为转发服务器 80端口
    # 依赖于nginx镜像（nginx/1.24.0），本地无则自动下载
    image: nginx:1.24.0
    hostname: nginxHost_s1
    # 映射端口 【宿主机端口:容器端口】
    ports:
      - "81:80"
      - "444:443"
    # 目录挂载 【宿主机目录:容器目录】
    volumes:
      - /www1/web:/usr/share/nginx/html
      - /www1/conf_s:/etc/nginx/conf.d
      - /www1/logs:/var/log/nginx
      - /www1/ssl:/ssl
    # 容器名称
    container_name: nginx_s1
    #environment:
    #  - "SERSYNC=true"
    restart: always
    # 相当于 docker run -i
    stdin_open: true
    # 相当于 docker run -t
    tty: true
    # 指定容器的ip
    #networks:
    #  mynet:
    #    ipv4_address: 172.20.0.3
    # 容器的ip在设置的网络名的网段中随机生成
    networks:
      - mynet

```
### 为容器追加参数
```shell
# 为容器 nginxtest 加上重启参数 --restart=always
docker update --restart=always nginxtest
# 查看更多帮助
docker update --help
```