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


const Blockfrost = require("@blockfrost/blockfrost-js");
const path = require("path");
const API = new Blockfrost.BlockFrostAPI({
    projectId: "previewD2Ua5jbVMR9r8Y2faeJuaRYvyqKCy9ko", // see: https://blockfrost.io
});



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
        let rootKey = Seed.deriveRootKey(mnemonic);
        let privateKey = Seed.deriveKey(rootKey, ['1852H','1815H','0H','0','0']).to_raw_key();
        let accountKey = Seed.deriveAccountKey(rootKey, 0);



        const data = {
            walletId : wallet.id,
            walletName: wallet.name,
            walletState:await  wallet.state.status,
            walletAvailableBalance: wallet.getAvailableBalance(),
            walletRewardBalance : wallet.getRewardBalance(),
            walletTotalBalance : wallet.getTotalBalance(),
            walletAddress:await wallet.getAddressAt(0),
            privateKey:  privateKey.to_bech32(),
            publicKey: accountKey.to_bech32(),
        }

        console.log(data);
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
                walletState:await wallet.state.status,
                walletAvailableBalance: wallet.getAvailableBalance(),
                walletRewardBalance : wallet.getRewardBalance(),
                walletTotalBalance : wallet.getTotalBalance(),
                walletAddress: await wallet.getAddressAt(0),
                privateKey: privateKey.to_bech32(),
                publicKey: accountKey.to_bech32(),
            }

            console.log("deja : ");
            console.log(data);

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



app.post('/send-file2', (req, res) => {
    let data = {
        0: 'hello',
        1: Buffer.from('2512a00e9653fe49a44a5886202e24d77eeb998f', 'hex'),
        4: [1, 2, {0: true}],
        5: {
            'key': null,
            'l': [3, true, {}]
        },
        6: undefined
    };

    let metadata = Seed.buildTransactionMetadata(data);

    console.log(metadata.metadata());

    res.status(200).send({ hash: metadata.metadata() });




});


function generateRandomKey() {
    return crypto.randomBytes(32); // 256-bit key for AES-256
}

function encryptFile(inputPath, publicKey) {
    const data = fs.readFileSync(inputPath);

    const symmetricKey = generateRandomKey();
    const cipher = crypto.createCipheriv('aes-256-cbc', symmetricKey, Buffer.alloc(16, 0));
    const encryptedData = Buffer.concat([cipher.update(data), cipher.final()]);

    const encryptedSymmetricKey = crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    }, symmetricKey);

    const extBuffer = Buffer.from(path.extname(inputPath), 'utf8');
    const extSizeBuffer = Buffer.alloc(2);
    extSizeBuffer.writeUInt16BE(extBuffer.length, 0);

    const outputPath = inputPath.replace(/\.[^/.]+$/, "") + ".encrypted.bin";
    fs.writeFileSync(outputPath, Buffer.concat([extSizeBuffer, extBuffer, encryptedSymmetricKey, encryptedData]));
    return outputPath;
}

