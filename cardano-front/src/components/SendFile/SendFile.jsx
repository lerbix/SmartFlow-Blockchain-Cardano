import React, { useState } from "react";
import {
    Box,
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
    Button,
    Text,
    Badge,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter, ModalContent, ModalBody, Modal, ModalOverlay, ModalHeader,
} from "@chakra-ui/react";
import axios from "axios";
import {initializeApp} from "firebase/app";
import firebaseConfig from "../../utils/firebaseConfig.js";
import {getAuth} from "firebase/auth";
import {doc, getDoc, getFirestore, updateDoc} from "firebase/firestore";
import { useToast } from "@chakra-ui/react";





// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);



function SendFile({buildSendTransaction}) {
    const [email, setEmail] = useState("");
    const [file, setFile] = useState(null);
    const [emailError, setEmailError] = useState("");
    const [fileError, setFileError] = useState("");
    const [formError, setFormError] = useState("");
    const [passphrase, setPassphrase] = useState("");
    const [link, setLink] = useState("");
    const [showLink, setShowLink] = useState(false);


// Dans la fonction handleSubmit
    const toast = useToast();
    const handleEmailChange = (event) => {
        setEmail(event.target.value);
        setEmailError("");
        setFormError("");
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setFileError("");
        setFormError("");
    };



    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email) {
            setEmailError("Veuillez fournir une adresse e-mail.");
            return;
        }

        if (!file) {
            setFileError("Veuillez sélectionner un fichier à envoyer.");
            return;
        }




        const user = auth.currentUser;
        if (!user) {
            return;
        }
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        // Créer une instance de FormData
        const formData = new FormData();
        formData.append("email", email);
        formData.append("destinateur", null);
        formData.append("file", file);
        formData.append("passphrase", passphrase);
        formData.append("walletId", userData.walletId);


        try {
            // Envoyer la requête POST avec l'instance de FormData
            const response = await axios.post("http://localhost:3002/send-file", formData);
            toast({
                title: "Réponse du serveur",
                description: "Transaction ID : " + response.data.txid,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            console.log("Réponse du serveur :", response.data);
            setLink("https://ipfs.io/ipfs/" + response.data.hash);
            setLink("https://ipfs.io/ipfs/" + response.data.hash);
            setShowLink(true);
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <Box maxW="xl" mx="auto" p={4}>
            <form onSubmit={handleSubmit}>
                <FormControl id="email" isRequired isInvalid={emailError}>
                    <FormLabel>Adresse e-mail</FormLabel>
                    <Input type="email" value={email} onChange={handleEmailChange} />
                    {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
                </FormControl>
                <FormControl id="file" isRequired isInvalid={fileError}>
                    <FormLabel>Fichier à envoyer</FormLabel>
                    <Input type="file" onChange={handleFileChange} />
                    {fileError && <FormErrorMessage>{fileError}</FormErrorMessage>}
                </FormControl>

                <FormControl id="passphrase">
                    <FormLabel>Phrase secrète</FormLabel>
                    <Input
                        type="password"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder="Entrez votre phrase secrète"
                    />
                    <Text fontSize="sm">
                        La phrase secrète est utilisée pour protéger votre portefeuille en
                        ajoutant une couche de sécurité supplémentaire.
                    </Text>
                </FormControl>
                {formError && <Box color="red.500">{formError}</Box>}
                <Button type="submit" mt={4}>
                    Envoyer
                </Button>
                <Button  mt={4} ml={4} colorScheme="gray" onClick={()=> window.location.href ="/dashboard"}>
                    retour
                </Button>
                {showLink && (
                    <Box
                        position="fixed"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        zIndex={10}
                    >
                    <Modal isOpen={showLink} onClose={() => setShowLink(false)}>
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>Voici votre lien</ModalHeader>
                            <ModalBody>

                                    <Text fontSize="lg">
                                        Link:{" "}
                                        <a href={link} target="_blank" rel="noopener noreferrer">
                                            {link}
                                        </a>
                                    </Text>
                                    <Button mt={4} onClick={() => setShowLink(false)}>
                                        Fermer
                                    </Button>
                            </ModalBody>
                        </ModalContent>
                    </Modal>
                    </Box>
                )}

            </form>
        </Box>
    );
}

export default SendFile;
