title: docker镜像瘦身工具slim
author: John Doe
tags:
  - python
categories:
  - supervisor
abbrlink: 5c8569fd
date: 2023-08-17 12:34:00
---
## 安装
> 注意：通过 https://github.com/slimtoolkit/slim 下载的是源代码，需要编译。
```shell
wget https://downloads.dockerslim.com/releases/1.40.3/dist_linux.tar.gz && \
tar zxf dist_linux.tar.gz && \
mv dist_linux/* /usr/local/bin/ && \
docker-slim --version
```
## 使用
> 把镜像 archlinux:latest 瘦身后更名为 archlinux:curl
```shell
#下载镜像
docker pull archlinux:latest
# 镜像瘦身
slim build \
--target archlinux:latest \
--tag archlinux:curl \
--http-probe=false
```
## 文档
```shell
#查看帮助，或者详见github官网文档。
slim build --help
```