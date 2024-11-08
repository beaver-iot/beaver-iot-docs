---
sidebar_position: 12
---

# 接口请求

前端开发中，接口请求是一个非常常见的操作。为了方便管理和维护，同时规范接口请求的处理方式，让所有接口请求参数、响应数据具有完备的 Typescript 类型定义，我们封装了一个通用的接口处理工具。

## 开始使用

接口处理工具当前在 `shared/src/utils/request` 目录下位置，支持多种接口请求处理方式，支持多种配置方式，可灵活选择。

创建实例：

```ts
// client.ts
import { createRequestClient } from '@iot/shared/src/utils/request';

/** 业务请求头配置 */
const headerHandler = async () => {
    // ...
}

/** 自动刷新逻辑处理 */
const autoJumpHandler = async () => {
    // ...
}

/** 接口超时跟踪上报 */
const trackerHandler = async () => {
    // ...
}

const client = createRequestClient({
    // 接口 base url
    baseURL: 'https://xxx.host.com',
    // 静态接口请求头
    headers: {
        'x-headers': 'xxx',
    },
    configHandlers: [
        headerHandler,
        autoJumpHandler,
    ],
    onResponse(resp) {
        // Todo: 全局通用响应处理
        return resp;
    },
    onResponseError(error) {
        // Todo: 全局通用错误处理
        return error;
    },
});

export default client;
```

创建 API：

```ts
// services/http/user.ts
import { attachAPI } from '@iot/shared/src/utils/request';
import client from 'client.ts';

// APISchema 已在 @iot/shared/types/common.d.ts 中定义
interface UserAPISchema extends APISchema {
    /** 根据 id 获取用户 */
    getUser: {
        request: {
            id: number;
        };
        response: {
            avatar: string;
            id: number;
            name: string;
        };
    };

    /** 获取当前登录用户 */
    getLoginUser: {
        request: void;
        response: {
            id: number;
            name: string;
            avatar: string;
        }
    };

    /** 创建新用户 */
    createUser: {
        request: {
            avatar: string;
            name: string;
            enterpriseId: number;
        };
        response: {
            avatar: string;
            id: number;
            name: string;
        };
    },

    /** 下载资源 */
    download: {
        request: {
            id: number;
        };
        response: any;
    },
}

export default attachAPI<UserAPISchema>(client, {
    // 接口错误及响应的处理下放至 service 层，业务可自行定义
    onError(error) {
        // Todo: apis 统一错误处理
        return error;
    },

    onResponse(resp) {
        // Todo: apis 统一响应处理
        return resp;
    },

    // 支持 3 种配置方式，可灵活选择
    apis: {
        // 字符串配置
        getUser: 'GET api/user/:id',
        getLoginUser: 'GET api/user/current',

        // 对象配置
        createUser: {
            method: 'POST',
            path: 'api/user/:enterpriseId',
            // 特殊配置
            headers: { 'x-abc': 'xxx' },
        },

        // 函数配置
        download: async (params) => {
            const resp = await client.request({
                url: 'http://xxx.yeastar.com',
                method: 'GET',
                params,
                headers: {
                    enterpriseId: 'xxx'
                },
                responseType: 'blob',
            });
            let result = resp.data.data;
            // ...
            return result;
        },
    }
});
```

业务调用：

```ts
import userAPI from '@/services/http/user.ts';

userAPI.getUser({ id: 123 }).then(resp => {
    console.log(resp.data.data);
});
```

## 错误处理

基于请求处理工具，在 Web 应用中我们封装了统一的接口错误处理逻辑，可对常见的接口错误码（如 `authentication_failed` 用户鉴权错误）进行统一拦截处理，同时也支持在业务调用时对错误码进行拦截并自定义处理。

### 统一拦截

项目中默认对所有接口错误码做拦截并弹出 message 提示。开发者也可根据业务需求，自定义统一处理方式，如下：

