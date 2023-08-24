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
pypy3 get-pip.py
```
## 安装插件
```shell
pip3 install termcolor
```
## 测试代码 test1.py
```py
# pypy3 与 python3 的速度对比
import time
from termcolor import colored

start = time.time()
number = 0
for i in range(100000000):
    number += i

print(colored("FINISHED", "green"))
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