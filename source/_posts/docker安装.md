title: docker安装
author: John Doe
tags: []
categories:
  - docker
abbrlink: ea332afd
date: 2023-08-15 05:39:00
---
> docker 安装程序
> 自动判断 centos 和 debian 系统安装 docker
<!-- more -->
```sh
#!/bin/bash

#https://docs.docker.com/engine/install/centos/
echo "################################"
echo "### 1: 安装 docker-ce_centos ###"
echo "### 2: 安装 docker-ce_debian ###"
echo "################################"

# 注意：定义的函数名不能含有字符"-"
### 一，在 centos 上安装docker-ce
function install_docker_ce_centos() {
    echo "更新"
    sudo yum update -y
    
    echo "卸载旧版本"
    sudo yum remove docker \
              docker-client \
              docker-client-latest \
              docker-common \
              docker-latest \
              docker-latest-logrotate \
              docker-logrotate \
              docker-engine \
              docker-selinux

    echo "安装需要的软件包"
    # 安装需要的软件包,yum-util 提供yum-config-manager功能，另外两个是devicemapper驱动依赖的
    sudo yum install -y yum-utils device-mapper-persistent-data lvm2

    echo "设置yum源"
    sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

    echo "查看docker版本列表"
    # 可以查看所有仓库中所有docker版本
    yum list docker-ce --showduplicates | sort -r

    echo "安装docker ..."
    # 安装 docker 到最新版
    sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # 安装 docker 到指定版本
    #sudo VERSION_STRING="23.0.6"
    #sudo yum install -y docker-ce-${VERSION_STRING} docker-ce-cli-${VERSION_STRING} containerd.io docker-buildx-plugin docker-compose-plugin

    echo "启动docker-ce服务并将其加入开机自启"
    # 启动
    sudo systemctl start docker

    # 加入开机自启
    sudo systemctl enable docker

    echo "查看 docker-ce 版本 ..."
    docker version
}

### 二，在 debian 上安装 docker-ce
function install_docker_ce_debian() {
    echo "卸载以避免与 Docker Engine 版本冲突 ..."
    for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done
    
    #设置存储库
    echo "更新apt包索引并安装包以允许apt通过 HTTPS 使用存储库"
    sudo apt-get -y update
    sudo apt-get -y install ca-certificates curl gnupg
    
    echo "添加Docker官方GPG密钥"
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    echo "使用以下命令设置存储库"
    echo \
    "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
    "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    #安装 Docker 引擎
    echo "更新apt包索引"
    sudo apt-get -y update
    echo "安装 Docker 引擎、containerd 和 Docker Compose 最新版"
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    echo "查看 docker-ce 版本 ..."
    docker version

}

check_sys(){
    if [[ -f /etc/redhat-release ]]; then
        release="centos"
    elif cat /etc/issue | grep -q -E -i "debian"; then
        release="debian"
    elif cat /etc/issue | grep -q -E -i "ubuntu"; then
        release="ubuntu"
    elif cat /etc/issue | grep -q -E -i "centos|red hat|redhat"; then
        release="centos"
    elif cat /proc/version | grep -q -E -i "debian"; then
        release="debian"
    elif cat /proc/version | grep -q -E -i "ubuntu"; then
        release="ubuntu"
    elif cat /proc/version | grep -q -E -i "centos|red hat|redhat"; then
        release="centos"
    fi
}

echo "检测系统"
check_sys

install_docker(){
    if [[ ${release} == "centos" ]]; then
        #centos
        install_docker_ce_centos
    elif [[ ${release} == "debian" ]]; then
        #debian
        install_docker_ce_debian
    fi
}

echo "安装docker"
install_docker

```