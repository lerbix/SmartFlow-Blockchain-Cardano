import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import firebaseConfig from "../../utils/firebaseConfig.js";
import {Box, Button, FormControl, FormLabel, Input, Heading, Spinner} from "@chakra-ui/react";
import AuthenticationService from "../../services/AuthenticationService.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const EditForm = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");

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
                setFirstName(userData.firstName);
                setLastName(userData.lastName);
                setBirthDate(userData.birthDate);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSaveChanges = async () => {
        try {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                firstName: firstName,
                lastName: lastName,
                birthDate: birthDate,
            });
            window.location.href = "/dashboard"; // Redirection vers le tableau de bord
        } catch (error) {
            console.log(error);
        }
    };


    return (
        <Box>
            <Heading size="md">Modifier votre profil</Heading>
            {isLoading && <Spinner />}
            {user && (
                <Box>
                    <FormControl id="firstName" mt={4}>
                        <FormLabel>Prénom</FormLabel>
                        <Input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    </FormControl>
                    <FormControl id="lastName" mt={4}>
                        <FormLabel>Nom</FormLabel>
                        <Input type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
                    </FormControl>
                    <FormControl id="birthDate" mt={4}>
                        <FormLabel>Date de naissance</FormLabel>
                        <Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
                    </FormControl>
                    <Button colorScheme="blue" mt={4} onClick={handleSaveChanges}>Enregistrer les modifications</Button>
                    <Button colorScheme="red" mt={4} ml={4} onClick={()=>window.location.href = "/dashboard"}>Annuler</Button>
                </Box>
            )}
        </Box>
    );
}

export default EditForm;
