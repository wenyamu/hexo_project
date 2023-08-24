title: linux配置-ssh
author: ljs
abbrlink: 3362da68
tags:
  - ssh
categories:
  - linux
date: 2022-01-15 19:30:00
---
> 客户端A主机，服务端B主机。实现A主机通过免密登陆B主机

## 在B主机安装ssh
```shell
apt install -y openssh-server
```
<!-- more -->
## 修改B主机的ssh配置文件
```shell
#1、#PermitRootLogin prohibit-password 改为 PermitRootLogin yes (允许root登陆ssh)
sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
#或者直接在文件末尾追加
echo "PermitRootLogin yes" >> /etc/ssh/sshd_config

#2、如果想使用自定义的端口 可以设置 Port 9000
sed -i 's/#Port 22/Port 9000/' /etc/ssh/sshd_config
#或者直接在文件末尾追加
echo "Port 9000" >> /etc/ssh/sshd_config
```
## 配置B主机的管理员root密码
```shell
passwd root
#或者用明文的方式配置密码
echo 'root:aaaa' | chpasswd
```
## 启动B主机的ssh服务
```shell
service ssh start

#配置好密码之后，直接在这个容器中尝试下连接
ssh root@127.0.0.1 -p 9000

#宿主机上登陆ssh测试
使用 docker inspect 容器id | grep '"IPAddress"' 查看容器的ip
ssh root@172.18.0.2 -p 9000
```

## 配置B主机实现ssh免密登陆
先在客户端A主机上通过`ssh-keygen`命令生成密钥对
> id_rsa 私钥，id_rsa.pub 公钥
```shell
root@c86bf8bed861:/# ssh-keygen
Generating public/private rsa key pair.
Enter file in which to save the key (/root/.ssh/id_rsa): 
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /root/.ssh/id_rsa
Your public key has been saved in /root/.ssh/id_rsa.pub
```
通过scp命令将主机A上的id_rsa.pub公钥文件复制到远程主机B
```shell
scp -P 9000 /root/.ssh/id_rsa.pub root@81.110.26.20:/root/.ssh/
#或者使用ssh-copy-id 直接在远程主机B对应的.ssh/文件夹下生成authorized_keys
#ssh-copy-id -i ~/.ssh/id_rsa.pub -p 9000 root@81.110.26.20
```
> 9000是远程B主机81.110.26.20的ssh登陆端口，通过scp命令复制，前提是远程服务器已经开启ssh密码登录。

### B主机配置

1、将上传的公钥文件转换或重命名为 authorized_keys 文件
```shell
#如果上一步配置中使用了ssh-copy-id 此步可以省略
cat /root/.ssh/id_rsa.pub >> /root/.ssh/authorized_keys
```
2、编辑主机B上的ssh的配置文件。
```shell
vim /etc/ssh/sshd_config

#要确保下面这两项没有注释
PubkeyAuthentication yes #允许公钥认证
AuthorizedKeysFile .ssh/authorized_keys #指定包含用于用户身份验证的公钥的文件

#为了安全考虑，可以禁用root账户登录（不禁用也不影响免密登陆），或者在选项前面可以加#号
PermitRootLogin no

#有了证书登录，可以禁用密码登录（不禁用也不影响免密登陆），或者在选项前面可以加#号
PasswordAuthentication no
```
重启一下B主机的ssh服务，这样ssh配置免密登陆才能生效
```shell
service ssh restart
ssh root@81.110.26.20 -p 9000 # 这时不需要密码就可以登陆了
```

## 总结
1、在客户端A主机上创建密钥对，把公钥复制到ssh服务器B主机上，实现A免密登陆B。
2、为了安全建议不要使用root用户，可以试试A、B两个服务器都使用普通用户。