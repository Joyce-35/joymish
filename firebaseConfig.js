// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyAbtoPI2DY6Sn21VVSr7YIO678bVyYefPQ",
  authDomain: "joymish-f61aa.firebaseapp.com",
  projectId: "joymish-f61aa",
  storageBucket: "joymish-f61aa.appspot.com",
  messagingSenderId: "418648981308",
  appId: "1:418648981308:web:434817a81f6775d9a4e839",
  measurementId: "G-7T81426J3Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