```ts
// web/src/services/http/client/error-handler.ts
const handlerConfigs: ErrorHandlerConfig[] = [
    /**
     * 拦截 authentication_failed 错误码，执行以下处理：
     * 1. 弹出 message 提示
     * 2. 在 1s 后跳转到登录/注册页面
     * 3. 移除 token 缓存
     */
    {
        errCodes: ['authentication_failed'],
        handler(errCode, resp) {
            const intlKey = getHttpErrorKey(errCode);
            const message = intl.get(intlKey) || intl.get(serverErrorKey);
            const target = iotLocalStorage.getItem(REGISTERED_KEY)
                ? '/auth/login'
                : '/auth/register';

            toast.error({
                key: errCode,
                content: message,
                duration: 1000,
                onClose: () => {
                    const { pathname } = window.location;

                    if (target === pathname) return;
                    location.replace(target);
                },
            });
            iotLocalStorage.removeItem(TOKEN_CACHE_KEY);
        },
    },
];
```

### 自定义拦截

在业务开发中，部分场景下接口错误的处理是与业务逻辑强相关的，此时我们可以在业务接口调用时，通过 `$ignoreError` 参数进行配置，忽略统一错误拦截处理。自定义拦截处理有 3 种配置方式，以下为示例。

忽略所有统一错误拦截处理：

```ts
const {
    data: deviceData,
    loading,
    run: getDeviceList,
} = useRequest(
    async () => {
        const { page, pageSize } = paginationModel;
        const [error, resp] = await awaitWrap(
            deviceAPI.getList(
                {
                    name: keyword,
                    page_size: pageSize,
                    page_number: page + 1,
                },
                // 忽略所有通用错误拦截处理，业务需自行定义错误处理逻辑
                { $ignoreError: true },
            ),
        );
        const data = getResponseData(resp);

        // console.log({ error, resp });
        if (error || !data || !isRequestSuccess(resp)) {
            // TODO: 在此处自定义错误处理逻辑
            return;
        };

        return objectToCamelCase(data);
    },
    {
        debounceWait: 300,
        refreshDeps: [keyword, paginationModel],
    },
);
```

忽略指定错误码的统一错误拦截处理：

```ts
const {
    data: deviceData,
    loading,
    run: getDeviceList,
} = useRequest(
    async () => {
        const { page, pageSize } = paginationModel;
        const [error, resp] = await awaitWrap(
            deviceAPI.getList(
                {
                    name: keyword,
                    page_size: pageSize,
                    page_number: page + 1,
                },
                // 仅忽略 `authentication_failed` 错误码拦截处理，业务需自行定义错误处理逻辑
                { $ignoreError: ['authentication_failed'] },
            ),
        );
        const data = getResponseData(resp);

        // console.log({ error, resp });
        if (error || !data || !isRequestSuccess(resp)) {
            // TODO: 在此处自定义错误处理逻辑
            return;
        };

        return objectToCamelCase(data);
    },
    {
        debounceWait: 300,
        refreshDeps: [keyword, paginationModel],
    },
);
```

忽略指定错误码的统一错误拦截处理，并定义错误处理函数：

```ts
const {
    data: deviceData,
    loading,
    run: getDeviceList,
} = useRequest(
    async () => {
        const { page, pageSize } = paginationModel;
        const [error, resp] = await awaitWrap(
            deviceAPI.getList(
                {
                    name: keyword,
                    page_size: pageSize,
                    page_number: page + 1,
                },
                {
                    $ignoreError: [
                        {
                            codes: ['authentication_failed', 'token_expired'],
                            handler(errCode, resp) {
                                // TODO: 在此处自定义错误处理逻辑
                            },
                        },
                    ],
                },
            ),
        );
        const data = getResponseData(resp);

        // console.log({ error, resp });
        if (error || !data || !isRequestSuccess(resp)) return;

        return objectToCamelCase(data);
    },
    {
        debounceWait: 300,
        refreshDeps: [keyword, paginationModel],
    },
);
```
