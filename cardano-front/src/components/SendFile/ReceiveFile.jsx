import {useParams, useSearchParams} from "react-router-dom";
import {Box, Button, Center, Spinner, Heading, Link, Text, useToast} from "@chakra-ui/react";
import axios from "axios";
import React, {useEffect, useRef, useState} from "react";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {doc, getDoc} from "firebase/firestore";

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

    const handleFileReceive = () => {
        setIsLoading(true);
        axios.post('http://localhost:3002/receive-file2', { cid,tx, uuid: user.uid, originaName,})
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
                // Gestion des erreurs ici
                console.log(error.response);
            });
    };

    return (
        <Box>
            <Center>
                <Heading as="h2" size="lg" mb={4}>
                    Réception du fichier
                </Heading>
            </Center>
            <Text textAlign="center" mb={4}>
                Description du composant de réception du fichier.
            </Text>

            {isLoading && <Spinner
                thickness='4px'
                speed='0.65s'
                emptyColor='gray.200'
                color='blue.500'
                size='xl'
            />}


            {user && (<>
                <Text textAlign="center" mb={4}>
                You : {user.email}
                 </Text>

                <Text textAlign="center" mb={4}>
                CID : {cid}
                </Text>

                <Text textAlign="center" mb={4}>
                Transaction ID : {tx}
                </Text>
                <Text textAlign="center" mb={4}>
                Sender ID : {uuidSender}
                </Text>
            {/* Add the hidden anchor tag */}
                <a href={downloadLink} ref={hiddenDownloadLink} download style={{ display: 'none' }}></a>

                <Center>
                <Button onClick={handleFileReceive} colorScheme="blue">
            {isLoading ? (
                <Spinner size="sm" mr="2" />
                ) : (
                "Recevoir un fichier"
                )}
                </Button>
                </Center>
            </>)
            }
            {!isLoading && (
                <Button mt={4} ml={4} colorScheme="gray" onClick={() => window.location.href = "/dashboard"}>
                    Retour
                </Button>
            )}

        </Box>
    );
};

export default FileReceiver;
