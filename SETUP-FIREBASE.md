# 共有（Firebase）のセットアップ手順

このアプリは `firebase-config.js` が空のあいだ「端末内だけに保存」で動きます。
下の設定を入れると **みんなで同じマニュアルを共有** できるようになります。

- マニュアル本文・対応済チェック → Firestore（リアルタイム反映）
- 写真 → Firestore に1枚1件で保存（**無料プランのまま**使えます。カード登録不要）
- 合い言葉 → 「共有アカウント1つのパスワード」として Firebase 側で検証します

## 設定済みの内容（2026-08-31）
| 項目 | 値 |
|---|---|
| プロジェクト | `nagomi-manual`（Spark＝無料プラン） |
| Firestore | asia-northeast1 |
| 共有アカウント | `staff@manual-biz.com`（パスワード＝合い言葉。コンソールでのみ変更） |
| 共有アカウントのUID | `U5OyWORGhRMhN0nY029Nik2VAth1` |

以下は、別のプロジェクトで作り直すときの手順です。

## 1. プロジェクトを作る
1. https://console.firebase.google.com を開く（五味さんのGoogleアカウントで）
2. 「プロジェクトを追加」→ 名前は `nagomi-manual` など
3. Googleアナリティクスは **オフ** でOK

## 2. Firestore を作る
1. 左メニュー「構築 → Firestore Database」→「データベースの作成」
2. モードは **本番環境モード**（ルールは後で入れます）
3. ロケーションは **asia-northeast1（東京）**

## 3. 合い言葉用のアカウントを1つ作る
1. 左メニュー「構築 → Authentication」→「始める」
2. 「Sign-in method」タブ →「メール / パスワード」を **有効** にする（下の「メールリンク」はオフのまま）
3. 「Users」タブ →「ユーザーを追加」
   - メール：`staff@manual-biz.com`（実在しなくてOK。`firebase-config.js` の `SHARED_EMAIL` と一致させる）
   - パスワード：**これが合い言葉になります**（6文字以上。現場に伝える言葉）
4. 追加後、一覧に出る **ユーザーUID**（20文字くらいの文字列）をコピーしておく

## 4. セキュリティルールを入れる
「Firestore Database → ルール」に貼り付けて「公開」。
`ここにUID` を 3 でコピーしたUIDに置き換えてください（現在は `U5OyWORGhRMhN0nY029Nik2VAth1`）。

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function shared() {
      return request.auth != null && request.auth.uid == 'ここにUID';
    }
    match /manuals/{id} { allow read, write: if shared(); }
    match /photos/{id}  { allow read, write: if shared(); }
  }
}
```

これで「合い言葉を知っている人（＝共有アカウントでログインできた人）だけ」が読み書きできます。
自分で勝手にアカウントを作った人はUIDが違うので弾かれます。

## 5. ウェブアプリを登録して設定値を貼る
1. 「プロジェクトの概要」の歯車 → 「プロジェクトの設定」→ 下の「マイアプリ」→ **`</>`（ウェブ）**
2. アプリのニックネームは `manual` など。Hosting のチェックは **不要**
3. 表示される `firebaseConfig` の中身を `firebase-config.js` に貼る
4. 「承認済みドメイン」に **`manual-biz.com`** を追加
   （Authentication → Settings → 承認済みドメイン。`localhost` は最初から入っています）

## 6. 反映
`firebase-config.js` を保存して push すると、1〜2分で共有モードになります。
アプリを開くと合い言葉を聞かれ、入れると全員が同じマニュアルを見られます。

## 運用メモ
- **合い言葉を変える**：Authentication → Users → 該当ユーザー → パスワードを再設定
- **端末で入れ直す**：メニュー →「🔒 合い言葉を入れ直す（ログアウト）」
- **この端末だけのマニュアルを共有に移す**：メニュー →「⬆ この端末のマニュアルを共有に移す」
- **容量の目安**：無料プランは 1GiB。写真は1枚あたり約0.3MBなので **およそ3,000枚**まで
- **圏外**：一度開いたマニュアルはキャッシュから読めます。チェックは電波が戻ったときに送信されます
