# 🐱 小猫咪喂食互动游戏

一个纯前端 H5 小游戏，让玩家选择物品喂养可爱的小猫咪。使用 HTML5、CSS3、JavaScript、GSAP 动画库和 Howler.js 音频管理。

## 功能特性

✨ **交互式喂食系统**
- 三种可选物品：纸巾 🧻、萝卜 🥕、冻干 ✨
- 点击物品时播放对应的语音提示
- 物品飞向小猫，触发吃食动画

🎨 **精美动画**
- 物品飞行动画（抛物线轨迹）
- 猫的吃食反应（缩放 + 抖动）
- 粒子效果和浮动文字反馈
- 响应式 CSS 动画

🔊 **音频系统**
- 每个物品有独特的选择音
- 吃食音效和成功反馈音
- 静音功能（保存到本地存储）
- 移动端音频自动解锁（手势触发）

📱 **移动友好**
- 完全响应式设计
- 优化的触摸交互（Pointer Events）
- 支持 iOS 和 Android 浏览器
- 安全区域适配（刘海屏等）

## 项目结构

```
cat/
├── index.html              # 主 HTML 文件
├── style.css               # 样式表（响应式 + 动画）
├── app.js                  # 主应用逻辑（事件、动画、音频管理）
├── generate-audio.js       # 音频生成脚本（Node.js）
├── audio-generator.html    # 浏览器音频生成工具（可选）
├── README.md              # 本文档
└── assets/
    ├── images/            # 图片资源目录（可选）
    └── sounds/            # 音频文件
        ├── tissue.wav     # 纸巾选择音
        ├── carrot.wav     # 萝卜选择音
        ├── treat.wav      # 冻干选择音
        ├── eat.wav        # 吃食音效
        └── success.wav    # 成功反馈音
```

## 快速开始

### 本地运行

**方法 1：使用 Python 内置服务器（推荐）**

```bash
cd cat
python -m http.server 8000
```

然后在浏览器中访问：`http://localhost:8000`

**方法 2：使用 Node.js HTTP 服务器**

```bash
npm install http-server -g
cd cat
http-server
```

**方法 3：使用 PHP**

```bash
cd cat
php -S localhost:8000
```

**方法 4：直接打开文件**

由于安全限制，某些浏览器不允许直接从文件系统加载音频。建议使用上述服务器方式。

### 游戏流程

1. **开始游戏**：点击"开始游戏"按钮进入游戏界面
2. **选择物品**：点击底部的三个物品（纸巾、萝卜、冻干）
3. **观看动画**：物品会飞向小猫，猫咪会做出反应
4. **收集反馈**：
   - 纸巾/萝卜：展示"😋"表情和心形反馈
   - 冻干：展示"😻"表情、粒子效果和成功音效
5. **重复游戏**：恢复交互后可继续喂食

## 技术栈

### 核心库

- **GSAP 3.12.2**：高性能 JavaScript 动画库
  - 用于物品飞行动画的补间控制
  - 精确的时间轴管理和缓动函数
  
- **Howler.js 2.2.4**：跨浏览器音频管理库
  - 处理 Web Audio API 和 HTMLAudio 的差异
  - 自动格式回退和音频上下文管理
  - 移动端友好的播放控制

### 原生技术

- **HTML5**：语义化结构，支持 Pointer Events
- **CSS3**：Flexbox 布局、Grid、transform 动画、媒体查询
- **JavaScript (ES6+)**：Promise、async/await、箭头函数

## 配置说明

### 修改动画速度

编辑 `app.js` 中的 CONFIG 对象：

```javascript
const CONFIG = {
    ANIMATION_DURATION: 0.8,      // 猫的吃食动画时长（秒）
    ITEMS_FLYING_DURATION: 0.8    // 物品飞行时长（秒）
};
```

### 修改音频文件

如要使用自定义音频：

1. 将音频文件放在 `assets/sounds/` 目录
2. 更新 `app.js` 中的 CONFIG.SOUNDS 路径
3. 支持格式：WAV, MP3, OGG, M4A（Howler.js 会自动选择浏览器支持的格式）

### 更改UI外观

编辑 `style.css` 中的颜色和尺寸变量：

```css
/* 背景渐变 */
.game-container {
    background: linear-gradient(180deg, #87ceeb 0%, #e0f6ff 100%);
}

/* 物品尺寸 */
.item-sprite {
    width: 80px;
    height: 80px;
    font-size: 60px;
}
```

## 音频生成

