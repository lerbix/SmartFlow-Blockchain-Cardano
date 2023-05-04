import { useState, useEffect } from 'react';
import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    Checkbox,
    Stack,
    Link,
    Button,
    Heading,
    Text,
    useColorModeValue,
    Alert,
    AlertIcon,
    Image,
} from '@chakra-ui/react';
import AuthenticationService from "../services/AuthenticationService.js";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../utils/firebaseConfig.js";
import { getAuth} from "firebase/auth";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);


    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        const storedPassword = localStorage.getItem('password');

        if (storedEmail && storedPassword) {
            setEmail(storedEmail);
            setPassword(storedPassword);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            if (rememberMe) {
                localStorage.setItem('email', email);
                localStorage.setItem('password', password);
            } else {
                localStorage.removeItem('email');
                localStorage.removeItem('password');
            }
            await AuthenticationService.login(email, password);
            window.location.href = "/dashboard";
            console.log('Utilisateur connecté');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Box
                    rounded={'lg'}
                    bg={useColorModeValue('white', 'gray.700')}
                    boxShadow={'lg'}
                    p={8}>
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
                                value={rememberMe && !email ? '' : email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </FormControl>
                        <FormControl id="password" isRequired mt="4">
                            <FormLabel>Password</FormLabel>
                            <Input
                                type="password"
                                value={rememberMe && !password ? '' : password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </FormControl>
                        <Stack  direction={{ base: 'column', sm: 'row' }}
                                align={'start'}
                                justify={'space-between'}>
                            <Checkbox
                                isChecked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            >
                                Remember me
                            </Checkbox>
                            <Link mr={4} href="/forget-password" color={'blue.400'}>Forgot password?</Link>

                        </Stack>
                        <Button w={"full"} type="submit" colorScheme="blue" mt="4">
                            Sign in
                        </Button>
                    </form>
                    <Text fontSize={'lg'} color={'gray.600'} mt={8}>
                        Vous n'avez pas de compte ? {' '}
                        <Link href="/register" color={'blue.400'}>
                            Inscrivez-vous
                        </Link>
                    </Text>
                </Box>

    );
};

export default LoginForm;
