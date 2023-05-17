import {Box, Card, Container, Heading, Link, Text} from "@chakra-ui/react";
import SendFile from "../components/SendFile/SendFile.jsx";

const SendFilePage = () => {
    return (

        <Container>
            <Box p={4} width={500}>

                <Heading as="h1" size="xl" textAlign="center" mb={8}>
                    Envoie du fichier
                </Heading>
                <Card>
                    <SendFile/>
                </Card>

            </Box>
        </Container>

    );
};

export default SendFilePage;
