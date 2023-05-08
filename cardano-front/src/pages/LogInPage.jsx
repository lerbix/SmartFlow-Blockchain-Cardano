import {Box, Container, Heading, Link } from "@chakra-ui/react";
import LogForm  from "../components/LogForm.jsx";

const RegisterPage = () => {
    return (
       <div>
                <Heading as="h1" size="xl" textAlign="center" mb={8}>
                    Connexion
                </Heading>
                <LogForm />
       </div>
    );
};

export default RegisterPage;
