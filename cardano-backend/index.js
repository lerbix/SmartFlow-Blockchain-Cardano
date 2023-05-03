const express = require('express');
const multer = require('multer'); // middleware pour gérer les fichiers
const cors = require('cors'); // middleware pour ajouter les entêtes CORS
const app = express();
const { Seed, WalletServer, AddressWallet} = require('cardano-wallet-js');
const {response} = require("express");
const crypto = require("crypto");
const fs = require("fs");
const admin = require('firebase-admin');
const serviceAccount = require("./key.json");
const ipfsAPI = require ('ipfs-api');
const ipfs = ipfsAPI('127.0.0.1', '5001', {protocol: 'http'});
var nodemailer = require('nodemailer');

// Initialisez Firebase Admin SDK avec vos identifiants Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();


// Middleware pour gérer les fichiers envoyés
const upload = multer({ dest: 'uploads/' });

const walletServer = WalletServer.init('http://localhost:8090/v2');

// Middleware pour ajouter les entêtes CORS
app.use(cors());

// Middleware pour analyser le corps des requêtes en JSON
app.use(express.json());


function extractWalletId(text) {
    const pattern = /(?:id:\s)([a-z0-9]{40})/;
    const match = pattern.exec(text);
    return match ? match[1] : null;
}


async function createOrRestoreWallet(name,passphrase, mnemonic){

    try{
        let mnemonic_sentence = Seed.toMnemonicList(mnemonic);
        let wallet = await walletServer.createOrRestoreShelleyWallet(name,mnemonic_sentence ,passphrase);
        //console.log(wallet);
        // Creation
        let rootKey = Seed.deriveRootKey(mnemonic);
        let privateKey = Seed.deriveKey(rootKey, ['1852H','1815H','0H','0','0']).to_raw_key();
        let accountKey = Seed.deriveAccountKey(rootKey, 0);

        const data = {
            walletId : wallet.id,
            walletName: wallet.name,
            walletState:  wallet.state.status,
            walletAvailableBalance: wallet.getAvailableBalance(),
            walletRewardBalance : wallet.getRewardBalance(),
            walletTotalBalance : wallet.getTotalBalance(),
            walletAddress:await wallet.getAddressAt(0),
            privateKey:  privateKey.to_bech32(),
            accountKey: accountKey.to_bech32(),
        }
        return data;


    }catch (e) {
        if (e.response.status === 409) {
            //let walletServer = WalletServer.init('http://localhost:8090/v2');
            // la wallet existe
            //console.log(e.response.data.message);
            //console.log(extractWalletId(e.response.data.message));
            const idWallet = extractWalletId(e.response.data.message);
            let wallet = await walletServer.getShelleyWallet(idWallet);

            //console.log(wallet);

            // KEY HANDLING
            let rootKey = Seed.deriveRootKey(mnemonic);
            let privateKey = Seed.deriveKey(rootKey, ['1852H','1815H','0H','0','0']).to_raw_key();
            let accountKey = Seed.deriveAccountKey(rootKey, 0);

            const data = {
                walletId : wallet.id,
                walletName: wallet.name,
                walletState: wallet.state.status,
                walletAvailableBalance: wallet.getAvailableBalance(),
                walletRewardBalance : wallet.getRewardBalance(),
                walletTotalBalance : wallet.getTotalBalance(),
                walletAddress: await wallet.getAddressAt(0),
                privateKey: privateKey.to_bech32(),
                accountKey: accountKey.to_bech32(),
            }

            //console.log(data.walletAddress);
            return data;
        }
        throw new Error();
    }








}


function generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048, // Longueur de la clé en bits
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    return { publicKey, privateKey };
}

app.post('/register', async (req, res) => {
    const { userId } = req.body;
    console.log('User Id: ' + userId);

    const keyPair = generateKeyPair();
    const publicKey = keyPair.publicKey;
    const privateKey = keyPair.privateKey;

    // Enregistrer les clés dans Firestore
    const usersRef = admin.firestore().collection('users');

    // Créer un document pour l'utilisateur avec l'ID correspondant
    const userDoc = usersRef.doc(userId);

    // Enregistrer la clé publique
    await userDoc.set({
        publicKey: publicKey
    }, { merge: true });

    // Enregistrer la clé privée (en prenant soin de bien protéger l'accès à cette donnée sensible)
    await userDoc.set({
        privateKey: privateKey
    }, { merge: true });

    // Répondre avec succès
    res.status(200).send('Clés enregistrées avec succès.');
});




// Route pour gérer la connexion au portefeuille
app.post('/walletCli', (req, res) => {
    const {name,passphrase, mnemonic } = req.body;

    console.log(`Nom du portefeuille: ${name}`);
    console.log(`Phrase mnémonique: ${mnemonic}`);
    console.log(`Phrase secrète: ${passphrase}`);

    createOrRestoreWallet(name,passphrase, mnemonic)
        .then((data) => {
            console.log("Creation ou restauration réussie.");
            res.status(200).send(data);
        })
        .catch(error => {
            console.log(`Erreur lors de la création ou de la restauration du portefeuille: ${error}`);
            res.status(500).send({ status: 505 , message: `Erreur lors de la création ou de la restauration du portefeuille: ${error}` });
        });
});



