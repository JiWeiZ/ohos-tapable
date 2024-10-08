# CHANGELOG
## [V2.2.4] 2024-09
### 修复
- 修复了拦截器不存在 call、done 等方法时的异常

### 新增
- 新增 HookInterceptor 的 register 方法的第二个参数
- 新增 registerGlobalInterceptor 方法

## [V2.2.3] 2024-09
### 修复
- 移除了 AsyncHook 的 call 方法

## [V2.2.2] 2024-09
### 修复
- 移除了不必要的依赖 @ohos/axios

## [V2.2.1] 2024-09

发布 2.2.1 初版

- 基于 tapable 原库完成 openHarmony 的适配：
  - tapable 原库中使用 new Function 实现代码复用的部分，改为通过继承的方式实现
  - 移除 tapable 原库中对 nodejs 和浏览器 api 的依赖 
- 已支持 tapable 原库中导出的 9 个 Hook，包括：
  - SyncHook
  - SyncBailHook
  - SyncWaterfallHook
  - SyncLoopHook
  - AsyncParallelHook
  - AsyncParallelBailHook
  - AsyncSeriesHook
  - AsyncSeriesBailHook
  - AsyncSeriesWaterfallHook
- 已支持 tapable 原库中导出的 2 个工具类，包括
  - HookMap
  - MultiHook
