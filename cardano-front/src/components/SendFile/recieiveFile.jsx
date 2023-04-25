import React, { useState } from "react";
import {Input, Button, FormLabel} from "@chakra-ui/react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";

const MyComponent = () => {
    const [cid, setCid] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const toast = useToast();

    const handleCidChange = (event) => {
        setCid(event.target.value);
    };
    const handlePrivateKey = (event) => {
        setPrivateKey(event.target.value);
    };
    const handleSubmit = async () => {
        if (!cid || !privateKey) {
            // Show an error message if either field is empty
            toast({
                title: "Error",
                description: "Please enter both the CID and private key.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        const formData = new FormData();
        formData.append("cid", cid);
        formData.append("privateKey", privateKey);

        console.log(cid);
        console.log(privateKey);


        try {
            const response = await axios.post(
                "http://localhost:3002/decrypt-file",
                formData
            );
            console.log(response.data.message);

            // Show a success message to the user
            toast({
                title: "File decrypted",
                description: "The file has been decrypted successfully!",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error(error);

            // Show an error message to the user
            toast({
                title: "Error decrypting file",
                description: "There was an error decrypting the file.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Box maxW="md" mx="auto" mt="8">
            <Card>
                <CardHeader textAlign="center" fontWeight="bold">
                    Decrypt File
                </CardHeader>
                <CardBody>
                    <FormLabel>CID :</FormLabel>
                    <Input value={cid} onChange={handleCidChange} />
                    <FormLabel mt={4}>Private Key:</FormLabel>
                    <Input value={privateKey} onChange={handlePrivateKey} />
                    <Button mt={4} onClick={handleSubmit} isFullWidth>
                        Get Document from IPFS
                    </Button>
                </CardBody>
            </Card>
        </Box>
    );
};

export default MyComponent;
