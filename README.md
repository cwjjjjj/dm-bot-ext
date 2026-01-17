# Instagram DM Bot - 自动化私信扩展

> ⚠️ **警告**: 此工具仅供学习研究使用。批量自动DM可能违反Instagram服务条款，导致账号限制或封禁。使用风险自负。

## ✨ 核心功能

- 📋 **CSV导入** - 支持导入自定义博主清单
- ✉️ **消息模板** - 支持变量替换和Spintex随机化
- 🤖 **拟人化操作** - 模拟真实用户点击、打字、停顿
- ⚡ **智能队列** - 自动排队、错误重试、状态持久化
- 🎯 **精准控制** - 每日限额、发送间隔、打字速度可调
- 📊 **实时监控** - Activity Logs记录所有操作
- 🔒 **本地存储** - 数据不上传服务器，隐私安全

## 🚀 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 构建扩展
```bash
pnpm build
```

### 3. 加载到Chrome
1. 打开 `chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `.output/chrome-mv3/` 目录

### 4. 验证Instagram选择器
**重要**: Instagram频繁更改DOM结构，必须先验证选择器！

1. 登录 Instagram
2. 访问 https://www.instagram.com/direct/inbox/
3. 打开开发者工具（F12）→ Console
4. 运行 `scripts/test-selectors.js` 的内容
5. 查看哪些选择器有效，哪些失效
6. 如有必要，更新 `/lib/instagram-dm.ts` 中的选择器

### 5. 准备CSV文件
创建 `contacts.csv`:
```csv
Profile Link,Name,Category
https://www.instagram.com/username1/,John Doe,Fashion
@username2,Jane Smith,Tech
username3,Bob Johnson,Travel
```

### 6. 创建消息模板
1. 打开扩展popup
2. 导航到 "Templates"
3. 创建新模板，例如:
   ```
   Hi {Name}! {I love|I really enjoy|I admire} your {Category} content.
   Would love to connect!
   ```

### 7. 开始自动化
1. 在首页选择列表和模板
2. 点击 "Start Queue"
3. Bot会在后台标签页自动执行

## 📁 项目结构

```
dm-bot-ext/
├── entrypoints/
│   ├── background.ts         # 后台服务（任务编排）
│   ├── content.tsx           # 内容脚本（DM执行）
│   └── popup/                # Popup UI
├── components/
│   ├── popup/                # UI组件
│   │   ├── HomePage.tsx      # 仪表盘
│   │   ├── ListsPage.tsx     # CSV管理
│   │   ├── TemplatesPage.tsx # 模板编辑
│   │   ├── LogsPage.tsx      # 活动日志
│   │   └── SettingsPage.tsx  # 设置
│   └── DMButton.tsx          # Instagram页面按钮
├── lib/
│   ├── instagram-dm.ts       # IG DM接口（核心⭐）
│   ├── bot-engine.ts         # 任务队列引擎
│   ├── storage.ts            # 存储操作
│   ├── storage-hooks.tsx     # React hooks
│   ├── csv-parser.ts         # CSV解析
│   └── spintex.ts            # 消息随机化
├── types/
│   └── storage.ts            # 类型定义
└── scripts/
    └── test-selectors.js     # 选择器验证工具
```

## 🎯 核心功能详解

### 1. CSV导入与管理
支持多种Instagram用户名格式：
- ✅ 完整URL: `https://www.instagram.com/username/`
- ✅ 带@前缀: `@username`
- ✅ 纯用户名: `username`

自定义字段支持：
```
Profile Link,Name,Category,CustomField1,CustomField2
@john,John,Fashion,Influencer,100K followers
```

### 2. 消息模板变量
```
Hi {Name}!

I came across your {Category} content and loved it.

Would love to connect! - {MyName}
```

### 3. Spintex随机化
防止垃圾信息检测：
```
{Hi|Hello|Hey} {Name}! {I love|I really enjoy|I admire} your {Category} content.
```

可能生成：
- "Hi John! I love your Fashion content."
- "Hello Jane! I really enjoy your Tech content."
- "Hey Bob! I admire your Travel content."

