title: hexo配置研究
author: John Doe
abbrlink: 7f79bcde
tags: []
categories: []
excerpt: >-
  这是一段文章摘要，是通过 Front-Matter 的 excerpt 属性设置的。 下面的图片也是，它将会出现在你的文章展示页面 <img
  src="https://liuyib.github.io/assets/banner/add-commits-to-others-pr.png"
  class="zoomimg">
date: 2022-01-08 15:28:00
---
## 第一次使用hexo

### 快速使用
```bash
npm install hexo-cli -g # 全局安装模块
hexo init /hexo # 新建并初始化项目目录
cd /hexo
npm install
hexo server # 简写：hexo s
```
然后就可以通过 http://ip:4000 打开你的hexo博客了

<!-- more -->

> 注意：以下是使用 alpine hexo 容器进行建站

```shell
~/.hexo $ hexo -v
INFO  Validating config
hexo: 6.3.0
hexo-cli: 4.3.1
os: linux 5.10.0-15-amd64 Alpine Linux
node: 18.17.0

~/.hexo $ npm -v
9.6.6

~/.hexo $ cat /etc/alpine-release
3.18.3

```

## 所有者不是 admin 的问题
1、遇到过编辑文章时，无法保存，服务也不可访问的情况。

2、开启 hexo-abbrlink 也是服务无法访问。

研究发现：文章的所有者不是 admin 需要修改成 admin
```shell
# 修改文件所有者(在宿主机中运行，因为容器中没有权限修改)
chown 新所有者名或id 待修改的文件
# 修改文件的所有者
chown admin test.md
# 批量修改 _posts 目录下的文件夹和文件的所有者
chown -R admin _posts
```
修改之后需要重启，不然 hexo-admin 后台看不到此文件


## hexo 内容管理后台
```shell
npm install hexo-admin
```
然后就可以通过 http://ip:4000/admin 打开你的hexo博客后台了

## 使用 hexo-admin 后台执行 deploy

在 /hexo 目录下新建 hexo_deploy.sh 文件代码内容如下：
```
#!/usr/bin/env sh
hexo clean
hexo g
hexo d
```
修改 /hexo/_config.yml 文件，添加以下内容
```
# hexo-admin 使用用户:ljs 和密码:ljsljs 登录
admin:
  #username: ljs
  #password_hash: $2a$10$/CFpA2l/UkaHwCPfGus1JuLhZt4vJu1LDTppN39dEgayA0a0Yleqy
  #secret: fdasf789$$%@%@$#
  deployCommand: './hexo_deploy.sh'
```
> 以上完成后，在 http://ip:4000/admin/#/deploy 页面下 点击 deploy 按钮，就可以运行 hexo_deploy.sh

## 自动生成目录
如果想让博文自动生成目录 需要安装 hexo-toc 插件（有的主题会自带生成目录的功能，像stun）
```shell
npm install hexo-toc
```
然后使用以下标签，写在需要生成目录的位置，一般是放在文章内容顶部
```html
<!-- toc -->
```

安装后如果没有生效，重启hexo服务

## 生成永久链接地址
原理是为 *.md 添加一个标签 abbrlink: 123456

在文章（*.md）修改时（包括文件名和文章内容），插件生成的 abbrlink 值前后都是一样的，相当于生成了一个固定的唯一的url永久地址。

