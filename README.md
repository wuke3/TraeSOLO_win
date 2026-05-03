<div align="center">

# TRAE SOLO Win

[![GitHub release](https://img.shields.io/github/v/release/wuke3/TraeSOLO_win?style=for-the-badge)](https://github.com/wuke3/TraeSOLO_win/releases)
[![GitHub license](https://img.shields.io/github/license/wuke3/TraeSOLO_win?style=for-the-badge)](https://github.com/wuke3/TraeSOLO_win/blob/main/LICENSE)
[![Electron](https://img.shields.io/badge/Electron-28.3.3-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-0078D4?style=for-the-badge)](https://github.com/wuke3/TraeSOLO_win)

**为 TRAE SOLO 提供原生桌面体验的跨平台应用**

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [项目结构](#-项目结构) • [开发指南](#-开发指南)

</div>

---

## 📖 项目简介

TRAE SOLO Win 是基于 Electron 构建的跨平台桌面应用程序，将 TRAE SOLO 网页版封装为原生桌面应用，提供更流畅的使用体验、更丰富的系统集成和更便捷的操作方式。

### 为什么选择桌面版？

- 🚀 **原生体验** - 无边框窗口设计，流畅的动画效果
- 🔔 **系统集成** - 系统托盘、开机自启动、全局快捷键
- 🔒 **隐私安全** - 独立进程运行，数据本地存储
- 🌐 **双服务器** - 一键切换国内版与国际版

---

## ✨ 功能特性

### 核心功能

| 功能 | 描述 |
|------|------|
| 🌐 **双服务器切换** | 国内版 与国际版 无缝切换 |
| 🌓 **主题切换** | 深色/浅色模式，窗口图标自动同步 |
| 🖼️ **无边框窗口** | 现代化自定义标题栏，支持拖拽移动 |
| 📌 **系统托盘** | 最小化/关闭到托盘，后台运行 |
| 🔗 **外部链接处理** | 第三方链接在独立窗口打开 |
| 📥 **文件下载** | 点击下载直接弹出保存对话框 |
| 📁 **拖拽上传** | 支持文件拖拽到页面上传 |
| ⌨️ **全局快捷键** | `Ctrl+Shift+S` 快速显示/隐藏窗口 |
| 🚀 **开机自启动** | 可选的系统开机自启动 |
| 📐 **窗口记忆** | 自动保存窗口位置和大小 |

### 用户界面

- 🎯 统一的现代化按钮设计
- 💫 流畅的过渡动画
- 🎭 深色/浅色双套图标
- 📱 响应式布局适配

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [Electron](https://www.electronjs.org/) | 28.3.3 | 跨平台桌面应用框架 |
| [Node.js](https://nodejs.org/) | 14+ | JavaScript 运行时 |
| HTML5 | - | 页面结构 |
| CSS3 | - | 样式设计 |
| JavaScript | ES6+ | 交互逻辑 |

---

## 📁 项目结构

```
TRAE SOLO Win/
├── main.js                     # 应用入口
├── index.html                  # 主窗口页面
├── external-window.html        # 外部链接窗口页面
├── package.json                # 项目配置
│
├── src/
│   ├── main/                   # 主进程
│   │   ├── index.js            # 主进程入口
│   │   ├── ipc-handlers.js     # IPC 通信处理
│   │   ├── window-manager.js   # 窗口管理
│   │   ├── settings.js         # 设置持久化
│   │   ├── tray-manager.js     # 系统托盘
│   │   ├── webview-manager.js  # WebView 管理
│   │   └── preload.js          # 预加载脚本
│   │
│   ├── renderer/               # 渲染进程
│   │   └── shared/
│   │       ├── theme-manager.js    # 主题管理
│   │       ├── title-bar-drag.js   # 标题栏拖拽
│   │       └── window-controls.js  # 窗口控制
│   │
│   ├── js/
│   │   ├── main.js             # 主窗口逻辑
│   │   └── external-window.js  # 外部窗口逻辑
│   │
│   ├── css/
│   │   └── main.css            # 样式文件
│   │
│   ├── config/
│   │   └── constants.js        # 配置常量
│   │
│   ├── utils/
│   │   ├── logger.js           # 日志工具
│   │   └── validators.js       # 数据验证
│   │
│   ├── light.png               # 浅色模式图标
│   └── dark.png                # 深色模式图标
│
└── assets/
    └── icons/                  # 应用图标资源
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/wuke3/TraeSOLO_win.git
cd TraeSOLO_win

# 安装依赖
npm install

# 开发模式运行
npm start
```

### 构建应用

```bash
# 构建 Windows 版本
npm run build:win

# 构建 Linux 版本
npm run build:linux

# 构建当前平台
npm run build
```

构建产物位于 `dist/` 目录。

---

## 📖 使用指南

### 服务器切换

1. 点击标题栏 ⚙️ 设置按钮
2. 在设置面板选择服务器：
   - 🇨🇳 **国内版** - solo.trae.cn
   - 🌍 **国际版** - solo.trae.ai
3. 应用自动刷新并切换

### 主题切换

1. 点击标题栏 ⚙️ 设置按钮
2. 切换深色模式开关
3. 主题立即生效，图标自动同步

### 系统托盘

- **单击托盘图标** - 显示/隐藏主窗口
- **双击托盘图标** - 显示主窗口
- **右键托盘图标** - 显示菜单

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+S` | 全局显示/隐藏窗口 |
| `F12` (开发模式) | 打开开发者工具 |

---

## 🔧 开发指南

### 架构设计

项目采用 Electron 的主进程-渲染进程架构：

```
┌─────────────────────────────────────────────────────┐
│                    主进程              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ 窗口管理器   │ │ 设置管理器  │ │ 托盘管理器  │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
│                      │ IPC                         │
└──────────────────────┼──────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────┐
│                    渲染进程            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ 主题管理器   │ │ 窗口控制器  │ │ WebView     │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 关键模块

#### 主进程

- **[index.js](src/main/index.js)** - 应用生命周期、单实例锁定、全局快捷键
- **[window-manager.js](src/main/window-manager.js)** - 窗口创建、无边框窗口、关闭到托盘
- **[ipc-handlers.js](src/main/ipc-handlers.js)** - 进程间通信、设置读写、窗口控制
- **[settings.js](src/main/settings.js)** - 设置持久化、白名单验证
- **[tray-manager.js](src/main/tray-manager.js)** - 系统托盘、图标切换

#### 渲染进程

- **[theme-manager.js](src/renderer/shared/theme-manager.js)** - 主题切换、图标同步
- **[window-controls.js](src/renderer/shared/window-controls.js)** - 窗口控制按钮

### 安全特性

- ✅ Context Isolation 启用
- ✅ Node Integration 禁用
- ✅ Preload Script 安全暴露 API
- ✅ 设置白名单防止恶意修改
- ✅ URL/Domain 验证

---

## ❓ 常见问题

<details>
<summary><b>应用程序无法启动</b></summary>

1. 检查 Node.js 和 npm 是否正确安装
2. 确保依赖已安装：`npm install`
3. 检查网络连接
4. 开发模式下按 F12 查看控制台错误
</details>

<details>
<summary><b>无法切换服务器</b></summary>

1. 检查网络连接
2. 在浏览器中验证目标服务器可访问
3. 检查控制台是否有错误信息
</details>

<details>
<summary><b>主题切换不生效</b></summary>

1. 重启应用程序
2. 确认 `src/light.png` 和 `src/dark.png` 存在
3. 按 F12 检查 JavaScript 错误
</details>

<details>
<summary><b>如何重置设置</b></summary>

设置存储在用户数据目录：
- **Windows**: `%APPDATA%\trae-solo-win\settings.json`
- **Linux**: `~/.config/trae-solo-win/settings.json`

删除 `settings.json` 文件后重启应用即可重置。
</details>

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

### 提交 Issue

发现 Bug 或有功能建议？请 [提交 Issue](https://github.com/wuke3/TraeSOLO_win/issues/new)。

---

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

---

## 📮 联系方式

- **项目地址**: [github.com/wuke3/TraeSOLO_win](https://github.com/wuke3/TraeSOLO_win)
- **官方网站**: [trae.cn](https://www.trae.cn/)
- **问题反馈**: [GitHub Issues](https://github.com/wuke3/TraeSOLO_win/issues)

---

<div align="center">

如果这个项目对你有帮助，请给一个 ⭐ Star 支持一下！

Made with ❤️ by TRAE SOLO Community

</div>
