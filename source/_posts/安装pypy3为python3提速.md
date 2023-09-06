title: 安装pypy3为python3提速
author: John Doe
tags: []
categories:
  - python
abbrlink: 652f3f3a
date: 2023-08-14 21:36:00
---
据说让 python3 提速10倍 | debian 安装 pypy3

<!-- more -->
## 安装pypy3
> pypy3 对应的是 python3
```shell
apt update
apt install -y pypy3
```
## 安装pip3
```shell
wget https://bootstrap.pypa.io/get-pip.py
python3 get-pip.py
# 或者
apt install -y pip-python3
```
## 升级pip
```shell
pip3 install --upgrade pip
# 或者
python3 -m pip install --upgrade pip
```

## 安装模块
```shell
pip3 install termcolor
# 或者
python3 -m pip install termcolor

# 如果 pypy3 运行时无法调用模块，可以试试
pypy3 -m pip install termcolor
```
## 测试代码 test1.py
```py
# pypy3 与 python3 的速度对比
import time
#from termcolor import colored

start = time.time()
number = 0
for i in range(100000000):
    number += i

#print(colored("FINISHED", "green"))
print(f'Ellapsed time: {time.time() - start} s')
```
### test1.py 测试结果
```shell
root@sg:~# pypy3 test1.py
FINISHED
Ellapsed time: 0.23811650276184082 s
root@sg:~# python3 test1.py
FINISHED
Ellapsed time: 11.29741096496582 s
```
## 测试代码 test2.py
```py
# pypy3 与 python3 的速度对比
import time

start_time=time.time()
total=0
for i in range(1,5000):
    for j in range(1,5000):
        total+=i*j-2*j-2*i

print(f"计算结果:{total}")
end_time=time.time()
print(f"耗时{end_time-start_time:.2f}秒")
```
### test2.py 测试结果
```shell
root@sg:~# pypy3 test2.py
计算结果:155937606240000
耗时0.08秒
root@sg:~# python3 test2.py
计算结果:155937606240000
耗时5.59秒
```

> pypy3 比 python3 快了好多

## Python 虚拟环境
> Python 应用经常需要使用一些包第三方包或者模块，有时需要依赖特定的包或者库的版本，所以不能有一个能适应所有 Python 应用的软件环境，很多时候不同的 Python 应用所依赖的版本是冲突的，满足了其中一个，另一个则无法运行，解决这一问题的方法是 虚拟环境。虚拟环境是一个包含了特定 Python 解析器以及一些软件包的自包含目录，不同的应用程序可以使用不同的虚拟环境，从而解决了依赖冲突问题，而且虚拟环境中只需要安装应用相关的包或者模块，可以给部署提供便利。

```shell
# 有时会提示安装 ensurepip (Debian/Ubuntu)
apt install python3-venv

# 在当前目录创建一个名为 diy-env 的虚拟环境
python3 -m venv diy-env
#root@localhost:~/python/test# python3 -m venv diy-env

# 激活 diy-env 虚拟环境（会在命令行最前面出现当前激活的虚拟环境标记）
source diy-env/bin/activate
#root@localhost:~/python/test# source diy-env/bin/activate
#(diy-env) root@localhost:~/python/test#

# 退出虚拟环境
deactivate
#(diy-env) root@localhost:~/python/test# deactivate
#root@localhost:~/python/test#
```