# YouTube Upload Setup Guide

## 概要
MulmoStudioで生成した動画をYouTubeにアップロードするための設定手順です。

## 必要なもの
1. Googleアカウント
2. Google Cloud Platform (GCP) プロジェクト
3. YouTube Data API v3 の有効化
4. OAuth 2.0 認証情報

## セットアップ手順

### 1. Google Cloud Platform プロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択
3. プロジェクトIDをメモしておく

### 2. YouTube Data API v3 の有効化

1. Google Cloud Console でプロジェクトを選択
2. 「APIとサービス」→「ライブラリ」に移動
3. "YouTube Data API v3" を検索
4. APIを有効化

### 3. OAuth 2.0 認証情報の作成

1. 「APIとサービス」→「認証情報」に移動
2. 「認証情報を作成」→「OAuth クライアントID」を選択
3. アプリケーションタイプで「デスクトップアプリケーション」を選択
4. 名前を入力（例: "MulmoStudio YouTube Upload"）
5. 作成後、JSONファイルをダウンロード

### 4. OAuth 同意画面の設定

1. 「OAuth同意画面」タブに移動
2. 外部ユーザーを選択（個人用の場合）
3. 必要な情報を入力:
   - アプリ名: "MulmoStudio"
   - ユーザーサポートメール: あなたのメールアドレス
   - デベロッパーの連絡先情報: あなたのメールアドレス
4. スコープを追加:
   - `https://www.googleapis.com/auth/youtube.upload`
5. テストユーザーにあなたのGoogleアカウントを追加

### 5. 初回認証とリフレッシュトークンの取得

初回認証を行い、リフレッシュトークンを取得するためのスクリプトを実行します:

```bash
# 認証用スクリプト（作成予定）
npm run youtube:auth -- --credentials path/to/credentials.json
```

または、以下のNode.jsスクリプトを使用:

```javascript
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');

async function getRefreshToken() {
  const credentials = JSON.parse(fs.readFileSync('path/to/credentials.json'));
  
  const oauth2Client = new OAuth2Client(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirect_uris[0]
  );

  const scopes = ['https://www.googleapis.com/auth/youtube.upload'];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  console.log('このURLにアクセスして認証を行ってください:', authUrl);
  console.log('認証後、認証コードを入力してください:');
  
  const code = 'YOUR_AUTH_CODE_HERE'; // 手動で入力
  
  const { tokens } = await oauth2Client.getToken(code);
  
  // credentials.jsonにリフレッシュトークンを追加
  credentials.refresh_token = tokens.refresh_token;
  fs.writeFileSync('path/to/credentials.json', JSON.stringify(credentials, null, 2));
  
  console.log('リフレッシュトークンが保存されました');
}

getRefreshToken();
```

### 6. 認証情報ファイルの準備

最終的な認証情報ファイルは以下の形式になります:

```json
{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET", 
  "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob"],
  "refresh_token": "YOUR_REFRESH_TOKEN"
}
```

## 使用方法

### 基本的な使用法

```bash
# 動画を生成してYouTubeにアップロード
mulmo youtube script.json --credentials path/to/credentials.json

# タイトルと説明を指定
mulmo youtube script.json \\
  --credentials path/to/credentials.json \\
  --title "My Video Title" \\
  --description "Video description"

# プライバシー設定を指定
mulmo youtube script.json \\
  --credentials path/to/credentials.json \\
  --privacy public

# タグを指定
mulmo youtube script.json \\
  --credentials path/to/credentials.json \\
  --tags "tag1,tag2,tag3"
```

### オプション一覧

- `--credentials`: 認証情報ファイルのパス (必須)
- `--title, -t`: 動画のタイトル
- `--description, -d`: 動画の説明
- `--tags`: タグ (カンマ区切り)
- `--privacy, -p`: プライバシー設定 (private, public, unlisted)
- `--category, -c`: カテゴリID (デフォルト: 22 = People & Blogs)

### カテゴリID一覧

- 1: Film & Animation
- 2: Autos & Vehicles
- 10: Music
- 15: Pets & Animals
- 17: Sports
- 19: Travel & Events
- 20: Gaming
- 22: People & Blogs
- 23: Comedy
- 24: Entertainment
- 25: News & Politics
- 26: Howto & Style
- 27: Education
- 28: Science & Technology

## トラブルシューティング

### よくあるエラー

1. **"No refresh token found"**
   - 初回認証が完了していません
   - 認証フローを実行してリフレッシュトークンを取得してください

2. **"Invalid credentials"**
   - 認証情報ファイルが正しくありません
   - ファイルパスとJSON形式を確認してください

3. **"Video file not found"**
   - 動画ファイルが生成されていません
   - まず `mulmo movie` コマンドで動画を生成してください

4. **"API quota exceeded"**
   - YouTube API の使用制限に達しました
   - 時間を置いてから再試行してください

### セキュリティ注意事項

- 認証情報ファイルは安全な場所に保存してください
- Git リポジトリに認証情報をコミットしないでください
- 定期的にアクセストークンを更新してください

## API制限

YouTube Data API v3 には以下の制限があります:
- 1日あたりのクォータ: 10,000 units
- 動画アップロード: 1,600 units per upload
- 1日あたり約6本の動画をアップロード可能

詳細は [YouTube API Documentation](https://developers.google.com/youtube/v3/getting-started) を参照してください。