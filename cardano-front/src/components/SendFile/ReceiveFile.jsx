import {useParams, useSearchParams} from "react-router-dom";
import {Box, Button, Center, Heading, Link, Text, useToast} from "@chakra-ui/react";
import axios from "axios";
import {useEffect, useRef, useState} from "react";

const FileReceiver = () => {

    // localhost:5173/receive-file2?Cid=QmPYtTJzSQZJEFCLgTo1NKc5GsS7ir9frFRfZdQKqiKJ9G&Tx=af0465f610af989dd899a5b6142033dd8f2d3fd754e7799356e70183bbef10e1

    const [searchParams, setSearchParams] = useSearchParams();

    const cid = searchParams.get("Cid");
    const tx = searchParams.get("tx");
    const uuid = searchParams.get('uuid');
    const originaName = searchParams.get('fileName');
    const [downloadLink, setDownloadLink] = useState('');
    const hiddenDownloadLink = useRef(null);
    const toast = useToast();


    // Add a useEffect hook to watch for downloadLink changes
    useEffect(() => {
        // Trigger a click event on the hidden anchor tag only if the download link is set
        if (downloadLink) {
            hiddenDownloadLink.current.click();
            setDownloadLink('');
        }
    }, [downloadLink]);


    console.log(cid);
    console.log(tx);
    const handleFileReceive = () => {

        axios.post('http://localhost:3002/receive-file2', { cid,tx, uuid, originaName,})
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
            <Text textAlign="center" mb={4}>
                CID : {cid}
            </Text>
            <Text textAlign="center" mb={4}>
                Transaction ID : {tx}
            </Text>
            <Text textAlign="center" mb={4}>
                Sender ID : {uuid}
            </Text>
            {/* Add the hidden anchor tag */}
            <a href={downloadLink} ref={hiddenDownloadLink} download style={{ display: 'none' }}></a>

            <Center>
                <Button onClick={handleFileReceive} colorScheme="blue">
                    Recevoir un fichier
                </Button>
            </Center>
        </Box>
    );
};

export default FileReceiver;
