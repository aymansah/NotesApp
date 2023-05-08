// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore, collection} from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJ962qhnza8uwiBCZU3Ecp33sXW6_2Sr0",
  authDomain: "notes-app-b35ed.firebaseapp.com",
  projectId: "notes-app-b35ed",
  storageBucket: "notes-app-b35ed.appspot.com",
  messagingSenderId: "210148657223",
  appId: "1:210148657223:web:390c5f00a0eb152ca08962"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const notesCollection = collection(db, "notes")