项目包含自动音频生成脚本。若要重新生成音频文件：

```bash
node generate-audio.js
```

脚本会在 `assets/sounds/` 目录下生成 WAV 格式的音效。

### 自定义音频生成

编辑 `generate-audio.js` 中的音频配置：

```javascript
const sounds = [
    { name: 'tissue.wav', freq: 440, duration: 0.5, volume: 0.3 },
    // ... 其他配置
];
```

- `freq`：频率（Hz），440 = A4 音符
- `duration`：时长（秒）
- `volume`：音量（0-1）

## 浏览器兼容性

| 浏览器 | 支持 | 备注 |
|--------|------|------|
| Chrome / Edge | ✅ | 完全支持，包括 Pointer Events |
| Firefox | ✅ | 完全支持 |
| Safari | ✅ | iOS 13+ 支持，需手势解锁音频 |
| Android Chrome | ✅ | 完全支持 |
| WeChat (微信) | ✅ | 支持，某些功能可能受限 |

### 移动端提示

- **iOS Safari**：第一次使用需点击"开始游戏"来解锁音频播放
- **Android**：某些浏览器在省电模式下可能无法播放音频
- **微信内置浏览器**：建议在"在浏览器中打开"后使用

## 常见问题

### Q: 为什么没有声音？
A: 
1. 检查浏览器静音开关（iOS 侧面开关）
2. 点击"开始游戏"确保音频已解锁
3. 检查游戏内的静音按钮（🔊 图标）是否打开
4. 检查浏览器控制台（F12）是否有错误信息

### Q: 游戏加载很慢？
A: 
1. 检查网络连接
2. 清除浏览器缓存
3. 检查 GSAP 和 Howler.js 的 CDN 是否可访问
4. 可下载 CDN 文件到本地使用

### Q: 能否离线使用？
A: 是的，可以下载整个项目在本地运行。但需要使用本地 HTTP 服务器（不支持 `file://` 协议）。

### Q: 如何自定义物品？
A: 
1. 编辑 `index.html` 的 items-container 部分
2. 修改 emoji 代码（或使用图片）
3. 更新 `app.js` 中的音频配置

## 性能优化

项目已包含以下优化措施：

- ✅ 使用 GPU 加速的 CSS transform 动画
- ✅ 使用 `requestAnimationFrame` 控制帧率
- ✅ 音频文件预加载和缓存
- ✅ 文件压缩和资源合并
- ✅ 响应式图片和 Retina 屏幕适配

## 构建和部署

### 打包为静态网站

整个项目已是纯前端，可直接部署到任何静态文件服务器：

```bash
# 上传整个 cat 目录即可
scp -r cat/ user@server:/var/www/html/
```

### 部署到常见平台

- **GitHub Pages**：上传到 `gh-pages` 分支
- **Netlify**：连接 Git 仓库，自动部署
- **Vercel**：同上，超快速度
- **阿里云 OSS**：上传到 OSS bucket

### 优化部署

可选地压缩和合并资源：

```bash
# 最小化 CSS
cleancss -o style.min.css style.css

# 最小化 JavaScript
terser app.js -o app.min.js
```

然后在 `index.html` 中引用 `.min` 版本。

## 许可证

本项目使用 MIT 许可证。

第三方库许可：
- GSAP：GSAP 标准许可（大多数用途免费）
- Howler.js：MIT 许可

## 开发者资源

### 修改猫的表情

`app.js` 中的 CSS class 控制猫的表情：

```javascript
cat.classList.add('eating');    // 😸 吃食表情
cat.classList.add('happy');     // 😻 开心表情
```

可在 `style.css` 中的 `.cat::before` 添加更多表情。

### 添加更多物品

1. 在 `index.html` 的 `.items-container` 中添加新物品 div
2. 设置 `data-type` 属性（用于识别）
3. 在 `app.js` 的 CONFIG.SOUNDS 中添加对应音频
4. 重新生成或添加音频文件到 `assets/sounds/`

示例：

```html
<div class="item" data-type="fish" data-label="鱼">
    <div class="item-sprite">🐟</div>
    <p class="item-label">鱼</p>
</div>
```

```javascript
SOUNDS: {
    fish: 'assets/sounds/fish.wav',
    // ...
}
```

## 支持和贡献

如有问题或建议，欢迎提交 Issue 或 Pull Request。

---

**最后更新**：2025 年 12 月 28 日

**版本**：1.0.0

祝你玩得开心！🎮😸
