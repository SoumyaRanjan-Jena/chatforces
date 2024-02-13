import firebase from "firebase/compat/app"
import "firebase/compat/auth"

export const auth = firebase.initializeApp({
    apiKey: "AIzaSyDtjCN7wgtORAd-iRNdCRuKQY_VssF5yhU",
    authDomain: "chatforces1.firebaseapp.com",
    projectId: "chatforces1",
    storageBucket: "chatforces1.appspot.com",
    messagingSenderId: "232346870199",
    appId: "1:232346870199:web:41fa6f9cbf003fa0de8832"
}).auth()