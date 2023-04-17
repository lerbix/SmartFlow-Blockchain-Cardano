import { useState } from "react";
import {
    FormControl,
    FormLabel,
    Input,
    Button,
    Stack,
    Text,
    Heading,
    Divider,
    useToast, Box, Table, Tbody, Tr, Td, HStack, Badge, Code, VStack,
} from "@chakra-ui/react";
import axios from 'axios';
import {initializeApp} from "firebase/app";
import firebaseConfig from "../utils/firebaseConfig.js";
import {getAuth} from "firebase/auth";
import {doc, getDoc, getFirestore, updateDoc} from "firebase/firestore";


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);





const WalletConnectorCli = () => {
    const [walletData, setWalletData] = useState(null);
    const [name, setName] = useState("");
    const [mnemonic, setMnemonic] = useState("");
    const [passphrase, setPassphrase] = useState("");
    const toast = useToast();

    const handleConnectWallet = () => {
        // Envoi des données au backend
        axios.post('http://localhost:3002/walletCli', { name,passphrase, mnemonic, })
            .then(response => {
                // Traitement de la réponse du backend ici
                toast({
                    title: "Portefeuille connecté avec succès.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                setWalletData(response.data);
            })
            .catch(error => {
                // Gestion des erreurs ici
                console.log(error.response);
                toast({
                    title: "Erreur lors de la connexion au portefeuille.",
                    description: `Type d'erreur: ${error.response.data.status}, Message d'erreur: ${error.response.data.message}`,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            });
    };


    const saveWalletInfo = async () => {
        const user = auth.currentUser;
        if (!user) {
            return;
        }

        try {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                walletId: walletData.walletId,
                walletAddress: walletData.walletAddress.id,
                publicKey: walletData.accountKey,

            });
            console.log("user modified ! ");
        } catch (error) {
            console.log(error);
        }

    };



    return (
        <Stack spacing={8} mx="auto" mt={8} maxW="lg" py={12} px={6}>
            <Heading textAlign="center">Connectez ou créez votre portefeuille</Heading>
            <Divider />
            <Stack spacing={6}>

                <FormControl id="name">
                    <FormLabel>Nom du portefeuille</FormLabel>
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Entrez le nom de votre portefeuille"
                    />
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


                <FormControl id="mnemonic">
                    <FormLabel>Phrase mnémonique</FormLabel>
                    <Input
                        type="text"
                        value={mnemonic}
                        onChange={(e) => setMnemonic(e.target.value)}
                        placeholder="Entrez votre phrase mnémonique"
                    />
                    <Text fontSize="sm">
                        La phrase mnémonique est une série de 12 à 24 mots utilisée pour
                        restaurer votre portefeuille en cas de perte de vos clés privées.
                    </Text>
                </FormControl>
                <HStack spacing={3} direction={["column", "row"]}>
                    <Button w={"full"} colorScheme="blue" onClick={handleConnectWallet}>
                        Se connecter au portefeuille
                    </Button>
                    <Button  colorScheme="gray" onClick={()=> window.location.href ="/dashboard"}>
                        retour
                    </Button>
                </HStack>
                {walletData && (
                    <Box>
                        <Heading size="md">Informations du portefeuille:</Heading>
                        <Stack spacing={4} mt={4}>
                            <Box>
                                <Text fontWeight="bold">Nom du Wallet :</Text>
                                <Text>{walletData.walletName}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Status :</Text>
                                <Text>{walletData.walletState}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Wallet Available Balance :</Text>
                                <Text>{walletData.walletAvailableBalance}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Wallet Reward Balance :</Text>
                                <Text>{walletData.walletRewardBalance}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Wallet Total Balance :</Text>
                                <Text>{walletData.walletTotalBalance}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Wallet Address  :</Text>
                                <Text >{walletData.walletAddress.id}</Text>
                                <Text >State : {walletData.walletAddress.state}</Text>
                            </Box>

                            <Box>
                                <Text fontWeight="bold">Private Key  :</Text>
                                <Text >{walletData.privateKey}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Account Key  :</Text>
                                <Text >{walletData.accountKey}</Text>
                            </Box>

                        </Stack>
                        <Button my={4} onClick={saveWalletInfo} colorScheme={"yellow"} >Link to informations to account</Button>
                    </Box>

                )}
            </Stack>
        </Stack>
    );
};

export default WalletConnectorCli;
