import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAnY1LjKApcBRzQY3ZiLnHQk4YP7N1FuLE",
  authDomain: "pluggy-san.firebaseapp.com",
  databaseURL: "https://pluggy-san-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pluggy-san",
  storageBucket: "pluggy-san.firebasestorage.app",
  messagingSenderId: "184973727261",
  appId: "1:184973727261:web:5051498fe2ffebf36798f4",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
