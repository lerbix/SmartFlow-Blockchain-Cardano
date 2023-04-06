import { Box, Container, Heading } from "@chakra-ui/react";
import LogForm from "../components/LogForm.jsx";

const RegisterPage = () => {
    return (
        <Box p={4}>
            <Container maxW="md">
                <Heading as="h1" size="xl" textAlign="center" mb={8}>
                    Connexion
                </Heading>
                <LogForm />
            </Container>
        </Box>
    );
};

export default RegisterPage;
