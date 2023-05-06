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
    AlertDialogFooter,
    ModalContent,
    ModalBody,
    Modal,
    ModalOverlay,
    ModalHeader,
    FormHelperText,
    Alert,
    AlertIcon,
    AlertTitle, VStack, Code, Link, HStack, Spinner, Tooltip,
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
    const [passphraseError, setPassphraseError] = useState("");
    const [passphrase, setPassphrase] = useState("");
    const [link, setLink] = useState("");
    const [showLink, setShowLink] = useState(false);
    const [linkTransaction, setLinkTransaction] = useState('');
    const [isSentEmail, setIsSentEmail] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // new state variable





// Dans la fonction handleSubmit
    const toast = useToast();
    const handleEmailChange = (event) => {
        const email = event.target.value;
        setEmail(email);
        setEmailError("");
        setFormError("");

        // Vérification de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError("Email est requis");
        } else if (!emailRegex.test(email)) {
            setEmailError("Entrez un email valide !");
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setFile(file);
        setFileError("");
        setFormError("");

        // Vérification de la taille du fichier
        const maxSize = 2 * 1024 * 1024; // 2 Mo
        if (!file) {
            setFileError("Le fichier est requis !");
        } else if (file.size > maxSize) {
            setFileError("La taille du fichier ne doit pas dépasser 2 Mo");
        }
    };

    const handlePassphraseChange = (event) => {
        const passphrase = event.target.value;
        setPassphrase(passphrase);
        setPassphraseError("");
        setFormError("");

        // Validation de la phrase secrète
        if (!passphrase) {
            setPassphraseError("La phrase secrète est requise !");
        } else if (passphrase.length < 6) {
            setPassphraseError("La phrase secrète doit contenir au moins 6 caractères !");
        } else {
            setPassphraseError("");
        }
    };




    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        if (!email) {
            setEmailError("Email est requis !");
            setFormError('Veuillez vérifier vos informations !');
            return;
        }

        if (!file) {
            setFileError("Le fichier est requis !");
            setFormError('Veuillez vérifier vos informations !');
            return;
        }

        if (!passphrase) {
            setPassphraseError("La passPhrase est requise !");
            setFormError('Veuillez vérifier vos informations !');
            return;
        }


        if (emailError || fileError || passphraseError ){
            setFormError('Veuillez vérifier vos informations !');
            return;
        }

        console.log("submitted !");





        const user = auth.currentUser;
        console.log(user);
        if (!user) {
            return;
        }
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        // Créer une instance de FormData
        const formData = new FormData();
        formData.append("emailReceiver", email);
        //formData.append("destinateur", null);
        formData.append("file", file);
        formData.append("passphrase", passphrase);
        formData.append("walletId", userData.walletId);
        formData.append("userId", user.uid);
        formData.append("senderEmail", user.email);



        try {
            // Envoyer la requête POST avec l'instance de FormData
            const response = await axios.post("http://localhost:3002/send-file", formData);

            if (response.status === 200) {
                toast({
                    title: "Réponse du serveur",
                    description: "Transaction ID: " + response.data.tx,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });

                console.log("Réponse du serveur :", response.data);
                setLinkTransaction(response.data.tx);
                setLink(response.data.CID);
                console.log(response.data);
                setIsSentEmail(response.data.emailSucces);
                setShowLink(true);
                setIsLoading(false);
            } else {
                toast({
                    title: "Erreur du serveur",
                    description: "Une erreur est survenue lors de l'envoi du fichier.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Erreur",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setIsLoading(false);
        }
    };


    return (
        <Box maxW="xl" mx="auto" p={4}>
            <form noValidate onSubmit={handleSubmit}>

                {formError && (
                    <Alert py={4} status="error">
                        <AlertIcon />
                        <AlertTitle>{formError}</AlertTitle>
                    </Alert>

                )}

                <FormControl id="email" isRequired isInvalid={emailError}>
                    <FormLabel>Adresse e-mail</FormLabel>
                    <Input  type="email" value={email} onChange={handleEmailChange} />
                    {!emailError ? (
                        <FormHelperText>
                            L'email du destinataire
                        </FormHelperText>
                    ) : (
                        <FormErrorMessage>{emailError}</FormErrorMessage>
                    )}
                </FormControl>

                <FormControl id="file" isRequired isInvalid={fileError}>
                    <FormLabel>Fichier à envoyer</FormLabel>
                    <Input type="file" onChange={handleFileChange} />
                    {!fileError ? (
                        <FormHelperText>
                            Le fichier à envoyer : taille maximale 2 Mo
                        </FormHelperText>
                    ) : (
                        <FormErrorMessage>{fileError}</FormErrorMessage>
                    )}
                </FormControl>


                <FormControl id="passphrase" isRequired isInvalid={passphraseError}>
                    <FormLabel>Phrase secrète</FormLabel>
                    <Input
                        type="password"
                        value={passphrase}
                        onChange={handlePassphraseChange}
                        placeholder="Entrez votre phrase secrète"
                    />
                    {!passphraseError ? (
                        <FormHelperText>
                            La phrase secrète est utilisée pour protéger votre portefeuille en
                            ajoutant une couche de sécurité supplémentaire.
                        </FormHelperText>
                    ) : (
                        <FormErrorMessage>{passphraseError}</FormErrorMessage>
                    )}

                </FormControl>



                <Button width={"full"} colorScheme={"green"} type="submit" mt={4}>
                    {isLoading ? (
                        <Spinner size="sm" mr="2" />
                    ) : (
                        "Envoyer"
                    )}
                </Button>
                {!isLoading && (
                    <Button mt={4} ml={4} colorScheme="gray" onClick={() => window.location.href = "/dashboard"}>
                        Retour
                    </Button>
                )}

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
                                <ModalHeader>Envoie Réussi</ModalHeader>
                                <ModalBody>

                                    <HStack >
                                        <Text mx={3} fontSize={'lg'} as={'b'}> Transaction :</Text>

                                        {linkTransaction ?
                                            <Tooltip label={linkTransaction}>
                                                <Badge colorScheme={'green'}> Envoyé</Badge>
                                            </Tooltip> :
                                            (<Tooltip label={'Transaction échoué'}>
                                                <Badge colorScheme={'red'}> Non Envoyé</Badge>
                                            </Tooltip> )
                                        }
                                    </HStack>

                                    <HStack >
                                        <Text mx={3} fontSize={'lg'} as={'b'}> IPFS CID :</Text>
                                        {link ?
                                            <Tooltip label={link}>
                                                <Badge colorScheme={'green'}> Envoyé</Badge>
                                            </Tooltip> :
                                            (<Tooltip label={'Transaction échoué'}>
                                                <Badge colorScheme={'red'}> Non Envoyé</Badge>
                                            </Tooltip> )
                                        }
                                    </HStack>

                                    <HStack >
                                        <Text mx={3} fontSize={'lg'} as={'b'}> Email envoyé :</Text>
                                        {isSentEmail ? (
                                            <Badge colorScheme={"green"}> Envoyé </Badge>
                                        ) : (<Badge colorScheme={"red"}> Non Envoyé </Badge>)
                                        }

                                    </HStack>


                                    <HStack mt={4} spacing={4}  justifyContent={"center"} >
                                        <Button  onClick={() => setShowLink(false)}>
                                            Fermer
                                        </Button>
                                        <Button colorScheme={"yellow"} onClick={() => window.location.href = "/historySent"}>
                                            Consulter vos historique
                                        </Button>


                                    </HStack>

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
