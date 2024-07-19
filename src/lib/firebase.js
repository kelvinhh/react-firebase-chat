import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "chatchat-bed60.firebaseapp.com",
    projectId: "chatchat-bed60",
    storageBucket: "chatchat-bed60.appspot.com",
    messagingSenderId: "523614781378",
    appId: "1:523614781378:web:1975eb28ab6e0b26c5605b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();