app.post('/send-file', upload.single('file'), async (req, res) => {
    const emailReceiver = req.body.emailReceiver;
    const walletId = req.body.walletId;
    const walletPassphrase = req.body.passphrase;
    const senderUserId = req.body.userId;
    const senderEmail = req.body.senderEmail;



    const file = req.file;
    const {originalname} = file;
    console.log("userId : "+senderUserId);

    let isHashSucces = false;
    //let isCryptSucces = false;


    // --------------------------- ETAPE 1 -------------------------------- //
    // --------------------------- Hash   -------------------------------- //

    // Calculer le hash du fichier en utilisant la bibliothèque crypto

    try {

    const hashFile = await hashFromFile(file.path).then(res=>{
        isHashSucces = true;
        console.log('Le hash du fichier est : ' + res);
        return res;
    }).catch(err => {
        isHashSucces = false;
        console.log('Erreur lors du hash du document');
    });



    // --------------------------- ETAPE 2 -------------------------------- //
    // --------------------------- Crypter le document   -------------------------------- //


    const dataUser = await getInfoDestinataireFromEmail(emailReceiver).then(res => {
        console.log('Information recupérées : (Public Key)');
        return  res;
    }).catch(err => {
        console.log('Erreur : Information non recuperé (Public Key)');
        throw Error('Erreur : Information non recuperé (Public Key)');
    });


    console.log(dataUser);

    const publicKeyRecv = dataUser.publicKey;
    const encryptedFilePath = encryptFile(file.path, publicKeyRecv);
    console.log(`Fichier chiffré : ${encryptedFilePath}`);




    // --------------------------- ETAPE 3 -------------------------------- //
    // --------------------------- Envoie à la blockchain le hash   -------------------------------- //




    // ETAPE 2 : ENVOIE A LA BLOCKCHAIN

    let wallet = await walletServer.getShelleyWallet(walletId);
        let currentTime = new Date().toISOString();
        let tx = await sendToBlockChain2(wallet, walletPassphrase, hashFile, currentTime).then((result )=>{
        console.log("Envoie à la blockchain reussie !" );
        console.log("tx : " + result.id);
        return result.id;
    }).catch(e => {
        console.log('Erreur lors de Envoie à la blockChain');
        throw new Error("Erreur lors de l'envoie à la blockChain");
    });





    // --------------------------- ETAPE 4  -------------------------------- //
    // --------------------------- envoie à ipfs   -------------------------------- //



       const fileContent = fs.readFileSync(encryptedFilePath);

           const fileAdded = await ipfs.add(fileContent);
           console.log(fileAdded);
           const CID = await fileAdded[0].hash;
           console.log(`File uploaded to IPFS. CID: ${CID}`);





           const link = 'http://localhost:5173/receive-file2?Cid='+CID+'&tx='+tx+'&uuid='+senderUserId+'&fileName='+originalname;
           console.log(link);


           var transporter = nodemailer.createTransport({
               service: 'gmail',
               auth: {
                   user: 'bkl.abdel7@gmail.com',
                   pass: 'pwsyqofnulgyztme'
               }
           });

           var mailOptions = {
               from: 'bkl.abdel7@gmail.com',
               to: emailReceiver,
               subject: 'File uploaded to IPFS',
               html: `<p>Dear user,</p><p>The file you uploaded to our system is now available for download via IPFS. Please click on the link below to download the file:</p><p><a href="https://gateway.ipfs.io/ipfs/${CID}">Download File</a></p><p>Thank you for using our service!</p>`
           };




        let emailSucces = await transporter.sendMail(mailOptions).then(res => {
            return true;
        }).catch(err => {
            return false;
        });




        // Stocker les informations dans Firebase:
        const date = new Date();

        const FileHistory =
            {

                senderEmail: senderEmail,
                receiverEmail: emailReceiver,
                transactionID: tx,
                ipfsCID: CID,
                nomFichier : originalname,
                dateSent: date.toISOString(),
                receiptAcknowledged: false,
            };


        await storeFileHistory(FileHistory);




        res.status(200).send({
            CID: CID,
            tx : tx,
            emailSucces : emailSucces,
        });


       } catch (error) {
        console.log('Envoie du fichier échoué')
        res.status(500).send({message: error.message});
       }

});

const storeFileHistory = async (fileHistory) => {
    try {
        const fileHistoryRef = admin.firestore().collection('fileHistory');
        const docRef = await fileHistoryRef.add(fileHistory);
        console.log('Document written with ID:', docRef.id);
    } catch (error) {
        console.error('Error adding document:', error);
    }
};


