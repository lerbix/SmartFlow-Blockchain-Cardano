import React from 'react';
import {Box, ChakraProvider, Container} from '@chakra-ui/react';
import FileSentHistory from "../components/Historique/FileSentHistory.jsx";

const History = () => {
    const sampleData = [
        {
            senderEmail: 'expediteur@example.com',
            receiverEmail: 'destinataire@example.com',
            transactionID: '123abc',
            ipfsCID: 'QmExAmPlE',
            dateSent: '2023-05-04 10:00:00',
            receiptAcknowledged: true,
        },
        {
            senderEmail: 'envoyeur@example.com',
            receiverEmail: 'recepteur@example.com',
            transactionID: '456def',
            ipfsCID: 'QmExAmPlE2',
            dateSent: '2023-05-04 11:00:00',
            receiptAcknowledged: false,
        },
    ];

    return (


        <Box  >
            <FileSentHistory data={sampleData} />
        </Box>






    );
};

export default History;
