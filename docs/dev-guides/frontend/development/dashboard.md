---
sidebar_position: 14
---

# Dashboard 插件

## 插件介绍

Dashboard 插件用于展示设备实体的数据，其中包括历史数据、最新数据、实体数据操作等。Dashboard 插件可以自定义展示内容，支持多种数据展示方式，例如表格、图表、卡片等。

## 整体流程

1. 登录开源项目
2. 创建并开发自己的插件
3. 到 setting 页面连接集成
4. 到设备页面添加自己的实体
5. 到 dashboard 页面添加自己的插件

## Dashboard 插件目录结构

插件目录位于工程的 apps/web/src/plugin 目录中，具体插件内部目录结构如下：

```
plugin
├── components                  # 插件基础插件目录
│   ├── chart-metrics-select    # 图表指标选择插件
│   ├── chart-time-select       # 图表查询时间选择插件
│   ├── entity-select           # 实体单择插件
│   ├── icon-color-select       # icon颜色选择器插件
│   ├── icon-select             # icon选择器插件
|   ├── input                   # 输入框插件
|   ├── multi-entity-select     # 多实体选择插件
|   ├── select                  # 选择器插件
|   ├── switch                  # 开关插件
|   └── index.ts                # 插件基础插件入口文件
├── config-plugin               # 通用插件配置弹框，开发插件无需关注
├── plugins                     # 插件目录
│   ├── area-chart              # 面积图表插件
|       ├── configure           # 插件表单配置文件
|       ├── view                # 插件预览文件
|       ├── config.json         # 插件配置文件
|       ├── icon.png            # 插件图标
│   ├── bar-chart               # 柱状图表插件
│   ├── data-card               # 数据卡片插件
│   ├── gauge-chart             # 仪表盘插件
│   ├── horizon-bar-chart       # 横向柱状图插件
│   ├── icon-remaining          # 余量插件
│   ├── line-chart              # 折线图表插件
│   └── pie-chart               # 饼图图表插件
│   └── radar-chart             # 雷达图图表插件
│   └── switch                  # 开关插件
│   └── trigger                 # 事件触发插件
├──render                       # 插件渲染引擎，开发插件无需关注
├──view-components              # 插件UI显示通用插件
├──typings.d.ts                 # 插件类型定义文件
├──utils.ts                     # 插件工具函数
```

## 开发步骤

- 在 apps/web/src/plugin/plugins 下创建一个新的 Dashboard 插件目录。

- 在创建了自己的插件目录后，**第一件事是创建 config.json，可以没有 configure，没有 view，但一定要有 config.json**，一个 config.json 就能够完成插件的表单配置 + 配置预览。

- 创建 config.json 后，配置 config.json 文件的 type，type 作为插件的唯一标识使用，不能与其他插件重复，命名上尽量不要太简单，避免跟其他重复。

- 配置 config.json 的 name 属性以及 icon 路径，name 作为显示在 Dashboard 配置弹框中的插件名称，icon 作为显示在 Dashboard 配置弹框中的插件图标。

