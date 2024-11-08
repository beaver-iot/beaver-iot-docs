---
sidebar_position: 12
---

# 主题定制

MUI 组件库提供了非常完善的主题定制方案，但若完全按照该方案则我们在处理多主题样式时只能采用 CSS-in-JS 的方案，这在部分场景下不够灵活，且开发人员需重新熟悉一套新的样式处理方案。故我们当前采用多主题方案会同时支持 CSS Variables 和 CSS-in-JS。系统中的多主题服务会处理这两套方案的差异及兼容问题，同时对外暴露必要接口，辅助业务快速开发。

以下介绍应用中处理多主题需求的几种方式。

## CSS Variables

```less
/** style.less */
body {
    // 自定义 CSS 变量
    background-color: var(--body-background);
    // MUI 调色板变量
    background-color: var(--mui-palette-background-default);
}
```

以上，`--mui-palette-background-default` 变量由 MUI 调色板提供，Theme 服务不会对该调色板做 Token 扩展，当前可用 Token 可查看官方文档。而 `--body-background` 是自定义变量，可根据需求自行增加（注意需符合相应的命名和使用规范）。

## CSS-in-JS

```tsx
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomElem = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
    '&:hover': {
        backgroundColor: theme.palette.common.black,
    },
}));

const StyledBox = styled(Box)(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
    '&:hover': {
        backgroundColor: theme.palette.common.black,
    },
}));

const Box2 = () => (
    <Box sx={{ bgcolor: 'background.default' }} />
);

const Box3 = () => (
    <Box sx={theme => ({ bgcolor: theme.palette.background.default })} />
);
```

## 总结

两种方式的不同点在于 CSS-in-JS 只能使用 MUI 调色板的 Token，而 CSS Variables 可使用 MUI 调色板的 Token 及自定义变量。
以上，因 CSS-in-JS 方案会增加运行时开销，对应用性能存在一定影响，故当前仅建议在处理全局性问题场景时使用，业务开发仍推荐使用 CSS Variables 方案。
