# NOTION 筆記整合指南

## 方法1：使用 NOTION API（推薦）

### 步驟1：設置 NOTION 集成
1. 前往 https://www.notion.so/my-integrations
2. 點擊 "New integration"
3. 填寫集成信息：
   - Name: NANI學習平台
   - Associated workspace: 選擇您的工作區
   - Capabilities: 選擇 "Read content"
4. 點擊 "Submit"
5. 複製 "Internal Integration Token"

### 步驟2：獲取數據庫 ID
1. 在您的 NOTION 中創建一個數據庫
2. 添加以下屬性：
   - Title (標題)
   - Category (分類) - Select: 管理學, 英文, 行銷學
   - Tags (標籤) - Multi-select
   - Content (內容) - Text
   - Date (日期) - Date
3. 分享數據庫給您的集成
4. 從 URL 中複製數據庫 ID

### 步驟3：更新環境變量
在 `.env` 文件中添加：
```
NOTION_TOKEN=your_integration_token_here
NOTION_DATABASE_ID=your_database_id_here
```

## 方法2：手動導入（簡單）

### 步驟1：導出 NOTION 筆記
1. 在 NOTION 中選擇要導出的頁面
2. 點擊 "..." → "Export"
3. 選擇 "HTML" 格式
4. 下載導出的文件

### 步驟2：轉換格式
使用提供的轉換工具將 HTML 轉換為平台格式

## 方法3：直接複製貼上

### 步驟1：創建筆記
1. 在平台上點擊 "新增筆記"
2. 選擇分類（管理學/英文/行銷學）
3. 填寫標題和內容
4. 添加標籤

### 步驟2：同步更新
定期手動更新筆記內容

## 自動同步功能

平台提供以下自動同步功能：
- 每日自動同步 NOTION 數據庫
- 支持標籤和分類自動映射
- 保持格式和樣式

## 使用建議

1. **統一格式**：在 NOTION 中使用統一的標籤系統
2. **定期同步**：建議每週同步一次
3. **備份重要筆記**：重要內容建議手動備份
4. **使用標籤**：善用標籤功能進行分類

## 故障排除

### 問題1：API 連接失敗
- 檢查 NOTION_TOKEN 是否正確
- 確認數據庫已分享給集成
- 檢查網絡連接

### 問題2：格式顯示異常
- 檢查 HTML 格式是否正確
- 重新導出 NOTION 內容
- 使用純文本格式

### 問題3：同步失敗
- 檢查數據庫 ID 是否正確
- 確認集成權限設置
- 查看錯誤日誌 
