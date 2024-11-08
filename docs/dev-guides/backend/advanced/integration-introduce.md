---
sidebar_position: 1
toc_min_heading_level: 2
toc_max_heading_level: 5
---

import CodeBlock from '@theme/CodeBlock';
import { DevProjectRepoSSH } from '/src/consts';
import { DevProjectRepoHttps } from '/src/consts';
import { ProjectName } from '/src/consts';

# 集成构建

## 概述
**集成**是{ProjectName}实现设备连接、设备控制、功能拓展的主要途径，它能够使{ProjectName}和其它软件、设备、第三方平台等交互。
{ ProjectName }平台的集成以插件形式开发，面向社区共建，促进系统的扩展和集成。
<p>在本章节中，我们将介绍如何使用我们提供的集成开发仓库和环境进行工程构建、开发、调试以及发布的整个过程。</p>

## 工程构建

### 代码仓库

我们提供了一个集成开发的仓库，包含所有已经发布的集成插件、示例代码以及调试环境，
你可以通过下载[beaver-iot-integrations代码仓库]({DevProjectRepoHttps})来体验集成开发。

### pom.xml配置 
- **依赖包引入**

  对于集成开发，我们提供了`context`依赖包，用于集成开发的基础功能。通常情况下，我们不需要将`context`打包到集成插件中，所以我们将其`scope`设置为`provided`。
开发者可引入其他依赖包（{ ProjectName } 平台未引入的包），以满足集成开发的需求。
```xml
    <dependencies>
        <dependency>
            <groupId>com.milesight.beaveriot</groupId>
            <artifactId>context</artifactId>
            <version>${project.version}</version>
            // highlight-next-line
            <scope>provided</scope>
        </dependency>
    </dependencies>
```
:::warning
请注意，为避免依赖冲突和导致包过大，我们建议开发者在引入依赖包时，尽量选择{ ProjectName } 平台已引入的包。对于平台已经引入的包，开发者可设置`scope`设置为`provided`。
:::
- **依赖包版本统一**
  为统一依赖包的版本，{ProjectName} 平台定义了一个`beaver-iot-parent` POM依赖，开发者可在`dependencyManagement`中定义依赖包的版本。
```xml
    <dependencyManagement>
        <dependencies>
          <dependency>
              <groupId>com.milesight.beaveriot</groupId>
              <artifactId>beaver-iot-parent</artifactId>
              <version>${beaver-iot.version}</version>
              <type>pom</type>
              <scope>import</scope>
          </dependency>
        </dependencies>
    </dependencyManagement>
```
:::info
在beaver-iot-integrations工程中，我们已经定义了`beaver-iot-parent`的版本号，因此开发者在集成开发过程中无需特别定义。
:::
- **插件打包**
  集成开发者需要将集成插件打包成jar包，以便发布到{ProjectName}平台。我们建议开发者使用`maven-assembly-plugin`插件进行打包。
```xml
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
```
## 集成开发
### 集成配置
#### 参数说明
集成配置是集成插件的基础，它包含了集成的基本信息、设备、实体等元数据信息。开发者需要在`resources`目录下创建`integration.yaml`文件，定义集成的配置信息。
|参数名                        |默认值           |是否必填            |描述                |
|---                          |---             |---      |---                |
|id                         |无                 |是    |集成ID                  |
|name                         |无               |是     |集成名称                  |
|icon-url                      |无               |否     |集成图标地址，支持相对路径和绝对路径地址                  |
|description                  |无               |否     |集成描述                 |
|enabled                      |true             |否      |是否启用               |
|entity-identifier-add-device  |无               |否     |添加设备的Entity Identifier,当配置此值则说明当前集成支持设备添加|
|entity-identifier-delete-device |无            |否      |删除设备的Entity Identifier,当配置此值则说明当前集成支持设备删除|
|initial-devices              |无                |否    |初始化的设备实体，具体参见[设备/实体构建章节](entity-definition.md)       |
|initial-entities              |无               |否     |初始化的集成实体，具体参见[设备/实体构建章节](entity-definition.md)            |

:::warning
请注意，集成配置文件中的`id`字段是集成的唯一标识，不可重复。
:::
#### icon-url配置
icon-url支持相对路径和绝对路径地址，相对路径地址是相对于集成插件的根目录的路径，绝对路径地址是引用外部的图片地址。
- 相对路径地址示例：`icon-url: /public/my-integration.png`
- 绝对路径地址示例：`icon-url: https://www.example.com/my-integration.png`
当使用相对路径地址，开发者需要将图片文件放置在集成插件的`/resources/static/public`目录下，例如：
```yaml
  my-integration/
  ├── src/
  │ ├── main/
  │ │ └── resources/
  │ │ └──── static/
  │ │ └────── public/
  │ │ └──────── my-integration.png
```
:::tip
为避免资源文件冲突，建议开发者使用`integration-id`作为图片文件名
:::

#### 代码示例
- **简单的集成配置示例**
```yaml
integration:
  my-integration: # integration identifier
    name: My Integration Name # integration name
    description: "My Demo Integration" # integration description
```

