
import React, {useEffect, useState} from 'react';
import {
    Box,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    VStack, HStack, Badge, Progress, Heading, Button, Spinner, useToast, Alert, AlertIcon, AlertTitle, AlertDescription,
} from '@chakra-ui/react';
import {getAuth, onAuthStateChanged} from "firebase/auth";
import axios from "axios";



const WalletInfo = () =>{

    const [isLoading, setIsLoading] = useState(true);
    const [walletInfo, setWalletInfo] = useState(null);
    const [user, setUser] = useState(null);
    const toast = useToast();




    const fetchWalletInfo = async (uid) => {
        setIsLoading(true);
        await axios
            .post('http://localhost:3002/WalletInfo', { uuid: uid })
            .then((response) => {
                console.log('Reponse du Serveur : ');
                console.log(response.data);

                toast({
                    title: 'Réponse du serveur',
                    description: 'Reponse : ' + response.data.message,
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });

                setWalletInfo(response.data.walletData);
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
                toast({
                    title: 'Réponse du serveur',
                    description: 'Reponse : ' + error.response.data.message,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            });
    };


    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                await fetchWalletInfo(user.uid);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);


    const handleRefresh = async () => {

        setIsLoading(true);
        if (user){
            await fetchWalletInfo(user.uid);
            setIsLoading(false);
        }
    }

    return (

        <Box spacing={4} alignItems="start" >
            <Heading fontWeight="bold" alignSelf={'center'}>Wallet Information</Heading>


            {isLoading ? (
                <Spinner
                    my={10}
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="blue.500"
                    size="xl"
                />
            ) : walletInfo ? (
                <>
                    <Table mt={4} size='lg' variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Property</Th>
                                <Th>Value</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td fontWeight="bold">Name : </Td>
                                <Td>
                                    {walletInfo.name}
                                </Td>
                            </Tr>
                            <Tr>
                                <Td fontWeight="bold">Identifiant</Td>
                                <Td>
                                    {walletInfo.id}
                                </Td>
                            </Tr>
                            <Tr>
                                <Td fontWeight="bold">Address pool gap </Td>
                                <Td>
                                    {walletInfo.address_pool_gap}
                                </Td>
                            </Tr>
                            <Tr>
                                <Td fontWeight="bold">Statut</Td>
                                <Td>
                                    <VStack>
                                        <Box>
                                            {walletInfo.state.status === 'syncing' && (
                                                <VStack>
                                                    <Badge colorScheme={"yellow"}>{walletInfo.state.status}</Badge>
                                                    <Text fontSize={'xs'}>{walletInfo.state.progress.quantity} %</Text>
                                                </VStack>

                                            )}

                                            {walletInfo.state.status === 'ready' && (
                                                <VStack>
                                                    <Badge colorScheme={"green"}>{walletInfo.state.status}</Badge>
                                                </VStack>

                                            )}
                                        </Box>
                                    </VStack>
                                </Td>
                            </Tr>

                            <Tr>
                                <Td fontWeight="bold">Balance</Td>
                                <Td>
                                    <VStack alignItems={'start'} >
                                        <Text >
                                            Balence Available :
                                            <Text as={'b'} mx={1}> {walletInfo.balance.available.quantity}</Text>
                                            {walletInfo.balance.available.unit}
                                        </Text>

                                        <Text>
                                            Balence Reward :
                                            <Text as={'b'} mx={1}> {walletInfo.balance.reward.quantity}</Text>
                                            {walletInfo.balance.available.unit}
                                        </Text>

                                        <Text>
                                            Balence Total :
                                            <Text as={'b'} mx={1}> {walletInfo.balance.total.quantity}</Text>
                                            {walletInfo.balance.total.unit}
                                        </Text>
                                    </VStack>
                                </Td>
                            </Tr>

                        </Tbody>
                    </Table>
                    <HStack my={4} spacing={5} justifyContent={'center'} >
                        <Button onClick={()=>window.location.href = "/dashboard"}>
                            Retour
                        </Button>
                        <Button colorScheme={'blue'} onClick={handleRefresh}>
                            Actualiser
                        </Button>
                    </HStack>
                </>
            ) : (
                <VStack my={5} spacing={5}>
                    <Alert status='error' width={500}>
                        <AlertIcon />
                        <AlertTitle>Erreur </AlertTitle>
                        <AlertDescription>Aucune Information Récupéré </AlertDescription>
                    </Alert>

                    <Button onClick={()=>window.location.href = "/dashboard"}>
                        Retour
                    </Button>

                </VStack>
            )}




        </Box>
    );
}

export default WalletInfo;