//Recieve file Part
app.post('/receive-file2',upload.none(), async (req, res) => {
    const { cid, tx, uuid, originaName} = req.body;

    console.log(req.body);
    // do something with the CID here
    console.log(`Received CID: `+cid);
    console.log(`Received TX : `+ tx);
    console.log(`Received uuid : `+ uuid);
    console.log(`Received fileName : `+ originaName);
    //console.log('wallet passphrase: '+walletPassphrase);





    // Récuperation du Hash de la blockChain
    let hashFromBlockChain = await getMetaDataFromTx(tx)
        .then(res => {
            console.log('Received Hash From BlockChain : ' + res)
            return res;
        })
        .catch(err => {
            console.log('Erreur lors de la récupération des métadonnées de la transaction' + err)
        });





    // Téléchargez le fichier à partir d'IPFS
    const fileFromIPFS =  await getFileFromIPFS2(cid);


    // Decrypter

    const privateKey = await getInfoDestinataireFromUUID(uuid).then(res => {
        console.log('Recuperation des informations reussies (private Key )');
        return res.privateKey;
    }).catch(err => console.log('erreur lors de la recuperation '));

    // Déchiffrer le fichier
    const decryptedFilePath = decryptFile(fileFromIPFS, privateKey);

    // Save the decrypted file temporarily
    const fileName = originaName;
    fs.writeFileSync(path.join(__dirname, fileName), decryptedFilePath);




    // Hash du fichier de IPFS
    const hashFileFromIPFS = await hashFromFile(fileName);
    console.log('Hash du fichier IPFS : ' +  hashFileFromIPFS);


    // Comparer les Hashs
    if (compareHashes(hashFromBlockChain, hashFileFromIPFS)){
       // Enregistrer les clés dans Firestore
        const usersRef = admin.firestore().collection('users');

        // Créer un document pour l'utilisateur avec l'ID correspondant
        const userDocRef = usersRef.doc(uuid);
        const userDocSnapshot = await userDocRef.get();

        // Récuperation du Hash de la blockChain
        let dateFromBlockChain = await getMetaDataFromTx2(tx)
            .then(res => {
                console.log('Received dateSent From BlockChain : ' + res)
                return res;
            })
            .catch(err => {
                console.log('Erreur lors de la récupération des métadonnées de la transaction' + err)
            });

        //ENVOIE A LA BLOCKCHAIN




        /*
        const message='The file you uploaded has been reccd eived';
        let currentTime = new Date().toISOString();
        let txre = await sendToBlockChain3(wallet, walletPassphrase, message, currentTime,dateFromBlockChain).then((result )=>{
            console.log("Envoie à la blockchain reussie !" );
            console.log("tx : " + result.id);
            return result.id;
        }).catch(e => {
            console.log('Erreur lors de Envoie à la blockChain');
            throw new Error("Erreur lors de l'envoie à la blockChain");
        });
         */


        const mnemonic="payment pear mammal youth ivory upgrade slush razor eye ghost swift maximum oxygen symptom fiscal network powder someone glue trend world alley mouse odor";
        let mnemonic_sentence = Seed.toMnemonicList(mnemonic);

        let txre = await sendToBlockChain1(wallet, mnemonic_sentence, message,tx ).then((result )=>{
            console.log("Envoie à la blockchain reussie !" );
            console.log("txre : " + result);
            return result;
        }).catch(e => {
            console.log('Erreur lors de Envoie à la blockChain');
            throw new Error("Erreur lors de l'envoie à la blockChain");
        });





        const userEmail = userDocSnapshot.data().email;
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'bkl.abdel7@gmail.com',
                pass: 'pwsyqofnulgyztme'
            }
        });
        var mailOptions = {
            from: 'bkl.abdel7@gmail.com',
            to: userEmail,
            subject: 'Accusé de récéption',
            html: `<p>Dear User This is to inform you that the file you uploaded to our system has been received by the receiver.</p><p>The transaction ID is:{$txre} </p>`
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });




        // Accusé de reception :
        await setAccuseTrue(tx);



        res.status(200).send({
            compare: true ,
            message: "Les identifiants sont identiques",
            fileName: fileName
        });

    }else {
        res.status(200).send({ compare: false ,message: "Les identifiants sont différents", fileName:fileName});
    }


});

// Create a new route for serving the file
app.get('/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, fileName);

    res.download(filePath, fileName, (err) => {
        if (err) {
            console.log(err);
        } else {
            // Delete the file after it's been downloaded
            fs.unlinkSync(filePath);
        }
    });
});

app.post('/WalletInfo',async (req, res) => {
    const {uuid} = req.body;
    console.log('Walet Info : ');
    console.log('Received uid : ' + uuid);
x
    try {
        const walletId = await getInfoDestinataireFromUUID(uuid)
            .then((res)=>{
                return res.walletId;
            }).catch(err => {
                console.log("Erreur lors de la recuperation de la walletID");
                throw Error('Wallet Not Connected ');
            });


        const wallet = await walletServer.getShelleyWallet(walletId).then(res => {
            return res;
        }).catch(err => {
            console.log("Erreur lors de la recuperation de la wallet");
            throw Error('Wallet Not Found ');
        });

        const walletdAddress = await wallet.getAddressAt(0);

        const dataToSend = {
            id : wallet.id,
            address_pool_gap : wallet.address_pool_gap,
            balance : wallet.balance,
            name : wallet.name,
            state : wallet.state,
            walletdAddress : walletdAddress,
        }
        res.status(200).send({
            message: 'Information Récupérés avec succes',
            walletData : dataToSend,
        });
        console.log('informations du Wallet récupérés et transmises');
    }catch (e) {
        res.status(500).send({
            message : e.message,
        })

    }


});



