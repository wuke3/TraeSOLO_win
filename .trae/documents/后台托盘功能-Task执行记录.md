# Task 执行记录

## Task 名
后台托盘（系统托盘）功能实现

## 已实现功能

### 1. 配置管理
- 在 `src/config/constants.js` 中新增托盘相关默认设置：
  - `minimizeToTray`: 最小化到托盘（默认 true）
  - `closeToTray`: 关闭窗口时隐藏到托盘（默认 true）

### 2. 托盘管理器 (tray-manager.js)
新增文件 `src/main/tray-manager.js`，实现以下功能：
- 托盘图标创建（支持亮色/深色主题）
- 右键菜单：显示主窗口、退出
- 左键单击：切换窗口显示/隐藏
- 左键双击：显示并聚焦主窗口
- 托盘图标随主题自动更新
- 完整的异常处理和日志记录

### 3. 窗口管理器优化
修改 `src/main/window-manager.js`：
- 新增 `close` 事件监听，拦截窗口关闭
- 当 `closeToTray` 为 true 时，阻止默认关闭行为，隐藏窗口而非销毁
- 新增 `quitApp()` 函数：设置 `isQuitting` 标志，允许真正退出应用
- 导出 `quitApp` 供托盘管理器使用

### 4. 主进程集成
修改 `src/main/index.js`：
- 导入托盘管理器相关函数
- 在 `app.on('ready')` 中调用 `setupTray()` 初始化托盘
- 在 `app.on('will-quit')` 中调用 `destroyTray()` 销毁托盘
- 修改 `window-all-closed` 事件：使用 `quitApp()` 而非直接 `app.quit()`

### 5. 设置 IPC 处理
修改 `src/main/ipc-handlers.js`：
- 导入 `updateTrayIcon` 函数
- 在 `update-settings` 中新增对 `minimizeToTray` 和 `closeToTray` 的验证和保存
- 当 `darkMode` 变更时，自动调用 `updateTrayIcon()` 更新托盘图标

## 代码结构
```
d:\Desktop\TraeSOLO_win\
├── src\
│   ├── config\
│   │   └── constants.js          (新增托盘默认设置)
│   ├── main\
│   │   ├── index.js                (集成托盘管理器)
│   │   ├── window-manager.js       (新增窗口拦截和退出功能)
│   │   ├── ipc-handlers.js         (新增托盘设置 IPC)
│   │   └── tray-manager.js         (新增托盘管理器)
```

## 已修改文件
1. `src/config/constants.js` - 新增托盘设置项
2. `src/main/window-manager.js` - 优化窗口关闭逻辑
3. `src/main/index.js` - 集成托盘管理器
4. `src/main/ipc-handlers.js` - 新增设置 IPC
5. `src/main/tray-manager.js` - 新增（托盘管理器）

## 问题
无

## 下一步
1. 在渲染层（index.html, src/js/main.js）中添加托盘设置 UI 界面
2. 实现最小化到托盘功能（当前仅实现关闭到托盘）
3. 添加开机自启动功能
4. 实现主进程与渲染进程间的托盘设置双向同步
