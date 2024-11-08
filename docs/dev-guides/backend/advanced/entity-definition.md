---
sidebar_position: 2
toc_min_heading_level: 2
toc_max_heading_level: 4
---

import CodeBlock from '@theme/CodeBlock';
import { DevProjectRepoSSH } from '/src/consts';
import { ProjectName } from '/src/consts';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 设备/实体构建

## 概述
本章节主要介绍{ProjectName}平台关键对象及如何构建，包括集成、设备、实体等。支持基于注解、编程式、YAML等方式构建。
## 关键对象

编码的基础对象介绍
### Integration

`Integration`是集成配置对象，一般是通过集成的yaml文件配置，可参见[集成构建章节](integration-introduce.md)，里面包含了集成的：
* **id** (对于集成来说就是它的identifier)
* **名称**
* **图标**
* **添加设备的服务实体key**
* **删除设备的服务实体key**
* **初始的设备**
* **初始的实体**
* **关键编码概念介绍**

### Device

`Device`是设备的实例，里面有：
* **id**
* **所属集成的id**
* **名称**
* **额外数据**: 采用Map结构存储设备的额外信息，如设备的SN等
* **key**：设备key, key规则详见[关键编码概念介绍](../../key-dev-concept.md)章节
* **identifier**: 设备identifier, identifier规则详见[关键编码概念介绍](../../key-dev-concept.md)章节
* **包含的实体**

:::tip
设备在保存后，除了**名称**和**额外数据**都不建议再改变其它元数据。
:::

### Entity

`Entity`是实体的实例，对象内容是实体的元数据(不包含实体的值)，包括：
* **id**
* **设备key**: 如果是设备的实体，那么会含有设备的key，规则详见[关键编码概念介绍](../../key-dev-concept.md)章节
* **集成ID** 
* **实体名称**
* **访问权限**: 只读/只写/读写
* **identifier**：实体identifier, identifier规则详见[关键编码概念介绍](../../key-dev-concept.md)章节
* **实体值类型**：包括：STRING, LONG, DOUBLE, BOOLEAN, BINARY, OBJECT
* **实体类型**: 包括：属性实体, 事件实体, 服务实体
* **实体属性**: 实体的属性，如单位, 精度, 最大值, 最小值, 最大长度, 最小长度, 枚举格式等
* **子实体**：实体的子实体，当前最多支持两层关系
* **key**: 实体key, key规则详见[关键编码概念介绍](../../key-dev-concept.md)章节

:::tip
实体在保存后，除了**名称**和**实体属性**都不建议再改变其它元数据。
:::

## 对象构建
<a id="build-with-annotation"></a>
### 基于注解构建
{ProjectName}平台提供了基于注解的方式构建设备、实体，开发者只需在设备类、实体类上添加相应的注解即可完成设备、实体的构建。平台将会在集成启动时加载对应的实体、集成并初始化

#### 注解说明
##### 类注解
- `@IntegrationEntities`：标识当前类为集成实体类
- `@DeviceEntities`：标识当前类为设备实体类
    - `identifier`：设备identifier
    - `name`：设备名称
    - `additional`：设备额外数据，通过@KeyValue注解声明
- `@Entities`：标识当前类为子实体类

##### 字段注解
- `@Entity`：标识当前属性为实体属性
    - `type`：实体类型，包括：属性实体, 事件实体, 服务实体
    - `name`：实体名称
    - `identifier`：实体identifier
    - `attributes`：@Attribute注解声明实体属性，包括如单位, 精度, 最大值, 最小值, 最大长度, 最小长度, 枚举格式等
    - `accessMod`：实体访问权限，包括：只读, 只写, 读写
- `@Attribute`：实体属性注解
  - `enumClass`：枚举类
  - `unit`：单位
  - `fractionDigits`：精度
  - `max`：最大值
  - `min`：最小值
  - `maxLength`：最大长度
  - `minLength`：最小长度
  - `format`：格式

#### 构建集成实体
 
- **定义集成实体**
```java
@Data
@EqualsAndHashCode(callSuper = true)
@IntegrationEntities
public class MyIntegrationEntities extends ExchangePayload {
    @Entity(type = EntityType.SERVICE, name = "Device Connection Benchmark", identifier = "benchmark")
    // highlight-next-line
    private String benchmark;

    @Entity(type = EntityType.PROPERTY, name = "Detect Status", identifier = "detect_status", attributes = @Attribute(enumClass = DetectStatus.class), accessMod = AccessMod.R)
    // highlight-next-line
    private Long detectStatus;
    
    @Entity(type = EntityType.SERVICE, identifier = "delete_device")
    // highlight-next-line
    private String deleteDevice;
    
    public enum DetectStatus {
        STANDBY, DETECTING;
    }
}
```

