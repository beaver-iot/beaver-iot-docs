---
sidebar_position: 1

---

import { ProjectName } from '/src/consts';

# 后端架构

## 整体架构
![Functional Architecture](/img/functional-arch.png)

- **数据层**：数据存储层，包含关系库和NoSQL（时序库），其中关系库支持开箱即用的内存数据库H2及Postgres SQL
- **核心层**：
    - **数据交换**：核心支撑能力，包含规则引擎、动态脚本、事件总线等核心能力，以及基于核心能力构建的连接器（Connector），来支撑设备数据上行、下行业务场景
    - **规范/标准**：{ProjectName} 平台定义集成开发的标准规范，包括基础规范、集成规范、实体规范、SPI规范等，以规范化集成服务开发
- **组件层**：通用技术组件，并下沉以组件形态，方便更好被上层服务所复用
- **服务层**：
    - **服务**：基于核心层、组件层构建上层必要服务，为上层应用提供支撑
    - **集成**：集成是{ProjectName}实现设备连接、设备控制、功能拓展的主要途径，它能够使{ProjectName}和其它软件、设备、第三方平台等交互。 {ProjectName}平台的集成以插件形式开发，面向社区共建，促进系统的扩展和集成
- **应用层**：基于服务层提供的服务和组件，构建具体的业务应用

![General Architecture](/img/general-arch.svg)

大体上{ProjectName}实现了一个微内核架构，具体功能由集成实现。而{ProjectName}本身只负责数据存储、基本流程定义、集成管理和通用接口实现等。

