# Job Scraper Worker

Indeedから求人情報をスクレイピングして、DynamoDBとGoogle Sheetsに保存するワーカーアプリケーションです。

## 🎯 機能

- **Indeedスクレイピング**: Playwrightを使用した効率的なWebスクレイピング
- **DynamoDB保存**: AWS DynamoDBへの求人データ保存
- **Google Sheets連携**: スプレッドシートへの自動データ出力
- **重複排除**: 既存の求人との重複チェック機能
- **ログ機能**: 詳細なログ出力とファイル保存

## 📋 必要な準備

### 1. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成し、必要な値を設定してください：

```bash
cp .env.example .env
```

#### AWS DynamoDB設定
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
DYNAMODB_TABLE_NAME=job-listings
```

#### Google Sheets設定
```env
GOOGLE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_SHEET_NAME=Jobs
```

### 2. DynamoDBテーブルの作成

以下のスキーマでテーブルを作成してください：

- **テーブル名**: `job-listings`
- **パーティションキー**: `id` (String)
- **TTL属性**: `ttl` (90日で自動削除)

### 3. Google Sheets API設定

1. Google Cloud Consoleでプロジェクトを作成
2. Google Sheets APIを有効化
3. サービスアカウントを作成
4. 認証情報（JSON）をダウンロード
5. スプレッドシートをサービスアカウントと共有

### 4. Playwrightブラウザのインストール

```bash
npx playwright install chromium
```

## 🚀 使用方法

### 開発モード

```bash
# 基本的な実行（デフォルト: "エンジニア" "東京" 3ページ）
pnpm dev

# カスタム検索条件
pnpm dev "プログラマー" "大阪" "5"
```

### 本番モード

```bash
# ビルド
pnpm build

# 実行
pnpm start "フロントエンドエンジニア" "東京" "2"
```

### スクレイピングのみ実行

```bash
pnpm scrape
```

## 📁 ディレクトリ構造

```
src/
├── index.ts                    # メインエントリーポイント
├── types/
│   └── job.ts                 # 型定義
├── utils/
│   ├── config.ts              # 環境変数管理
│   └── logger.ts              # ログ機能
├── services/
│   ├── dynamodb-service.ts    # DynamoDB操作
│   └── sheets-service.ts      # Google Sheets操作
└── scrapers/
    └── indeed-scraper.ts      # Indeedスクレイピング
```

## ⚙️ 設定可能な項目

### スクレイピング設定

- `SCRAPING_DELAY_MS`: ページ間の遅延時間（デフォルト: 2000ms）
- `SCRAPING_USER_AGENT`: User-Agent文字列
- `MAX_RETRIES`: リトライ回数（デフォルト: 3回）

### ログ設定

- `LOG_LEVEL`: ログレベル（error/warn/info/debug）
- `LOG_FILE_PATH`: ログファイルの保存先

## 🔍 データ形式

### JobListing型

```typescript
interface JobListing {
  id: string;              // MD5ハッシュで生成されるユニークID
  title: string;           // 求人タイトル
  company: string;         // 会社名
  location: string;        // 勤務地
  description: string;     // 求人詳細
  salary?: string;         // 給与情報
  employmentType?: string; // 雇用形態
  postedDate: string;      // 投稿日
  url: string;            // 求人URL
  source: 'indeed';       // データソース
  scrapedAt: string;      // スクレイピング実行日時
  tags?: string[];        // タグ（将来の拡張用）
}
```

## 🚨 注意事項

### 利用規約の遵守

- Indeedの利用規約を必ず確認してください
- robots.txtに従った適切なスクレイピングを心がけてください
- 過度な負荷をかけないよう、適切な間隔でリクエストを送信してください

### セキュリティ

- 認証情報は`.env`ファイルで管理し、Gitにコミットしないでください
- 本番環境では適切なアクセス制御を設定してください

### エラーハンドリング

- スクレイピング失敗時は自動的にリトライを行います
- ログファイルで詳細なエラー情報を確認できます

## 📊 実行例

```bash
# TypeScriptエンジニアの求人を東京で5ページ分スクレイピング
pnpm dev "TypeScript エンジニア" "東京" "5"
```

実行結果：
- DynamoDBに求人データを保存
- Google Sheetsに求人リストを出力
- `logs/scraping.log`に詳細ログを記録

## 🔧 トラブルシューティング

### よくある問題

1. **環境変数エラー**: `.env`ファイルの設定を確認
2. **DynamoDB接続エラー**: AWSの認証情報とリージョンを確認
3. **Google Sheets権限エラー**: サービスアカウントの共有設定を確認
4. **Playwrightエラー**: ブラウザのインストール状況を確認

### ログの確認

```bash
# ログファイルの確認
tail -f logs/scraping.log
```

## 📈 今後の拡張予定

- [ ] 他の求人サイト（マイナビ、リクナビ等）の対応
- [ ] Slack通知機能
- [ ] 求人データの分析機能
- [ ] スケジュール実行機能
- [ ] Web UIでの実行状況確認