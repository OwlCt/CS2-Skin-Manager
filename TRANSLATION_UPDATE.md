# 翻译数据更新指南

当CS2更新新物品（皮肤、探员、音乐盒等）时，按照以下步骤更新翻译数据。

## 🔄 快速更新流程

### 1. 更新翻译数据（中文和英文）

运行翻译更新脚本：

```bash
node scripts/fetch-translations.js
```

这个脚本会自动：
- 从 CSGO-API 获取最新的中文和英文翻译数据
- 下载所有皮肤、探员、音乐盒的翻译
- 保存到 `public/data/translations/` 目录

### 2. 更新游戏数据文件

更新本地游戏数据（根据需要）：

```bash
# 更新皮肤数据
node scripts/extract-weapon-mappings.js

# 更新探员数据
node scripts/extract-agents.js

# 更新音乐盒数据
node scripts/extract-music-kits.js
```

### 3. 测试更新

```bash
# 启动开发服务器
bun run dev

# 在浏览器中测试：
# 1. 切换到中文，检查新物品是否显示中文名称
# 2. 切换回英文，检查是否正常
# 3. 搜索新物品名称，确认搜索功能正常
```

### 4. 提交更改

```bash
git add public/data/translations/*.json
git add data/*.json  # 如果更新了游戏数据
git commit -m "chore: update translations for CS2 patch X.X.X"
```

## 📋 详细说明

### 翻译数据来源

所有翻译数据来自 [CSGO-API](https://github.com/ByMykel/CSGO-API)：

- **英文数据**: `https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/`
- **中文数据**: `https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/zh-CN/`

支持的数据类型：
- `skins.json` - 所有武器皮肤（含刀具、手套）
- `agents.json` - 所有探员角色
- `music_kits.json` - 所有音乐盒
- `base_weapons.json` - 基础武器名称

### 自动化更新脚本

**脚本位置**: `scripts/fetch-translations.js`

**功能**:
- 自动获取最新翻译数据
- 支持多语言（目前：英文、简体中文）
- 显示下载进度和统计信息
- 自动保存到正确的目录

**添加新语言**:

编辑 `scripts/fetch-translations.js`，在 `languages` 数组中添加新语言代码：

```javascript
const languages = ["en", "zh-CN", "zh-TW", "ja", "ko"]; // 示例：添加繁中、日语、韩语
```

然后更新 `src/contexts/LanguageContext.tsx` 添加语言选项。

### 翻译映射机制

**位置**: `src/lib/translation-mapping.ts`

**工作原理**:

1. **皮肤**: 通过 `paint_index` + `weapon_defindex` 精确匹配
2. **探员**: 通过英文名称桥接到 ID，再映射到目标语言
3. **音乐盒**: 通过 `id` 直接匹配

这些映射是自动的，无需手动配置。

## 🐛 常见问题

### Q: 新物品不显示中文名称？

**原因**: CSGO-API 可能还没有更新最新数据

**解决方案**:
1. 检查 [CSGO-API](https://github.com/ByMykel/CSGO-API) 是否已更新
2. 如果已更新，重新运行 `node scripts/fetch-translations.js`
3. 如果未更新，可以临时使用英文名称，等待API更新后再刷新

### Q: 探员翻译不显示？

**原因**: 探员名称在本地数据和API数据中可能有细微差异（如引号、空格）

**解决方案**:
1. 检查浏览器控制台是否有错误
2. 对比 `data/agents.json` 和 `public/data/translations/en.json` 中的名称
3. 如需要，更新 `src/lib/translation-mapping.ts` 中的名称标准化逻辑

### Q: 翻译数据文件太大？

**当前大小**: 约 6MB/语言（包含2000+皮肤）

**优化建议**:
- 考虑按需加载（lazy loading）
- 使用压缩版本（.json.gz）
- 缓存策略优化

## 📦 生产部署

部署时确保翻译文件被包含：

```bash
# 构建前确认翻译文件存在
ls -lh public/data/translations/

# 构建
bun run build

# 验证翻译文件被包含在构建输出中
ls -lh .next/static/ | grep translations
```

## 🔗 相关链接

- [CSGO-API GitHub](https://github.com/ByMykel/CSGO-API)
- [CSGO-API 文档](https://bymykel.github.io/CSGO-API/)
- [支持的语言列表](https://github.com/ByMykel/CSGO-API#available-languages)

## 📝 更新日志

记录每次翻译更新：

```bash
# 查看翻译文件的更新时间
ls -lh public/data/translations/

# 查看文件统计信息
wc -l public/data/translations/*.json
```

---

**提示**: 建议设置定期更新任务（如每周或每次CS2大更新后）来保持翻译数据最新。
