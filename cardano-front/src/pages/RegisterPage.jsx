import {Box, Container, Heading, Link, Text} from "@chakra-ui/react";
import RegistrationForm from "../components/RegistrationForm.jsx";

const RegisterPage = () => {
    return (
        <Box p={4} width={500}>
            <Container maxW="md">
                <Heading as="h1" size="xl" textAlign="center" mb={8}>
                    Inscription
                </Heading>
                <RegistrationForm />
                <Text m={4}>
                    Vous avez dejà un compte ?
                    <Link ml={4} color='teal.500' href='/'>
                        Connexion
                    </Link>
                </Text>
            </Container>
        </Box>
    );
};

export default RegisterPage;
