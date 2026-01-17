# Instagram DM 自动化扩展 - 使用指南

## ⚠️ 重要警告

在使用此扩展之前，请务必了解以下风险：

### 风险提醒
- ❌ **批量自动DM可能触发Instagram反垃圾信息机制**
- ❌ **可能导致账号被限制或封禁**
- ❌ **可能被要求进行身份验证**
- ❌ **违反Instagram服务条款**

### 安全建议
- ✅ 建议先用小号测试
- ✅ 从少量联系人开始（3-5个）
- ✅ 每日限制默认30条（可在设置中调整）
- ✅ 随机延迟60-300秒
- ✅ 使用拟人化操作（鼠标移动、打字速度）
- ✅ Spintex消息随机化

---

## 📦 安装扩展

### 1. 构建扩展
```bash
pnpm build
```

### 2. 加载到Chrome
1. 打开 `chrome://extensions/`
2. 启用"开发者模式"（右上角开关）
3. 点击"加载已解压的扩展程序"
4. 选择文件夹：`.output/chrome-mv3/`

### 3. 验证安装
- 浏览器工具栏会出现扩展图标
- 访问任何Instagram个人主页应该能看到"DM Bot"按钮

---

## 🔧 第一步：验证Instagram选择器

### 为什么需要验证？
Instagram频繁更改DOM结构，选择器可能失效。

### 验证步骤

#### 1. 登录Instagram
访问 https://www.instagram.com/ 并登录

#### 2. 导航到私信页面
- 点击右上角的私信图标（飞机图标）
- 或直接访问：https://www.instagram.com/direct/inbox/

#### 3. 打开开发者工具
- 按 `F12` 或右键 → "检查"
- 切换到 "Console" 标签

#### 4. 运行验证脚本
复制 `scripts/test-selectors.js` 的内容到Console并运行

#### 5. 查看结果
```
✅ DIRECT_MESSAGE_ICON: 找到 1 个可见元素
❌ NEW_MESSAGE_BUTTON: 未找到元素
⚠️  SEARCH_INPUT: 找到 2 个元素，但都不可见
```

#### 6. 修复失效的选择器
如果发现选择器失效：
1. 使用 `findAllClickable()` 查看所有可点击元素
2. 使用 `highlightElement('selector')` 高亮显示元素
3. 在"Elements"标签中手动检查元素的属性
4. 更新 `/lib/instagram-dm.ts` 中的选择器
5. 重新构建扩展：`pnpm build && pnpm compile`

---

## 📝 第二步：准备CSV文件

### CSV格式
创建一个CSV文件（例如 `test-contacts.csv`）：

```csv
Profile Link,Name,Category
https://www.instagram.com/your_test_account/,Test User,Fashion
username2,Jane Doe,Tech
@username3,Bob Smith,Travel
```

### 支持的格式
- ✅ 完整URL: `https://www.instagram.com/username/`
- ✅ 带@前缀: `@username`
- ✅ 纯用户名: `username`

### 字段说明
| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| Profile Link | ✅ | Instagram个人主页链接或用户名 | `@john_doe` |
| Name | ❌ | 联系人姓名（用于消息模板） | `John Doe` |
| Category | ❌ | 分类（用于消息模板） | `Fashion` |
| CustomField | ❌ | 自定义字段（列名可任意） | `任何值` |

---

## ✉️ 第三步：创建消息模板

### 变量替换
支持以下变量：
- `{Name}` - 从CSV的Name字段
- `{Category}` - 从CSV的Category字段
- `{CustomField}` - 任何自定义字段

### Spintex随机化
使用 `{选项1|选项2|选项3}` 语法随机选择：
```
{Hi|Hello|Hey} {Name}! I {love|really enjoy|admire} your {Category} content.
```

可能生成：
- "Hi John! I love your Fashion content."
- "Hello Jane! I really enjoy your Tech content."
- "Hey Bob! I admire your Travel content."

### 创建模板步骤
1. 打开扩展popup
2. 点击左侧"Templates"
3. 点击"+ New Template"
4. 输入模板名称
5. 输入消息内容（使用变量和Spintex）
6. 查看"Preview"确认效果
7. 点击"Save"

---

## 🚀 第四步：开始自动化

### 步骤
1. 打开扩展popup
2. 在首页点击"Start New Queue"
3. 选择联系人列表
4. 选择消息模板
5. 点击"Start"

### 发生什么
1. Bot会在后台打开新标签页
2. 自动导航到Instagram私信
3. 逐个发送消息
4. 可以关闭popup，任务会继续

### 监控进度
- 在popup首页查看进度
- "Activity Logs"查看详细日志
- "Contact Lists"查看每个联系人的状态

---

## ⏸️ 控制任务

### 暂停
- 点击首页的"Pause"按钮
- 任务会在当前消息完成后暂停
- 可以稍后点击"Resume"恢复

### 停止
- 点击"Stop"按钮
- 任务立即终止
- 已发送的消息保持"sent"状态
- 未发送的消息保持"pending"状态

### 重置状态
- 在"Contact Lists"页面
- 选择列表
- 点击"Reset Status"
- 所有状态重置为"pending"

---

## ⚙️ 设置说明

### 速率限制
| 设置 | 默认值 | 说明 |
|------|--------|------|
| Daily Limit | 30 | 每天最多发送数量 |
| Min Delay | 60秒 | 消息间隔最小延迟 |
| Max Delay | 300秒 | 消息间隔最大延迟 |

### 打字模拟
| 设置 | 默认值 | 说明 |
|------|--------|------|
| Min Speed | 50ms | 每个字符最小打字时间 |
| Max Speed | 250ms | 每个字符最大打字时间 |

