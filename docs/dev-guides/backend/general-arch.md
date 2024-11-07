---
sidebar_position: 1

---

import { ProjectName } from '/src/consts';

# 后端架构

## 整体架构
//todo  总体架构图，说明各个部分的作用

![General Architecture](/img/general-arch.svg)

大体上{ProjectName}实现了一个微内核架构，具体功能由集成实现。而{ProjectName}本身只负责数据存储、基本流程定义、集成管理和通用接口实现等。