- 完成以上步骤后就可以在 Dashboard 上看到自己才插件了，但只是看到，还无法使用，还需要配置 configProps 以及 view 属性，才能使插件能够进行配置以及显示，具体配置说明[config.json 配置项说明](#configjson-配置项说明)。

- 配置 config.json 其他配置项，typings.d.ts 必填类型的必须都要填写，否则会影响最终的插件效果。

## config.json 配置项说明

### config.json 配置项详解

| 属性名          | 描述                                                                                                                   | 必填项                                       | 默认值 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------ |
| **name**        | 插件名，用于在表单中展示插件名                                                                                         | 是                                           | -      |
| **type**        | 插件类型，作为插件的唯一标识，不可重复，在实际使用中通过该 type 值来找到对应的配置文件。                               | 是                                           | -      |
| **class**       | 插件分类，作为插件的分类，用于在 dashboard 点击添加插件时，根据分类展示插件显示的位置，未填写时候默认显示在 other 类别 | 否                                           | -      |
| **icon**        | 插件图标，非必填，值只能为 icon.png，或者不填，用于在 dashboard 点击添加插件时，展示插件的图标，未填写时显示默认图标   | 否                                           | -      |
| **defaultCol**  | 插件在 dashboard 中默认占用的列数                                                                                      | 是                                           | -      |
| **defaultRow**  | 插件在 dashboard 中默认占用的行数                                                                                      | 是                                           | -      |
| **minCol**      | 插件在 dashboard 中最小占用的列数                                                                                      | 是                                           | -      |
| **minRow**      | 插件在 dashboard 中最小占用的行数                                                                                      | 是                                           | -      |
| **configProps** | 配置插件可配置项                                                                                                       | 是                                           | -      |
| **view**        | 配置插件在 dashboard 上的展示配置                                                                                      | 插件下的 view 文件有自定义配置该配置项可不填 | -      |

**configProps 属性配置说明**

| 属性名         | 描述                              | 类型                                      | 必填项 | 默认值 |
| -------------- | --------------------------------- | ----------------------------------------- | ------ | ------ |
| **title**      | 表单插件标题                      | string                                    | 否     |        |
| **style**      | 插件直连样式, 使用 css 字符串配置 | string                                    | 否     |        |
| **class**      | 插件类名                          | string                                    | 否     |        |
| **theme**      | 插件样式                          | Record\<'default' \| 'dark', ThemeProps\> | 否     |        |
| **components** | 插件集合                          | ComponentProps[]                          | 否     |        |

**configProps.component 属性配置说明**
| 属性名 | 描述 | 类型 | 必填项 | 默认值 |
| -------------- | ------------------------------------------------------------------------------------------ | --------------------------------------- | ------ | ------ |
| **type** | 支持 MUI 的表单插件，值与 MUI 表单插件名一致；支持 components 中的插件，值与 index.ts 文件中暴露的插件名一致；若存在 MUI 的插件名与 components 文件中自己定义的插件名一致，则以 components 文件中的插件为准 | string | 是 | |
| **key** | 插件绑定字段 | string | 是 | |
| **title** | 表单插件标题 | string | 否 | |
| **valueType** | 值类型，可选类型为：string \| number \| boolean \| array \| object | string | 否 | 'string' |
| **defaultValue** | 默认值 | string \| number \| boolean \| Array\<string \| number> | 否 | |
| **style** | 插件样式 | string | 否 | |
| **styleDepended** | 依赖其他插件值的样式，可参考配置示例 | Record\<string, string\> | 否 | |
| **componentProps** | 插件内置属性，具体配置根据填写的 type | Record\<string, any\> | 否 | |
| **options** | 下拉选项配置 | OptionsProps[] | 否 | |
| **rules** | 校验规则，具体配置可查看 react-hook-form 插件校验规则配置 | rulesType | 否 | |

**configProps.theme 配置说明**
| 属性名 | 描述 | 类型 | 必填项 | 默认值 |
| ------- | ------------ | ------ | ------ | ------ |
| **class** | 样式类名设置 | string | 否 | - |
| **style** | 直连样式设置 | string | 否 | - |

**configProps.component.options 配置说明**
| 属性名 | 描述 | 类型 | 必填项 | 默认值 |
| ------- | ---------------- | ---------------------- | ------ | ------ |
| **label** | 标签 | string | 是 | - |
| **value** | 值 | string \| number | 否 | - |
| **options** | 嵌套选项 | OptionsProps\<T\>[] | 否 | - |

**view 配置说明**

| 属性名            | 描述                              | 类型                                         | 必填项 | 默认值 |
| ----------------- | --------------------------------- | -------------------------------------------- | ------ | ------ |
| **tag**           | html 标签名称                     | string                                       | 是     |        |
| **props**         | html 标签属性                     | Record\<string, any\>                        | 否     |        |
| **id**            | html 标签 id                      | string                                       | 否     |        |
| **content**       | html 标签内容                     | string                                       | 否     |        |
| **params**        | html 内容绑定的参数变量           | string[]                                     | 否     |        |
| **showDepended**  | html 标签显示依赖，可参考配置示例 | Record\<string, any\>                        | 否     |        |
| **children**      | html 子节点                       | ViewProps[](view 属性自身嵌套)               | 否     |        |
| **class**         | 通用类名                          | string                                       | 否     |        |
| **style**         | 通用样式                          | string                                       | 否     |        |
| **styleDepended** | 依赖其他插件值的样式              | Record\<string, string\>                     | 否     |        |
| **themes**        | html 标签风格                     | Record\<'default' \| 'dark, ViewThemeProps\> | 否     |        |

### config.json 配置示例

```
{
    "type": "trigger",      // 插件唯一标识
    "name": "Trigger",      // 插件名称
    "class": "operate",     // 插件类型
    "icon": "./icon.png",   // 插件图标
    "defaultRow": 4,        // 插件被使用后默认渲染在Dashboard占的宽度，24等分
    "defaultCol": 4,        // 插件被使用后默认渲染在Dashboard占高度，24等分
    "minRow": 3,            // 插件被使用后最小渲染在Dashboard占的宽度，24等分
    "minCol": 3,            // 插件被使用后最小渲染在Dashboard占高度，24等分
    "configProps": [
        {
            "style": "width: 100%",     // 表单样式，表示占满一行
            "components": [
                {
                    "type": "entitySelect",     // entitySelect表示components中的实体单选插件
                    "title": "Entity",          // 插件显示在表单上的标题
                    "key": "entity",            // 插件在表单中的key值，作为表单键值
                    "style": "width: 100%",     // 当前插件样式，表示独占一行
                    "valueType": "object",      // 当前插件值类型，object表示当前插件的值是一个对象
                    "componentProps": {         // 传给插件的属性，只有插件支持的属性能生效
                        "size": "small",        // 当前插件属性，small表示当前插件使用小尺寸
                        "entityType": ["SERVICE"],          // 实体单选插件只过滤SERVICE类型实体
                        "accessMods": ["W", "RW"],          // 实体单选插件只过滤W,RW权限的实体
                        "entityExcludeChildren": true       // 实体单选插件过滤出父实体
                    },
                    "rules": {              // 当前插件校验规则，只有react-hook-form支持的规则能生效
                        "required": true    // 表示当前表单项必填
                    }
                }
            ]
        },
        {
            "components": [
                {
                    "type": "input",            // input表示components中的input插件
                    "title": "Title",          // 插件显示在表单上的标题
                    "key": "title",            // 插件在表单中的key值，作为表单键值
                    "defaultValue": "Title",    // 插件在表单中的默认值
                    "componentProps": {
                        "size": "small",
                        "inputProps": {
                            "maxLength": 15        // 当前插件属性，maxLength表示当前插件最大输入长度为15
                        }
                    }
                }
            ]
        },
        {
            "components": [
                {
                    "type": "input",
                    "title": "Label",
                    "key": "label",
                    "defaultValue": "Label",
                    "componentProps": {
                        "size": "small",
                        "inputProps": {
                            "maxLength": 15
                        }
                    }
                }
            ]
        },
        {
            "title": "Appearance of status",
            "style": "display: flex;",
            "components": [
                {
                    "type": "iconSelect",
                    "key": "icon",
                    "style": "flex: 1;padding-right: 12px;",
                    "defaultValue": "WifiTetheringIcon",
                    "componentProps": {
                        "size": "small"
                    },
                    "rules": {
                        "required": true
                    }
                },
                {
                    "type": "iconColorSelect",
                    "key": "iconColor",
                    "style": "flex: 1;",
                    "defaultValue": "#A9AEB8",
                    "componentProps": {
                        "size": "small"
                    }
                }
            ]
        }
    ],
    "view": [
        {
            "tag": "div",
            "themes": {
                "default": {
                    "class": "trigger-view",
                    "style": "background: #fff"
                }
            },
            "children": [
                {
                    "tag": "Tooltip",
                    "class": "trigger-view-title",
                    "style": "white-space: nowrap;overflow: hidden;text-overflow: ellipsis;font-weight: 600;",
                    "params": [
                        "title"
                    ],
                    "themes": {
                        "default": {
                            "style": "color: #272E3B"
                        },
                        "dark": {
                            "style": "color: rgba(247, 248, 250, 0.86)"
                        }
                    },
                    "props": {
                        "autoEllipsis": true
                    }
                },
                {
                    "tag": "div",
                    "style": "display: flex;justify-content: center;flex: 1;align-items: center;flex-direction: column;",
                    "children": [
                        {
                            "tag": "icon",
                            "style": "font-size: 56px",
                            "class": "trigger-view-icon",
                            "styleDepended": {
                                "color": "iconColor"        // 样色样式依赖于表单中iconColor字段的值
                            },
                            "params": [
                                "icon"                      // 值显示来源于表单中icon字段的值
                            ]
                        },
                        {
                            "tag": "Tooltip",       // 使用 view-component中的Tooltip 插件
                            "class": "trigger-view-title",
                            "style": "white-space: nowrap;overflow: hidden;text-overflow: ellipsis;;text-align: center;margin-top: 8px;",
                            "params": [
                                "label"                // 值显示来源于表单中label字段的值
                            ],
                            "themes": {
                                "default": {
                                    "style": "color: #6B7785"  // 默认主题下文字颜色为#6B7785
                                },
                                "dark": {
                                    "style": "color: rgba(247, 248, 250, 0.62)"         // 暗色主题下文字颜色为rgba(247, 248, 250, 0.62)
                                }
                            },
                            "props": {      // 配置Tooltip插件的属性
                                "autoEllipsis": true    // 该属性表示文字超出显示范围时自动省略
                            }
                        }
                    ]
                }
            ]
        }
    ]
}
```
