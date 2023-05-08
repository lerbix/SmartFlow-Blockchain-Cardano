import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc} from "firebase/firestore";
import firebaseConfig from "../../utils/firebaseConfig.js";
import {Badge, Box, Button, Card, Container, Heading, HStack, Spinner} from "@chakra-ui/react";
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
    const [isWalletConnected, setIsWalletConnected] = useState(false);



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

                setIsWalletConnected(!!userData.walletAddress);


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

    const handleDisconnect = async () => {
        try {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                walletAddress: null,
                walletId: null,
            });
            setIsWalletConnected(false);
        } catch (error) {
            console.log(error);
        }
    };



    return (
        <Container>
            <Box>
                <Heading size="md" p={4}>Tableau de bord</Heading>
                {isLoading && <Spinner
                    thickness='4px'
                    speed='0.65s'
                    emptyColor='gray.200'
                    color='blue.500'
                    size='xl'
                />}
                {user && (
                    <Card>
                        <Box p={4}>
                            <p>Utilisateur connecté : {user.email}</p>
                            <p>Prénom : {user.firstName}</p>
                            <p>Nom : {user.lastName}</p>
                            <p>Date de naissance : {user.birthDate}</p>
                            <p>Wallet :
                                {isWalletConnected ? (
                                    <Badge  py={2} colorScheme="green"> Wallet linked </Badge>
                                ) : (
                                    <Badge  colorScheme="red"> Wallet not linked</Badge>
                                )}
                            </p>


                            <Button colorScheme="red" mt={4} onClick={handleLogout}>Déconnexion</Button>
                            <Button colorScheme="yellow" mt={4} ml={4} onClick={ ()=>window.location.href = "/edit-profile"} >Modifier profil</Button>
                            <Button ml={4} mt={4} onClick={ ()=>window.location.href = "/Check"}>
                                CheckDocument
                            </Button>
                            {isWalletConnected && (
                                <Button colorScheme="blue" mt={4} ml={4} onClick={() => window.location.href = "/send-file"} >Send</Button>
                            )}
                            {!isWalletConnected && (
                            <Button my={3} onClick={()=>window.location.href = "/walletCli"}>
                                Connect With Cardano Wallet CLI
                            </Button>
                                )}
                            {isWalletConnected && (

                                <HStack spacing={4}>
                                    <Button my={3} onClick={handleDisconnect}>
                                        Disconnect Your Cardano Wallet
                                    </Button>
                                    <Button my={3} onClick={()=>window.location.href = "/WalletInfo"}>
                                       Consulter votre Wallet
                                    </Button>

                                </HStack>




                            )}

                            <Heading size="md" p={4} >Historique </Heading>
                            <HStack spacing={3}>
                                <Button  my={3} onClick={()=>window.location.href = "/historySent"}>
                                    Historique des fichiers Envoyés
                                </Button>
                                <Button  my={3} onClick={()=>window.location.href = "/historyReceived"}>
                                    Historique des fichiers Recus
                                </Button>
                            </HStack>

                        </Box>
                    </Card>


                )}
            </Box>



        </Container>




    );
};

export default Dashboard;
