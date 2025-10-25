# VTodo 快速開始指南

## 🎯 專案已完成!

VTodo 是一個基於 Markdown 的 Todo 管理工具,提供視覺化的看板介面。

## 📦 專案結構

```
vtodo/
├── bin/cli.js          # CLI 入口程式
├── src/                # React 原始碼
├── dist/               # 建置產出 (已完成)
├── example-data/       # 範例資料
└── package.json        # 專案設定
```

## 🚀 本地測試

### 1. 開發模式

```bash
pnpm dev
```

訪問 `http://localhost:5173`

### 2. 測試 CLI

```bash
# 確保已建置
pnpm build

# 啟動 CLI
pnpm start
# 或
node bin/cli.js
```

訪問 `http://localhost:3456`

### 3. 使用範例資料測試

啟動後:
1. 選擇 `example-data` 資料夾
2. 授予檔案存取權限
3. 看到範例任務的看板
4. 嘗試拖拽、編輯、新增任務

## 📝 發佈到 npm

### 準備檢查清單

- [x] `pnpm build` 成功
- [x] `node bin/cli.js` 可正常啟動
- [x] 測試選擇資料夾並載入任務
- [x] 測試拖拽功能
- [x] 測試編輯任務
- [ ] 測試新增任務
- [ ] 測試刪除任務

### 發佈步驟

```bash
# 1. 登入 npm (首次)
npm login

# 2. 確認版本號
# 編輯 package.json 中的 version

# 3. 發佈
npm publish

# 4. 測試已發佈的版本
npx vtodo@latest
```

## 🔧 使用方式

### 方法 1: npx (推薦)

```bash
cd ~/my-project
npx vtodo
```

### 方法 2: 全域安裝

```bash
pnpm add -g vtodo
cd ~/my-project
vtodo
```

### 方法 3: 專案內安裝

```bash
pnpm add -D vtodo
# 在 package.json 加入:
{
  "scripts": {
    "todo": "vtodo"
  }
}
pnpm todo
```

## 🎨 功能特色

✅ **已完成:**
- 視覺化看板 (Pending | In Progress | Completed)
- 拖拽移動任務
- 編輯任務 (標題、描述、checklist、筆記)
- Markdown 預覽
- 檔案系統直接存取
- 進度條顯示
- 自動儲存
- CLI 工具

🔜 **未來可擴充:**
- 搜尋/過濾功能
- 標籤系統
- 優先順序
- 快捷鍵
- 統計報表

## 🌟 核心檔案說明

### FileManager.js
處理所有檔案系統操作:
- 讀寫 todo.md
- 讀寫個別 task 檔案
- 移動/刪除檔案
- 建立新任務

### MarkdownParser.js
處理 Markdown 解析:
- 解析 todo.md 格式
- 解析 task 檔案格式
- 序列化回 Markdown
- 計算進度

### App.jsx
主應用邏輯:
- 狀態管理
- 檔案操作協調
- UI 事件處理

### Board.jsx
看板元件:
- 拖拽邏輯 (@dnd-kit)
- 三欄佈局
- 拖拽視覺回饋

### TaskEditor.jsx
任務編輯器:
- 編輯/預覽模式
- Checklist 管理
- Markdown 預覽

## 📚 技術棧

- **React 19** - UI 框架
- **Vite** - 建置工具
- **@dnd-kit** - 拖拽功能
- **markdown-it** - Markdown 解析
- **Tailwind CSS** - 樣式
- **Express** - CLI 伺服器
- **File System Access API** - 檔案存取

## 🔍 測試建議

1. **基本功能測試**
   - 選擇資料夾
   - 載入任務
   - 查看看板

2. **拖拽測試**
   - Pending → In Progress
   - In Progress → Completed
   - Completed → Pending
   - 同一欄內拖動

3. **編輯測試**
   - 修改標題
   - 修改描述
   - 新增/刪除 checklist 項目
   - 勾選 checklist
   - 切換預覽模式

4. **檔案測試**
   - 開啟 todo.md 確認更新
   - 開啟 task 檔案確認內容
   - 檢查檔案是否正確移動

## 💡 提示

- 使用 Chrome 或 Edge 瀏覽器 (File System Access API 需求)
- 首次選擇資料夾需要授權
- 所有變更立即寫入檔案
- 可用 Git 追蹤所有變更

## 🐛 已知問題

無 (目前運作正常)

## 📞 支援

- GitHub: https://github.com/chyyynh/vtodo
- Issues: https://github.com/chyyynh/vtodo/issues

---

**祝你 vibe coding 愉快!** 🎉
