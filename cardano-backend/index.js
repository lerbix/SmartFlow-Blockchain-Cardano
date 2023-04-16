const express = require('express');
const multer = require('multer'); // middleware pour gérer les fichiers
const cors = require('cors'); // middleware pour ajouter les entêtes CORS
const app = express();
const { Seed, WalletServer } = require('cardano-wallet-js');
const {response} = require("express");

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

    }catch (e) {
        if (e.response.status === 409) {
            //let walletServer = WalletServer.init('http://localhost:8090/v2');
            // la wallet existe
            //console.log(e.response.data.message);
            //console.log(extractWalletId(e.response.data.message));
            const idWallet = extractWalletId(e.response.data.message);
            let wallet = await walletServer.getShelleyWallet(idWallet);


            // KEY HANDLING
            let rootKey = Seed.deriveRootKey(mnemonic);
            let privateKey = Seed.deriveKey(rootKey, ['1852H','1815H','0H','0','0']).to_raw_key();
            console.log("private key : " + privateKey.to_bech32());


            let accountKey = Seed.deriveAccountKey(rootKey, 0);
            console.log("account key : " +  accountKey.to_bech32());

            const data = {
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


app.listen(3002, () => {
    console.log('Serveur démarré sur le port 3002!');
});
