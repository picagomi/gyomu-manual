/* ===========================================================
   Firebase の設定（共有機能）
   -----------------------------------------------------------
   ここが空のあいだは「この端末だけに保存」で動きます。
   Firebase コンソールで取得した値を貼ると、共有モードになります。

   ここに書く値は公開されて問題のないもの（クライアント用の識別子）です。
   実際の鍵は「合い言葉（共有アカウントのパスワード）」と
   Firestore のセキュリティルールで守ります。
   =========================================================== */

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDMnhbZ281RaCONMXs7OpjBHK48FoCzTyI",
  authDomain: "nagomi-manual.firebaseapp.com",
  projectId: "nagomi-manual",
  storageBucket: "nagomi-manual.firebasestorage.app",
  messagingSenderId: "105595720434",
  appId: "1:105595720434:web:8524764c1fc32c4197766b"
};

/* 合い言葉で入るときに使う共有アカウントのメールアドレス。
   （Firebase コンソールで1つだけ作るアカウント。実在のメールでなくて構いません）
   合い言葉＝このアカウントのパスワードです。変更はコンソールから行います。 */
window.SHARED_EMAIL = "staff@manual-biz.com";
