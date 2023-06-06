const express = require('express');
require('dotenv').config();
const multer = require('multer'); // middleware pour gérer les fichiers
const cors = require('cors'); // middleware pour ajouter les entêtes CORS
const app = express();
const { Seed, WalletServer, CARDANO_CHIMERIC, PublicKey} = require('cardano-wallet-js');
const {response} = require("express");
const crypto = require("crypto");
const fs = require("fs");
const CryptoJS = require("crypto-js");
// Configuration Firbase Admin
const admin = require('firebase-admin');
const serviceAccount = require("./FirebaseConfigEnvLocal.json");

// Configuration IPFS
const ipfsAPI = require ('ipfs-api');
const ipfsHost = process.env.IPFS_HOST;
const ipfsPort = process.env.IPFS_PORT;
const ipfsProtocol = process.env.IPFS_PROTOCOL;
const ipfs = ipfsAPI(ipfsHost, ipfsPort, { protocol: ipfsProtocol });

// Configuration nodeMailer
var nodemailer = require('nodemailer');

// Configuration Blockfrost
const Blockfrost = require("@blockfrost/blockfrost-js");
const path = require("path");
const projectId = process.env.BLOCKFROST_PROJECT_ID;
const API = new Blockfrost.BlockFrostAPI({
    projectId: projectId,
    // Autres options de configuration de l'API Blockfrost
});


// Configuration : Wallet Serveur
const walletServerUrl = process.env.WALLET_SERVER_URL;
const walletServer = WalletServer.init(walletServerUrl);
const passPhraseServ = "G)9T#J!K:4yu0z)eEG1D";



// Initialisez Firebase Admin SDK avec vos identifiants Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();


