import { useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Alert, AlertIcon } from "@chakra-ui/react";
import AuthenticationService from "../services/AuthenticationService.js";
// import { auth } from "../firebase";

const RegistrationForm = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);

    const handleRegister = async (event) => {
        event.preventDefault();
        try {
            await AuthenticationService.register(email, password, firstName, lastName, birthdate);
            console.log('Utilisateur inscrit');
            window.location.href = "/dashboard";
            setIsSuccess(true);
            setIsError(false);
        } catch (error) {
            console.log('Failed :  ' + error );
            setIsSuccess(false);
            setIsError(true);
        }
    };

    return (
        <Box>
            {isSuccess && (
                <Alert status="success" mb={4}>
                    <AlertIcon />
                    Inscription réussie !
                </Alert>
            )}
            {isError && (
                <Alert status="error" mb={4}>
                    <AlertIcon />
                    Une erreur est survenue, veuillez réessayer.
                </Alert>
            )}

            <FormControl id="firstName" isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                />
            </FormControl>

            <FormControl id="lastName" isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                />
            </FormControl>

            <FormControl id="birthdate" isRequired>
                <FormLabel>Date of Birth</FormLabel>
                <Input
                    type="date"
                    placeholder="Enter your date of birth"
                    value={birthdate}
                    onChange={(event) => setBirthdate(event.target.value)}
                />
            </FormControl>

            <FormControl id="email" isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </FormControl>

            <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
            </FormControl>
            <Button mt={4} w={"full"} colorScheme="teal" onClick={handleRegister}>
                Register
            </Button>
        </Box>
    );
};

export default RegistrationForm;
