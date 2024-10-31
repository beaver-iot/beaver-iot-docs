---
sidebar_position: 2
toc_min_heading_level: 2
toc_max_heading_level: 5
---

import { ProjectName } from '/src/consts';

# 项目简介

## 本项目解决什么样的问题

> 为什么有{ProjectName}这样一个项目

物联网技术在现实生活中覆盖范围非常广。我们希望能够通过一个平台软件，屏蔽所有中间传输方式，将这些设备联动起来。

以物联网设备供应商为主导开发的应用（[Milesight IoT Cloud](https://www.milesight.com/iot/product/milesight-iot-cloud/)），和自身的产品耦合较高。在实际场景下，用户使用的设备常常因为引入时间、功能、连接方式等不同，来源于不同的供应商。这导致了这些设备无法在同一个平台使用，限制了供应商应用的功能发挥。

以第三方解决方案商为主导开发的应用，有时为了盈利导致了核心代码闭源，可定制化程度较低，对接设备和平台有限（[Akenza](https://akenza.io/) / [EWeLink](https://ewelink.cc/)）。有时候为了较高的通用性，导致复杂性和使用成本变高(ThingsBoard)。

{ProjectName}项目将核心功能和概念尽量简化，以尽可能少的理解成本来实现尽可能多的功能。同时，作为一个开源项目，设备供应商和其它社区开发者可以开发自己的集成组件，扩展项目的功能。并且能够定制化为自己的应用，向客户提供解决方案。

## 项目的定位

一般的物联网应用包含多个层级，我们把它分成了六个层次，如图所示，每个层级的宽度表示这个层级的复杂性。

![Project Location](/img/project-location.svg)

{ProjectName}的核心模块专注于最通用的**数据管理**和**通用应用**，并且以这两个层级为支点，以**集成**为主要形式，向下拓展兼容设备和平台的能力，向上拓展具体场景功能。

| 功能层次    | 来源     | 举例 |
| --------   | ------- | -------                                         |
| 设备接入    | {ProjectName}集成🔌    | Socket / Mqtt / Cellular / LoRaWAN / Bluetooth  |
| 系统接入    | {ProjectName}集成🔌    | Mqtt / Webhook / Api / RPC                      |
| 编码/解码   | {ProjectName}集成🔌    | Binary / JSON / XML                             |
| 数据管理    | {ProjectName}核心🔤    | 数据库 / 核心库调用                                |
| 通用应用    | {ProjectName}核心🔤    | 仪表盘 / 工作流 / 规则引擎                         |
| 领域场景应用 |*用户👤或{ProjectName}集成🔌 | 能耗监控 / 农田灌溉 / 家庭灯光控制                   |

> *用户可以根据**通用应用**来创建具体的**领域场景应用**