:::tip
- 默认情况下，@Entity实体注解采用对象字段(驼峰转下划线)名作为实体name、identifier,开发者可通过name、identifier属性自定义实体名称、identifier
- 当在消费者端订阅实体时，注解的实体对象同时可用于接收ExchangePayload事件数据，即可通过Getter方法获取到属性值，从而简化代码开发，可参见[事件订阅](eventbus.md)章节。
需注意当用于接收事件数据时，实体对象需继承ExchangePayload类，并且实体属性包含对应的Getter方法
:::
- **定义集成子实体**
```java
@Data
@EqualsAndHashCode(callSuper = true)
@IntegrationEntities
public class MyIntegrationEntities extends ExchangePayload {
    
    @Entity(type = EntityType.EVENT, name = "Detect Report", identifier = "detect_report")
    // highlight-next-line
    private DetectReport detectReport;

    @Entity(type = EntityType.SERVICE, identifier = "add_device")
    // highlight-next-line
    private AddDevice addDevice;

    @Data
    @EqualsAndHashCode(callSuper = true)
    @Entities
    public static class DetectReport extends ExchangePayload {
        // Entity type inherits from parent entity (DetectReport)
        @Entity
        private Long consumedTime;

        @Entity
        private Long onlineCount;

        @Entity
        private Long offlineCount;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    // highlight-next-line
    @Entities
    public static class AddDevice extends ExchangePayload {
        @Entity
        private String ip;
    }
}
```

:::tip
当实体类为子实体时，需在子实体类上添加@Entity注解，即可完成子实体的构建。子实体默认继承父实体的属性,即子实体不需要设置type类型
:::
#### 定义设备实体
```java
@Data
@EqualsAndHashCode(callSuper = true)
@DeviceEntities(name="demoDevice", additional = {@KeyValue(key = "sn", value = "demoSN")}, identifier = "demoSN")
public class MyDeviceEntities extends ExchangePayload {
    
  @Entity(name = "temperature", identifier = "temperature", accessMod = AccessMod.RW, type = EntityType.PROPERTY)
  // highlight-next-line
  public Double temperature;
  
  @Entity
  // highlight-next-line
  private String humidity;
}
```
:::tip
当实体类为设备实体，只需添加@DeviceEntities注解即可，同时{ProjectName}平台会完成设备的初始化构建
:::

### 编程式构建
{ProjectName} 平台提供了DeviceBuilder、EntityBuilder等Builder类，开发者可通过编程式构建设备、实体等对象。

#### 构建集成实体
- **不包含子实体**
```java
  // highlight-next-line
  Entity entityConfig = new EntityBuilder(integrationId)    //设置集成标识
          .identifier("webhookStatus")        //设置实体标识
          .property("webhookStatus", AccessMod.R) //设置实体属性
//          .service("accessKey")             //设置实体服务
//          .event("accessKey")               //设置实体事件
          .attributes(new AttributeBuilder().maxLength(300).enums(IntegrationStatus.class).build())      //设置实体属性,也可以使用attributes(Supplier<Map<String, Object>> supplier)方法进行构建
          .valueType(EntityValueType.STRING)    //设置实体值类型
          .build();
```
- **包含子实体**
<Tabs>
  <TabItem value="示例1" label="示例1" default>
```java
   // highlight-next-line
  //示例1： 通过EntityBuilder的children()方法构建子实体
  Entity entityConfig = new EntityBuilder(integrationId)
          .identifier("settings")
          .property("settings", AccessMod.RW)
          .valueType(EntityValueType.STRING)
          // highlight-next-line
          .children()           //设置子实体
              .valueType(EntityValueType.STRING).property("accessKey", AccessMod.RW).end()
          // highlight-next-line
          .children()
              .valueType(EntityValueType.STRING).property("secretKey", AccessMod.RW).end()
          .build();
```
  </TabItem>
  <TabItem value="示例2" label="示例2">

