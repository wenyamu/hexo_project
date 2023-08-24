title: python 备份文件到百度网盘的方法
author: Ljs
tags:
  - python
  - sync
categories: []
abbrlink: 40df1f5
date: 2022-01-10 17:42:00
---
这里是摘要，linux 与 百度网盘。这里推荐一款python 插件 bypy。
<!-- more -->
### linux 与 百度网盘同步
https://github.com/houtianze/bypy

#环境：
centos release 7.9
python 2.7.5

### 先下载并安装pip
针对python 2.7版本
```shell
curl -O https://bootstrap.pypa.io/pip/2.7/get-pip.py
```
针对python 3.x版本
```shell
curl -O https://bootstrap.pypa.io/get-pip.py # curl方式
wget https://bootstrap.pypa.io/get-pip.py # wget方式
python get-pip.py
```
升级pip
```shell
python -m pip install --upgrade pip
```

### 使用 pip 安装 bypy
```shell
pip install bypy
```
### 使用 pip 升级 bypy
```shell
pip install -U bypy
```

### 运行
1,作为独立程序: 运行 bypy (或者python -m bypy，或者python3 -m bypy）

2,作为一个包，在代码中使用: import bypy

### 授权
#随便执行一个bypy命令，例如bypy info 会返回以下内容（此步操作只针对第一次使用时）
[root@hostlocal ~]# bypy info
Please visit:  
https://openapi.baidu.com/oauth/2.0/authorize?scope=basic+netdisk&redirect_uri=oob&response_type=code&client_id=q8WE4EpCsau1oS0MplgMKNBn
And authorize this app
Paste the Authorization Code here within 10 minutes.
Press [Enter] when you are done
#用浏览器访问上面的链接获取授权码，然后粘贴再回车就授权成功.

### 常用命令
#创建云盘目录（测试中发现，云盘中没有目录，在使用 upload 和 syncup 会自动创建）
bypy mkdir <remotedir>
bypy mkdir bbb/ccc/ddd 和 bypy mkdir /bbb/ccc/ddd 结果是一样的，都是在程序文件夹（bypy）下生成多级目录

#上传文件(如果后面不加任何参数，在某个文件夹下就会将文件夹下的内容全部上传到云端程序文件夹（bypy）下)
bypy upload [localpath] [remotepath] [ondup] （如果本地路径中有空文件夹，则不会上传到云盘）
例如 bypy upload /root/ljs /aaa overwrite
[ondup]的值有'overwrite', 'skip', 'prompt' 分别是 “覆盖”,“跳过”,“提示”(缺省值:覆盖)

bypy syncup [localdir] [remotedir] [deleteremote] （可以上传空文件夹）
例如 bypy syncup /root/ljs /aaa

### upload 和 syncup 的区别
> 1、如果没有第3个参数，暂时在测试中发现，它俩的功能是一样的
> 2、upload 会返回同步的详情信息，而 syncup 不会返回信息
> 3、upload 不会上传空文件夹，而 syncup 可以上传空文件夹
> 4、upload 可以同步目录或单个文件，而 syncup 只同步目录

#下载文件
bypy syncdown [remotedir] [localdir] [deletelocal] - 从远程目录同步到本地目录中
bypy downdir [remotedir] [localdir] - 下载远程目录(递归)
bypy downfile <remotefile> [localpath] - 下载远程文件
bypy download [remotepath] [localpath] - 下载一个远程目录/文件(递归)

### 其它
```shell
#启动bypy可能会缺少的模块
yum install python-urllib3 python-requests

#Debian / Ubuntu 环境下，只需执行如下命令一次：
pip install requests
```
