---
sidebar_position: 3
---

import { ProjectName } from '/src/consts';


# 关键编码概念介绍

## 概念

### identifier
`identifier`指的是在一个对象的标识符，在同一个**命名空间**下不能重复。

只能含有以下字符:`A-Z` `a-z` `0-9` `_` `@` `#` `$` `-`


* 对于[**集成**](../concepts.md)来说，命名空间是**全局**，即一个{ProjectName}应用实例中的不同集成不能拥有重复的集成`identifier`。一般来说，市面上所有集成的`identifier`都不应该重复。
* 对于[**设备**](../concepts.md)来说，命名空间是这个**设备的所属的集成**，即一个集成下的每个设备的`identifier`都应该不同，集成间的设备`identifier`可以重复。如果是与第三方平台集成，我们建议将第三方平台的设备标识符作为`identifier`，方便集成与这个平台的对应设备建立映射关系。
* 对于[**实体**](../concepts.md)来说：
    * **集成的实体**命名空间是**它的集成**
    * **设备的实体**命名空间是**它的设备**。不同集成/设备下实体的`identifier`可以重复
    * **父实体的子实体**命名空间是**它的父实体**。不同父实体下子实体`identifier`可以重复

:::tip Full Identifier
子实体除了`identifier`以外，还有`fullIdentifier`，表示包括父实体在内的标识符

例如：某个子实体的`identifier`是`bar`，其父实体的`identifier`是`foo`。那么这个子实体的`fullIdentifier`就是`foo.bar`
:::


### key

key这个概念通常只对**实体**有意义。

**集成的实体**的key格式为
```
{集成名}.integration.{实体identifier}[.{子实体identifier}]
```
**设备的实体**的key格式为
```
{集成名}.device.{设备identifier}.{实体identifier}[.{子实体identifier}]
```

## 关键对象

### Integration

`Integration`是集成的配置对象，一般是通过集成的yaml文件配置，里面包含了集成的：
* id (对于集成来说就是其identifier)
* 名称
* 图标
* 添加设备的服务实体key
* 删除设备的服务实体key
* 初始的设备
* 初始的实体
* 其它元数据信息

### Device

`Device`是设备的实例，里面有：
* id
* 所属集成的id
* 名称
* 额外数据
* key
* identifier
* 包含的实体

### Entity

`Entity`是实体的实例，对象内容包括：
* id
* 如果是设备的实体，那么会含有设备的key
* 如果是集成的实体，那么会含有集成的id
* 实体名称
* 访问权限（读/写）
* identifier
* 实体值类型
* 实体类型
* 实体属性
* 子实体
* key

### Event

### Exchange

Exchange Up

Exchange Down

### EventBus

