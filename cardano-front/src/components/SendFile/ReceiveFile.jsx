import {useParams, useSearchParams} from "react-router-dom";
import {
    Card,
    Box,
    Button,
    Center,
    Spinner,
    Heading,
    Link,
    Text,
    useToast,
    CardHeader,
    StackDivider, CardBody, Stack, Flex, Highlight
} from "@chakra-ui/react";
import axios from "axios";
import React, {useEffect, useRef, useState} from "react";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {doc, getDoc, getFirestore} from "firebase/firestore";
import firebaseConfig from "../../utils/firebaseConfig.js";
import {initializeApp} from "firebase/app";
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const db = getFirestore(app);
const FileReceiver = () => {

    // localhost:5173/receive-file2?Cid=QmPYtTJzSQZJEFCLgTo1NKc5GsS7ir9frFRfZdQKqiKJ9G&Tx=af0465f610af989dd899a5b6142033dd8f2d3fd754e7799356e70183bbef10e1

    const [searchParams, setSearchParams] = useSearchParams();
    const cid = searchParams.get("Cid");
    const tx = searchParams.get("tx");
    const uuidSender = searchParams.get('uuid');
    const originaName = searchParams.get('fileName');
    const [downloadLink, setDownloadLink] = useState('');
    const hiddenDownloadLink = useRef(null);
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);


    // Add a useEffect hook to watch for downloadLink changes
    useEffect(() => {
        // Trigger a click event on the hidden anchor tag only if the download link is set
        if (downloadLink) {
            hiddenDownloadLink.current.click();
            setDownloadLink('');
        }
    }, [downloadLink]);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);


    console.log(cid);
    console.log(tx);


    const handleFileReceive =async () => {
        const user = auth.currentUser;
        const userDocRef = doc(db, "users", user.uid);
        const userDoc =  await getDoc(userDocRef);
        const userData = userDoc.data();
        const walletId=userData.walletId;
        const walletPassphrase=userData.passphrase;



        console.log("walletId: "+walletId);

        setIsLoading(true);
        axios.post('http://localhost:3002/receive-file2', { cid,tx, uuid: user.uid, originaName, uuidSender})
            .then(response => {
                setDownloadLink(`http://localhost:3002/download/${response.data.fileName}`);
                console.log(downloadLink);

                if (response.data.compare){
                    toast({
                        title: response.data.message,
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                    })
                    setIsLoading(false);
                }else {
                    toast({
                        title: response.data.message,
                        status: "warning",
                        duration: 3000,
                        isClosable: true,
                    })
                }


            })
            .catch(error => {
                setIsLoading(false);

                toast({
                    title: 'Accée refusé au fichier',
                    status: "error",
                    duration: 10000,
                    isClosable: true,
                })

            });
    };

    return (
        <div>
            <Heading>Réception du fichier</Heading>
        <Card mt={5}>

            <CardHeader>
                <Heading textAlign="left" mb={4} fontWeight={"semibold"}>
                    Vous avez recu un fichier !
                </Heading>
            </CardHeader>
            <Center>
                {isLoading && <Spinner
                    thickness='4px'
                    speed='0.65s'
                    emptyColor='gray.200'
                    color='blue.500'
                    size='xl'
                />}

            </Center>
            {user && (<>
                <CardBody textAlign="left">
                    <Stack divider={<StackDivider />} spacing='4'>
                        <Box>
                            <Heading size='xs' textTransform='uppercase'>
                                <Highlight query='YOUREMAIL' styles={{ px: '1', py: '1', bg: 'orange.100' }}>YourEmail</Highlight>
                            </Heading>
                            <Text pt='2' fontSize='sm'>
                                {user.email}
                            </Text>
                        </Box>

                        <Box>
                            <Heading size='xs' textTransform='uppercase'>
                                <Highlight query='CID' styles={{ px: '1', py: '1', bg: 'orange.100' }}>CID </Highlight>                           </Heading>
                            <Text pt='2' fontSize='sm'>
                                {cid}
                            </Text>
                        </Box>

                        <Box>
                            <Heading size='xs' textTransform='uppercase'>
                                <Highlight query='Transaction ID' styles={{ px: '1', py: '1', bg: 'orange.100' }}>Transaction ID</Highlight>                            </Heading>
                            <Text pt='2' fontSize='sm'>
                                {tx}
                            </Text>
                        </Box>

                        <Box>
                            <Heading size='xs' textTransform='uppercase'>
                                <Highlight query='Sender ID' styles={{ px: '1', py: '1', bg: 'orange.100' }}> Sender ID </Highlight>
                            </Heading>
                            <Text pt='2' fontSize='sm'>
                                {uuidSender}
                            </Text>
                        </Box>

                    </Stack>
                </CardBody>
            {/* Add the hidden anchor tag */}
                <a href={downloadLink} ref={hiddenDownloadLink} download style={{ display: 'none' }}></a>
            </>)
            }
        </Card>
            <Flex alignItems="center" justifyContent="center">
            <Center>
                <Button onClick={handleFileReceive} colorScheme="blue" mt={5}>
                    {isLoading ? (
                        <Spinner size="sm" mr="2" />
                    ) : (
                        "Recevoir un fichier"
                    )}
                </Button>
            </Center>
            {!isLoading && (
                <Button mt={4} ml={4} colorScheme="gray" onClick={() => window.location.href = "/dashboard"}>
                    Retour
                </Button>
            )}
            </Flex>


    </div>
    );
};

export default FileReceiver;
