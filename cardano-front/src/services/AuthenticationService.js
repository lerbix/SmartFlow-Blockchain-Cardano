import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from "../utils/firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

class AuthenticationService {

    // Méthode pour inscrire un nouvel utilisateur
    async register(email, password, firstName, lastName, birthdate) {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Ajouter les données utilisateur personnalisées dans la base de données Firestore
            const userDocRef = doc(db, 'users', result.user.uid);
            await setDoc(userDocRef, {
                email: email,
                firstName : firstName,
                lastName : lastName,
                birthDate : birthdate,
            });

            return result.user;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Méthode pour connecter un utilisateur existant
    async login(email, password) {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Méthode pour déconnecter l'utilisateur actuel
    async logout() {
        try {
            await signOut(auth);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Vérifie si un utilisateur est connecté ou non
    isUserLoggedIn() {
        const user = auth.currentUser;
        return !!user;
    }
}

export default new AuthenticationService();
