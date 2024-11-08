---
sidebar_position: 16
---

# 开发规范

本项目开发规范已抽离为独立的子仓库，开发者可在 `packages/spec` 中查看源码并做相应定制处理。以下将对使用方式及基础规范进行介绍。

## 开始使用

Javascript 项目规范配置：

```js
// .eslintrc.js
module.exports = {
    root: true,
    extends: [
        require.resolve('@milesight/spec/src/eslint-config/base'),
    ],
};
```

Typescript 项目规范配置：

```js
// .eslintrc.js
module.exports = {
    root: true,
    extends: [
        require.resolve('@milesight/spec/src/eslint-config/base'),
        require.resolve('@milesight/spec/src/eslint-config/typescript'),
    ],
};
```

React + Typescript 项目规范配置：

```js
// .eslintrc.js
module.exports = {
    root: true,
    extends: [
        require.resolve('@milesight/spec/src/eslint-config/base'),
        require.resolve('@milesight/spec/src/eslint-config/react-typescript'),
    ],
};
```

Stylelint 规范配置：

```js
// .stylelintrc.js
module.exports = {
    extends: require.resolve('@milesight/spec/src/stylelint-config'),
};
```

Prettier 规范配置：

```js
// .prettierrc.js
module.exports = require('@milesight/spec/src/prettier-config');
```

Commitlint 规范配置：

```js
// .commitlintrc.js
module.exports = require('@milesight/spec/src/commitlint-config');
```

## 规范说明



