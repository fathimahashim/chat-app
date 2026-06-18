import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth"; // FIX 1: moved sendPasswordResetEmail from firebase/auth/cordova to firebase/auth
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore"; // FIX 2: added collection, getDocs (were missing, used in resetPass)
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyCZYT-sW9ggXq2MTfqlKs1WuzUPc9tkjxY",
  authDomain: "chat-app-gs-de434.firebaseapp.com",
  projectId: "chat-app-gs-de434",
  storageBucket: "chat-app-gs-de434.firebasestorage.app",
  messagingSenderId: "946450707302",
  appId: "1:946450707302:web:7868b0cfa9c621d9fecea7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey There i am using chat app",
      lastSeen: Date.now()
    });
    await setDoc(doc(db, "chats", user.uid), {
      chatsData: []
    });
  } catch (error) {
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(" "));
  }
}

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(" "));
  }
}

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(" "));
  }
}

const resetPass = async (email) => {
  if (!email) {
    // FIX 3: toast.error call had mismatched brackets — closing paren was inside return, and return was outside
    toast.error("Enter your email");
    return null;
  }
  try {
    const userRef = collection(db, 'users');
    const q = query(userRef, where("email", "==", email));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset Email Sent")
    } else {
      toast.error("Email does not exist")
    }
  } catch (error) {
    console.error(error);
    toast.error(error.message)
  }
}

// FIX 4: restPass -> resetPass (typo in export)
export { signup, login, logout, auth, db, resetPass };