- **完整的集成配置示例**
```yaml
integration:
  my-integration: # integration identifier
    name: My Integration Name # integration name
    icon-url: /public/my-integration.png # integration icon url
    description: "My Demo Integration" # integration description
    enabled: true # whether enable this integration. Must be "true" for now
    entity-identifier-add-device: addDevice # entity identifier for adding device
    entity-identifier-delete-device: deleteDevice # entity identifier for deleting device
    initial-entities: # initial entities
      - identifier: 'connect' # entity identifier
        name: connect         # entity name
        value_type: string    # entity value type
        type: service         # entity type
        children:             # children entities
          - identifier: 'url'
            name: connectUrl    
            value_type: string
            type: service
```

### 集成生命周期
#### 生命周期说明
{ProjectName}平台提供了`IntegrationBootstrap`接口，用于平台集成的生命周期管理。开发者需要实现`IntegrationBootstrap`接口，重写`onPrepared`、`onStarted`、`onDestroyed`方法，以实现集成的生命周期管理。

![General Architecture](/img/integration-lifecycle.svg)

* {ProjectName}启动后首先会初始化应用程序环境
  * 加载所有集成的配置，存入内存中
  * 调用每个集成的`onPrepared`函数

* 将集成的设备和实体持久化
  * 调用每个集成的`onStarted`函数
  * 接下来{ProjectName}程序正式启动运行。
* 集成销毁会调用`onDestroyed`函数

#### 代码示例

- **一个最简单的集成生命周期示例**
```java
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
:::tip
{ProjectName}平台根据`IntegrationBootstrap`接口的实现类来发现平台的集成插件，因此集成开发者必须要实现`IntegrationBootstrap`接口，并将其注入到Spring容器中。
集成包路径需在`com.milesight.beaveriot`目录下，以确保集成能够被{ProjectName}平台发现，强烈建议开发者使用`com.milesight.beaveriot.集成标识`包路径。
:::

- **完整的集成生命周期示例**
  
  如下示例中，演示在`onPrepared`方法中添加初始化设备，`onStarted`方法中其中数据同步服务，`onDestroyed`方法中停止数据同步服务等操作
```java
@Component
public class MyIntegrationBootstrap implements IntegrationBootstrap {

    // in this example, we use MyIntegrationDataSyncService to sync data
    @Autowired
    private MyIntegrationDataSyncService myIntegrationDataSyncService;
    
    @Override
    public void onPrepared(Integration integrationConfig) {
        // add initial device
      // highlight-next-line  
      Entity entityConfig = new EntityBuilder()
                .property("parentProperty", AccessMod.W).valueType(EntityValueType.STRING)
                .children()
                    .valueType(EntityValueType.STRING).property("childrenProperty", AccessMod.W).end()
                .build();
        // highlight-next-line
        Device device = new DeviceBuilder(integrationConfig.getId())
                .name("demoDevice")
                .identifier("demoDeviceIdentifier")
                .entity(entityConfig)
                .build();
      // highlight-next-line
        integrationConfig.addInitialDevice(device);
    }

    @Override
    public void onStarted(Integration integrationConfig) {
        // start data sync service， when integration entity is ready
        myIntegrationDataSyncService.init();
    }

    @Override
    public void onDestroy(Integration integrationConfig) {
        // stop data sync service
        myIntegrationDataSyncService.stop();
    }
}
```
:::tip
如上示例采用Builder方式构建设备和实体，这部分内容我们将在[设备/实体构建](entity-definition.md)章节中详细描述
:::
## 集成调试

### 运行调试应用
为方便集成开发者调试集成插件，我们提供了`application-dev`模块，开发者可以在该模块中进行集成插件的调试。
只需将集成pom加入依赖dependencies中即可，例如：
```xml

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

### 更多自定义
  默认情况下，`application-dev`模块会加载所有{ProjectName}平台服务，并采用H2作为内置数据库方式启动，开发者可以通过配置`pom.xml`、`application-dev`文件，自定义集成插件的调试环境。
- **去掉用户、认证模块**

  为了方便集成开发者更好的调试集成插件，我们提供了去掉用户、认证模块的配置，开发者可以在`pom.xml`中注释掉`authentication-service`、`user-service`依赖包，即可去掉用户、认证模块。

```xml
<dependencies>
   <!-- 
    <dependency>
      <groupId>com.milesight.beaveriot</groupId>
      <artifactId>authentication-service</artifactId>
      </dependency>
    <dependency>
      <groupId>com.milesight.beaveriot</groupId>
      <artifactId>user-service</artifactId>
    </dependency>
    -->
</dependencies>
```
- **自定义数据库**

  默认情况下，`application-dev`模块会使用H2作为内置数据库，开发者可以在`application-dev`文件中配置postgres数据库（或以环境变量配置方式），例如：
```shell
DB_TYPE=postgres;
SPRING_DATASOURCE_URL=jdbc:postgresql://ip:5432/postgres;
SPRING_DATASOURCE_PASSWORD=postgres;
SPRING_DATASOURCE_USERNAME=postgres;
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
```
## 集成发布
集成以jar包插件的形式发布到{ProjectName}平台，开发者可以通过`maven`的`install`命以将集成插件打包成jar包，然后上传到{ProjectName}平台进行发布。
- **集成打包**
```shell
mvn package -pl integrations/my-integration -am -Dmaven.test.skip=true
```
- **集成发布**

  将集成插件jar包添加到{ProjectName}的安装目录下的`/plugins`目录下，然后重启{ProjectName}平台即可。
