# Instagram 封号规则与安全指南 2025

> 为 Instagram 私信插件开发者提供的详细风控规则与最佳实践

最后更新：2025年1月

---

## 目录

- [一、API 与私信（DM）硬性限制](#一api-与私信dm硬性限制)
- [二、行为操作安全线](#二行为操作安全线)
- [三、Instagram 检测技术](#三instagram-检测技术)
- [四、直接导致封号的高危操作](#四直接导致封号的高危操作)
- [五、2025 年封号新趋势](#五2025-年封号新趋势)
- [六、开发者安全实践建议](#六开发者安全实践建议)
- [七、账号风控策略](#七账号风控策略)
- [八、参考资料](#八参考资料)

---

## 一、API 与私信（DM）硬性限制

### 1.1 官方 Graph API 限制（2025年最新）

| 限制类型 | 数值 | 说明 | 生效时间 |
|---------|------|------|---------|
| **DM 发送速率** | **200 条/小时** | 从 5,000 降至 200（减少 96%） | 2025年1月 |
| **内容发布** | **100 篇/24小时** | 轮播算作 1 篇 | 持续有效 |
| **消息窗口** | **24 小时** | 只能给 24 小时内互动过的用户发消息 | 长期规则 |
| **日发送上限** | **50-200 条/天** | 因账号类型和信誉而异 | 动态调整 |
| **Send API** | **100 次/秒** | 针对专业账号的消息 API | 持续有效 |

### 1.2 重要政策变化时间线

```
2025年5月20日  → Instagram Marketing API 重大弃用更新
2025年12月1日   → REST API 限制大幅收紧
2026年1月       → 200 DMs/小时 限制强制执行
```

### 1.3 24 小时消息窗口规则

**允许的触发条件：**
- ✅ 用户评论了你的帖子
- ✅ 用户回复了你的 Story
- ✅ 用户主动给你发送了 DM
- ✅ 用户提到了你的账号
- ✅ 用户点击了你的广告中的 CTA 按钮

**禁止的行为：**
- ❌ 给未互动的用户批量发消息（Cold DM）
- ❌ 使用非官方 API 绕过消息窗口限制
- ❌ 购买第三方"群发工具"

---

## 二、行为操作安全线

### 2.1 新号（注册 2 周内）养号策略

#### 前 72 小时（关键期）
```
总操作上限：20 个/天
├─ 浏览行为：80%（16 个操作）
├─ 点赞：5-10 个
├─ 评论：0 个
├─ 关注：0 个
└─ 私信：0 个
```

#### 第 4-14 天
```
逐步增加到 50 个操作/天
├─ 第 4-7 天：20-30 个操作
├─ 第 8-14 天：30-50 个操作
└─ 每天递增，避免突然跳跃
```

#### 新号首日建议
- 点赞 5-10 个帖子
- **不要**评论或发消息
- 添加 2-3 个原创图片
- 完善个人资料（分批完成）
- 之后让账户休息 24 小时

### 2.2 老号安全操作线

| 操作类型 | 保守安全值 | 风险边界 | 绝对上限 |
|---------|-----------|---------|---------|
| **关注** | 100-150/天 | 200-300/天 | 60/小时 |
| **取关** | 100-150/天 | 190/天 | 60/小时 |
| **点赞** | 300-400/天 | 700-1,000/天 | - |
| **评论** | ~5/天 | ~10/天 | - |
| **私信** | ~50-100/天 | ~200/天 | 200/小时 |

### 2.3 每小时限制

#### 关注/取关操作
- **绝对上限**：60 次/小时
- **推荐节奏**：约 10 次/小时
- **新号限制**：30 次/小时

#### 总行动限制
- **新号**：500 个操作/天
- **老号**：建议不超过 500 个操作/天
- **操作定义**：关注、取关、点赞、评论、浏览等

### 2.4 时间分配策略

```
❌ 错误示例：集中在 1 小时内完成所有操作

✅ 正确示例：分散在全天
├─ 上午：30% 的操作
├─ 下午：40% 的操作
├─ 晚上：30% 的操作
└─ 每次操作间隔：随机 3-10 分钟
```

---

## 三、Instagram 检测技术

### 3.1 浏览器指纹识别（50+ 参数）

Instagram 通过以下维度识别设备和浏览器：

```
核心指纹技术
├─ Canvas 指纹
│   ├─ 显卡型号
│   ├─ 驱动版本
│   ├─ 字体列表
│   └─ 渲染特征
│
├─ WebGL 指纹
│   ├─ 图形渲染能力
│   ├─ 着色器信息
│   └─ 硬件加速特征
│
├─ Audio 指纹
│   ├─ AudioContext 处理
│   ├─ 音频编解码器
│   └─ 音频处理延迟
│
├─ 硬件信息
│   ├─ CPU 核心数
│   ├─ 内存大小
│   ├─ 屏幕分辨率
│   └─ 时区设置
│
└─ 浏览器特征
    ├─ 浏览器版本
    ├─ 插件列表
    ├─ User-Agent
    └─ CSS 渲染特征
```

### 3.2 行为模式分析

#### 操作速度检测
```
人类行为模式：
├─ 随机延迟：3-15 秒
├─ 不规律节奏：有时快，有时慢
└─ 自然停顿：浏览、思考、回退

机器行为模式（会被检测）：
├─ 固定间隔：每 5 秒一次
├─ 持续操作：24 小时不间断
└─ 完美节奏：无任何随机性
```

#### 活动分布检测
```
正常行为：
├─ 操作集中在活跃时段
├─ 有休息期
├─ 周末与工作日差异
└─ 时区与账号信息一致

异常行为（会被标记）：
├─ 凌晨 3 点大量操作
├─ 24 小时持续活动
├─ 每天完全相同的操作数量
└─ 多账号完全同步操作
```

#### 互动质量分析
```
高质量互动：
├─ 阅读完整内容
├─ 个性化评论
├─ 相关话题参与
└─ 有回访和二次互动

低质量互动（会被降权）：
├─ 只点不看
├─ 复制粘贴评论
├─ 无关话题评论
└─ 从不回访
```

### 3.3 API 使用模式检测

Instagram 可以识别：
- ❌ 非官方 API 调用特征
- ❌ 请求频率异常（如整点请求）
- ❌ 缺乏真实用户行为的 API 序列
- ❌ User-Agent 与实际浏览器不匹配
- ❌ 请求头缺失或不完整

### 3.4 设备关联检测

```
关联风险因素：
├─ IP 地址
│   ├─ 同 IP 多账号
│   ├─ 数据中心 IP
│   └─ VPN/代理特征
│
├─ 浏览器指纹
│   ├─ 完全相同的指纹
│   ├─ 指纹特征异常
│   └─ 指纹被篡改痕迹
│
├─ 设备信息
│   ├─ 相同设备 ID
│   ├─ 硬件信息一致
│   └─ 传感器数据相同
│
└─ 行为模式
    ├─ 多账号同步操作
    ├─ 相似的时间模式
    └─ 相同的内容策略
```

---

## 四、直接导致封号的高危操作

### 4.1 自动化行为（严重违规）

#### 被严格禁止的工具
- ❌ 自动点赞机器人
- ❌ 自动评论工具
- ❌ 批量关注/取关注软件
- ❌ 自动 DM 群发工具（非官方 API）
- ❌ 浏览器插件自动化
- ❌ 账号群控系统

#### 后果
```
第一次发现 → 警告 + 临时限制
第二次发现 → 账号停用 7-30 天
第三次发现 → 永久封禁
```

### 4.2 互动异常（高风险）

#### 具体行为
```
❌ 短时间（1小时内）点赞 100+
❌ 每天取关超过 200
❌ 批量关注同一领域账号
❌ 重复相同评论（复制粘贴）
❌ 给未互动用户发私信
❌ 同时操作多个账号
```

### 4.3 内容违规（中等风险）

#### 禁止内容类型
- 侵权内容（图片、视频、音乐）
- 虚假信息
- 仇恨言论
- 骚扰霸凌
- 露骨内容
- 违规物品销售
- 被禁的话题标签

#### 后果
```
轻度违规 → 内容删除 + 警告
中度违规 → 账号受限（阴影禁令 Shadowban）
重度违规 → 账号永久封禁
```

### 4.4 账号关联风险（高风险）

#### 触发条件
```
一机多号
├─ 同一设备登录 3+ 账号
├─ 快速切换账号
└─ 同一浏览器多账号

一号多登
├─ 账号在多地登录
├─ 短时间内更换设备
└─ 使用代理/VPN
```

#### 关联判定
```
轻度关联 → 限制功能（无法发帖、关注）
中度关联 → 账号暂时停用
重度关联 → 所有关联账号永久封禁
```

---

## 五、2025 年封号新趋势

### 5.1 AI 审核系统升级

#### 2025 年春季大规模误封事件
- Instagram 部署了新的 AI 审核系统
- 导致大量正常用户账号被封
- 账号"一夜之间消失"现象激增
- 创作者、小企业主受影响严重

#### AI 系统特征
```
检测方式
├─ 机器学习模型分析行为模式
├─ 异常检测算法
├─ 人工审核辅助
└─ 误判申诉机制（但效率低）

误判原因
├─ AI 对正常活动误判为自动化
├─ 特定行业账号被针对性审查
└─ 缺乏人工复核
```

### 5.2 封号类型详解

#### 临时限制
```
特征：
├─ 无法点赞、评论、关注
├─ 无法发送 DM
├─ 提示"尝试过于频繁"
└─ 持续时间：几小时到 7 天

解决：
├─ 停止操作 24-48 小时
├─ 验证手机号
└─ 正常使用慢慢恢复
```

#### 账号停用
```
特征：
├─ 无法登录
├─ 提示"账号违反政策"
├─ 可申诉
└─ 持续时间：7-30 天

解决：
├─ 提交申诉表单
├─ 等待人工审核（7-14 天）
└─ 提供身份证明
```

#### 永久封禁
```
特征：
├─ 无法登录
├─ 提示"账号已被停用"
├─ 通常无法申诉
└─ 所有数据永久丢失

原因：
├─ 严重违规（多次）
├─ 使用自动化工具
├─ 账号欺诈
└─ 严重内容违规
```

### 5.3 2025 年封号数据

```
日均封号统计
├─ 总数：200 万+ 账号/天
├─ 操作异常：68%
├─ 内容违规：22%
└─ 账号关联：10%

趋势
├─ 封号率逐年上升
├─ 误判案例增加
├─ 申诉通过率下降
└─ AI 审核更严格
```

---

## 六、开发者安全实践建议

### 6.1 技术实现层面

#### ✅ 必须遵守的原则

```javascript
// 1. 使用官方 API
const instagramAPI = new InstagramMessagingAPI({
  accessToken: '官方_access_token',
  apiVersion: 'v20.0' // 使用最新版本
});

// 2. 遵守速率限制
const rateLimiter = {
  dmPerHour: 200,      // 硬性限制
  dmPerDay: 50,        // 安全线
  messagesWindow: 24   // 小时窗口
};

// 3. 添加随机延迟
const humanLikeDelay = () => {
  return Math.random() * (10000 - 3000) + 3000; // 3-10 秒
};

// 4. 24 小时窗口检查
async function canSendMessage(userId, lastInteraction) {
  const hoursSinceInteraction = (Date.now() - lastInteraction) / (1000 * 60 * 60);
  return hoursSinceInteraction <= 24;
}
```

#### ❌ 严禁的操作

```javascript
// ❌ 使用非官方 API
// ❌ 绕过消息窗口
// ❌ 浏览器自动化（Puppeteer、Selenium）
// ❌ 固定延迟（如每次恰好 5 秒）
// ❌ 批量群发（无互动）
```

### 6.2 业务逻辑层面

#### 用户触发优先

```javascript
// ✅ 合法：用户主动触发
userCommentsOnPost() → sendAutoDM()
userRepliesToStory() → sendAutoDM()
userSendsDM() → replyWithAutoMessage()
userClicksCTA() → sendWelcomeMessage()

// ❌ 非法：群发
sendMessageToAllFollowers()  // 违规
bulkSendToNonEngaged()        // 违规
coldDMNewUsers()              // 违规
```

#### 内容个性化

```javascript
// ✅ 推荐：个性化消息
const personalizeMessage = (userData) => {
  return `Hi ${userData.name}! 👋

感谢你对 ${userData.postTopic} 的评论！
我看到你对 ${specificTopic} 感兴趣...

个性化内容...`;

  // 避免模板化、批量相同内容
};

// ❌ 避免：完全相同的消息
const genericMessage = "Hello! Check out my profile!";
```

#### 退订机制

```javascript
// 必须提供退订选项
const addOptOut = (message) => {
  return `
    ${message}

    ---
    回复 "STOP" 退订接收此类消息
  `;
};

// 必须处理退订请求
if (userMessage.toUpperCase() === 'STOP') {
  unsubscribeUser(userId);
}
```

### 6.3 监控与日志

#### 关键指标监控

```javascript
const monitoring = {
  // API 使用率
  apiUsageRate: currentUsage / limit * 100,

  // 24 小时窗口内的用户
  usersInWindow: engagedUsers.length,

  // 消息失败率
  messageFailRate: failedMessages / totalMessages * 100,

  // 账号健康状态
  accountHealth: {
    warnings: count,
    restrictions: activeRestrictions,
    lastActionTime: timestamp
  }
};

// 超过阈值立即停止
if (monitoring.apiUsageRate > 90) {
  pauseSending();
  alert('接近 API 限制！');
}
```

#### 审计日志

```javascript
const auditLog = {
  timestamp: Date.now(),
  userId: userId,
  action: 'send_dm',
  triggerType: 'user_comment',
  triggerTime: userInteractionTime,
  messageContent: message,
  windowValid: checkWindow(userId),
  apiResponse: response
};

// 保存 90 天以上（用于申诉证明）
saveToAuditLog(auditLog);
```

---

## 七、账号风控策略

### 7.1 新号养号完整流程

#### 第 1-3 天：建立信任
```
Day 1：
├─ 注册账号
├─ 完善资料（分批，每次 1-2 项）
├─ 上传 2-3 张原创图片
├─ 浏览内容 30 分钟（只看，不互动）
├─ 点赞 5-10 个相关帖子
└─ 休息 24 小时

Day 2：
├─ 浏览内容 20 分钟
├─ 点赞 10-15 个帖子
├─ 关注 5-10 个相关账号
└─ 浏览 Stories

Day 3：
├─ 浏览内容 20 分钟
├─ 点赞 15-20 个帖子
├─ 评论 2-3 个（高质量）
├─ 发布 1 条原创内容
└─ 关注 5-10 个账号
```

#### 第 4-7 天：缓慢增长
```
每日操作：
├─ 点赞：20-30 个
├─ 评论：3-5 个
├─ 关注：10-15 个
├─ 发布内容：每 2 天 1 条
└─ 回复评论和 DM

注意事项：
├─ 每天增加不超过 20%
├─ 保持真实互动（阅读、观看）
├─ 避免固定时间操作
└─ 时区与账号资料一致
```

#### 第 8-14 天：稳定发展
```
每日操作：
├─ 点赞：30-50 个
├─ 评论：5-10 个
├─ 关注：15-20 个
├─ 发布内容：每天 1 条
├─ 回复所有评论和 DM
└─ 互动时间：分散在全天

两周后：
├─ 评估账号健康度
├─ 如果无警告，可缓慢增加
├─ 每周增加不超过 30%
└─ 时刻关注系统通知
```

### 7.2 老号维护策略

#### 日常操作节奏

```
理想模式：
├─ 早晨（9-11 点）：30% 操作
├─ 下午（2-4 点）：40% 操作
├─ 晚上（7-9 点）：30% 操作
└─ 深夜：避免操作

操作分配：
├─ 浏览：40%
├─ 点赞：30%
├─ 评论：15%
├─ 关注/取关：10%
└─ 私信：5%
```

#### 避免模式

```
❌ 错误模式：
├─ 每天固定时间操作
├─ 每次操作数量相同
├─ 周末也工作
├─ 无休息日
└─ 只发不互动

✅ 正确模式：
├─ 时间随机
├─ 数量浮动（±20%）
├─ 周末减少操作
├─ 每周 1 天休息
└─ 高互动率
```

### 7.3 多账号管理（高风险）

#### ⚠️ 重要警告
```
Instagram 明确禁止：
├─ 使用工具同时管理多个账号
├─ 账号互推互粉
├─ 批量操作
└─ 账号关联

后果：
├─ 所有账号被标记
├─ 限制功能
├─ 永久封禁
└─ 无法申诉
```

#### 如果必须管理多账号

```
隔离策略：
├─ 不同设备（物理隔离）
├─ 不同 IP（独立网络）
├─ 不同浏览器（不同指纹）
├─ 不同时间（错开操作）
└─ 完全独立的行为模式

工具选择：
├─ 避免使用群控工具
├─ 避免使用 antidetect 浏览器
├─ 手动切换（有风险）
└─ 推荐：放弃多账号策略
```

### 7.4 检测账号健康

#### 健康指标

```javascript
const accountHealth = {
  // 互动率
  engagementRate: {
    likes: receivedLikes / givenLikes,
    comments: receivedComments / givenComments,
    follows: receivedFollows / givenFollows
  },

  // 警告记录
  warnings: {
    actionBlocked: count,
    feedbackRequired: count,
    suspiciousActivity: count
  },

  // 限制状态
  restrictions: {
    canLike: boolean,
    canComment: boolean,
    canFollow: boolean,
    canDM: boolean
  },

  // 增长趋势
  growth: {
    followersRate: weeklyGrowth / currentFollowers,
    engagementRateChange: current - previous
  }
};

// 健康评分
const healthScore = calculateScore(accountHealth);
if (healthScore < 60) {
  alert('账号健康度低，建议停止自动化！');
}
```

#### 预警信号

```
🔴 立即停止：
├─ 收到"自动化行为"警告
├─ 多次"Action Blocked"
├─ 互动率突然下降 50%+
├─ 无法执行特定操作
└─ 收到账号限制通知

🟡 暂停自动化：
├─ 互动率持续下降
├─ 粉丝增长停滞
├─ 曝光量减少
└─ 出现限制迹象

🟢 可以继续：
├─ 无警告记录
├─ 互动率稳定
├─ 粉丝自然增长
└─ 账号功能正常
```

---

## 八、参考资料

### 官方文档
- [Instagram Messaging Platform - Meta for Developers](https://developers.facebook.com/docs/messenger-platform/instagram/)
- [Instagram Platform Overview](https://developers.facebook.com/docs/instagram-platform/overview/)
- [Instagram Content Publishing Guidelines](https://developers.facebook.com/docs/instagram-platform/content-publishing/)
- [Why there are limits for sending messages](https://help.instagram.com/436248864916865/)

### API 限制
- [Instagram API Rate Limits: 200 DMs/Hour Explained](https://creatorflow.so/blog/instagram-api-rate-limits-explained/)
- [Instagram API Limitations & Setup Tips](https://www.interakt.shop/instagram-automation/api-limitations-setup-tips/)
- [Instagram Graph API Complete Developer Guide for 2025](https://elfsight.com/blog/instagram-graph-api-complete-developer-guide-for-2025/)

### DM 自动化
- [Avoid Instagram Bans: DM Automation Safety Guide](https://creatorflow.so/blog/avoid-instagram-bans-dm-automation/)
- [Is Instagram Auto DM Safe in 2025?](https://www.replyrush.com/post/2025-guide-using-instagram-auto-dm-without-getting-banned)
- [Instagram DM Automation 2026 Guide](https://www.inro.social/blog/instagram-dm-automation-2025)
- [How to Comply with Instagram DM Rules in 2026](https://chatimize.com/instagram-dm-rules/)

### 行为限制
- [Instagram Limits in 2025](https://metricool.com/instagram-limits/)
- [Know Your Instagram Limits (And Stay Safe!)](https://www.instagram.com/p/DSFroisgRJC/)
- [What are the Instagram actions limits per hour and day?](https://www.boostfluence.com/blog/limit-subscription-instagram)
- [Instagram Action Block in 2025: Complete Recovery Guide](https://litport.net/blog/instagram-action-block-complete-recovery-guide-and-prevention-tips-28542)

### 检测技术
- [Instagram Fingerprint Detection & Avoidance Guide 2025](https://multiaccounts.com/blog/instagram-fingerprint-detection-avoidance-guide-2025)
- [Browser Fingerprint Detection: Complete 2025 Guide](https://coronium.io/blog/browser-fingerprint-detection-guide)
- [Browser Fingerprint Detection in 2025: Advanced Guide for Developers](https://litport.net/blog/browser-fingerprint-detection-advanced-guide-for-developers-18406)
- [Instagram设备指纹冲突：2025最新解决方案](https://news.like.tg/news/instagram-device-fingerprint-conflict-two-thousand-twenty-five-latest-solution)
- [Everything About Canvas Fingerprinting](https://multilogin.com/blog/everything-you-need-to-know-about-canvas-fingerprinting/)

### 封号与风控
- [Instagram's 2025 Ban Wave Report](https://medium.com/@ceo_46231/instagrams-2025-cse-ban-wave-the-full-story-from-all-angles-8a44419dd7c9)
- [Instagram Account Banned: How to Appeal and Prevent](https://www.adspower.net/blog/instagram-account-banned-how-to-appeal-and-prevent)
- [Instagram Ban Prevention: Best Long-Term Solution](https://multilogin.com/academy/instagram-ban-prevention-the-best-long-term-solution/)
- [How to Protect Your Instagram Account from Bans in 2025](https://www.zeeholler.com/blog/instagram-security-prevent-bans-2025)
- [2025年防封号关键技巧](https://www.instagram.com/p/DOoavctEzN4/)
- [别让你的IG号白养！5大高危操作](https://blog.maskfog.com/%E5%88%AB%E8%AE%A9%E4%BD%A0%E7%9A%84-ig-%E5%8F%B7%E7%99%BD%E5%85%BB%EF%BC%815-%E5%A4%A7%E9%AB%98%E5%8D%B1%E6%93%8D%E4%BD%9C%E6%AD%A3%E5%9C%A8%E8%A7%A6%E5%8F%91%E9%99%90%E6%B5%81%E4%B8%8E%E5%B0%81/)

### 自动化与安全
- [Instagram Automated Behaviour: Safe Automation Guide (2025)](https://www.spurnow.com/en/blogs/instagram-automated-behaviour)
- [Instagram Automation: Complete Guide to Safe Automation](https://socialrails.com/blog/instagram-automation-complete-guide)
- [The 2025 Guide to Safe Instagram Automation Tools](https://www.bot.space/blog/the-2025-guide-to-the-best-instagram-automation-tools-safe-smart-strategic)
- [The Dangers of Unofficial Instagram DM APIs](https://www.bot.space/blog/the-dangers-of-unofficial-instagram-dm-apis-why-theyll-get-you-banned)
- [How to Fix Automated Behavior on Instagram](https://proxidize.com/blog/automated-behavior-instagram/)

### 学术研究
- [Browser Fingerprint Detection and Anti-Tracking (arXiv 2025)](https://arxiv.org/pdf/2502.14326)
- [How Unique is Whose Web Browser? (PETS 2025)](https://petsymposium.org/popets/2025/popets-2025-0038.pdf)
- [Digital Fingerprint: CSS Opens New Possibilities](https://cispa.de/en/digital-fingerprints)

---

## 附录

### A. 快速检查清单

开发前检查：
- [ ] 已阅读 Instagram Platform 政策
- [ ] 了解最新的 API 限制
- [ ] 确认使用官方 API
- [ ] 设计了速率限制机制
- [ ] 实现了 24 小时窗口检查
- [ ] 添加了随机延迟
- [ ] 准备了监控和日志系统

运行时检查：
- [ ] API 使用率 < 90%
- [ ] 消息窗口有效
- [ ] 操作速率符合限制
- [ ] 内容已个性化
- [ ] 提供了退订选项
- [ ] 监控账号健康度
- [ ] 记录了审计日志

### B. 常见错误代码

| 错误代码 | 含义 | 解决方案 |
|---------|------|---------|
| `429` | Rate limit exceeded | 立即停止，等待 1 小时 |
| `Feedback Required` | 被检测为自动化 | 验证账号，暂停 24-48 小时 |
| `Action Blocked` | 操作过于频繁 | 减少操作频率，等待 24 小时 |
| `Account Suspended` | 账号被停用 | 提交申诉，等待审核 |

### C. 申诉流程

```
账号被封 → 提交申诉 → 等待审核 → 结果

1. 访问帮助中心
2. 选择"账号被停用"
3. 填写申诉表单
4. 提供身份证明（如需要）
5. 等待 7-14 天
6. 检查邮箱通知

提高成功率：
├─ 准备使用证明（截图、日志）
├─ 解释是合法使用
├─ 承诺遵守政策
└─ 提供真实信息
```

---

## 最后的警告

> ⚠️ **重要声明**：Instagram 的风控规则会不断更新，本文档仅反映 2025 年 1 月的信息。开发任何自动化工具前，请务必：
>
> 1. 查阅最新的官方文档
> 2. 遵守 Instagram Platform 政策
> 3. 使用官方 API
> 4. 保守设置速率限制
> 5. 持续监控政策变化
>
> **使用自动化工具的风险由使用者自行承担。**

---

**文档版本**：v1.0
**更新日期**：2025-01-17
**维护者**：DM Bot Extension Team
