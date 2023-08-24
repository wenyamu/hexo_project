title: linux基础命令
author: John Doe
tags: []
categories:
  - linux
abbrlink: 503970b4
date: 2023-08-12 05:45:00
---
linux 命令收集

<!-- more -->
## 系统命令
> 通用
```shell
#echo "内核版本"
uname -r

#echo "系统类型"
uname -s

```
> debian
```shell
#echo "linux版本"
cat /etc/os-release

#echo "更新系统安装源"
apt update
apt -y install 软件包名

```
> alpine
```shell
#echo "linux版本"
cat /etc/alpine-release

#echo "更新系统安装源"
apk update

# 相当于 先更新、再安装、最后删除缓存
apk add --update --no-cache 软件包名

```
> centos
```shell
#echo "linux版本"
cat /etc/redhat-release 

#echo "更新系统安装源"
yum update
yum -y install 软件包名

```
## 日期时间
> 年月日
```shell
echo $(date +%F)	# 2023-08-20
echo $(date +%Y/%m/%d)	# 2023/08/20 ; %Y: 年 | %m: 月 | %d: 日
```
> 时分
```shell
echo $(date +%R)	# 18:17
```
> 时分秒
```shell
echo $(date +%T)	# 18:17:21
echo $(date +%H:%M:%S)	# 18:17:21 ; %H: 时 | %M: 分 | %S: 秒
```
> 星期
```shell
echo $(date +%A)	# Sunday | 中文环境输出星期日
```
>年月日时分秒
```shell
echo $(date +%F%n%T)			# 2023-08-20 18:18:21
echo $(date +%Y/%m/%d%n%H:%M:%S)	# 2023/08/20 18:18:21 ; %n: 空格
```

> 下载文件
```shell
wget -N --no-check-certificate https://www.xxx.com/test/install.sh

# 给.sh文件设置755权限
#chmod +x ./install.sh

# 执行
./install.sh
```

> 输入数字安装对应软件的原理示例
```sh
#!/bin/bash

echo "##############################"
echo "### 1: 查看 docker-ce 版本 ###"
echo "### 2: 查看 docker 版本    ###"
echo "### 3: 查看 linux 内核版本 ###"
echo "##############################"

# 注意：定义的函数名不能含有字符"-"
### 一，查看 docker-ce 版本
function show_docker_ce() {
    echo "docker-ce 版本"
    docker version
}

### 二，查看 docker 版本
function show_docker() {
    echo "docker 版本"
    docker --version
}

### 三，查看 linux 内核版本
function show_linux() {
    echo "linux 内核版本"
    uname -r
}

# 注意：定义变量时，=号前后不能有空格
read -p "请输入对应编号或编号组合 : " SOFT_NUM
#如果 ${SOFT_NUM} 字符串为空，则默认为0
if [ -z "${SOFT_NUM}" ];then
	SOFT_NUM=0
fi

#过滤输入的字符（具体命令释义见文末）
#1，提取其中的数字1-3，因为软件就三个，1-3对应三个软件
#2，为每个数字前加上空格，为第三步做准备
#3，替换空格为换行，为第四步做好准备
#4，按从小到大进行排序，并删除重复数字，只保留一个
#5，再把换行替换成空格，为第六步做好准备
#6，去掉字符串中的所有空格
#最后得到的软件编号和组合编号就只有7种形式：1,2,3,12,23,13,123

filter_num=`echo ${SOFT_NUM} | tr -cd "[1-3]" | sed 's/./& /g' | tr ' ' '\n' | sort -nu | tr '\n' ' ' | sed s/[[:space:]]//g`

#此case必须放置在定义的函数后面，不然会提示找不到函数，无法执行
case $filter_num in
 1)
    show_docker_ce
 ;;
 2)
    show_docker
 ;;
 3)
    show_linux
 ;;
 12)
    show_docker_ce
    show_docker
 ;;
 13)
    show_docker_ce
    show_linux
 ;;
 23)
    show_docker
    show_linux
 ;;
 123)
    show_docker_ce
    show_docker
    show_linux
 ;;
 *)
    echo "请重新输入编号或编号组合"
 ;;
esac
```

> 以上代码中对字符串的操作详解
```shell
num="1, 3 2 1-01  - 2345 231 4224533115"
echo ${num} | tr -cd "[0-9]" | sed 's/./& /g' | tr ' ' '\n' | sort -nu | tr '\n' ' ' | sed s/[[:space:]]//g

#释义tr -cd "[0-9]"

#tr 是translate的缩写，主要用于删除文件中的控制字符，或者进行字符转换
#-d 表示删除
#[0-9] 表示所有数字
#-c 表示对条件取反
#tr -cd "[0-9]" 的意思：剔除非数字的字符

#释义tr ' ' '\n' | sort -nu

#tr ' ' '\n' 把空格替换成换行
#sort -n 表示把字符串按数字进行从小到大排序 #sort -u 去除重复数字，只保留一个
# 注意：此两个命令结合才能起到排序的作用（因为sort默认是处理文件的，加上换行欺骗它这是文件）

#释义sed命令

str='bbc123uu789'
echo $str
#bbc123uu789

#在每个字符后加上+号
echo $str|sed 's/./&\+/g'
#b+b+c+1+2+3+u+u+7+8+9+

#在每个字符后加上空格
echo $str|sed 's/./& /g'
#b b c 1 2 3 u u 7 8 9 

#以固定长度用空格分隔（三个.表示每三个字符分隔一次）
echo $str|sed 's/.../& /g'
#bbc 123 uu7 89

#去除字符串中的所有空格
str2='b b c 1 2 3 u u 7 8 9'
echo $str2|sed s/[[:space:]]//g
#bbc123uu789

```