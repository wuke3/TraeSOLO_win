# TRAE SOLO Win 全面优化计划

## 一、项目现状分析

### 1.1 代码结构
- **主进程**: `main.js` (455 行) - 包含所有主进程逻辑
- **渲染进程**: `src/js/main.js` 和 `src/js/external-window.js`
- **UI**: `index.html`, `external-window.html`, `src/css/main.css`
- **配置**: `package.json`

### 1.2 主要问题分类
| 优先级 | 类别 | 问题数量 |
|--------|------|----------|
| 🔴 高 | 安全问题 | 3 |
| 🟡 中 | 代码质量 | 5 |
| 🟡 中 | 性能问题 | 2 |
| 🟢 低 | 功能增强 | 4 |

---

## 二、优化实施计划

### 阶段一：安全优化（高优先级）

#### 任务 1.1：创建项目目录结构
**文件操作**:
- 创建 `src/main/` 目录
- 创建 `src/renderer/` 目录
- 创建 `src/renderer/shared/` 目录
- 创建 `src/config/` 目录
- 创建 `src/utils/` 目录

#### 任务 1.2：提取配置常量
**新建文件**: `src/config/constants.js`
- 提取所有硬编码 URL
- 提取域名配置
- 提取窗口尺寸配置
- 提取主题配置

#### 任务 1.3：实现 Context Bridge（关键安全改进）
**新建文件**: `src/main/preload.js`
- 使用 `contextBridge.exposeInMainWorld` 安全暴露 API
- 移除 `nodeIntegration: true`
- 启用 `contextIsolation: true`
- 禁用废弃的 `enableRemoteModule`

**修改文件**: `main.js`
- 更新 `webPreferences` 配置
- 添加 `preload` 脚本路径

**修改文件**: `index.html` 和 `external-window.html`
- 移除 `nodeintegration` 和 `webpreferences` 属性
- 更新 webview 标签

**修改文件**: `src/js/main.js` 和 `src/js/external-window.js`
- 移除 `require('electron')`
- 使用 `window.electronAPI` 替代

#### 任务 1.4：禁用生产环境 DevTools
**修改文件**: `main.js`
- 根据 `process.env.NODE_ENV` 条件启用 devTools
- 添加 `NODE_ENV` 环境变量检测

---

### 阶段二：代码质量优化（中优先级）

#### 任务 2.1：实现结构化日志系统
**新建文件**: `src/utils/logger.js`
- 实现日志级别（DEBUG, INFO, WARN, ERROR）
- 添加时间戳
- 添加模块名称
- 支持日志格式化

**修改文件**: 所有 `.js` 文件
- 替换 `console.log/error` 为 logger 调用

#### 任务 2.2：提取共享模块
**新建文件**: `src/renderer/shared/title-bar-drag.js`
- 提取标题栏拖拽逻辑

**新建文件**: `src/renderer/shared/theme-manager.js`
- 提取主题管理逻辑

**新建文件**: `src/renderer/shared/window-controls.js`
- 提取窗口控制按钮逻辑

**修改文件**: `src/js/main.js` 和 `src/js/external-window.js`
- 引入并使用共享模块

#### 任务 2.3：主进程模块化重构
**新建文件**: `src/main/window-manager.js`
- 窗口创建和管理逻辑

**新建文件**: `src/main/settings.js`
- 设置读写逻辑

**新建文件**: `src/main/ipc-handlers.js`
- 所有 IPC 处理逻辑

**新建文件**: `src/main/webview-manager.js`
- webview 事件处理逻辑

**修改文件**: `main.js`
- 简化为主进程入口，引入各模块

#### 任务 2.4：添加输入验证
**新建文件**: `src/utils/validators.js`
- URL 验证函数
- IPC 消息参数验证
- 配置项边界检查

**修改文件**: 所有 IPC 处理代码
- 添加参数验证

---

### 阶段三：性能优化（中优先级）

#### 任务 3.1：优化标题更新机制
**修改文件**: `src/js/external-window.js`
- 移除轮询机制
- 完全依赖 `page-title-updated` 事件
- 清理不必要的定时器

#### 任务 3.2：完善资源清理
**修改文件**: `src/js/external-window.js`
- 窗口关闭时清理所有定时器
- 移除事件监听器

**修改文件**: `main.js`
- 应用退出时清理 IPC 监听器
- 清理全局快捷键

---

### 阶段四：功能增强（低优先级）

#### 任务 4.1：窗口状态持久化
**修改文件**: `src/main/settings.js`
- 添加窗口大小和位置保存
- 添加窗口最大化状态保存

**修改文件**: `src/main/window-manager.js`
- 创建窗口时恢复状态

#### 任务 4.2：添加单实例锁定
**修改文件**: `main.js`
- 使用 `app.requestSingleInstanceLock()`
- 处理第二个实例启动事件

#### 任务 4.3：改进错误处理和用户体验
**修改文件**: 相关文件
- 添加 webview 加载失败重试机制
- 添加用户友好的错误提示

#### 任务 4.4：优化 package.json 依赖版本
**修改文件**: `package.json`
- 使用精确版本号替代 `^`
- 添加必要的生产依赖说明

---

## 三、文件清单

### 新建文件（共 12 个）
1. `src/config/constants.js`
2. `src/utils/logger.js`
3. `src/utils/validators.js`
4. `src/main/preload.js`
5. `src/main/window-manager.js`
6. `src/main/settings.js`
7. `src/main/ipc-handlers.js`
8. `src/main/webview-manager.js`
9. `src/main/index.js` (新的主进程入口)
10. `src/renderer/shared/title-bar-drag.js`
11. `src/renderer/shared/theme-manager.js`
12. `src/renderer/shared/window-controls.js`

### 修改文件（共 8 个）
1. `main.js` (将重命名为备份或重构)
2. `index.html`
3. `external-window.html`
4. `src/js/main.js`
5. `src/js/external-window.js`
6. `package.json`
7. `src/css/main.css` (如有需要)

### 备份文件
- 原 `main.js` 备份为 `main.js.backup`

---

## 四、风险评估与应对

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|----------|
| Context Bridge 重构导致功能中断 | 高 | 中 | 分步骤测试，保留旧代码备份 |
| 模块化重构引入新 bug | 中 | 中 | 每完成一个模块就测试 |
| 依赖版本变更导致兼容性问题 | 中 | 低 | 先在开发环境测试 |
| 性能优化反而降低体验 | 低 | 低 | A/B 测试对比 |

---

## 五、验证标准

### 安全验证
- ✅ `nodeIntegration` 为 false
- ✅ `contextIsolation` 为 true
- ✅ 使用 preload 脚本和 contextBridge
- ✅ 生产环境 devTools 禁用

### 代码质量验证
- ✅ 无重复代码
- ✅ 模块化结构清晰
- ✅ 所有函数有必要注释
- ✅ 输入验证完善

### 性能验证
- ✅ 无过度轮询
- ✅ 资源正确清理
- ✅ 应用启动时间无明显增加

### 功能验证
- ✅ 所有原有功能正常工作
- ✅ 窗口控制正常
- ✅ 主题切换正常
- ✅ 外部窗口正常
