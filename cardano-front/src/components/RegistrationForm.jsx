import { useState } from "react";
import {
    Text,
    Flex,
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Alert,
    AlertIcon,
    useToast,
    HStack,
    useColorModeValue,
    InputGroup, InputRightElement, Heading, Stack, Link,
} from "@chakra-ui/react";
import AuthenticationService from "../services/AuthenticationService.js";
// import { auth } from "../firebase";
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

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
    const [showPassword, setShowPassword] = useState(false);

    const handleAgeValidation = () => {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
            age-=1;
        }
        if (age < 18) {
            setError('You must be at least 18 years old to register.');
            return false;
        }
        return true;
    }
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
        if (handlePasswordValidation()&&handleAgeValidation()) {
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
        }else if(!handlePasswordValidation()){
            setIsError(true);
            toast({
                title: "Error",
                description: error,
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        }else{
            setIsError(true);
            toast({
                title: "Error",
                description: "You must be at least 18 years old to register.",
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        }

    };

    return (
        <Flex
            minH={'fit-content'}
            width={'3xl'}
            align={'center'}
            justify={'center'}
            bg={useColorModeValue('gray.50', 'gray.800')}>
        <Box>
            <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
                <Stack align={'center'}>
                    <Heading fontSize={'4xl'} textAlign={'center'}>
                        Sign up
                    </Heading>
                    <Text fontSize={'lg'} color={'gray.600'}>
                        to enjoy all of our cool features ✌️
                    </Text>
                </Stack>
                <Box
                    rounded={'lg'}
                    bg={useColorModeValue('white', 'gray.700')}
                    boxShadow={'lg'}
                    p={8}>
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
<HStack>
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
</HStack>
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
                <InputGroup>
                    <Input type={showPassword ? 'text' : 'password'}
                           placeholder="Enter your password"
                           value={password}
                           onChange={(event) => setPassword(event.target.value)}
                    />
                    <InputRightElement h={'full'}>
                        <Button
                            variant={'ghost'}
                            onClick={() =>
                                setShowPassword((showPassword) => !showPassword)
                            }>
                            {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <Button mt={4} w={"full"}
                    bg={'blue.400'}
                    color={'white'}
                    _hover={{
                        bg: 'blue.500',
                    }} onClick={handleRegister}>
                Register
            </Button>
                    <Text fontSize={'lg'} color={'gray.600'} mt={8}>
                        Vous avez dejà un compte ?
                        <Link ml={4} color='teal.500' href='/'>
                            Connexion
                        </Link>
                    </Text>
                </Box>
            </Stack>
        </Box>
        </Flex>
    );
};

export default RegistrationForm;
