import { Box, Container, Heading } from "@chakra-ui/react";
import RegistrationForm from "../components/RegistrationForm.jsx";

const RegisterPage = () => {
    return (
        <Box p={4}>
            <Container maxW="md">
                <Heading as="h1" size="xl" textAlign="center" mb={8}>
                    Inscription
                </Heading>
                <RegistrationForm />
            </Container>
        </Box>
    );
};

export default RegisterPage;
