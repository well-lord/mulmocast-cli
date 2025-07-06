# jsonテンプレート作成
```
mulmo tool prompt -t text_only
```



# 動画作成(動作確認)
```
yarn run movie myprompt/5.txt -l ja -c ja
```


# 動作確認(本番)
- YouTubeへの動画アップロードまで
```bash
# ファイルを指定して動画作成、アップロード
yarn run youtube myprompt/5.txt -l ja -c ja

# コピーしたpromptで動画作成、アップロード
yarn run youtube __clipboard -l ja -c ja
```
