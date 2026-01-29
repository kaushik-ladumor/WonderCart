// Firebase.js - Make sure it looks like this
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAjNlsY6f0MQOjACuuRnxVCWlJoE4HyanI",
    authDomain: "wondercart-project.firebaseapp.com",
    projectId: "wondercart-project",
    storageBucket: "wondercart-project.firebasestorage.app",
    messagingSenderId: "886588133348",
    appId: "1:886588133348:web:f7812e55c42259850081f1",
    measurementId: "G-9L08YB3KPV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
export default app;