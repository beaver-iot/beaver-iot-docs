---
sidebar_position: 1

---

import { ProjectName } from '/src/consts';

# 后端架构

## 总体架构
![General Architecture](/img/general-arch.svg)

大体上{ProjectName}实现了一个微内核架构，具体功能由集成实现。而{ProjectName}本身只负责数据存储、基本流程定义、集成管理和通用接口实现等。

## 集成生命周期

![General Architecture](/img/integration-lifecycle.svg)

* {ProjectName}启动后首先会初始化应用程序环境
  * 加载所有集成的配置，存入内存中
  * 调用每个集成的`onPrepared`函数

* 将集成的设备和实体持久化
  * 用每个集成的`onStarted`函数
  * 接下来{ProjectName}程序正式启动运行。
* 集成销毁会调用`onDestroyed`函数