### 4. 拟人化操作
- 🖱️ **鼠标移动** - 贝塞尔曲线路径
- ⌨️ **打字模拟** - 随机速度 + 停顿 + 偶尔回退修正
- ⏱️ **随机延迟** - 操作间隔随机化
- 👆 **真实点击** - mousedown → mouseup → click

### 5. 安全机制
- ✅ 每日限额（默认30条）
- ✅ 发送间隔（60-300秒）
- ✅ 错误自动重试（最多3次）
- ✅ 失败暂停选项
- ✅ 状态持久化（刷新不丢失）

## ⚙️ 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式（热重载）
pnpm dev

# 类型检查
pnpm compile

# 构建生产版本
pnpm build

# 构建Firefox版本
pnpm build:firefox

# 打包为ZIP
pnpm zip
```

## 🔧 调试技巧

### 查看日志
1. 打开Chrome DevTools（F12）
2. 切换到 "Console" 标签
3. 查找 `[Instagram DM]` 或 `[Bot Engine]` 开头的日志

### 验证选择器
运行 `scripts/test-selectors.js`:
```javascript
// 在Instagram页面的Console中运行
// 脚本内容见: scripts/test-selectors.js
```

输出示例：
```
✅ DIRECT_MESSAGE_ICON: 找到 1 个可见元素
❌ NEW_MESSAGE_BUTTON: 未找到元素
✅ SEARCH_INPUT: 找到 1 个可见元素
```

### 手动测试函数
验证脚本加载后，可使用：
```javascript
// 高亮显示元素
highlightElement('div[role="button"]');

// 查找所有可点击按钮
findAllClickable();
```

## 🐛 常见问题

### Q: 扩展未显示在Instagram页面？
**A**:
1. 确认扩展已在 `chrome://extensions/` 启用
2. 刷新Instagram页面
3. 确认在个人主页（不是帖子页面）
4. 检查content script是否注入（F12 → Console）

### Q: 选择器失效怎么办？
**A**:
1. 运行 `scripts/test-selectors.js` 验证
2. 使用 `findAllClickable()` 查看实际元素
3. 手动检查DOM结构（F12 → Elements）
4. 更新 `/lib/instagram-dm.ts` 中的选择器
5. 重新构建: `pnpm build`

### Q: 消息发送失败？
**A**: 可能原因：
- 对方私密账号
- 未关注对方（对方设置了限制）
- 账号被限制
- 触发反垃圾机制

解决方案：
- 查看"Activity Logs"的错误信息
- 降低每日限额和发送频率
- 先用小号测试

### Q: 任务卡住不执行？
**A**:
1. 检查"Activity Logs"
2. 确认选择器正确
3. 手动测试元素查找
4. 检查网络连接

## 📊 技术栈

- **框架**: [WXT](https://wxt.dev/) - Modern web extension framework
- **UI**: React 19 + TypeScript
- **存储**: @wxt-dev/storage (chrome.storage.local wrapper)
- **构建**: Vite 7
- **Manifest**: V3
- **包管理**: pnpm

## 📖 详细文档

- [使用指南](./docs/USAGE_GUIDE.md) - 完整使用教程
- [选择器验证](./scripts/test-selectors.js) - DOM选择器测试工具
- [MVP计划](./.claude/plans/) - 原始需求文档

## ⚠️ 免责声明

此工具仅供学习和研究目的。使用本工具的风险由用户自行承担。

- ❌ 违反Instagram服务条款可能导致账号封禁
- ❌ 请遵守当地法律法规
- ❌ 请尊重其他用户的隐私
- ❌ 不得用于垃圾信息或骚扰

## 📝 开发路线图

- [x] 基础架构搭建
- [x] CSV导入功能
- [x] 消息模板系统
- [x] Spintex随机化
- [x] Bot引擎
- [x] 拟人化操作
- [x] UI组件
- [x] 活动日志
- [x] 错误处理
- [ ] 选择器自动更新（AI辅助）
- [ ] 代理支持
- [ ] 多账号管理
- [ ] A/B测试
- [ ] 响应率追踪

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Created with ❤️ using [WXT](https://wxt.dev/) framework**
