title: git 上传项目到 github
author: John Doe
tags: []
categories: []
abbrlink: 720a2000
date: 2023-08-22 12:58:00
---
> windows 和 debian 安装方法
<!-- more -->
<!-- toc -->
## 一、安装 git
### windows10
> 下载地址

http://git-scm.com/download/
> 使用方法

在本地项目目录的空白处右键-"Open Git Bash here"

### debian11
```shell
apt update
apt -y install git
```

## 二，为Github账户设置SSH key
```shell
# 在终端生成公钥 id_rsa.pub（直接3次回车）
ssh-keygen -t rsa -C "xxx@gmail.com" # -C github.com 注册邮箱

# 默认生成公钥的位置
#C:\Users\你的用户名\.ssh

#打开 id_rsa.pub 并复制公钥，在 GitHub 中新增一个 ssh key
#类型 选择 Authentication Key
#标题 随便写一个
```
## 三、全局部署 GitHub 用户名和邮箱，让 GitHub 知道你是谁。
```shell
git config --global user.email "xxx@gmail.com"
git config --global user.name "yyy"
```
## 四，上传本地项目目录的文件
```shell
# 新建项目说明文件（可选）
echo "node 项目文件演示" >> README.md

# 初始化本地项目，会在本地项目目录下新建 .git 文件夹（此文件夹是隐藏的）
git init

# 准备添加到仓库的文件
git add . #添加文件夹内所有文件
git add README.md #添加单个文件

# 准备提交到仓库 -m "对目录或文件的更新日志"
git commit -m "修改了文件中的小bug"

# git add . && git commit -m "修改了文件中的小bug" 合并成一句命令，如下
git commit -am  "修改了文件中的小bug"

# 第一次上传项目时，为项目设置一个分支，不设置则默认是 master，这里定义的是 main 分支（可选）
#git branch -M main

# 设置别称 node_test 并与远程仓库关联，别称可以随便起（仅第一次需要）
git remote add node_test git@github.com:wenyamu/node_demo.git

# 如果你是修改代码后上传到仓库，这一步是标准操作，也是个好习惯（如果是新创建的仓库，可以省略）
#git pull node_test master # master 是仓库的分支

# 上传代码到GitHub仓库
git push -u node_test master # master 是仓库的分支
```
## 总结
> 当你修改本地项目的后，上传可以简化命令
```shell
# 提交并为每个修改后的文件加上提交注释"ssl bugs xxx"
git commit -am "ssl bugs xxx"
#[master df65159] ssl bugs xxx
#2 file changed, 2 insertion(+), 2 deletion(-)

# 上传修改过的文件
git push

```