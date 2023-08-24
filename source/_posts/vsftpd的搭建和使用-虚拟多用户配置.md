title: vsftpd的搭建和使用-虚拟多用户配置
author: ljs
abbrlink: ff5f9e62
date: 2022-01-16 16:07:51
tags:
---
<!-- toc -->
vsftpd的搭建和使用-虚拟多用户配置

> 服务器环境
centos 7.6
<!--more-->
## 安装ftp服务

### 安装 vsftpd
```shell
yum install -y vsftpd
```
### 安装虚拟用户数据库
后面用到的 db_load 命令
```shell
yum -y install libdb-utils
```
### 启动FTP服务
```shell
systemctl start vsftpd.service
```
### 设置FTP服务开机自启动
```shell
systemctl enable vsftpd.service
```
其它相关命令
```shell
systemctl restart vsftpd.service # 重启服务
systemctl status vsftpd.service  # 服务状态查看
```
查看FTP服务的端口号
```shell
netstat -antup | grep ftp
```
## 增加一个系统用户
`virftp`，所有虚拟用户都会映射到此用户后对文件系统进行读写操作
```shell
方法一（推荐）：
#添加用户，用户登录时使用 nologin（禁止用此用户名登陆服务器）
useradd -s /sbin/nologin virftp

#设置用户密码（明文密码一次成功，不需要二次确认）
#这种方式虽然简单，但是通过history命令可以查到用户的密码，所以不安全。
echo "123456" | passwd --stdin virftp

方法二：
#添加用户，用户登录时使用nologin（禁止用此用户名登陆服务器）
useradd -s /sbin/nologin virftp

#设置用户密码（执行命令后要输入两次密码）
passwd virftp
```
## 配置vsftp主配置文件
```shell
#题外话：过滤配置文件注释后内容并查看（相当于 cat /etc/vsftpd/vsftpd.conf 不显示注释）
grep -v "#" /etc/vsftpd/vsftpd.conf

#重命名vsftpd主配置文件为vsftpd.conf.bak（推荐）
mv /etc/vsftpd/vsftpd.conf{,.bak}

#或者备份vsftpd主配置文件
#cp /etc/vsftpd/vsftpd.conf{,.bak}

#新建vsftpd.conf并编辑
vim /etc/vsftpd/vsftpd.conf

#禁止匿名用户登录
anonymous_enable=NO
#允许本地用户登录
local_enable=YES
#启用虚拟账户 
guest_enable=YES
#把虚拟账户映射到系统账户virftp              
guest_username=virftp
#使用虚拟用户验证（PAM验证）新建文件/etc/pam.d/vsftpd.pam(默认验证文件是/etc/pam.d/vsftpd)
pam_service_name=vsftpd.pam
#设置存放各虚拟用户配置文件的目录（此目录下与虚拟用户名相同的文件为它的配置文件）
user_config_dir=/etc/vsftpd/vsftpd_viruser
#启用chroot时，虚拟用户根目录允许写入
allow_writeable_chroot=YES
#设置被动模式下，建立数据传输可使用的端口范围的最小值。
#建议您把端口范围设置在一段比较高的范围内，例如50000~50010，有助于提高访问FTP服务器的安全性。
pasv_min_port=50000
#设置被动模式下，建立数据传输可使用的端口范围的最大值。
pasv_max_port=50010
```

## 配置虚拟用户访问vsftpd服务
```shell
#创建虚拟用户密码文件(奇数行为帐号，偶数行为密码)
vim /etc/vsftpd/vir_user
test01
pwd01
test02
pwd02
```
## 创建虚拟用户的根目录
要保证虚拟用户映射的系统用户，对这个根目录有读写权限
```shell
#创建虚拟用户对应根目录
#方法一（推荐）：
mkdir -p /home/virftp/{test01,test02}

#方法二：
mkdir -p /home/virftp/test01 /home/virftp/test02

###题外话###
#1、使用mkdir在同目录下创建多个目录：
# mkdir /tmp/{proc,etc,home,usr}

#2、使用mkdir同时在多目录下创建多目录：
# mkdir /tmp/{proc/{1,2,3},etc/{4,5,6},home/dir}
```
修改目录权限
```shell
#方法一（推荐）：
chown -R virftp.virftp /home/virftp/{test01,test02}

#方法二：
chown -R virftp.virftp /home/virftp/test01
chown -R virftp.virftp /home/virftp/test02
```