app.post('/check-file', upload.single('file'), async (req, res) => {




    const file = req.file;
    const {originalname} = file;
    console.log("FileName : "+originalname);

    let isHashSucces = false;
    //let isCryptSucces = false;


    // --------------------------- ETAPE 1 -------------------------------- //
    // --------------------------- Hash   -------------------------------- //

    // Calculer le hash du fichier en utilisant la bibliothèque crypto

    try {
        const hashFile = await hashFromFile(file.path).then(res=>{
            isHashSucces = true;
            console.log('Le hash du fichier est : ' + res);
            return res;
        }).catch(err => {
            isHashSucces = false;
            console.log('Erreur lors du hash du document');
        });
        const transactionId = await checkHashExists(originalname);
        console.log('Transaction ID:', transactionId);
        const hashFileblock =await getMetaDataFromTx(transactionId);
        console.log("the hash of the file from the blockChain is: "+hashFileblock);

        if(compareHashes(hashFileblock,hashFile)){
            res.status(200).send({
                message: 'Le document est authentique',
                hashduFichier : hashFile,
            });
        }else{
            console.log("Le document n'est pas authentique");
            res.status(500).send({message: "Le document n'est pas authentique"});
        }

    } catch (error) {
        console.log('Envoie du fichier échoué')
        res.status(500).send({message: error.message});
    }

});


function decryptFile(inputData, privateKey) {
    const extSize = inputData.readUInt16BE(0);
    const extBuffer = inputData.slice(2, 2 + extSize);
    const fileExt = extBuffer.toString('utf8');

    const encryptedSymmetricKey = inputData.slice(2 + extSize, 2 + extSize + 256);
    const encryptedData = inputData.slice(2 + extSize + 256);

    const symmetricKey = crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    }, encryptedSymmetricKey);

    const decipher = crypto.createDecipheriv('aes-256-cbc', symmetricKey, Buffer.alloc(16, 0));
    const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    const outputBuffer = Buffer.concat([extBuffer, decryptedData]);

    return outputBuffer;
}




async function getTransactionDetails(tx){
    const data = await API.txs(tx);
    console.log(data);
}

async function getMetaDataFromTx(tx){
        const metadata = await API.txsMetadata(tx);
        let  {json_metadata} = metadata[0];
        const hashFile = json_metadata;
        return hashFile;
}

async function getMetaDataFromTx2(tx){
    const metadata = await API.txsMetadata(tx);
    let  {json_metadata} = metadata[1];
    const datesent = json_metadata;
    return datesent;
}

async function getFileFromIPFS2(cid) {
    try {
        // Utilise la méthode "cat" de l'API IPFS pour récupérer le fichier à partir du CID
        const fileData = await ipfs.cat(cid);
        // Convertit les données du fichier en une chaîne de caractères (ou autre format selon vos besoins)
        //const fileContent = fileData.toString();
        // Renvoie le contenu du fichier
        return fileData;
    } catch (error) {
        // En cas d'erreur, vous pouvez gérer le cas ici
        console.error('Une erreur s\'est produite lors de la récupération du fichier depuis IPFS:', error);
        throw error;
    }
}
function compareHashes(hash1, hash2) {
    if (hash1 === hash2) {
        console.log('Les hachages sont identiques.');
        return true
    } else {
        console.log('Les hachages sont différents.');
        return false;
    }
}

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



async function  hashFromFile(file) {
    const fileStream = fs.createReadStream(file);
    const hash = crypto.createHash('sha256');
    fileStream.pipe(hash);
    const calculatedHash = await new Promise((resolve, reject) => {
        hash.on('error', reject);
        hash.on('finish', () => {
            resolve(hash.digest('hex'));
        });
    });
    const hashFile = calculatedHash;
   return hashFile;
}


async function setAccuseTrue(transactionID) {
    const fileHistoryRef = admin.firestore().collection('fileHistory');

    const querySnapshot = await fileHistoryRef.where('transactionID', '==', transactionID).get();

    if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
            await doc.ref.update({ receiptAcknowledged: true });
        });

        console.log("Champ receiptAcknowledged mis à jour avec succès pour les documents correspondants !");
    } else {
        console.log("Aucun document trouvé avec l'ID de transaction spécifié.");
    }
}


