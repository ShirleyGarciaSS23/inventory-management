import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
 apiKey: "AIzaSyCuTw59hn2KGcNF-VVH3QlOBkRON4h00Bs",
 authDomain: "inventory-management-45ec3.firebaseapp.com",
 projectId: "inventory-management-45ec3",
 storageBucket: "inventory-management-45ec3.appspot.com",
 messagingSenderId: "28951620927",
 appId: "1:28951620927:web:fd35e9542bf3f2fb5fb78a"
 };
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };