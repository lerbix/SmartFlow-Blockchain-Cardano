import {Box, Container, Heading, Link } from "@chakra-ui/react";
import LogForm  from "../components/LogForm.jsx";

const RegisterPage = () => {
    return (
        <Box p={4} width={500}>
            <Container maxW="md">
                <Heading as="h1" size="xl" textAlign="center" mb={8}>
                    Connexion
                </Heading>
                <LogForm />
                <Box textAlign="center" mt={4}>
                    Pas encore inscrit ?
                    <Link href="/register" color='blue.500'  ml={2}>Créez un compte ici</Link>
                </Box>
            </Container>
        </Box>
    );
};

export default RegisterPage;
