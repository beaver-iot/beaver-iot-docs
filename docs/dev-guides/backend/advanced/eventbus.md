---
sidebar_position: 3
toc_min_heading_level: 2
toc_max_heading_level: 4
---

import CodeBlock from '@theme/CodeBlock';
import { DevProjectRepoSSH } from '/src/consts';
import { ProjectName } from '/src/consts';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 事件总线
## 概述
{ProjectName} 平台提供了事件总线，用于在系统内部各个服务、集成之间进行通信，开发者可以通过订阅事件来实现自己的业务逻辑。平台事件总线支持基于Key表达式的事件订阅，以支持更细粒度的订阅。
当前平台支持的事件类型有：设备事件、实体事件、实体值数据交换事件(Exchange),开发者也可以自定义事件类型。
## 事件定义
### Event 事件

{ProjectName}的某些资源发生变化时，会触发相关的**事件**`Event`，订阅这些事件的处理方法就会被触发，这是整个系统运行的基础。

事件分为： **设备事件**`DeviceEvent` / **实体事件**`EntityEvent` / **实体值数据交换事件**`ExchangeEvent`

#### DeviceEvent
表示**设备元数据**相关事件，事件的类型(`DeviceEvent.EventType`)有：创建`CREATED` / 更新`UPDATED` / 删除`DELETED`。这个事件会携带发生变化的设备。*这个事件在保存设备元数据时会自动触发，一般不需要集成开发者发送事件。*

DeviceEvent对应的Payload为**Device对象**。

#### EntityEvent
表示**实体元数据**相关事件，事件的类型(`EntityEvent.EventType`)有：创建`CREATED` / 更新`UPDATED` / 删除`DELETED`。这个事件会携带发生变化的实体。*这个事件在保存实体元数据时会自动触发，一般不需要集成开发者发送事件。*

EntityEvent对应的Payload为**Entity对象**。

#### ExchangeEvent
表示**实体值数据**相关事件，事件的类型(`ExchangeEvent.EventType`)有：下行`DOWN` / 上行`UP`。

ExchangeEvent对应的Payload为**ExchangePayload对象**,开发者也可以自定义Payload对象并继承**ExchangePayload**即可。可参见[设备/实体构建](entity-definition.md)章节的注解声明实体章节。


:::tip
{ProjectName} 平台提供了事件总线，开发者也可以自定义事件类型，只需实现自定义的Event事件和Payload即可，其中Event事件需要继承`Event`接口，Payload需要继承`IdentityKey`接口。
:::

## 事件发布
{ProjectName}平台提供了ExchangePayload事件发布的流程执行器，开发者可以通过调用`ExchangeFlowExecutor`服务实现ExchangeEvent事件的发布。可支持同步和异步方式发布，另外支持指定EventType（即上行或下行）。

### 事件发布流程
:::info
实体数据**下行**和**上行**表示的主体是实体的所属者。**下行**表示数据流向这个所属者，**上行**表示数据从这个所属者流出。*当数据流出和流入的所属者相同时，按流出方为准，即按照<b>上行</b>对待。*

##### 下行举例
* 用户在前端更新一个设备或者集成的属性或服务实体
* 集成的定时任务，触发一个设备的服务实体

##### 上行举例
* 设备上传了属性实体值的更新
* 设备上传了事件
* *集成更新了集成自己的实体*

:::

`ExchangeEvent`事件我们会触发**通用内置流程**，流程包含实体**数据校验**、实体**当前值保存**（仅属性实体）、实体**历史值保存**，然后才触发相关订阅的方法。

![Exchange Event Flow](/img/exchange-flow.svg)

无论是同步请求还是异步请求，相关监听器都会被调用。

同步请求的情况下，某些监听器的执行抛出了异常，会先捕捉并收集，然后在所有同步监听器执行完毕后抛出一个异常。如果没有抛出异常，则返回所有同步监听器的执行结果。

### 代码示例

<Tabs>
<TabItem value="同步" label="同步" default>

