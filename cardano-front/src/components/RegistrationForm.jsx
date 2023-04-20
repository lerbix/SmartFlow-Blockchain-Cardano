import { useState } from "react";
import {Box, Button, FormControl, FormLabel, Input, Alert, AlertIcon, useToast} from "@chakra-ui/react";
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
    const toast = useToast();
    const [error, setError] = useState('');

    const handlePasswordValidation = () => {
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }
        if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/.test(password)) {
            setError('Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character');
            return false;
        }
        return true;
    }
    const handleRegister = async (event) => {
        event.preventDefault();
        if (handlePasswordValidation()) {
            try {
                await AuthenticationService.register(email, password, firstName, lastName, birthdate);
                console.log('Utilisateur inscrit');
                window.location.href = "/dashboard";
                setIsSuccess(true);
                setIsError(false);
                toast({
                    title: "Success",
                    description: "Registration successful!",
                    status: "success",
                    duration: 9000,
                    isClosable: true,
                });
            } catch (error) {
                console.log('Failed :  ' + error);
                setIsSuccess(false);
                setIsError(true);
            }
        }else{
            setIsError(true);
            toast({
                title: "Error",
                description: error,
                status: "error",
                duration: 9000,
                isClosable: true,
            });
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
