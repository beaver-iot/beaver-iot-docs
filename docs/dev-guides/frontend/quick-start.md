---
sidebar_position: 1
---

# 快速开始

## 在线体验

可直接在 [Beaver IoT Demo](https://demo.beaver-iot.com/) 上进行体验。

## 前置准备

- Pnpm 8 及以上版本；
- Node.js 20 及以上版本；

### 安装 Pnpm

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

参考 [Pnpm 安装文档](https://pnpm.io/installation)。

### 安装 Node

```bash
# 安装 Node.js 的 LTS 版本
pnpm env use --global lts
```

参考 [Pnpm Node.js 环境管理文档](https://pnpm.io/cli/env)。

### 克隆仓库

生成 SSH Key（如果本地已有，可跳过）：

```bash
# 一路「回车」即可
ssh-keygen -t rsa -C "your_email@milesight.com"

# 拷贝公钥
# Git Bash on Windows
cat ~/.ssh/id_rsa.pub | clip

# Mac
cat ~/.ssh/id_rsa.pub | pbcopy
```

将生成并拷贝的 SSH 公钥，复制粘贴到 Gitlab 的 `用户设置 -> SSH 密钥` 中。然后，即可免密克隆项目到本地：

```bash
# 克隆仓库
git clone git@gitlab.milesight.com:oss/beaver-iot-web.git

# 进入项目目录
cd beaver-iot-web

# 配置提交的用户名及邮箱
# 若需全局修改，可增加 --global 参数
git config user.name xxx
git config user.email xxx@yeastar.com
```

## 启动运行

```bash
pnpm run start
```
