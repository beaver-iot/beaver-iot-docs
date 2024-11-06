---
sidebar_position: 3
---

import CodeBlock from '@theme/CodeBlock';
import { DevProjectRepoSSH, DevProjectRepoHttps } from '/src/consts';
import { ProjectName } from '/src/consts';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 快速入门

快速实现一个自定义集成的后端部分

## 前置条件

在开发集成的后端部分之前，您可能需要知道：
* {ProjectName} 的基本概念以及术语
* Java 的基本语法
* SpringFramework 的基础知识

如果您对以上的知识有一定的了解，那么请继续往下阅读，一步一步完成一个最简单的 Demo。

## 环境准备

在进行开发前，需要准备以下环境：
* Java IDE (推荐[IntelliJ IDEA](https://www.jetbrains.com/idea/))
* Java Version 17 SDK
* Maven
* Git CLI

在准备这些完成后，运行以下git命令，获取集成开发的项目
<Tabs>
  <TabItem value="SSH" label="SSH" default>
    <CodeBlock language="bash">git clone {DevProjectRepoSSH}</CodeBlock>
  </TabItem>
  <TabItem value="Https" label="Https">
    <CodeBlock language="bash">git clone {DevProjectRepoHttps}</CodeBlock>
  </TabItem>
</Tabs>

代码拉取完成后，使用IDE打开项目文件夹*beaver-iot-integrations*，您会发现两个模块，分别是`application-dev`和`integrations`。

## 写一个Hello world

### 创建集成元数据
在项目的`integrations`模块下新建一个作为这个集成的模块，命名为
> **my-integration**

在模块下创建这个集成的pom文件`pom.xml`

```xml title="beaver-iot-integrations/integrations/my-integration/pom.xml"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.milesight.beaveriot</groupId>
        <artifactId>integrations</artifactId>
        <version>1.0-SNAPSHOT</version>
        <relativePath>../pom.xml</relativePath>
    </parent>

<!-- highlight-next-line -->
    <artifactId>my-integration</artifactId>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>com.milesight.beaveriot</groupId>
            <artifactId>context</artifactId>
            <version>${project.version}</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <!-- in case you have your own dependencies to be packaged -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

在这个新建的模块下新建一个资源文件`integration.yaml`
```yaml title="beaver-iot-integrations/integrations/my-integration/src/main/resources/integration.yaml"
integration:
   my-integration: # integration identifier
      name: My Integration Name # integration name
      description: "My Demo Integration" # integration description
      enabled: true # whether enable this integration. Must be "true" for now
```

### 创建Bootstrap类
新建包`com.milesight.beaveriot.myintegration`

内含一个Java类文件`MyIntegrationBootstrap.java`
```java title="beaver-iot-integrations/integrations/my-integration/src/main/java/com/milesight/beaveriot/myintegration/MyIntegrationBootstrap.java"
package com.milesight.beaveriot.myintegration;

import com.milesight.beaveriot.context.integration.bootstrap.IntegrationBootstrap;
import com.milesight.beaveriot.context.integration.model.Integration;
import org.springframework.stereotype.Component;

@Component
public class MyIntegrationBootstrap implements IntegrationBootstrap {
    @Override
    public void onPrepared(Integration integration) {
        
    }

    @Override
    public void onStarted(Integration integrationConfig) {
        // highlight-next-line
        System.out.println("Hello, world!");
    }

    @Override
    public void onDestroy(Integration integration) {

    }
}
```

### 启动你的第一个集成

在`application-dev`模块下，将你的集成加入依赖列表dependencies中
```xml title="beaver-iot-integrations/application/application-dev/pom.xml"

<!-- ... -->
    <dependencies>
        <!-- ... -->
        <dependency>
            <groupId>com.milesight.beaveriot</groupId>
            <!-- highlight-next-line -->
            <artifactId>my-integration</artifactId>
            <version>${project.version}</version>
        </dependency>
        <!-- ... -->
    </dependencies>
<!-- ... -->
</project>
```

然后启动*beaver-iot-integrations/application-dev/src/main/java/com/milesight/beaveriot/DevelopApplication.java*

可以看到控制台输出
> Hello, world!

## 实现一个有用的集成

你现在已经实现了一个最简单的集成，但是它的功能只有控制台输出文字，我们接下来将实现一个有用的集成。

这个新的集成能够检测某个ip地址的设备是否在线，其功能包括：
* 本机(Localhost)作为**默认设备**
* 支持**触发检测**所有设备是否在线功能
* 每次检测完成时**发送报告事件**
* 支持**添加**需要被监控的设备
* 支持**删除**设备
* 支持通过**Http**返回在线设备的数量

### 约定实体

通过分析以上需求，我们能够知道，这个这个集成需要以下实体：
* 一个服务(Service)类型的实体 `benchmark` ：执行检测所有设备是否在线
* 一个属性(Property)类型的实体 `detect_status` ：检测状态（检测中/待检测）
* 一个事件(Event)类型的实体 `detect_report` ：检测完毕的报告(包括检测数量、检测耗时)

特别的，添加和删除设备也是服务类型的实体：
* 添加设备服务 `add_device` 
* 删除设备服务 `delete_device` 

:::info
如果您对以上需求分析几种实体的定义有疑问，请看[概念介绍](../concepts.md)
:::

新建一个Java类文件`MyIntegrationEntities.java`，以注解的方式定义集成的以上5个实体以及其子实体

```java title="beaver-iot-integrations/integrations/my-integration/src/main/java/com/milesight/beaveriot/myintegration/MyIntegrationEntities.java"
package com.milesight.beaveriot.myintegration;

import com.milesight.beaveriot.context.integration.entity.annotation.Attribute;
import com.milesight.beaveriot.context.integration.entity.annotation.Entities;
import com.milesight.beaveriot.context.integration.entity.annotation.Entity;
import com.milesight.beaveriot.context.integration.entity.annotation.IntegrationEntities;
import com.milesight.beaveriot.context.integration.enums.AccessMod;
import com.milesight.beaveriot.context.integration.enums.EntityType;
import com.milesight.beaveriot.context.integration.model.ExchangePayload;
import lombok.Data;
import lombok.EqualsAndHashCode;

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

    @Entity(type = EntityType.EVENT, name = "Detect Report", identifier = "detect_report")
    // highlight-next-line
    private DetectReport detectReport;

    @Entity(type = EntityType.SERVICE, identifier = "add_device")
    // highlight-next-line
    private AddDevice addDevice;

    @Entity(type = EntityType.SERVICE, identifier = "delete_device")
    // highlight-next-line
    private String deleteDevice;


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
    @Entities
    public static class AddDevice extends ExchangePayload {
        @Entity
        private String ip;
    }

    public enum DetectStatus {
        STANDBY, DETECTING;
    }
}

```

这个类中，我们定义了**增加设备**和**删除设备**的实体，我们需要将这个他们的`identifier`同步到元数据中，让{ProjectName}知道这个集成支持添加和删除设备。

更新资源文件`integration.yaml`
```yaml title="beaver-iot-integrations/integrations/my-integration/src/main/resources/integration.yaml"
integration:
   my-integration: # integration identifier
      # ...
      # highlight-next-line
      entity-identifier-add-device: add_device
      # the same to deleteDevice identifier
      # highlight-next-line
      entity-identifier-delete-device: delete_device
```

:::warning
删除设备服务实体不能有子实体。

添加设备和删除设备是通用功能，需要每个集成显式地定义出来告诉用户和{ProjectName}：这个集成是支持动态添加或删除设备的。
:::

### 约定设备

我们这里定义一个本地设备为集成添加后的默认初始设备，设备包含一个实体——设备状态。

新建一个Java类文件`MyDeviceEntities.java`，以注解的方式定义设备和其实体。

```java title="beaver-iot-integrations/integrations/my-integration/src/main/java/com/milesight/beaveriot/myintegration/MyDeviceEntities.java"
package com.milesight.beaveriot.myintegration;

import com.milesight.beaveriot.context.integration.entity.annotation.Attribute;
import com.milesight.beaveriot.context.integration.entity.annotation.DeviceEntities;
import com.milesight.beaveriot.context.integration.entity.annotation.Entity;
import com.milesight.beaveriot.context.integration.entity.annotation.KeyValue;
import com.milesight.beaveriot.context.integration.enums.AccessMod;
import com.milesight.beaveriot.context.integration.enums.EntityType;
import com.milesight.beaveriot.context.integration.model.ExchangePayload;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@DeviceEntities(name="Default Device", identifier = "localhost", additional = {@KeyValue(key = "ip", value = "localhost")})
public class MyDeviceEntities extends ExchangePayload {
    @Entity(type = EntityType.PROPERTY, name = "Device Connection Status", accessMod = AccessMod.R, attributes = @Attribute(enumClass = DeviceStatus.class))
    // highlight-next-line
    private Long status;

    public enum DeviceStatus {
        ONLINE, OFFLINE;
    }
}
```

:::warning
以这种静态的方式添加的设备在每次重启后名称和属性都会恢复默认。如果用户主动删掉了这台设备，下次重启后还会出现，但设备实体的值会丢失。
:::

### 监听事件 - 新增设备 / 删除设备
上面演示了如何用注解来创建默认设备，这是一个简单明了的方式，但是这样的设备是静态的，很多时候我们需要根据用户的需求动态地创建或者删除设备。

在这之前，我们定义了添加/删除设备服务实体。当用户调用添加/删除设备服务，会发送相应事件，因此我们只需要通过[key](../key-dev-concept.md#key)监听这个事件，然后在处理方法中实现对应功能即可。

新增设备事件的上下文中有用户指定的设备名称`device_name`。这里添加设备的代码的作用相当于动态实现上面定义设备的注解。由于我们限定`identifier`的[字符](../key-dev-concept.md#identifier)不能包含ip地址中的`.`，因此我们做了一层转换。

删除设备事件的上下文中有设备的实例`device`。

新建一个Java类文件`MyDeviceService.java`，在这个类中实现添加和删除设备的方法
```java title="beaver-iot-integrations/integrations/my-integration/src/main/java/com/milesight/beaveriot/myintegration/MyDeviceService.java"
package com.milesight.beaveriot.myintegration;

import com.milesight.beaveriot.context.api.DeviceServiceProvider;
import com.milesight.beaveriot.context.api.ExchangeFlowExecutor;
import com.milesight.beaveriot.context.integration.enums.AccessMod;
import com.milesight.beaveriot.context.integration.enums.EntityValueType;
import com.milesight.beaveriot.context.integration.model.*;
import com.milesight.beaveriot.context.integration.model.event.ExchangeEvent;
import com.milesight.beaveriot.eventbus.annotations.EventSubscribe;
import com.milesight.beaveriot.eventbus.api.Event;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class MyDeviceService {
    @Autowired
    private DeviceServiceProvider deviceServiceProvider;

    @Autowired
    private ExchangeFlowExecutor exchangeFlowExecutor;

    @EventSubscribe(payloadKeyExpression = "my-integration.integration.add_device.*", eventType = ExchangeEvent.EventType.DOWN)
    // highlight-next-line
    public void onAddDevice(Event<MyIntegrationEntities.AddDevice> event) {
        String deviceName = event.getPayload().getContext("device_name", "Device Name");
        String ip = event.getPayload().getIp();
        final String integrationId = "my-integration";
        Device device = new DeviceBuilder(integrationId)
                .name(deviceName)
                .identifier(ip.replace(".", "_"))
                .additional(Map.of("ip", ip))
                .build();

        Entity entity = new EntityBuilder(integrationId, device.getKey())
                .identifier("status")
                .property("Device Status", AccessMod.R)
                .valueType(EntityValueType.LONG)
                .attributes(new AttributeBuilder().enums(MyDeviceEntities.DeviceStatus.class).build())
                .build();
        device.setEntities(Collections.singletonList(entity));

        deviceServiceProvider.save(device);
    }

    @EventSubscribe(payloadKeyExpression = "my-integration.integration.delete_device", eventType = ExchangeEvent.EventType.DOWN)
    // highlight-next-line
    public void onDeleteDevice(Event<ExchangePayload> event) {
        Device device = (Device) event.getPayload().getContext("device");
        deviceServiceProvider.deleteById(device.getId());
    }
}

```

### 监听事件 - Benchmark

接下来我们创建方法，监听Benchmark服务实体，并且实现这个方法。
更新Java类文件`MyDeviceService.java`，在这个类中添加Benchmark服务实体的方法实现。

检测所有设备完成后，会[上行](./key-object.md#exchangeevent)一个`detect_report`报告事件。
```java title="beaver-iot-integrations/integrations/my-integration/src/main/java/com/milesight/beaveriot/myintegration/MyDeviceService.java"
@Service
public class MyDeviceService {
    // ...
    @EventSubscribe(payloadKeyExpression = "my-integration.integration.benchmark", eventType = ExchangeEvent.EventType.DOWN)
    // highlight-next-line
    public void doBenchmark(Event<MyIntegrationEntities> event) {
        // mark benchmark starting
        exchangeFlowExecutor.syncExchangeDown(new ExchangePayload(Map.of("my-integration.integration.detect_status", MyIntegrationEntities.DetectStatus.DETECTING.ordinal())));
        int timeout = 5000;

        // start pinging
        List<Device> devices = deviceServiceProvider.findAll("my-integration");
        AtomicReference<Long> activeCount = new AtomicReference<>(0L);
        AtomicReference<Long> inactiveCount = new AtomicReference<>(0L);
        Long startTimestamp = System.currentTimeMillis();
        devices.forEach(device -> {
            boolean isSuccess = false;
            try {
                String ip = (String) device.getAdditional().get("ip");
                InetAddress inet = InetAddress.getByName(ip);
                if (inet.isReachable(timeout)) {
                    isSuccess = true;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

            int deviceStatus = MyDeviceEntities.DeviceStatus.OFFLINE.ordinal();
            if (isSuccess) {
                activeCount.updateAndGet(v -> v + 1);
                deviceStatus = MyDeviceEntities.DeviceStatus.ONLINE.ordinal();
            } else {
                inactiveCount.updateAndGet(v -> v + 1);
            }

            // Device have only one entity
            String deviceStatusKey = device.getEntities().get(0).getKey();
            exchangeFlowExecutor.asyncExchangeDown(new ExchangePayload(Map.of(deviceStatusKey, (long) deviceStatus)));
        });
        Long endTimestamp = System.currentTimeMillis();

        // mark benchmark done
        ExchangePayload donePayload = new ExchangePayload();
        donePayload.put("my-integration.integration.detect_status", MyIntegrationEntities.DetectStatus.STANDBY.ordinal());
        donePayload.put("my-integration.integration.detect_report", "");
        donePayload.put("my-integration.integration.detect_report.consumed_time", endTimestamp - startTimestamp);
        donePayload.put("my-integration.integration.detect_report.online_count", activeCount.get());
        donePayload.put("my-integration.integration.detect_report.offline_count", inactiveCount.get());
        exchangeFlowExecutor.syncExchangeUp(donePayload);
    }
// ...
}
```


### 监听事件 - 检测报告事件

我们可以监听检测完成后发送的报告事件。

更新Java类文件`MyDeviceService.java`，在这个类中添加报告的监听方法，并且打印。

```java title="beaver-iot-integrations/integrations/my-integration/src/main/java/com/milesight/beaveriot/myintegration/MyDeviceService.java"
@Service
public class MyDeviceService {
    // ...
    @EventSubscribe(payloadKeyExpression = "my-integration.integration.detect_report.*", eventType = ExchangeEvent.EventType.UP)
    // highlight-next-line
    public void listenDetectReport(Event<MyIntegrationEntities.DetectReport> event) {
        System.out.println("[Get-Report] " + event.getPayload()); // do something with this report
    }
// ...
}
```
### 创建Http API

我们允许集成设置自己的Http路由，用于自定义的前端调用，或者作为Webhook的入口。

这里我们实现一个返回在线设备数量的Http接口 `GET /my-integration/active-count`。


:::warning
为了防止不同集成和系统的路由冲突，集成的URL地址应该以集成名开头，如：
* **/my-integration**/foo
* **/my-integration**/foo/bar
* **/my-integration**/bar
:::


创建一个Java类`MyIntegrationController.java`，在这个类中添加Controller，接收请求。

```java title="beaver-iot-integrations/integrations/my-integration/src/main/java/com/milesight/beaveriot/myintegration/MyIntegrationController.java"
package com.milesight.beaveriot.myintegration;

import com.fasterxml.jackson.databind.JsonNode;
import com.milesight.beaveriot.base.response.ResponseBody;
import com.milesight.beaveriot.base.response.ResponseBuilder;
import com.milesight.beaveriot.context.api.DeviceServiceProvider;
import com.milesight.beaveriot.context.api.EntityValueServiceProvider;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/my-integration") // Should use integration identifier
public class MyIntegrationController {
    @Autowired
    private DeviceServiceProvider deviceServiceProvider;

    @Autowired
    private EntityValueServiceProvider entityValueServiceProvider;

    @GetMapping("/active-count")
    // highlight-next-line
    public ResponseBody<CountResponse> getActiveDeviceCount() {
        List<String> statusEntityKeys = new ArrayList<>();
        deviceServiceProvider.findAll("my-integration").forEach(device -> statusEntityKeys.add(device.getEntities().get(0).getKey()));
        Long count = entityValueServiceProvider
                .findValuesByKeys(statusEntityKeys)
                .values()
                .stream()
                .map(JsonNode::asInt)
                .filter(status -> status == MyDeviceEntities.DeviceStatus.ONLINE.ordinal())
                .count();
        CountResponse resp = new CountResponse();
        resp.setCount(count);
        return ResponseBuilder.success(resp);
    }

    @Data
    public class CountResponse {
        private Long count;
    }
}

```


## 测试你的集成

由于{ProjectName}是有用户验证模块的，因此在请求时会要求请求头携带登录Token，这样不方便调试。
因此我们建议在开发时，如果和用户无关的集成，将用户验证模块注释。

在`application-dev`模块下，将pom文件依赖列表的`authentication-service`注释掉。
```xml title="beaver-iot-integrations/application/application-dev/pom.xml"

<!-- ... -->
    <dependencies>
        <!-- ... -->
        <!-- highlight-start -->
<!--        <dependency>-->
<!--            <groupId>com.milesight.beaveriot</groupId>-->
<!--            <artifactId>authentication-service</artifactId>-->
<!--        </dependency>-->
        <!-- highlight-end -->
        <!-- ... -->
    <dependencies>
<!-- ... -->
```
然后刷新Maven后重新启动项目。

### 获取集成信息
```shell
curl --location --request GET 'http://localhost:9200/integration/my-integration' \
--header 'Content-Type: application/json'
```

### 添加设备

设备的ip为`8.8.8.8`，名称为`Test Device`

```shell
curl --location 'http://localhost:9200/device' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Test Device",
    "integration": "my-integration",
    "param_entities": {
        "my-integration.integration.add_device.ip": "8.8.8.8"
    }
}'
```

### 搜索设备
```shell
curl --location 'http://localhost:9200/device/search' \
--header 'Content-Type: application/json' \
--data '{
    "name": ""
}'
```

### 调用Benchmark服务
```shell
curl --location 'http://localhost:9200/entity/service/call' \
--header 'Content-Type: application/json' \
--data '{
    "exchange": {
        "my-integration.integration.benchmark": ""
    }
}'
```

看到控制台有日志输出
```
[Get-Report] {my-integration.integration.detect_report.offline_count=1, my-integration.integration.detect_report.consumed_time=5099, my-integration.integration.detect_report.online_count=1}
```

### 搜索实体
```shell
curl --location 'http://localhost:9200/entity/search' \
--header 'Content-Type: application/json' \
--data '{
    "keyword": "",
    "page_size": 100
}'
```

### 获取实体值

例如，搜索实体获取到列表，其中`entity_key`为`my-integration.device.8_8_8_8.status`的id为`1853700374977695745`。

获取这个实体的值：
```shell
curl --location --request GET 'http://localhost:9200/entity/1853700374977695745/status' \
--header 'Content-Type: application/json'
```

### 删除设备

例如，搜索设备获取到列表，其中刚刚添加的设备id为`1853676674098151426`

删除这个设备
```shell
curl --location 'http://localhost:9200/device/batch-delete' \
--header 'Content-Type: application/json' \
--data '{
    "device_id_list": ["1853676674098151426"]
}'
```

可以再次调用设备搜索，检查是否成功删除。
