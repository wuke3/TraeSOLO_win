<div align="center">

# TRAE SOLO Win

![GitHub stars](https://img.shields.io/github/stars/wuke3/TraeSOLO_win?style=social)
![GitHub forks](https://img.shields.io/github/forks/wuke3/TraeSOLO_win?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/wuke3/TraeSOLO_win?style=social)

![GitHub release](https://img.shields.io/github/v/release/wuke3/TraeSOLO_win?style=for-the-badge)
![GitHub license](https://img.shields.io/github/license/wuke3/TraeSOLO_win?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/wuke3/TraeSOLO_win?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/wuke3/TraeSOLO_win?style=for-the-badge)

![Electron](https://img.shields.io/badge/Electron-28.3.3-47848F?style=for-the-badge&logo=electron&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-14%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-0078D4?style=for-the-badge&logo=windows&logoColor=white)

</div>

## ✨ 项目简介

**TRAE SOLO Win** 是一个基于 Electron 开发的跨平台桌面应用程序，为 TRAE SOLO 的网页版提供原生的桌面使用体验。


## 🚀 功能特性

### ✨ 核心功能
- ✅ **跨平台支持** - 完美支持 Windows 和 Linux 操作系统
- ✅ **自定义窗口** - 无边框设计，自带美观的标题栏和控制按钮
- ✅ **双服务器切换** - 在国内版 (solo.trae.cn) 和国际版 (solo.trae.ai) 之间无缝切换
- ✅ **主题切换** - 支持深色模式和浅色模式，自动同步窗口图标
- ✅ **预约功能** - 一键打开预约页面，根据当前服务器智能跳转
- ✅ **外部链接处理** - 外部链接在独立窗口中打开，保持一致的用户体验
- ✅ **文件下载** - 点击下载直接弹出保存对话框，无需打开浏览器
- ✅ **文件拖拽上传** - 支持将文件拖拽到页面进行上传
- ✅ **窗口拖拽** - 流畅的标题栏拖拽功能
- ✅ **音频反馈** - 基于页面控制台输出的成功/错误音频提示

### 🎨 UI 特性
- 🎯 **统一设计风格** - 所有按钮采用一致的现代化设计
- 🌈 **响应式布局** - 适应不同屏幕尺寸
- 💫 **平滑过渡** - 所有交互都有流畅的动画效果
- 🎭 **双套图标** - 深色和浅色模式各有专属图标
- 📐 **优雅标题栏** - 高度适中，左侧带有应用图标

---

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| ![Electron](https://img.shields.io/badge/Electron-28.3.3-47848F?style=flat-square) | 28.3.3 | 跨平台桌面应用框架 |
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) | 5 | 页面结构 |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) | 3 | 样式设计 |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | ES6+ | 交互逻辑 |

---

## 📁 项目结构

```
TRAE SOLO Win/
├── 📄 main.js                  # Electron 主进程
├── 📄 index.html               # 主窗口 HTML
├── 📄 external-window.html     # 外部链接窗口 HTML
├── 📄 package.json             # 项目配置和依赖
├── 📄 README.md                # 项目说明文档（就是我！）
└── 📁 src/
    ├── 📁 css/
    │   ├── 📄 main.css         # 主窗口样式
    │   └── 📄 external-window.css
    ├── 📁 js/
    │   ├── 📄 main.js          # 主窗口 JavaScript
    │   └── 📄 external-window.js
    ├── 🖼️  light.png           # 浅色模式图标
    ├── 🖼️  dark.png            # 深色模式图标
    ├── 🔊 success.mp3          # 成功音频提示
    └── 🔊 error.mp3            # 错误音频提示
```

---

## ⚡ 快速开始

### 📋 前提条件

- ![Node.js](https://img.shields.io/badge/Node.js-v14.0.0%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white) Node.js (v14.0.0 或更高版本)
- ![npm](https://img.shields.io/badge/npm-v6.0.0%2B-CB3837?style=flat-square&logo=npm&logoColor=white) npm (v6.0.0 或更高版本) 或 ![pnpm](https://img.shields.io/badge/pnpm-v6.0.0%2B-F69220?style=flat-square&logo=pnpm&logoColor=white) pnpm

### 📦 安装依赖

使用 npm：

```bash
npm install
```

或使用 pnpm：

```bash
pnpm install
```

### 🔧 开发模式运行

```bash
npm start
```

### 📦 构建应用程序

#### Windows 版本

```bash
npm run build:win
```

构建产物将生成在 `dist` 目录中，包含 NSIS 安装程序和便携版。

#### Linux 版本

```bash
npm run build:linux
```

构建产物将生成在 `dist` 目录中，包含以下格式：
- DEB 包 (x64, arm64)
- RPM 包 (x64, arm64)
- AppImage (x64, arm64)
- Snap 包 (x64, arm64)

---

## 📖 使用说明

### 🌐 服务器切换

1. 点击顶部标题栏的 ⚙️ **设置** 按钮
2. 在设置面板中选择：
   - 🇨🇳 **国内版** (solo.trae.cn)
   - 🌍 **国际版** (solo.trae.ai)
3. 应用程序会自动刷新并切换到选择的服务器

### 🌓 主题切换

1. 点击顶部标题栏的 ⚙️ **设置** 按钮
2. 在设置面板中使用深色模式开关
3. 应用程序会立即切换主题：
   - 🟢 浅色模式 → light.png 图标
   - 🔵 深色模式 → dark.png 图标

### 📝 预约功能

1. 点击顶部标题栏的 📋 **预约** 按钮
2. 应用程序会根据当前服务器自动打开对应预约页面：
   - 国内版 → https://www.trae.cn/download#solo-download
   - 国际版 → https://www.trae.ai/download#solo-download

### 🔗 处理外部链接

- 当点击网页中的外部链接时，会自动在新的自定义窗口中打开
- 外部链接窗口也具有与主窗口相同的所有功能
- 所有第三方链接都会在新窗口中打开，不会影响主窗口

### 💾 下载文件

- 当在网页中点击下载链接时，会直接弹出文件保存对话框
- 选择保存位置后，文件会立即开始下载
- 下载完成后会在控制台显示状态

### 📁 文件拖拽上传

- 支持将文件直接拖拽到页面中
- 拖拽功能不会影响网页原有的其他功能

### 🔊 音频反馈

- 当页面控制台输出成功信息时，会播放 success.mp3
- 当页面控制台输出错误信息时，会播放 error.mp3
- 音频文件位于 src 目录中

---

## ❓ 常见问题

### 应用程序无法启动

1. 检查 Node.js 和 npm 是否正确安装
2. 确保所有依赖已成功安装 (`npm install` 或 `pnpm install`)
3. 检查网络连接是否正常
4. 查看控制台错误信息（按 F12 打开开发者工具）

### 无法切换服务器

1. 检查网络连接是否正常
2. 确保选择的服务器地址可访问
3. 尝试手动在浏览器中访问该地址确认

### 主题切换不生效

1. 尝试重启应用程序
2. 检查是否有 JavaScript 错误（按 F12 查看）
3. 确认 `src/light.png` 和 `src/dark.png` 文件存在

### 下载功能无法使用

1. 检查是否有文件保存对话框弹出
2. 确保有足够的磁盘空间
3. 检查下载目录的写入权限

### 音频反馈不工作

1. 确认 `src/success.mp3` 和 `src/error.mp3` 文件存在
2. 检查系统音量设置
3. 查看控制台是否有音频相关错误

---

## 🔧 故障排除

### 查看应用程序日志

- 在开发模式下，控制台会显示详细的日志信息
- 按 **F12** 可以打开开发者工具查看更多调试信息
- 开发者工具也可以用 **Ctrl+Shift+I** 打开

### 重置设置

应用程序的设置存储在本地，可以通过以下方式重置：

1. 关闭应用程序
2. 删除配置文件（位置取决于操作系统）
3. 重新启动应用程序

---

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 提交 Issue

如果您发现了 Bug 或有新功能建议，请 [提交 Issue](https://github.com/wuke3/TraeSOLO_win/issues/new)。

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](https://github.com/wuke3/TraeSOLO_win/blob/main/LICENSE) 文件。

---

## 📮 联系方式

如有任何问题或建议，请通过以下方式联系：

- 📁 **项目地址**：[https://github.com/wuke3/TraeSOLO_win](https://github.com/wuke3/TraeSOLO_win)
- 🌐 **官方网站**：[TRAE SOLO](https://solo.trae.cn/)
- 💬 **提交问题**：[GitHub Issues](https://github.com/wuke3/TraeSOLO_win/issues)

---

<div align="center">

如果这个项目对您有帮助，请给我们一个 ⭐ Star！

Made with ❤️ by TRAE SOLO 社区

</div>

---

## 📊 仓库统计

![GitHub repo size](https://img.shields.io/github/repo-size/wuke3/TraeSOLO_win?style=flat-square)
![GitHub code size](https://img.shields.io/github/languages/code-size/wuke3/TraeSOLO_win?style=flat-square)
![GitHub top language](https://img.shields.io/github/languages/top/wuke3/TraeSOLO_win?style=flat-square)
![GitHub language count](https://img.shields.io/github/languages/count/wuke3/TraeSOLO_win?style=flat-square)

---

### 📈 Star History

<div align="center">
  <img src="https://api.star-history.com/svg?repos=wuke3/TraeSOLO_win&type=Date" alt="Star History" width="700">
</div>
