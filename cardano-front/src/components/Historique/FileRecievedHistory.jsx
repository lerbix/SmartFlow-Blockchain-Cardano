import React, {useEffect, useState} from 'react';

import {
    Box,
    Text,
    Badge,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td, Heading, Link, Button,
} from '@chakra-ui/react';
import {initializeApp} from "firebase/app";
import firebaseConfig from "../../utils/firebaseConfig.js";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {doc,getFirestore} from "firebase/firestore";
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const itemsPerPage = 5; // Nombre d'éléments par page



const FileReceivedHistory = () => {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const [userId, setUserId] = useState(null);
    const handleChangePage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };


    useEffect(() => {
        const fetchFileHistory = async (userEmail) => {
            const fileHistoryRef = collection(db, 'fileHistory');
            const q = query(fileHistoryRef, where('receiverEmail', '==', userEmail));
            const querySnapshot = await getDocs(q);
            const fileHistory = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setData(fileHistory);
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchFileHistory(user.email);
                setUserId(user.uid);
            } else {
                setData([]);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id) => {
        const fileHistoryRef = collection(db, 'fileHistory');
        await deleteDoc(doc(fileHistoryRef, id));
        setData(data.filter((entry) => entry.id !== id));
    };
    function Pagination({ currentPage, totalPages, onChangePage }) {
        const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

        return (
            <Box mt={4}>
                {pageNumbers.map((pageNumber) => (
                    <Text
                        key={pageNumber}
                        display="inline-block"
                        px={2}
                        py={1}
                        mx={1}
                        bg={pageNumber === currentPage ? 'teal.500' : 'gray.200'}
                        color={pageNumber === currentPage ? 'white' : 'black'}
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => onChangePage(pageNumber)}
                    >
                        {pageNumber}
                    </Text>
                ))}
            </Box>
        );
    }

    return (
        <Box w="100%" p={4} borderRadius="md" boxShadow="md" bg="white" overflowX="auto">
            <Heading fontSize="4xl" mb={4}>
                Historique des Fichiers Recus
            </Heading>
            <Text fontSize="md" mb={6}>
                Les fichiers que vous avez Recu
            </Text>

            <Table variant="striped" colorScheme="green" size="md">
                <Thead>
                    <Tr>
                        <Th>Fichier</Th>
                        <Th>From</Th>
                        <Th>Transaction ID</Th>
                        <Th>IPFS CID</Th>
                        <Th>Date et heure d'envoi</Th>
                        <Th>Download</Th>
                        <Th>Supprimer</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {currentItems.map((entry, index) => (
                        <Tr key={index}>
                            <Td>{entry.nomFichier}</Td>
                            <Td>{entry.senderEmail}</Td>
                            <Td>
                                <Link target="_blank" rel="noopener noreferrer" href={`https://preview.cardanoscan.io/transaction/${entry.transactionID}`}>
                                    Consulter
                                </Link>
                            </Td>
                            <Td>
                                <Link target="_blank" rel="noopener noreferrer" href={`https://ipfs.io/ipfs/${entry.ipfsCID}`}>
                                    Consulter
                                </Link>
                            </Td>
                            <Td>{entry.dateSent}</Td>
                            <Td>
                                <Link href={"http://localhost:5173/receive-file2?Cid="+entry.ipfsCID+"&tx="+entry.transactionID+"&uuid="+userId+"&fileName="+entry.nomFichier} isExternal>
                                    <Button colorScheme="green" >Download</Button>
                                </Link>
                            </Td>
                            <Td>
                                <Button colorScheme="red" onClick={() => handleDelete(entry.id)}>
                                    Supprimer
                                </Button>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onChangePage={handleChangePage}
            />

            <Button my={3} onClick={()=>window.location.href = "/dashboard"}>
                Retour DashBoard
            </Button>
        </Box>

    );
};

export default FileReceivedHistory;