```java
  // highlight-next-line
  //示例2： 通过EntityBuilder的children(Supplier<List<Entity>> supplier)方法设置子实体
  // highlight-next-line
  Entity parentEntity = new EntityBuilder(integrationId)
        .identifier("settings")
        .property("settings", AccessMod.RW)
        .valueType(EntityValueType.STRING)
        // highlight-next-line
        .children(()->{
            Entity childEntity = new EntityBuilder()  //定义子实体
                    .identifier("accessKey")
                    .property("accessKey", AccessMod.RW)
                    .valueType(EntityValueType.STRING)
                    .build();
            return List.of(childEntity);
        })  //设置子实体，可以是List<Entity>或是单个实体
        .build();
```
  </TabItem>
  <TabItem value="示例3" label="示例3">

```java
  // highlight-next-line
  //示例2： 通过EntityBuilder的children(List<Entity> entities)方法设置子实体
  Entity childEntity = new EntityBuilder()  //定义子实体
        .identifier("accessKey")
        .property("accessKey", AccessMod.RW)
        .valueType(EntityValueType.STRING)
        .build();
  // highlight-next-line
  Entity parentEntity = new EntityBuilder(integrationId)
        .identifier("settings")
        .property("settings", AccessMod.RW)
        .valueType(EntityValueType.STRING)
        // highlight-next-line
        .children(childEntity)  //设置子实体，可以是List<Entity>或是单个实体
        .build();
```
  </TabItem>
</Tabs>

#### 构建设备及实体
- **构建设备**
```java
  // highlight-next-line
  Device device = new DeviceBuilder(integrationConfig.getId())
          .name("deviceDemo")                   //设置设备名称
          .identifier("deviceDemoIdentifier")   //设置设备标识
          .additional(Map.of("sn", "demoSN"))  //设置额外数据
          .build();
```
- **构建设备实体**

<Tabs>
  <TabItem value="示例1" label="示例1(推荐)" default>
```java
  //highlight-next-line 
  //示例1： 通过DeviceBuilder构建设备及实体示例：
  // highlight-next-line
  Device device = new DeviceBuilder(integrationConfig.getId())
          .name("deviceDemo")
          .identifier("deviceDemoIdentifier")
          .entity(entity)             //设置设备实体，可以是List<Entity>或是单个实体
          .additional(Map.of("sn", "demoSN"))
          .entity(()->{
              return new EntityBuilder(integrationId)    //设置集成标识
                    .identifier("temperature")        //设置实体标识
                    .property("temperature", AccessMod.R) //设置实体属性
                    .valueType(EntityValueType.STRING)    //设置实体值类型
                    .build();
            })
          .build();
```
  </TabItem>
  <TabItem value="示例2" label="示例2" default>
```java
  //highlight-next-line 
  //示例1： 通过DeviceBuilder构建设备及实体示例：
  //定义实体
  Entity entity = new EntityBuilder(integrationId)    //设置集成标识
        .identifier("temperature")        //设置实体标识
        .property("temperature", AccessMod.R) //设置实体属性
        .valueType(EntityValueType.STRING)    //设置实体值类型
        .build();
  // highlight-next-line
  Device device = new DeviceBuilder(integrationConfig.getId())
          .name("deviceDemo")
          .identifier("deviceDemoIdentifier")
          .entity(entity)             //设置设备实体，可以是List<Entity>或是单个实体
          .additional(Map.of("sn", "demoSN"))
          .build();
```
  </TabItem>
  <TabItem value="示例3" label="示例3">

```java
    // highlight-next-line
    Device device = new DeviceBuilder(integrationConfig.getId())
        .name("deviceDemo")
        .identifier("deviceDemoIdentifier")
        .entity(entityConfig)             //设置设备实体，可以是List<Entity>或是单个实体
        .additional(Map.of("sn", "demoSN"))
        .build();
    //highlight-next-line
    //示例2： 通过EntityBuilder构建设备实体示例：
    Entity entity = new EntityBuilder(integrationId, device.getKey())    //指定集成标识和设备key
        .identifier("temperature")        //设置实体标识
        .property("temperature", AccessMod.R) //设置实体属性
        .valueType(EntityValueType.STRING)    //设置实体值类型
        .build();
    device.setEntities(Collections.singletonList(entity));
```
  </TabItem>
</Tabs>

#### 构建实体属性
 
  {ProjectName} 平台提供了AttributeBuilder类，开发者可通过编程式构建实体属性。当前平台支持的属性包括：单位、精度、最大值、最小值、最大长度、最小长度、枚举格式等，也可以支持开发者自定义属性，例如：

