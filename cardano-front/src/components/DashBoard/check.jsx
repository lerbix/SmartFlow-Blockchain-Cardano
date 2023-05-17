import React, { useState } from "react";
import {
    Heading,
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
    AlertTitle, VStack, Code, Link, HStack, Spinner, Tooltip, Stack, StackDivider, Highlight, CardBody, Card,
} from "@chakra-ui/react";
import axios from "axios";
import {initializeApp} from "firebase/app";
import firebaseConfig from "../../utils/firebaseConfig.js";
import {getAuth} from "firebase/auth";
import {doc, getDoc, getFirestore, updateDoc, collection} from "firebase/firestore";
import { useToast } from "@chakra-ui/react";





// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);



function Check({buildSendTransaction}) {
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [formError, setFormError] = useState("");
    const [isLoading, setIsLoading] = useState(false); // new state variable
    const [fileInfo, setFileInfo] = useState(null); // new state variable



// Dans la fonction handleSubmit
    const toast = useToast();
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



    const handleSubmit = async (event) => {
        event.preventDefault();
        setFileInfo(null);
        setIsLoading(true);

        if (!file) {
            setFileError("Le fichier est requis !");
            setFormError('Veuillez vérifier vos informations !');
            setIsLoading(false);
            return;
        }

        if ( fileError){
            setFormError('Veuillez vérifier vos informations !');
            setIsLoading(false);
            return;
        }




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
        //formData.append("destinateur", null);
        formData.append("file", file);
        formData.append("walletId", userData.walletId);
        formData.append("userId", user.uid);
        formData.append("senderEmail", user.email);



        try {
            // Envoyer la requête POST avec l'instance de FormData
            const response = await axios.post("http://localhost:3002/check-file", formData);

            if (response.status === 200) {
                toast({
                    title: "Réponse du serveur",
                    description: response.data.message,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                console.log("Réponse du serveur :", response.data);
                console.log(response.data);
                setFileInfo(response.data.fileInfo);
                console.log(fileInfo)
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
            {isLoading && <Spinner
                thickness='4px'
                speed='0.65s'
                emptyColor='gray.200'
                color='blue.500'
                size='xl'
            />}
            <Heading mb={5}>Check the authenticity of your File</Heading>
            <form noValidate onSubmit={handleSubmit}>

                {formError && (
                    <Alert py={4} status="error">
                        <AlertIcon />
                        <AlertTitle>{formError}</AlertTitle>
                    </Alert>

                )}





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

                {fileInfo && (

                    <Card>
                        <CardBody textAlign="left">
                        <Stack divider={<StackDivider />} spacing='4'>
                            <Box>
                                <Heading size='xs' textTransform='uppercase'>
                                    <Highlight query='Nom du fichier Initial' styles={{ px: '1', py: '1', bg: 'orange.100' }}>Nom du fichier Initial</Highlight>
                                </Heading>
                                <Text pt='2' fontSize='sm'>
                                    {fileInfo.fileName}
                                </Text>
                            </Box>

                            <Box>
                                <Heading size='xs' textTransform='uppercase'>
                                    <Highlight query='Date Envoie' styles={{ px: '1', py: '1', bg: 'orange.100' }}>Date Envoie </Highlight>                           </Heading>
                                <Text pt='2' fontSize='sm'>
                                    {fileInfo.dateEnvoie}
                                </Text>
                            </Box>

                            <Box>
                                <Heading size='xs' textTransform='uppercase'>
                                    <Highlight query='Date Recu ' styles={{ px: '1', py: '1', bg: 'orange.100' }}>Date Recu </Highlight>                            </Heading>
                                <Text pt='2' fontSize='sm'>
                                    {fileInfo.dateRecu}
                                </Text>
                            </Box>

                            <Box>
                                <Heading size='xs' textTransform='uppercase'>
                                    <Highlight query='Transaction Envoie' styles={{ px: '1', py: '1', bg: 'orange.100' }}>Transaction Envoie</Highlight>
                                </Heading>
                                <HStack pt='4' fontSize='sm' justifyContent={"center"}>
                                    <Button  as='a' target='_blank' variant='solid' href={`https://preview.cardanoscan.io/transaction/${fileInfo.transactionHash}`}>
                                        Consulter La Transaction D'envoie
                                    </Button>
                                </HStack>
                            </Box>

                            <Box>
                                <Heading size='xs' textTransform='uppercase'>
                                    <Highlight query='Accusé de Réception' styles={{ px: '1', py: '1', bg: 'orange.100' }}>Accusé de Réception</Highlight>
                                </Heading>
                                <HStack pt='4' fontSize='sm' justifyContent={"center"}>
                                    <Button  as='a' target='_blank' variant='solid' href={`https://preview.cardanoscan.io/transaction/${fileInfo.transactionAccuse}`}>
                                        Consulter L'accusé de Réception
                                    </Button>
                                </HStack>
                            </Box>

                            <Box>
                                <Heading size='xs' textTransform='uppercase'>
                                    <Highlight query='Authentique' styles={{ px: '1', py: '1', bg: 'orange.100' }}>Authentique</Highlight>
                                </Heading>
                                <HStack pt='4' fontSize='sm' justifyContent={"center"}>
                                    {fileInfo.isAuthentic ? (
                                        <Badge colorScheme={"green"}>
                                            Le fichier est authentique
                                        </Badge>
                                    ) : (<Badge colorScheme={"red"}>
                                        Le fichier n'est pas authentique
                                    </Badge>)
                                    }
                                </HStack>
                            </Box>

                        </Stack>
                    </CardBody>

                    </Card>

                )}

            </form>
        </Box>
    );
}

export default Check;
