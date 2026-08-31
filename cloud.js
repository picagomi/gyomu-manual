/* ===========================================================
   cloud.js — みんなで共有するための層（Firebase）
   -----------------------------------------------------------
   ・マニュアル本文  → Firestore の manuals コレクション
   ・写真           → Firestore の photos コレクション（1枚1ドキュメント）
   ・ログイン       → 合い言葉＝共有アカウントのパスワード
   ・オフライン     → Firestore のローカルキャッシュで圏外でも閲覧できます

   firebase-config.js が空のときは何もしません（アプリは端末内保存で動きます）。
   =========================================================== */
import { initializeApp }
  from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence,
         signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
         collection, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, deleteField }
  from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const cfg   = window.FIREBASE_CONFIG || {};
const EMAIL = window.SHARED_EMAIL || '';
const enabled = !!(cfg.apiKey && cfg.projectId && EMAIL);

let auth = null, db = null, user = null, authKnown = false;
const authCbs = [];

if(enabled){
  const app = initializeApp(cfg);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
  setPersistence(auth, browserLocalPersistence).catch(()=>{});
  onAuthStateChanged(auth, u=>{
    user = u; authKnown = true;
    authCbs.forEach(cb=>{ try{ cb(u); }catch(e){} });
  });
}

/* 合い言葉が違うときのメッセージを日本語に */
function authMessage(e){
  const c = (e && e.code) || '';
  if(c.includes('wrong-password') || c.includes('invalid-credential') || c.includes('invalid-login')) return '合い言葉が違います';
  if(c.includes('too-many-requests')) return '試行が多すぎます。しばらく待ってからお試しください';
  if(c.includes('network')) return '通信できませんでした。電波を確認してください';
  if(c.includes('user-not-found')) return '共有アカウントが見つかりません（管理者に連絡してください）';
  return 'ログインできませんでした';
}

window.Cloud = {
  enabled,
  user: ()=> user,
  authKnown: ()=> authKnown,

  onAuth(cb){
    authCbs.push(cb);
    if(authKnown) cb(user);
  },
  async signIn(passphrase){
    try{
      await signInWithEmailAndPassword(auth, EMAIL, passphrase);
    }catch(e){
      const err = new Error(authMessage(e));
      err.code = e.code;
      throw err;
    }
  },
  async signOut(){ await signOut(auth); },

  /* マニュアル一覧をリアルタイムで受け取る（他の人の更新もすぐ届きます） */
  watchManuals(onList, onError){
    return onSnapshot(collection(db, 'manuals'),
      snap=> onList(snap.docs.map(d=> ({ ...d.data(), id: d.id }))),
      err => { console.warn('[cloud] watch error', err); if(onError) onError(err); });
  },

  async saveManual(m){ await setDoc(doc(db, 'manuals', m.id), m); },
  async deleteManual(id){ await deleteDoc(doc(db, 'manuals', id)); },

  /* 対応済チェックなど、一部のフィールドだけ更新（同時に複数人が押しても壊れません） */
  async patchManual(id, patch){ await updateDoc(doc(db, 'manuals', id), patch); },
  removeField: ()=> deleteField(),

  async putPhoto(id, dataURL){ await setDoc(doc(db, 'photos', id), { d: dataURL, at: Date.now() }); },
  async getPhoto(id){
    const s = await getDoc(doc(db, 'photos', id));
    return s.exists() ? s.data().d : null;
  },
  async delPhoto(id){ try{ await deleteDoc(doc(db, 'photos', id)); }catch(e){} }
};

window.dispatchEvent(new Event('cloud-ready'));
