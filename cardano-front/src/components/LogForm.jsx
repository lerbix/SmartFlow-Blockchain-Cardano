import { useState } from 'react';

import {
    FormControl,
    FormLabel,
    Input,
    Button,
    Alert,
    AlertIcon,
} from '@chakra-ui/react';
import AuthenticationService from "../services/AuthenticationService.js";

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');


    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await AuthenticationService.login(email, password);
            window.location.href = "/dashboard";
            console.log('Utilisateur connecté');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <form onSubmit={handleLogin}>
            {error && (
                <Alert status="error" mb="4">
                    <AlertIcon />
                    {error}
                </Alert>
            )}
            <FormControl id="email" isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </FormControl>
            <FormControl id="password" isRequired mt="4">
                <FormLabel>Password</FormLabel>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </FormControl>
            <Button type="submit" colorScheme="blue" mt="4">
                Login
            </Button>
        </form>
    );
};

export default LoginForm;