### 错误处理
| 设置 | 默认值 | 说明 |
|------|--------|------|
| Pause on Error | ✅ | 遇到错误是否暂停 |
| Auto Retry | ✅ | 失败是否自动重试 |
| Max Retries | 3 | 最大重试次数 |

---

## 🐛 故障排查

### 问题：扩展未加载
**解决方案**：
1. 确认已在 `chrome://extensions/` 启用
2. 检查是否有错误信息
3. 重新加载扩展

### 问题：找不到DM按钮
**解决方案**：
1. 刷新Instagram页面
2. 确认在个人主页（不是帖子页面）
3. 检查content script是否注入（F12 → Console → 查找"[DM Bot]"）

### 问题：任务卡住不发送
**解决方案**：
1. 检查"Activity Logs"查看错误
2. 确认Instagram选择器正确
3. 手动测试是否能找到元素（运行验证脚本）
4. 检查网络连接

### 问题：消息发送失败
**可能原因**：
- 私密账号，无法发送
- 未关注该账号
- 账号被限制
- 触发Instagram反垃圾机制

**解决方案**：
1. 查看"Activity Logs"的错误信息
2. 检查对方账号设置
3. 降低每日限额和发送频率
4. 停止任务，稍后再试

### 问题：选择器失效
**解决方案**：
1. 运行验证脚本 `scripts/test-selectors.js`
2. 使用 `findAllClickable()` 查看元素
3. 手动检查DOM结构
4. 更新 `/lib/instagram-dm.ts` 中的选择器
5. 重新构建：`pnpm build`

---

## 📊 查看日志

### 日志类型
- ℹ️ **info** - 一般信息
- ✅ **success** - 成功操作
- ⚠️ **warning** - 警告
- ❌ **error** - 错误

### 过滤日志
在"Activity Logs"页面：
- All - 显示所有日志
- Info - 只显示信息
- Success - 只显示成功
- Warning - 只显示警告
- Error - 只显示错误

---

## 🔒 隐私与安全

### 数据存储
- 所有数据存储在本地（Chrome Storage）
- 不上传到任何服务器
- 可以随时导出数据

### 权限说明
- `storage` - 存储联系人和设置
- `activeTab` - 访问当前标签页
- `tabs` - 打开新标签页执行任务
- `alarms` - 每日重置计数
- `notifications` - 发送完成通知

### 安全建议
- 不要分享CSV文件（包含用户信息）
- 定期导出备份重要数据
- 使用测试账号先验证
- 遵守Instagram服务条款

---

## 📈 最佳实践

### 消息模板
- ✅ 个性化（使用变量）
- ✅ 自然（使用Spintex）
- ✅ 简洁（不要长篇大论）
- ❌ 不要包含链接（可能被标记为垃圾）
- ❌ 不要重复相同内容

### 发送时间
- ✅ 工作日白天（对方时区）
- ✅ 避免深夜发送
- ✅ 分批发送，不要一次性全部

### 联系人质量
- ✅ 优先发送给活跃用户
- ✅ 检查账号是否真实
- ❌ 避免发送给明显机器人账号
- ❌ 不要发送给已发送过的用户

---

## 🆘 获取帮助

### 调试模式
1. 打开Chrome DevTools（F12）
2. 切换到"Console"标签
3. 查找 `[Instagram DM]` 开头的日志
4. 截图错误信息

### 日志示例
```
[Instagram DM] Opening DM for user: @john_doe
[Instagram DM] Clicking direct message icon
[Instagram DM] Clicking new message button
[Instagram DM] Searching for user: @john_doe
[Instagram DM] Found user in results: @john_doe
[Instagram DM] Sending message: Hi John! I love...
[Instagram DM] Typing message with human-like behavior
[Instagram DM] Looking for send button
[Instagram DM] Found send button by text
[Instagram DM] Message sent successfully
```

---

## 📜 许可与免责

此工具仅供学习和研究使用。使用本工具的风险由用户自行承担。

- ⚠️ 违反Instagram服务条款可能导致账号封禁
- ⚠️ 请遵守当地法律法规
- ⚠️ 请尊重其他用户的隐私
- ⚠️ 不得用于垃圾信息或骚扰

---

## 🔄 更新扩展

### 开发模式
```bash
# 修改代码后
pnpm compile  # 检查TypeScript错误
pnpm build    # 重新构建
```

### 重新加载
1. 访问 `chrome://extensions/`
2. 找到"DM Bot"扩展
3. 点击刷新按钮🔄
4. 刷新Instagram页面

---

## 📝 开发笔记

### 文件结构
```
dm-bot-ext/
├── lib/
│   ├── instagram-dm.ts       # IG DM 接口（核心）
│   ├── bot-engine.ts         # 任务编排
│   ├── storage.ts            # 存储操作
│   ├── storage-hooks.tsx     # React hooks
│   ├── csv-parser.ts         # CSV 解析
│   └── spintex.ts            # 消息解析
├── components/
│   └── popup/                # UI 组件
├── entrypoints/
│   ├── background.ts         # 后台脚本
│   ├── content.tsx           # 内容脚本
│   └── popup/                # Popup 页面
└── scripts/
    └── test-selectors.js     # 选择器验证脚本
```

### 关键函数
- `openNewDM(username)` - 打开私信
- `sendMessage(message, speed)` - 发送消息
- `checkForErrors()` - 检查错误状态
- `humanClick(element)` - 拟人化点击
- `humanType(element, text)` - 拟人化打字

---

**祝使用愉快！记住：质量 > 数量**