app.post('/send-file', upload.single('file'), async (req, res) => {
    const email = req.body.email;
    const walletId = req.body.walletId;
    const walletPassphrase = req.body.passphrase;
    const file = req.file;


    // ETAPE 1 HASHAGE DU DOCUMENT
    // Calculer le hash du fichier en utilisant la bibliothèque crypto
    const fileStream = fs.createReadStream(file.path);
    // Étape 1 : calculer le hash du document
    const hash = crypto.createHash('sha256');
    fileStream.pipe(hash);
    const calculatedHash = await new Promise((resolve, reject) => {
        hash.on('error', reject);
        hash.on('finish', () => {
            resolve(hash.digest('hex'));
        });
    });
    const hashFile = calculatedHash;
    //console.log('Le hash du fichier est : ' + fileHash);

    // ETAPE 2 : ENVOIE A LA BLOCKCHAIN

    // 2.A Récupérez l'adresse de portefeuille associée au Destinateur dans la collection "users"
    const infoDestinataire = await getInfoDestinataireFromEmail(email);
    console.log("address Wallet Dest : " + infoDestinataire.addressDest);
    console.log("pk Dest :" + infoDestinataire.pkDest);

    // 2.B Send to blockchain


    const senderWallet = await walletServer.getShelleyWallet(walletId);
    const metadata = {
        1: {
            "hash": hashFile,
        }
        // TODO : add or edit metaData
    };



    let receiverAddress = [new AddressWallet(infoDestinataire.addressDest)];
    const amounts = [1000000]; // ADA
    let transaction = await senderWallet.sendPayment(walletPassphrase, receiverAddress, amounts, metadata);
    //let transaction = await senderWallet.getTransaction('af0465f610af989dd899a5b6142033dd8f2d3fd754e7799356e70183bbef10e1');
    console.log(transaction.metadata); //af0465f610af989dd899a5b6142033dd8f2d3fd754e7799356e70183bbef10e1


    // TODO : Chiffrer le fichier avec la clé publique du destinataire
    // TODO : envoie le fichier crypté sur IPFS
    const fileContent = fs.readFileSync(file.path);
    try {
        const fileAdded = await ipfs.add(fileContent);
        console.log(fileAdded);
        const fileHash = await fileAdded[0].hash;
        console.log(`File uploaded to IPFS. CID: ${fileHash}`);
        res.status(200).send({ hash: fileHash });


        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'bkl.abdel7@gmail.com',
                pass: '********'
            }
        });

        var mailOptions = {
            from: 'bkl.abdel7@gmail.com',
            to: 'abderrahmanebkl48@gmail.com',
            subject: 'File uploaded to IPFS',
            html: `<p>Dear user,</p><p>The file you uploaded to our system is now available for download via IPFS. Please click on the link below to download the file:</p><p><a href="https://gateway.ipfs.io/ipfs/${fileHash}">Download File</a></p><p>Thank you for using our service!</p>`
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    } catch (error) {
        console.error('Error uploading file to IPFS:', error);
        res.status(500).send('Error uploading file to IPFS');
    }
});

//Recieve file Part
app.post('/decrypt-file',upload.none(), async (req, res) => {
    console.log(req.body);
    const { cid, privateKey } = req.body;

    // do something with the CID here
    console.log(`Received CID: `+cid);
    console.log(`Received PrivateKey: `+privateKey);

    // send a response back to the frontend
    res.send({ message: 'CID and privateKey received successfully' });

    //TODO Download the ECRYPTED file from IPFS

    const fileHash = 'Qmc3KPq3to4wmzGgt24K6swnQ9Xtmzi56kGPxfQig7fKiV';
    /*
    ipfs.files.get(fileHash, function (err, files) {
        files.forEach((file) => {
            console.log(file.path)
            console.log("File content >> ",file.content.toString('utf8'))
        })
    })
     */
    const encryptedFile = await getFileFromIPFS(fileHash);
    console.log(encryptedFile);
    //TODO Decrypt the file using the private key of the receiver
    //const decryptedFile = decryptFile(encryptedFile, privateKey);
    //TODO HASH the file
    /*
    const hashedFile = hashFile(decryptedFile);
    console.log(hashedFile);
     */
    //TODO compare the hashes
    /*
    const originalHash = 'abc123';
    const match = (hashedFile === originalHash);
    */
    //TODO Accusé de reception
     /*
    if (match) {
        console.log('File received and verified.');
    } else {
        console.log('Error: File hash does not match.');
    }
*/

});

function getFileFromIPFS(fileHash) {
    return new Promise((resolve, reject) => {
        ipfs.files.get(fileHash, function (err, files) {
            if (err) {
                reject(err);
            } else {
                files.forEach((file) => {
                    console.log(file.path)
                    console.log("File content >> ",file.content.toString('utf8'))
                    resolve(file.content.toString('utf8'));
                });
            }
        });
    });
}

function decryptFile(encryptedFile, privateKey) {
    // TODO: implement file decryption
    return decryptedFile;
}

function hashFile(file) {
    const hash = crypto.createHash('sha256');
    hash.update(file);
    return hash.digest('hex');
}
async function getInfoDestinataireFromEmail(email){
    const userRecord = await admin.auth().getUserByEmail(email);
    const usersRef = admin.firestore().collection('users');
    const query = usersRef.where('email', '==', userRecord.email).limit(1);
    const userDocs = await query.get();
    if (userDocs.empty) {
        console.log('Aucun utilisateur trouvé avec l\'email spécifié');
        return null;
    } else {
        const userDoc = userDocs.docs[0];
        const dataDest = {
            addressDest: userDoc.get('walletAddress'),
            pkDest : userDoc.get('publicKey'),
        }
        //console.log(dataDest);
        //console.log(`Adresse de portefeuille de destinataire : ${dataDest.addressDest}`);
        //console.log(`Clé de public de destinataire : ${userDoc.get(dataDest.pkDest)}`);
        return dataDest;
    }
}





app.listen(3002, () => {
    console.log('Serveur démarré sur le port 3002!');
});
