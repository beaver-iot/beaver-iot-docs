---
sidebar_position: 3
---

# 关键对象

## Integration

`Integration`是集成的配置对象，一般是通过集成的yaml文件配置，里面包含了集成的：
* id (对于集成来说就是其identifier)
* 名称
* 图标
* 添加设备的服务实体key
* 删除设备的服务实体key
* 初始的设备
* 初始的实体
* 其它元数据信息

## Device

`Device`是设备的实例，里面有：
* id
* 所属集成的id
* 名称
* 额外数据
* key
* identifier
* 包含的实体

:::note 注意
设备在保存后，除了**名称**和**额外数据**都不再变化，
:::



## Entity

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

## Event

Event分为`DeviceEvent` / `EntityEvent` / `ExchangeEvent`

## Exchange

Exchange Up

Exchange Down

## EventBus

