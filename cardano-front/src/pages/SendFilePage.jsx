import {Box, Container, Heading, Link, Text} from "@chakra-ui/react";
import RegistrationForm from "../components/RegistrationForm.jsx";
import SendFileForm from "../../../scripts/SendFileForm.jsx";

const SendFilePage = () => {
    return (
        <Box p={4} width={500}>
            <Container maxW="md">
                <Heading as="h1" size="xl" textAlign="center" mb={8}>
                    Envoie du fichier
                </Heading>
                <SendFileForm/>

            </Container>
        </Box>
    );
};

export default SendFilePage;