async function getInfoDestinataireFromUUID(uuid){
    const userRecord = await admin.auth().getUser(uuid);
    const usersRef = admin.firestore().collection('users');
    const query = usersRef.where('email', '==', userRecord.email).limit(1);
    const userDocs = await query.get();
    if (userDocs.empty) {
        console.log('Aucun utilisateur trouvé avec l\'email spécifié');
        return null;
    } else {
        const userDoc = userDocs.docs[0];
        const dataDest = {
            uuid: userRecord.uid,
            addressDest: userDoc.get('walletAddress'),
            publicKey : userDoc.get('publicKey'),
            privateKey: userDoc.get('privateKey'),
            walletId : userDoc.get('walletId'),
        }
        //console.log(dataDest);
        //console.log(`Adresse de portefeuille de destinataire : ${dataDest.addressDest}`);
        //console.log(`Clé de public de destinataire : ${userDoc.get(dataDest.pkDest)}`);
        return dataDest;
    }
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
        console.log(userRecord);
        const dataDest = {
            uuid: userRecord.uid,
            addressDest: userDoc.get('walletAddress'),
            publicKey : userDoc.get('publicKey'),
            privateKey: userDoc.get('privateKey')
        }
        //console.log(dataDest);
        //console.log(`Adresse de portefeuille de destinataire : ${dataDest.addressDest}`);
        //console.log(`Clé de public de destinataire : ${userDoc.get(dataDest.pkDest)}`);
        return dataDest;
    }
}



async function sendToBlockChain1(wallet, recoveryPhrase, message, transaction){


    // get first unused wallet's address
    let addresses = (await wallet.getUnusedAddresses()).slice(0, 1);
    let amounts = [1000000];
    // console.log(addresses);

    // get ttl
    let info = await walletServer.getNetworkInformation();
    let ttl = info.node_tip.absolute_slot_number * 12000;

    let currentTime = new Date().toISOString();
    // you can include metadata
    let data = {
        0: message,
        1: currentTime,
        2: transaction,
    };


    // get the tx structure with all the necessary components (inputs, outputs, change, etc).
    let coinSelection = await wallet.getCoinSelection(addresses, amounts, data);


    // get the signing keys (can be offline)
    let rootKey = Seed.deriveRootKey(recoveryPhrase);
    let signingKeys = coinSelection.inputs.map(i => {
        let privateKey = Seed.deriveKey(rootKey, i.derivation_path).to_raw_key();
        return privateKey;
    });


    // include the metadata in the build and sign process
    let metadata = Seed.buildTransactionMetadata(data);
    //console.log(metadata);
    let txBuild = Seed.buildTransaction(coinSelection, ttl, {metadata: metadata});
    //console.log(txBuild);
    let txBody = Seed.sign(txBuild, signingKeys, metadata);
    //console.log(txBody);
    // submit the tx into the blockchain
    let signed = Buffer.from(txBody.to_bytes()).toString('hex');
    //console.log(signed);
    let txId = await walletServer.submitTx(signed);

    return txId; // cf8b04e3319f46b3363c42d05a4313ab4ceca58fd07a4772e3397667456dd37d
}

async function sendToBlockChain2(wallet, walletPassphrase, hash, time){
    const senderWallet = wallet;
    const metadata = {
        0: hash,
        1: time,
    };

    //let receiverAddress = [new AddressWallet(infoDestinataire.addressDest)];
    let receiverAddress = (await senderWallet.getUnusedAddresses()).slice(0, 1);
    const amounts = [1000000]; // ADA
    let transaction = await senderWallet.sendPayment(walletPassphrase, receiverAddress, amounts, metadata);
    //let transaction = await senderWallet.getTransaction('af0465f610af989dd899a5b6142033dd8f2d3fd754e7799356e70183bbef10e1');
    //console.log(transaction);
    return transaction;
};

async function sendToBlockChain3(wallet, walletPassphrase, message,time, sentTime){
    const senderWallet = wallet;

    const metadata=[message,time,sentTime];

    //console.log("metadata 0 : "+metadata[0]);
    //let receiverAddress = [new AddressWallet(infoDestinataire.addressDest)];
    let receiverAddress = (await senderWallet.getUnusedAddresses()).slice(0, 1);
    const amounts = [1000000]; // ADA
    let transaction = await senderWallet.sendPayment(walletPassphrase, receiverAddress, amounts, metadata);
    //let transaction = await senderWallet.getTransaction('af0465f610af989dd899a5b6142033dd8f2d3fd754e7799356e70183bbef10e1');
    //console.log(transaction);
    return transaction;
};


const checkHashExists = async (fileName) => {
    const fileHistoryRef = admin.firestore().collection('fileHistory');
    const querySnapshot = await fileHistoryRef.where('nomFichier', '==', fileName).get();
    const fileHistory = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    const transactionId = fileHistory.length > 0 ? fileHistory[0].transactionID : null;
    return transactionId;
}


app.listen(3002, () => {
    console.log('Serveur démarré sur le port 3002!');
});
