---
sidebar_position: 10
---

# 环境变量

本项目是 Monorepo 设计，子应用采用 Vite 作为构建工具。基于之前的项目经验，大仓中通常维护的都是业务关联紧密的应用及工具，在调整环境变量时，我们希望可以在大仓根目录做统一调整，同时各个子应用也支持自定修改。故我们规范了环境变量的配置，同时抽离出了统一的环境变量处理工具，允许开发者有更高的变量处理自由度。

### 配置规范

默认配置下，应用启动后，会依次读取以下环境变量配置文件：

```bash
# 大仓根目录下的 .env
.env

# 大仓根目录下的 .env.local
.env.local

# 子应用目录下的 .env
apps/web/.env

# 子应用目录下的 .env.local
apps/web/.env.local
```

若各配置中存在同名变量，则后加载的会覆盖前加载的。配置加载顺序支持自定义，开发者可在应用目录下的 `vite.config.ts` 中灵活调整：

```ts
const { WEB_API_PROXY } = parseEnvVariables([
    path.join(projectRoot, '.env'),
    path.join(projectRoot, '.env.local'),
    path.join(__dirname, '.env'),
    path.join(__dirname, '.env.local'),
]);
```

## 内置变量

为便于开发调试及线上问题排查，在应用中我们内置了一些常用的环境变量，在应用 `vite.config.ts` 构建配置中执行 `getViteEnvVarsConfig` 是会自动载入，在应用运行时环境可通过以下变量进行调用：

```bash
# 应用构建时间戳
__BUILD_TIMESTAMP__

# 应用构建分支（需编译时环境支持 git 命令）
__GIT_BRANCH__

# 应用构建提交哈希（需编译时环境支持 git 命令）
__LATEST_COMMIT_HASH__
```

## 应用变量

本项目当前仅有 Web 应用，部分变量仅在编译时使用，不会注入到运行时环境中，如下：

```bash
# WEB 应用开发服务端口
WEB_DEV_PORT=9000

# 接口 API 代理地址
WEB_API_PROXY=http://192.168.45.115:9200

# WebSocket 代理地址
WEB_SOCKET_PROXY=http://192.168.45.115:9201
```

- `WEB_DEV_PORT`: Web 应用本地开发服务端口；
- `WEB_API_PROXY`: Web 应用接口代理地址。为解决跨域问题，同时便于灵活开发调试，前端本地服务启动后默认将 `/api/v1` 前缀的请求代理到该地址。若本地已部署后端服务，或有其他后端服务，可通过此变量自行修改；
- `WEB_SOCKET_PROXY`: Web 应用 WebSocket 服务代理地址。前端本地服务启动后默认将 `/websocket` 前缀的请求代理到该地址；

运行时环境变量：

```bash
# 接口 Origin 地址
WEB_API_ORIGIN=/

# Websocket Host 地址
WEB_WS_HOST=/

# Oauth cliend ID
OAUTH_CLIENT_ID=iab

# Oauth cliend secret
OAUTH_CLIENT_SECRET=milesight*iab
```

以上变量会注入到应用运行时环境中，且变量名会做一定调整：

- `WEB_API_ORIGIN`: 运行时变量名 `__APP_API_ORIGIN__`，默认配置为 `/`，若为 `http`/`https` 开头的地址，则应用的接口请求地址会直接使用该 origin，则编译时的 `WEB_API_PROXY` 配置将无效；
- `WEB_WS_HOST`: 运行时变量名 `__APP_WS_HOST__`，默认配置为 `/`，若为 `wx`/`wss`/`http`/`https` 开头的地址，则 Websocket 服务将会直接使用该 host，则编译时的 `WEB_SOCKET_PROXY` 配置将失效；
- `OAUTH_CLIENT_ID`: 鉴权 Oauth ID，按需调整；
- `OAUTH_CLIENT_SECRET`: 鉴权 Oauth Secret，按需调整；

> 提示：若为临时调整的变量，建议在 `.env.local` 中修改，将变量调整的影响范围限制在本地环境。

:::warning 注意
vite 支持约定式的环境变量定义，即会自动读取应用根目录下的 `.env.*` 文件，读取 `VITE_` 前缀的变量并通过 `import.meta.env` 暴露到应用运行时环境。该处理方式本无太大问题，但部分第三方库同样会使用 `import.meta.env` 中的变量，若应用中的变量发生变更则编译时第三方库打包得到的资源 hash 也会发生变更，导致浏览器缓存失效。故建议：
1. 谨慎使用 `VITE_` 前缀定义环境变量，若一定要用则应保证该变量的稳定，不随应用版本变化；
2. 使用 `getViteEnvVarsConfig` 方法定义环境变量，使用该方法定义的变量不会挂载到 `import.meta.env` 中，而是使用 `__${name}__` 的命名规范，在应用运行时环境可放心使用；
:::
