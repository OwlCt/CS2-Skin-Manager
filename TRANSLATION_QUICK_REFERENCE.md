# 翻译更新快速参考 / Translation Update Quick Reference

## 🚀 一键更新 / One-Command Update

```bash
bun run translations:update
```

这将自动：
- ✅ 下载最新的中英文翻译数据
- ✅ 保存到正确的目录
- ✅ 显示更新统计信息

---

## 📋 完整更新流程 / Full Update Process

### 1️⃣ 更新翻译 / Update Translations
```bash
bun run translations:update
```

### 2️⃣ 测试 / Test
```bash
bun run dev
# 浏览器打开: http://localhost:3000
# 点击语言切换按钮测试中英文显示
```

### 3️⃣ 提交 / Commit
```bash
git add public/data/translations/
git commit -m "chore: update translations"
```

---

## 📊 检查更新内容 / Check Updates

```bash
# 查看文件大小和更新时间
ls -lh public/data/translations/

# 统计物品数量
cat public/data/translations/en.json | grep -o '"id":' | wc -l

# 对比新旧文件
git diff public/data/translations/en.json | head -100
```

---

## 🔧 数据来源 / Data Source

**CSGO-API**: https://github.com/ByMykel/CSGO-API

支持的数据类型：
- 皮肤 Skins: 2000+ items
- 探员 Agents: 60+ characters
- 音乐盒 Music Kits: 170+ kits
- 基础武器 Base Weapons: 60+ weapons

---

## 🌐 支持的语言 / Supported Languages

目前支持 / Currently Supported:
- 🇺🇸 English (en)
- 🇨🇳 简体中文 (zh-CN)

可添加 / Can Add:
- 🇹🇼 繁體中文 (zh-TW)
- 🇯🇵 日本語 (ja)
- 🇰🇷 한국어 (ko)
- 🇷🇺 Русский (ru)
- 🇫🇷 Français (fr)
- 🇩🇪 Deutsch (de)
- 🇪🇸 Español (es)
- 🇵🇹 Português (pt-BR)

---

## ⚡ 故障排除 / Troubleshooting

### 问题：新物品没有中文名 / New items show English names

**解决方案 / Solution:**
```bash
# 1. 重新下载翻译
bun run translations:update

# 2. 清除浏览器缓存
# Chrome: Ctrl+Shift+R
# Firefox: Ctrl+F5

# 3. 重启开发服务器
bun run dev
```

### 问题：翻译文件太大 / Translation files too large

当前大小：~6MB/语言
- 浏览器会自动缓存
- 首次加载后速度很快
- 考虑使用 CDN 托管

### 问题：某些探员名称不匹配 / Some agent names don't match

检查映射逻辑：
```bash
# 查看映射代码
cat src/lib/translation-mapping.ts

# 检查本地和API数据差异
diff <(cat data/agents.json | jq -r '.[].agent_name' | sort) \
     <(cat public/data/translations/en.json | jq -r '.agents[].name' | sort)
```

---

## 📞 需要帮助？ / Need Help?

详细文档: [TRANSLATION_UPDATE.md](./TRANSLATION_UPDATE.md)

CSGO-API GitHub: https://github.com/ByMykel/CSGO-API
