import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import {
    Box,
    Button, Card, Container,
    FormControl,
    FormLabel, Heading,
    Input,
    Text,
} from "@chakra-ui/react";
import firebaseConfig from "../utils/firebaseConfig.js";
const app = initializeApp(firebaseConfig);

function ResetPasswordForm() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    function resetPassword() {
        const auth = getAuth();

        sendPasswordResetEmail(auth, email)
            .then(() => {
                // Password reset email sent!
                setMessage(
                    "Un email de réinitialisation de mot de passe a été envoyé à votre adresse email."
                );
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setMessage(`Erreur : ${errorCode} - ${errorMessage}`);
            });
    }

    return (
        <Container>
            <Box><Heading as="h1" size="xl" textAlign="center" mb={8}>
                Réinitialisation de mot de passe
            </Heading>
           <Card>
        <Box maxW="md" mx="auto" p={4}>
            <FormControl>
                <FormLabel>Email :</FormLabel>
                <Input
                    type="email"
                    placeholder="Entrez votre adresse email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </FormControl>
            <Button mt={4} onClick={resetPassword}>
                Réinitialiser votre mot de passe
            </Button>
            {message && <Text mt={4}>{message}</Text>
            }
        </Box>
           </Card>
            </Box>
        </Container>
    );
}

export default ResetPasswordForm;