## 配置虚拟用户各自的配置文件
```shell
#创建‘虚拟用户配置文件’的存放目录
mkdir /etc/vsftpd/vsftpd_viruser/

#创建和配置虚拟用户各自的配置文件(文件名称是‘虚拟用户名’)
vim /etc/vsftpd/vsftpd_viruser/test01
# 指定虚拟用户的虚拟目录（虚拟用户登录后的主目录,即登录ftp后访问的根目录）
local_root=/home/virftp/test01
# 允许写入
write_enable=YES
#允许浏览FTP目录和下载
anon_world_readable_only=NO
#禁止用户下载
#download_enable=NO
# 允许虚拟用户上传文件
anon_upload_enable=YES
# 允许虚拟用户创建目录
anon_mkdir_write_enable=YES
# 允许虚拟用户执行其他操作（如改名、删除）
anon_other_write_enable=YES
# 上传文件的掩码,如022时，上传目录权限为755,文件权限为644
anon_umask=022
```
## 生成虚拟用户数据库
```shell
db_load -T -t hash -f /etc/vsftpd/vir_user /etc/vsftpd/vir_user.db
chmod 700 /etc/vsftpd/vir_user.db
```

## 配置vsftpd验证文件
默认验证文件 /etc/pam.d/vsftpd
```shell
方法一（推荐）：
#新建验证文件
touch /etc/pam.d/vsftpd.pam

### 题外话：创建10个文件，从test01.txt到test10.txt ###
#touch /home/virftp/test02/test{01..10}.txt

# 使用命令在文件后追加(-e 参数，把\n当作换行处理，而不是当成字符串)
echo -e "auth     required  pam_userdb.so  db=/etc/vsftpd/vir_user\naccount  required  pam_userdb.so  db=/etc/vsftpd/vir_user" >> /etc/pam.d/vsftpd.pam

方法二：
#新建验证文件，并添加如下两行
vim /etc/pam.d/vsftpd.pam
auth     required  pam_userdb.so  db=/etc/vsftpd/vir_user
account  required  pam_userdb.so  db=/etc/vsftpd/vir_user
```
## 重启服务
```shell
systemctl restart vsftpd
```
## 总结
若添加新虚拟用户，则需要做以下5件事：
1、创建虚拟用户对应根目录文件夹并修改目录权限
2、在/etc/vsftpd/vsftpd_viruser/目录下创建配置文件（文件名为虚拟用户名）
3、在/etc/vsftpd/vir_user文件中添加帐号及密码
4、再次执行生成虚拟用户数据库
`db_load -T -t hash -f /etc/vsftpd/vir_user /etc/vsftpd/vir_user.db`
5、重启vsftpd服务
`systemctl restart vsftpd`

异常问题
1、为目录设置权限，不然无法对目录进行操作
```chmod -R 777 /var/ftp/test2```
2、将ftpuser添加到chroot_list中，连接ftp，提示530 Login incorrect，连接失败。但是创建的普通账号就可以正常登陆。

解决方法：很多提供对系统非登录访问的守护进程（如FTP）会检查用户的登录shell是否列在/etc/shells中，如果没有列出，守护进程就会拒绝访问（这正是您所需要的动作）。

打开 /etc/shells后，发现确实没有/sbin/nologin这一行，添加上再次登陆，成功。

使用命令在文件后追加
```shell
echo "/sbin/nologin" >> /etc/shells
```

