import {Box, Container, Heading, Link, Text} from "@chakra-ui/react";
import RegistrationForm from "../components/RegistrationForm.jsx";

const RegisterPage = () => {
    return (
        <div>
                <Heading as="h1" size="xl" textAlign="center" mb={8}>
                    Inscription
                </Heading>
                <RegistrationForm />
        </div>

    );
};

export default RegisterPage;