```java
    @Service
    public class ExchangeDemoService {
    
        @Autowired
        private ExchangeFlowExecutor exchangeFlowExecutor;
        
        public EventResponse exchangeUp(ExchangePayload payload){
            //上行
            //highlight-next-line
            return exchangeFlowExecutor.syncExchangeUp(payload);
        }
    
        public EventResponse exchangeDown(ExchangePayload payload){
            //下行
            //highlight-next-line
            return exchangeFlowExecutor.syncExchangeDown(payload);
         }
}
```
  </TabItem>
 <TabItem value="异步" label="异步" default>

```java
    @Service
    public class ExchangeDemoService {
    
        @Autowired
        private ExchangeFlowExecutor exchangeFlowExecutor;
        
        public void exchangeUp(ExchangePayload payload){
            //上行
            //highlight-next-line
            exchangeFlowExecutor.asyncExchangeUp(payload);
    }
    
        public void exchangeDown(ExchangePayload payload){
            //下行
            //highlight-next-line
            exchangeFlowExecutor.asyncExchangeDown(payload);
    }
}
```

</TabItem>
</Tabs>

:::info
{ProjectName} 平台同步调用支持返回响应，同时支持多个监听器的执行，返回EventResponse响应对象。
:::

## 事件订阅
平台提供了**@EventSubscribe注解**，用于订阅事件，当前支持的事件类型有：设备事件、实体事件、实体值数据交换事件(Exchange)。同时支持Key通配符表达式匹配。
### 注解说明
- @EventSubscribe注解
    - eventType：事件类型，参见事件定义章节的说明
    - payloadKeyExpression: Key表达式，用于匹配事件的Payload对象，支持*通配符，例如：`my-integration.*`:匹配所有以`my-integration.`开头的Key
  
### 事件订阅
#### 订阅ExchangeEvent事件

```java
@Service
public class MyDeviceService {
    
    @EventSubscribe(payloadKeyExpression = "my-integration.integration.add_device.*", eventType = ExchangeEvent.EventType.DOWN)
    // highlight-next-line
    public void onAddDevice(Event<MyIntegrationEntities.AddDevice> event) {
        MyIntegrationEntities.AddDevice addDevice = event.getPayload();  //可使用实体注解对象作为入参接收ExchangePayload请求
        String ip = addDevice.getIp(); 
        ...
    }

    @EventSubscribe(payloadKeyExpression = "my-integration.integration.delete_device", eventType = ExchangeEvent.EventType.DOWN)
    // highlight-next-line
    public EventResponse onDeleteDevice(ExchangeEvent event) {
        Device device = (Device) event.getPayload().getContext("device");
        deviceServiceProvider.deleteById(device.getId());
        //同步返回响应状态
        return EventResponse.of("connectResult", device.getId());
    }

}

```

:::info
- 可使用实体注解对象作为入参接收ExchangePayload请求，如：MyIntegrationEntities.AddDevice
- @EventSubscribe注解订阅事件，其中eventType为事件类型，非必填，当为空这表示订阅所有事件类型。
- {ProjectName} 平台异步订阅时将以异步方式执行，同步订阅时将以同步方式执行。开发者可以自行添加@Async注解异步执行，实现业务异步线程池隔离。
:::

#### 订阅DeviceEvent事件

```java
@Service
public class MyDeviceService {
    
    @EventSubscribe(payloadKeyExpression = "my-integration.device.*", eventType = DeviceEvent.EventType.CREATED)
    // highlight-next-line
    public void onSaveDevice(DeviceEvent event) {
        ...
    }

}

```

:::tip
{ProjectName} 平台开放设备添加、删除、修改的事件，开发者可以通过订阅这些事件来实现自己的业务逻辑。通常情况下开发者不需要关注这些事件。
:::

#### 订阅EntityEvent事件

```java
@Service
public class MyEntityService {
    
    @EventSubscribe(payloadKeyExpression = "my-integration.device.*", eventType = DeviceEvent.EventType.CREATED)
    // highlight-next-line
    public void onSaveEntity(EntityEvent event) {
        ...
    }

}

```

:::tip
{ProjectName} 平台开放实体添加、删除、修改的事件，开发者可以通过订阅这些事件来实现自己的业务逻辑。通常情况下开发者不需要关注这些事件。
:::