vsftp配置文件及参数说明
```
/etc/vsftpd目录下文件说明如下：
/etc/vsftpd/vsftpd.conf是vsftpd的核心配置文件。
/etc/vsftpd/ftpusers是黑名单文件，此文件中的用户不允许访问FTP服务器。
/etc/vsftpd/user_list是白名单文件，此文件中的用户允许访问FTP服务器。
配置文件vsftpd.conf参数说明如下：
用户登录控制参数说明如下表所示。
参数    说明
anonymous_enable=YES    接受匿名用户
no_anon_password=YES    匿名用户login时不询问口令
anon_root=（none）    匿名用户主目录
local_enable=YES    接受本地用户
local_root=（none）    本地用户主目录
用户权限控制参数说明如下表所示。
参数    说明
write_enable=YES    可以上传文件（全局控制）
local_umask=022    本地用户上传的文件权限
file_open_mode=0666    上传文件的权限配合umask使用
anon_upload_enable=NO    匿名用户可以上传文件
anon_mkdir_write_enable=NO    匿名用户可以建目录
anon_other_write_enable=NO    匿名用户修改删除
chown_username=lightwiter    匿名上传文件所属用户名
```
## 附件(sh执行文件)
```sh
#!/bin/sh
echo "Centos7.6搭建和使用 vsftpd - 虚拟多用户配置"

echo "一、安装ftp服务"

#安装 vsftpd
yum install -y vsftpd

# 安装虚拟用户数据库(后面用到的 db_load 命令)
#yum -y install libdb-utils

#启动FTP服务。
systemctl start vsftpd.service

#设置FTP服务开机自启动。
systemctl enable vsftpd.service

#当前时间
shijian=`date "+%Y-%m-%d_%H:%M:%S"`
#系统用户
sys_user="ljs"
#虚拟用户1
vir_user_01="user01"
vir_pwd_01="pwd01"
vir_user_01_conf_filename=$vir_user_01
vir_user_01_ftp_dir="/home/abc/ftp01"
#虚拟用户2
vir_user_02="user02"
vir_pwd_02="pwd02"
vir_user_02_conf_filename=$vir_user_02
vir_user_02_ftp_dir="/home/abc/ftp02"
#vsftpd服务配置文件
ftp_conf_file="/etc/vsftpd/vsftpd.conf"
#虚拟用户及密码文件
vir_user_pwd_file="/etc/vsftpd/vir_user.pwd"
#虚拟用户配置文件的存放目录
vir_user_conf_dir="/etc/vsftpd/vsftpd_viruser"
#设置被动模式下，建立数据传输可使用的端口范围的最小值、最大值。
pasv_min_port=50000
pasv_max_port=50010
#虚拟用户验证文件
verify_file="/etc/pam.d/vsftpd.pam"
#虚拟用户数据库文件
vir_user_db_file="/etc/vsftpd/vir_user_database.db"

echo "二、增加一个系统用户${sys_user} ，所有虚拟用户都会映射到此用户后对文件系统进行读写操作"

#添加用户，用户登录时使用 nologin（表示禁止用此用户名登陆服务器）
useradd -s /sbin/nologin ${sys_user}

#设置用户密码（明文密码一次成功，不需要二次确认）
#这种方式虽然简单，但是通过history命令可以查到用户的密码，所以不安全。
echo "123456" | passwd --stdin ${sys_user}

echo "三、配置vsftp主配置文件"

#重命名vsftpd主配置文件为 vsftpd.conf.bak（推荐）
mv ${ftp_conf_file}{,.bak}

#新建vsftpd.conf并编辑
cat > ${ftp_conf_file} << EOF
#文件生成时间
#${shijian}
#开启被动模式。
pasv_enable=YES
#禁止匿名用户登录
anonymous_enable=NO
#允许本地用户登录
local_enable=YES
#启用虚拟账户 
guest_enable=YES
#把虚拟账户映射到系统账户${sys_user}
guest_username=${sys_user}
# guest_username=www
# 如果ftp目录是指向网站根目录，用来上传网站程序，
# 可以指定虚拟用户的宿主用户为nginx运行账户www，可以避免很多权限设置问题
#使用虚拟用户验证（PAM验证）新建文件${verify_file}(默认验证文件是/etc/pam.d/vsftpd)
pam_service_name=$(basename $verify_file)
#设置存放各虚拟用户配置文件的目录（此目录下与虚拟用户名相同的文件为它的配置文件）
user_config_dir=${vir_user_conf_dir}
#启用chroot时，虚拟用户根目录允许写入
allow_writeable_chroot=YES
#设置被动模式下，建立数据传输可使用的端口范围的最小值。
#建议您把端口范围设置在一段比较高的范围内，例如50000~50010，有助于提高访问FTP服务器的安全性。
pasv_min_port=${pasv_min_port}
#设置被动模式下，建立数据传输可使用的端口范围的最大值。
pasv_max_port=${pasv_max_port}
EOF

echo "四、配置虚拟用户访问vsftpd服务"

#创建虚拟用户密码文件(奇数行为帐号，偶数行为密码)
cat > ${vir_user_pwd_file} << EOF
${vir_user_01}
${vir_pwd_01}
${vir_user_02}
${vir_pwd_02}
EOF

echo "五、创建虚拟用户的根目录，要保证虚拟用户映射的系统用户，对这个根目录有读写权限"

#创建虚拟用户对应根目录
mkdir -p {$vir_user_01_ftp_dir,$vir_user_02_ftp_dir}

#修改目录权限
chown -R ${sys_user}.${sys_user} {$vir_user_01_ftp_dir,$vir_user_02_ftp_dir}

echo "六、配置虚拟用户各自的配置文件"

#创建‘虚拟用户配置文件’的存放目录(目录必须真实存在，不然无法使用cat EOF命令)
mkdir ${vir_user_conf_dir}

#创建和配置虚拟用户各自的配置文件(文件名称必须只能是‘虚拟用户名’,也不能有后缀)
cat > ${vir_user_conf_dir}/${vir_user_01_conf_filename} << EOF
# 指定虚拟用户的虚拟目录（虚拟用户登录后的主目录,即登录ftp后访问的根目录）
local_root=${vir_user_01_ftp_dir}
# 允许写入
write_enable=YES
#允许浏览FTP目录和下载
anon_world_readable_only=NO
#禁止用户下载
#download_enable=NO
# 允许虚拟用户上传文件
anon_upload_enable=YES
# 允许虚拟用户创建目录
anon_mkdir_write_enable=YES
# 允许虚拟用户执行其他操作（如改名、删除）
anon_other_write_enable=YES
# 上传文件的掩码,如022时，上传目录权限为755,文件权限为644
anon_umask=022
EOF

cat > ${vir_user_conf_dir}/${vir_user_02_conf_filename} << EOF
# 指定虚拟用户的虚拟目录（虚拟用户登录后的主目录,即登录ftp后访问的根目录）
local_root=${vir_user_02_ftp_dir}
# 允许写入
write_enable=YES
#允许浏览FTP目录和下载
anon_world_readable_only=NO
#禁止用户下载
#download_enable=NO
# 允许虚拟用户上传文件
anon_upload_enable=YES
# 允许虚拟用户创建目录
anon_mkdir_write_enable=YES
# 允许虚拟用户执行其他操作（如改名、删除）
anon_other_write_enable=YES
# 上传文件的掩码,如022时，上传目录权限为755,文件权限为644
anon_umask=022
EOF

echo "七、生成虚拟用户数据库"
db_load -T -t hash -f ${vir_user_pwd_file} ${vir_user_db_file}
chmod 700 ${vir_user_db_file}

echo "八、配置vsftpd验证文件（默认验证文件 /etc/pam.d/vsftpd）"

#新建验证文件并使用命令添加内容(-e 参数，把\n当作换行处理，而不是当成字符串。> 表示清空再添加内容，>> 表示追加内容)
echo -e "auth     required  pam_userdb.so  db=${vir_user_db_file%.*}\naccount  required  pam_userdb.so  db=${vir_user_db_file%.*}" > ${verify_file}

echo "九、重启服务并查看vsftpd服务状态"
systemctl restart vsftpd.service
systemctl status vsftpd.service
```