# TRAE SOLO Win 应用优化计划 V2

## [ ] Task 1: 完善下载功能，直接显示保存对话框
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 确保点击下载链接时直接显示选择下载位置对话框
  - 优化下载处理逻辑
- **Success Criteria**:
  - 点击下载链接立即弹出保存对话框
  - 下载功能正常工作
- **Test Requirements**:
  - `programmatic` TR-1.1: will-download 事件正确处理
  - `human-judgement` TR-1.2: 下载流程顺畅

## [ ] Task 2: 适配深色/浅色模式图标
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 使用 dark.png 和 light.png 两个图标
  - 根据当前主题动态切换图标
  - 同时更新主窗口和外部窗口
- **Success Criteria**:
  - 浅色模式显示 light.png
  - 深色模式显示 dark.png
  - 切换主题时图标自动更新
- **Test Requirements**:
  - `programmatic` TR-2.1: 图标随主题切换
  - `human-judgement` TR-2.2: 图标显示正确

## [ ] Task 3: 确保所有第三方链接在新窗口打开
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 点击任何第三方跳转按钮或链接都要新开窗口
  - 不限制域名，所有外部链接都在新窗口打开
  - 改进链接检测逻辑
- **Success Criteria**:
  - 所有外部链接都在新窗口打开
  - 内部链接正常在原窗口导航
- **Test Requirements**:
  - `programmatic` TR-3.1: new-window 和 will-navigate 都正确处理
  - `human-judgement` TR-3.2: 外部链接都在新窗口打开

## [ ] Task 4: 优化外部窗口样式并支持深色模式
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - 优化外部窗口的样式，与主窗口一致
  - 添加深色模式支持
  - 添加标题栏图标
  - 添加下载处理
  - 添加外部链接处理
- **Success Criteria**:
  - 外部窗口样式与主窗口一致
  - 支持深色/浅色模式切换
  - 功能完整（下载、外部链接等）
- **Test Requirements**:
  - `human-judgement` TR-4.1: 外部窗口样式美观
  - `programmatic` TR-4.2: 深色模式正常工作