// Middleware pour gérer les fichiers envoyés
const upload = multer({ dest: 'uploads/' });


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
        const accountKey = Seed.deriveAccountKey(rootKey);

        const stakePrvKey = accountKey
            .derive(CARDANO_CHIMERIC) // chimeric
            .derive(0);

        const privateKey = stakePrvKey.to_raw_key();
        const publicKey = privateKey.to_public();

        const data = {
            walletId : wallet.id,
            walletName: wallet.name,
            walletState:await  wallet.state.status,
            walletAvailableBalance: wallet.getAvailableBalance(),
            walletRewardBalance : wallet.getRewardBalance(),
            walletTotalBalance : wallet.getTotalBalance(),
            walletAddress:await wallet.getAddressAt(0),
            privateKey:  privateKey.to_bech32(),
            publicKey: publicKey.to_bech32(),
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
            const accountKey = Seed.deriveAccountKey(rootKey);

            const stakePrvKey = accountKey
                .derive(CARDANO_CHIMERIC) // chimeric
                .derive(0);

            const privateKey = stakePrvKey.to_raw_key();
            const publicKey = privateKey.to_public();


            const data = {
                walletId : wallet.id,
                walletName: wallet.name,
                walletState:await wallet.state.status,
                walletAvailableBalance: wallet.getAvailableBalance(),
                walletRewardBalance : wallet.getRewardBalance(),
                walletTotalBalance : wallet.getTotalBalance(),
                walletAddress: await wallet.getAddressAt(0),
                privateKey: privateKey.to_bech32(),
                publicKey: publicKey.to_bech32(),
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

function encryptKey(key, passphrase) {
    const encrypted = CryptoJS.AES.encrypt(key, passphrase).toString();
    return encrypted;
}

// Decryption function
function decryptKey(encryptedKey, passphrase) {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedKey, passphrase);
    const decryptedKey = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return decryptedKey;
}

app.post('/register', async (req, res) => {
    const { userId } = req.body;
    console.log('User Id: ' + userId);

    const keyPair = generateKeyPair();
    const publicKey = keyPair.publicKey;
    const privateKey = keyPair.privateKey;

    // Chifferer les clés:
    const EncryptedPublicKey = encryptKey(publicKey, passPhraseServ);
    const EncryptedPrivateKey = encryptKey(privateKey, passPhraseServ);

    // Enregistrer les clés dans Firestore
    const usersRef = admin.firestore().collection('users');

    // Créer un document pour l'utilisateur avec l'ID correspondant
    const userDoc = usersRef.doc(userId);


    // Enregistrer la clé publique
    await userDoc.set({
        xpuK: EncryptedPublicKey
    }, { merge: true });

    // Enregistrer la clé privée (en prenant soin de bien protéger l'accès à cette donnée sensible)
    await userDoc.set({
        xprK: EncryptedPrivateKey
    }, { merge: true });

    console.log(userDoc);

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
    const mnemonic = req.body.mnemonic;



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
        throw Error('Utilisateur non Inscrit dans notre Application');
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
        const dataToSend = {
            date: currentTime,
            hash: hashFile,
        }

        let tx = await sendToBlockChain10(walletId,mnemonic, dataToSend).then((result)=>{
            console.log("Envoie à la blockchain reussie !" );
            console.log("tx : " + result);
            return result;
        }).catch(e => {
            console.log('Erreur lors de Envoie à la blockChain');
            throw new Error("Erreur lors de l'envoie à la blockChain : " + e);
        });



        /*
        let tx = await sendToBlockChain2(wallet, walletPassphrase, hashFile, currentTime).then((result )=>{
        console.log("Envoie à la blockchain reussie !" );
        console.log("tx : " + result.id);
        return result.id;
    }).catch(e => {
        console.log('Erreur lors de Envoie à la blockChain');
        throw new Error("Erreur lors de l'envoie à la blockChain : " + e);
    });

         */





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
           service: process.env.EMAIL_SERVICE,
           auth: {
               user: process.env.EMAIL_USER,
               pass: process.env.EMAIL_PASSWORD,
           }
       });


        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: emailReceiver,
            subject: 'SMARTFLOW CARDANO : Vous avez reçu un fichier',
            html: `<p>Cher utilisateur,</p>
                    <p>Nous sommes ravis de vous annoncer que vous avez reçu un nouveau fichier sur notre application SmartFlow Cardano. Nous souhaitons vous informer que le fichier est maintenant disponible et que vous pouvez y accéder immédiatement.</p>
                <p>Pour télécharger le fichier, vous avez deux options :</p>
                <ul>
                <li>Cliquez sur le lien suivant : <a href='${link}' >Télécharger le fichier</a></li>
                <li>Accédez à votre historique des fichiers reçus dans l\'application.</li>
                </ul>
                <p>Cordialement,</p>
                <p>L\'équipe SmartFlow Cardano</p>`
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


        // Supprimer le fichier crypté
        fs.unlink(encryptedFilePath, (err) => {
            if (err) {
                console.error('Erreur lors de la suppression du fichier crypté :', err);
            } else {
                console.log('Le fichier crypté a été supprimé avec succès.');
            }
        });


       } catch (error) {
        console.log('Envoie du fichier échoué')
        res.status(500).send({message: error.message});
        console.error(error);

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
                console.log('Received Hash From BlockChain : ' + res.hash)
                return res.hash;
            })
            .catch(err => {
                console.log('Erreur lors de la récupération des métadonnées de la transaction' + err)
            });





    // Téléchargez le fichier à partir d'IPFS
    const fileFromIPFS =  await getFileFromIPFS2(cid);


    // Decrypter

    const privateKey = await getInfoDestinataireFromUUID(uuid).then(res => {
        console.log('Recuperation des informations reussies (private Key )');
        console.log(res.privateKey);
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







        const walletID = 'e7bb9863ff00344380165f27a51b3a912d34e76e';
        const mnemonic="above tornado deposit timber unlock arrive arena liar alert blouse pupil response leisure melody super";
        const passphrase= "AdminWallet";

        let currentTime = new Date().toISOString();
        const dateToSend = {
            fileName : fileName,
            dateEnvoie : dateFromBlockChain,
            dateRecu :  currentTime,
            TransactionHash : tx,
            HashFichierRecu : hashFileFromIPFS,
            isAuthentic : true,
        }

        let txre = await sendToBlockChain1(walletID, mnemonic, dateToSend).then((result )=>{
            console.log("Envoie à la blockchain reussie !" );
            console.log("txre : " + result);
            return result;
        }).catch(e => {
            console.log('Erreur lors de Envoie à la blockChain');
            console.log(e);
            throw new Error("Erreur lors de l'envoie à la blockChain");
        });


        // Accusé de reception :
        await setAccuseTrue(tx, txre);




        const userEmail = userDocSnapshot.data().email;
        var transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            }
        });
        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'SMARTFLOW CARDANO : Accusé de récéption',
            html: `<p>Dear User This is to inform you that the file you uploaded to our system has been received by the receiver.</p><a href={'https://preview.cardanoscan.io/transaction/'+txre}>Consulter Accusé de Reception</a>`
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });





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


        const resultat = await checkAuth(hashFile);

        if(resultat.found){

            const TxAcusse = resultat.document.get('accuseTx');


            const metaData = await getAllMetaData(TxAcusse);

            console.log(metaData);


            console.log(metaData.find(i=>i.label === '1').json_metadata);
            const dataInfo = {
                fileName : metaData.find(i=>i.label === '1').json_metadata.fileName,
                dateEnvoie: metaData.find(i=>i.label === '2').json_metadata.dateEnvoie,
                dateRecu: metaData.find(i=>i.label === '3').json_metadata.dateRecu,
                isAuthentic :  metaData.find(i=>i.label === '4').json_metadata.isAuthentic,
                hashFileRecu : metaData.find(i=>i.label === '5').json_metadata.hashFileRecu,
                transactionHash : metaData.find(i=>i.label === '6').json_metadata.TransactionEnvoie,
                transactionAccuse : TxAcusse,
            }



            res.status(200).send({
                message: 'Le document est authentique',
                hashduFichier : hashFile,
                fileInfo : dataInfo,
            });
        }else{
            console.log("Le document n'est pas authentique");
            res.status(500).send({message: "Le document n'est pas authentique"});
        }

    } catch (error) {
        console.log('Envoie du fichier échoué')
        console.log(error)
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

async function getAllMetaData(tx){
    const metadata = await API.txsMetadata(tx);
    return metadata;
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


async function setAccuseTrue(transactionID, tx) {
    const fileHistoryRef = admin.firestore().collection('fileHistory');

    const querySnapshot = await fileHistoryRef.where('transactionID', '==', transactionID).get();

    if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
            await doc.ref.update({ receiptAcknowledged: true , accuseTx : tx});
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
            publicKey : decryptKey(userDoc.get('xpuK'), passPhraseServ),
            privateKey: decryptKey(userDoc.get('xprK'), passPhraseServ),
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
            publicKey : decryptKey(userDoc.get('xpuK'), passPhraseServ),
            privateKey: decryptKey(userDoc.get('xprK'), passPhraseServ),
        }
        //console.log(dataDest);
        //console.log(`Adresse de portefeuille de destinataire : ${dataDest.addressDest}`);
        //console.log(`Clé de public de destinataire : ${userDoc.get(dataDest.pkDest)}`);
        return dataDest;
    }
}