插件 [hexo-abbrlink](https://github.com/rozbo/hexo-abbrlink) 生成字母和数字组合

插件 [hexo-abbrlink2](https://github.com/rozbo/hexo-abbrlink2) 生成递增的数字
```shell
# 安装插件
npm install hexo-abbrlink
npm install hexo-abbrlink2

# 修改 /hexo/_config.yml文件
# 不带 .html 后缀
#permalink: posts/:abbrlink/
# 带 .html 后缀
permalink: posts/:abbrlink.html
abbrlink:
  #hexo-abbrlink 设置
  alg: crc32   #算法： crc16(default) and crc32(推荐)
  rep: hex     #进制： dec(default) and hex(推荐)
  #hexo-abbrlink2 设置
  #start: 1000 # the first id, default 0
```

## 安装主题
```shell
cd /hexo
git clone https://github.com/liuyib/hexo-theme-stun.git themes/stun
npm install hexo-renderer-pug
```

找到 /hexo/_config.yml 文件 修改主题为 stun
```/hexo/_config.yml
theme: stun
```

## 安装本地搜索插件

在 /hexo 下安装本地搜索插件：
```shell
npm install hexo-generator-search
```
配置插件，找到 /hexo/ _config.yml 文件，添加以下字段：
```/hexo/_config.yml
search:
  path: search.json
  field: post
  content: true
```
生成数据，安装上述插件后，在 /hexo 下执行指令：
```shell
hexo g
```
这样会在 /hexo/public 下生成 search.json 文件，Stun 主题的本地搜索功能就是利用这个文件里的数据实现的。

修改主题配置文件 /hexo/themes/stun/_config.yml
```/hexo/themes/stun/_config.yml
local_search:
  enable: true
```
## 安装 hexo deploy 部署插件
```shell
npm install hexo-deployer-rsync
npm install hexo-deployer-git
```
### hexo-deployer-rsync 插件的使用
> 执行 hexo d 发布 public 目录下的静态文件到nginx服务器
> 必须是ssh免密登陆，不然每次还需要输入远程服务器的密码

```
# 需要使用 root 用户进入容器，不然没有权限安装
docker exec -it --user root hexo sh

# 安装 rsync 和 openssh
apk update
apk add --update --no-cache rsync openssh

# 在 hexo 容器中执行，默认3次回车生成公钥和私钥文件
# 记清楚你是使用 哪个用户 运行，例如使用 hexo 用户
ssh-keygen

# 拷贝容器公钥文件到远程服务器上
# 如果你是使用 hexo 用户运行 ssh-keygen 命令，则执行以下代码：
# 需要输入一次远程服务器 45.77.216.11 的登录密码
ssh-copy-id -i /home/hexo/.ssh/id_rsa.pub root@45.77.216.11
# 如果出现错误 删除 /home/hexo/.ssh/known_hosts 文件即可
rm /home/hexo/.ssh/known_hosts
```
### hexo-deployer-git 插件的使用
```shell
# 新建 github.com 仓库名 wenyamu.github.io

# 设置 ssh key
ssh-keygen -t rsa -C "xxx@gmail.com" # -C github.com 注册邮箱
# 默认生成公钥的位置
#/home/hexo/.ssh/id_rsa.pub

#打开 id_rsa.pub 并复制公钥，在 GitHub 中新增一个 ssh key
#类型 选择 Authentication Key
#标题 随便写一个

# 全局部署 GitHub 用户名和邮箱，让 GitHub 知道你是谁。
git config --global user.email "xxx@gmail.com"
git config --global user.name "yyy"

```

修改 /hexo/_config.yml 配置文件，一般在最底部
```
deploy:
# 上传到 nginx 服务器
- type: rsync                 # 发布方式
  host: 45.77.216.11          # nginx服务器ip
  user: root                  # ssh登陆用户名
  root: /usr/share/nginx/html # nginx服务器的静态文件目录
  port: 22                    # ssh登陆端口
  delete: true                # public目录下没有，而ssh服务器上有的文件，则被删除
  progress: true              # 显示rsync进展
  args: ""                    # rsync 参数
  rsh: ""                     # 指定要使用的远程shell
  key: ""                     # 定制的SSH私有密钥
  verbose: false              # 是否显示文件上传详细信息
  ignore_errors: false        # 是否忽略错误提示
  create_before_update: false # 首先创建不存在的文件,然后更新现有的文件
# 上传到 github.com 使用 https://wenyamu.github.io/ 访问页面
- type: git
  repo: git@github.com:wenyamu/wenyamu.github.io.git
  branch: master
```

## 让 .md 文件名称与文章标题一致
> 替换 abc.md 文件中的 title: 字段的值为 abc
> 因为 hexo 文章的标题是根据 .md 文件中的 title 字段的值作为标题

新建 /hexo/retitle.js
```js
/**
 ** 替换 abc.md 文件中的 title: 字段的值为 abc
 ** 因为 hexo 文章的标题是根据 .md 文件中的 title 字段的值作为标题
 ** 修改 .md 的文件名称很方便 但是 title 字段的值不方便修改
 **

// 对单个文件操作
const fs = require('fs');
const filePath = './path/to/123456.md';
const fileData = fs.readFileSync(filePath, { encoding: 'utf8' });

var RegExp=/(title:\s*)(.*)/g; // 匹配 .md 文件中 title: 后面的参数值

if(RegExp.test(fileData)){ //如果匹配到`title`字段
  var title = fileData.match(RegExp)[0]; // 匹配结果返回 title: aaaa
  var name  = title.substr(7); // 得到 title 参数值 aaa
  console.log(title);
  console.log(name);

  // 替换 title 参数值（只替换从文件顶部开始匹配到的第一个）
  const modifiedData = fileData.replace(name, 'bar');

  // 将修改后的数据写回到文件中
  fs.writeFileSync(filePath, modifiedData);
  //console.log('数据已修改');
}
*/

/* 对文件夹下的每个文件 操作*/

//引入fs操作文件
var fs = require('fs');
var join = require('path').join;

// 设置要操作的文件夹
var dirpath = "./source/_posts/";

function getAllFiles(dir){
  let jsonFiles = [];
  function findJsonFile(path){
    let files = fs.readdirSync(path);
    files.forEach(function (item, index) {
      let fPath = join(path,item);
      let stat = fs.statSync(fPath);
      if(stat.isDirectory() === true) {
        findJsonFile(fPath);
      }
      if (stat.isFile() === true) { 
        jsonFiles.push(fPath);
      }
    });
  }
  findJsonFile(dir);
  //console.log(jsonFiles);//指定目录下的文件，包括子目录
  return jsonFiles;
}

function doFileEdit(){
  // 文件夹下每个文件的路径json数据
  var filesPathJson = getAllFiles(dirpath);
  //console.log(filesPathJson);
  for(var i=0; i < filesPathJson.length; i++){
    var _file = filesPathJson[i]; // path/to/123456.md

    var filename = _file.substr(_file.lastIndexOf('/')+1); // 123456.md
    var md_name  = filename.slice(0,-3); // 123456
    //console.log(md_name);

    var fileData = fs.readFileSync(_file, { encoding: 'utf8' });
    
    // 匹配 .md 文件中 title: 后面的参数值(.md 文件中 冒号后面有空格)
    var RegExp=/(title:\s*)(.*)/g;

    if(RegExp.test(fileData)){ //如果匹配到`title`字段
      var md_title_str = fileData.match(RegExp)[0]; // 返回 title: aaaa
      var md_title_var  = md_title_str.substr(7); // 返回 title 参数值 aaa
      //console.log(md_title_str);
      //console.log(md_title_var);
      
      // 如果 .md 文件中的 title 参数值 与 .md 文件名称不一致，则修改
      if(md_title_var != md_name){
        
        console.log(
        "\x1B[35m"
        + filename
        + "\x1B[0m"
        + "  "
        + md_title_str
        + "\x1B[32m ===> \x1B[0m"
        + "\x1B[36m"
        + md_name
        + "\x1B[0m"
        );

        // 替换 title 参数值（只替换从文件顶部开始匹配到的第一个）
        var modifiedData = fileData.replace(md_title_var, md_name);

        // 将修改后的数据写回到文件中
        fs.writeFileSync(_file, modifiedData);
      }
    }
  }
}

console.log("\x1B[1m ---修改文件列表--- \x1B[0m");
doFileEdit();

```
先执行 node retitle.js
再执行 hexo g 

## hexo 常用命令

```shell
# 初始化
hexo init

# 启动 Hexo 服务器
hexo s

# 清除缓存文件 (db.json) 和已生成的静态文件 (public)
hexo clean

# 生成全局静态文件
hexo g

#生成静态文件并部署
hexo g -d

# 部署
hexo d

# 部署前生成静态文件
hexo d -g

# 显示 Hexo 版本
hexo version

```
然后项目目录下会生成一个 public 文件夹，静态文件都在其中，最后就可以布署到nginx服务器上了。