```java
  // highlight-next-line
    Map<String, Object> build = new AttributeBuilder()
        .unit("s") // 单位为秒
        .fractionDigits(0) // 小数位数为0，表示精确到秒
        .min(0.0) // 设定合理的最小值（根据实际需求调整）
        .maxLength(10) // 设定合理的最大长度（根据实际需求调整）
        .minLength(1) // 设定合理的最小长度（根据实际需求调整）
        .format("yyyy-MM-dd HH:mm:ss") // 时间格式精确到秒
        .build();
```

#### 添加/删除设备实体

{ProjectName}平台支持添加、删除设备，开发者可通过配置

- **新增设备**

新增设备事件，平台将会在ExchangePayload上下文中携带设备名称`device_name`,开发者可以从ExchangePayload的上下文中获取，或实现`AddDeviceAware`接口获取新增的设备信息。

<Tabs>
  <TabItem value="方式1" label="方式1(推荐)" default>

- 定时实体
```java
    @Data
    @EqualsAndHashCode(callSuper = true)
    @Entities
    public static class AddDevice extends ExchangePayload implements AddDeviceAware {
      @Entity
      private String ip;
    }
```
- 获取设备名
```java
  @EventSubscribe(payloadKeyExpression = "my-integration.integration.add_device.*", eventType = ExchangeEvent.EventType.DOWN)
  // highlight-next-line
  public void onAddDevice(Event<MyIntegrationEntities.AddDevice> event) {
      String deviceName = event.getPayload().getAddDeviceName();
      ...
  }
```
  </TabItem>
  <TabItem value="方式2" label="方式2" default>
- 获取设备名
```java
  @EventSubscribe(payloadKeyExpression = "my-integration.integration.add_device.*", eventType = ExchangeEvent.EventType.DOWN)
  // highlight-next-line
  public void onAddDevice(Event<MyIntegrationEntities.AddDevice> event) {
      String deviceName = event.getPayload().getContext().get(ExchangeContextKeys.DEVICE_NAME_ON_ADD);
      ...
  }
```
  </TabItem>
</Tabs>

- **删除设备**

删除设备事件，平台将会在ExchangePayload上下文中携带删除的设备`device`,开发者可以从ExchangePayload的上下文中获取，或实现`DeleteDeviceAware`接口获取新增的设备信息。


<Tabs>
<TabItem value="方式1" label="方式1(推荐)" default>

- 定义设备删除的实体
```java
  @Data
  @EqualsAndHashCode(callSuper = true)
  @Entities
  public static class DeleteDevice extends ExchangePayload implements DeleteDeviceAware {
  }
```

:::danger 注意
设备删除的实体不应该包含任何实体，即这个类应该为空。
:::
- 获取删除的设备
```java
  @EventSubscribe(payloadKeyExpression = "my-integration.integration.delete_device", eventType = ExchangeEvent.EventType.DOWN)
  // highlight-next-line
  public void onDeleteDevice(Event<MyIntegrationEntities.DeleteDevice> event) {
      Device device = event.getPayload().getDeletedDevice();
      ...
  }
```
  </TabItem>
  <TabItem value="方式2" label="方式2" default>
- 获取删除的设备
```java
  @EventSubscribe(payloadKeyExpression = "my-integration.integration.delete_device", eventType = ExchangeEvent.EventType.DOWN)
  // highlight-next-line
  public void onDeleteDevice(Event<MyIntegrationEntities.DeleteDevice> event) {
      Device device = event.getPayload().getContext().get(ExchangeContextKeys.DEVICE_ON_DELETE);
      ...
  }
```
  </TabItem>
</Tabs>


### 基于YAML构建
 为方便开发，{ProjectName}平台也提供了基于YAML的方式构建设备、实体等对象。开发者只需在集成的yaml文件中定义设备、实体等对象即可完成设备、实体的构建。平台将会在集成启动时加载对应的实体、集成并初始化。

```yaml
integration:
  my-integration: # integration identifier
    # ...
    initial-entities: # initial entities
      - identifier: 'connect' # entity identifier
        name: connect         # entity name
        value_type: string    # entity value type
        type: service         # entity type
        access_mod: RW        # entity access mode
        children:             # children entities
          - identifier: 'url'
            name: connectUrl    
            value_type: string
            type: service
    initial-devices: # initial devices
      - identifier: 'demoDevice' # device identifier
        name: demoDevice         # device name
        entities:             # device entities
          - identifier: 'temperature'
            name: temperature
            value_type: long
            access_mod: RW
            type: property
```

:::tip
通常情况下，基于注解和编程式构建设备、实体方式更加灵活，能够解决绝大多数的需求场景。基于YAML构建，平台旨在提供多种手段，方便开发者快速构建设备、实体
:::