async function sendToBlockChain10(walletID, recoveryPhrase,dataToSend){

    console.log(recoveryPhrase);

    let wallet = await walletServer.getShelleyWallet(walletID);
    // get first unused wallet's address
    let addresses = (await wallet.getUnusedAddresses()).slice(0,1);
    console.log(addresses);
    let amounts = [1000000];
    // console.log(addresses);

    // get ttl
    let info = await walletServer.getNetworkInformation();
    let ttl = info.node_tip.absolute_slot_number * 12000;

    // get the signing keys (can be offline)
    let rootKeySIGN = Seed.deriveRootKey(recoveryPhrase);
    const accountKey = Seed.deriveAccountKey(rootKeySIGN);
    const stakePrvKey = accountKey
        .derive(CARDANO_CHIMERIC) // chimeric
        .derive(0);
    const privateKey = stakePrvKey.to_raw_key();
    const signatureHash = Seed.signMessage(privateKey,  dataToSend.hash);
    const signatureHashPartie1 = signatureHash.substring(0, signatureHash.length / 2);
    const signatureHashPartie2 = signatureHash.substring(signatureHash.length / 2);

    // you can include metadata
    let data = {
        0: 'Accusé d envoie',
        1: {
            'hash' : dataToSend.hash,
        },

        2: {
            'dateEnvoie' : dataToSend.date,
        },
        3: {
            'SignaturePartA' : signatureHashPartie1,
        },
        4: {
            "SignaturePartB": signatureHashPartie2,
        }
    };

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



async function sendToBlockChain1(walletID, recoveryPhrase,dataToSend){


    let wallet = await walletServer.getShelleyWallet(walletID);
    // get first unused wallet's address
    let addresses = (await wallet.getUnusedAddresses()).slice(0,1);
    console.log(addresses);
    let amounts = [1000000];
    // console.log(addresses);

    // get ttl
    let info = await walletServer.getNetworkInformation();
    let ttl = info.node_tip.absolute_slot_number * 12000;

    // you can include metadata
    let data = {
        0: 'Accusé de Reception',
        1: {
            'fileName' : dataToSend.fileName,
        },
        2: {
            'dateEnvoie' : dataToSend.dateEnvoie,
        },
        3: {
            'dateRecu' : dataToSend.dateRecu,
        },
        4: {
            'isAuthentic' : dataToSend.isAuthentic,
        } ,
        5: {
            'hashFileRecu' : dataToSend.HashFichierRecu,
        },
        6: {
            'TransactionEnvoie':dataToSend.TransactionHash,
        }
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


const checkAuth = async (targetHash) => {
    const fileHistoryRef = admin.firestore().collection('fileHistory');
    try {
        // Récupérer tous les documents de la collection 'fileHistory'
        const snapshot = await fileHistoryRef.get();

        // Parcourir les documents et vérifier les hash
        for (const doc of snapshot.docs) {
            const transactionID = doc.data().transactionID;
            if (transactionID) {
                console.log("On cherche dans transaction : " + transactionID);
                const hashDansTransaction = await getMetaDataFromTx(transactionID);
                console.log('Hash trouvé dans : ' + transactionID + ' Hash trouvé : ' + hashDansTransaction);

                if (compareHashes(targetHash, hashDansTransaction)) {
                    console.log('Hash Trouvé et identique');
                    return { found: true, document: doc };
                }
            }
        }

        return { found: false };
    } catch (error) {
        console.error('Erreur lors de la récupération des documents de la collection fileHistory :', error);
    }
};



app.listen(3002, async () => {
    console.log('Serveur démarré sur le port 3002!');
});
