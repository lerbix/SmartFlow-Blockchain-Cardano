import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import firebaseConfig from "../../utils/firebaseConfig.js";
import {Box, Button, Card, Heading, Spinner} from "@chakra-ui/react";
import AuthenticationService from "../../services/AuthenticationService.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);



const Dashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);



    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.data();
                setUser({
                    uid: user.uid,
                    email: user.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    birthDate: userData.birthDate,
                });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await AuthenticationService.logout();
            window.location.href = "/"; // Redirection vers la page de connexion
        } catch (error) {
            console.log(error);
        }
    };


    return (


        <Box>
            <Heading size="md">Tableau de bord</Heading>
            {isLoading && <Spinner />}
            {user && (
                <Card>
                    <Box p={4}>
                        <p>Utilisateur connecté : {user.email}</p>
                        <p>Prénom : {user.firstName}</p>
                        <p>Nom : {user.lastName}</p>
                        <p>Date de naissance : {user.birthDate}</p>
                        <Button colorScheme="red" mt={4} onClick={handleLogout}>Déconnexion</Button>
                        <Button colorScheme="yellow" mt={4} ml={4} onClick={ ()=>window.location.href = "/edit-profile"} >Modifier</Button>
                    </Box>
                </Card>
            )}
        </Box>

    );
};

export default Dashboard;
