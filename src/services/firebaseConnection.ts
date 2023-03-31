import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD8Be6tiSOfK2OcF4CXpS2QwzvK3I5VUyo",
  authDomain: "tarefas-plus-76a22.firebaseapp.com",
  projectId: "tarefas-plus-76a22",
  storageBucket: "tarefas-plus-76a22.appspot.com",
  messagingSenderId: "94850799105",
  appId: "1:94850799105:web:83912ae4514d2f55671200"
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

export { db };