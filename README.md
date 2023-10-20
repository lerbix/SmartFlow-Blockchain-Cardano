# TPE-BLOCKCHAIN-cardano-2023

Au cours des dernières années, la technologie Blockchain s’est beaucoup développée avec notamment l’apparition de plusieurs plateformes permettant d’envisager plusieurs types d’applications. Initialement, cette technologie a été popularisée avec la plateforme Bitcoin, mais de nos jours, on parle aussi beaucoup de la plateforme Ethereum, Quorum ou encore d’HyperLedger. Le fonctionnement de la technologie Blockchain utilise une approche complètement décentralisée permettant de se passer d’un tiers validateur.Dans le cadre du projet SmartFlow, nous avons développé une solution permettant de certifier l’infalsifiabilité d’un document électronique lors du transfert de document d’un émetteur vers un destinataire. Cette solution repose sur l'utilisation de la technologie Blockchain pour garantir l'intégrité et la sécurité des documents.

## Objectifs du Projet

L'objectif principal du projet SmartFlow est de développer une interface graphique conviviale qui permettra à un utilisateur authentifié de déposer un document, de le crypter, de le hacher, puis d'envoyer son hash dans la blockchain. Cette certification garantira que le document n'a pas été altéré ou modifié pendant le processus de transfert.

Les fonctionnalités clés du projet incluent :

- Authentification des utilisateurs
- Dépôt sécurisé des documents électroniques
- Cryptage des documents pour assurer leur confidentialité
- Hachage des documents pour créer une empreinte unique
- Enregistrement des empreintes dans la blockchain pour garantir l'intégrité
- Récupération sécurisée des documents par le destinataire

## Installation

### Clonez le projet

1. Copiez l'URL du dépôt GitLab que vous souhaitez cloner. Vous pouvez le trouver en haut de la page du dépôt sur GitLab.
2. Ouvrez votre terminal ou votre interface de ligne de commande.
3. Accédez au répertoire où vous souhaitez cloner le dépôt en utilisant la commande cd suivie du chemin du répertoire. Par exemple, si vous souhaitez cloner le dépôt dans votre dossier "Projets", vous pouvez utiliser la commande suivante :

   ```bash
   cd Chemin/Vers/Votre/Repertoire/Projets
   ```

4. Utilisez la commande git clone suivie de l'URL du dépôt que vous avez copiée précédemment. Par exemple :
   ```bash
   git clone https://github.com/lerbix/SmartFlow-Blockchain-Cardano
   ```
5. Appuyez sur Entrée pour exécuter la commande. Git va alors télécharger tous les fichiers du dépôt et les copier dans le répertoire spécifié.

Une fois la commande git clone terminée, vous aurez une copie locale complète du dépôt sur votre machine. Vous pouvez maintenant accédez au répertoire du projet en utilisant la commande suivante :

```bash
cd SmartFlow-Blockchain-Cardano
```

### Configuration de la partie Front

Dans cette partie de la documentation, nous allons configurer la partie front-end de l'application, qui est la plus facile. Pour commencer, suivez les étapes suivantes :

- Déplacez-vous vers le répertoire 'cardano-front' en utilisant la commande suivante :

```bash
cd cardano-front
```

- Une fois dans le répertoire 'cardano-front', vous pouvez installer les dépendances nécessaires en utilisant la commande suivante :

```bash
npm install
```

Cette commande téléchargera et installera toutes les dépendances nécessaires pour le projet. Assurez-vous d'avoir Node.js et npm installés sur votre machine avant d'exécuter cette commande.

Après avoir installé les dépendances nécessaires, vous pouvez suivre les étapes ci-dessous pour lancer le projet :

- Utilisez la commande suivante pour démarrer le serveur de développement :

```bash
npm run dev
```

Après avoir exécuté la commande, vous devriez voir des informations dans votre terminal indiquant que le serveur de développement est en cours d'exécution. Il vous fournira également une URL locale où vous pourrez accéder à l'application dans votre navigateur.

Veuillez noter que **vous ne pourrez pas vous connecter ou vous inscrire pour le moment**, car vous n'avez pas encore configuré Firebase. Pour configurer Firebase et permettre l'authentification dans l'application, veuillez suivre les instructions dans la partie Configuration Firebase Front.

#### Configuration de Firebase Front

Dans cette partie, nous allons configuré Firebase [lien vers Firebase ](https://firebase.google.com/)qui nous permettera de s'authentifier :

Dans le dossier 'cardano-front' :

- Localisez le fichier .env à la racine du projet.

- Ouvrez le fichier .env dans un éditeur de texte.

- Remplacez les valeurs des variables suivantes par les informations d'identification spécifiques à votre projet Firebase :
  | Variable | Remplacement |
  | --------------------------------- | ------------------------------------------------------------------------- |
  | VITE_FIREBASE_API_KEY | Remplacez par votre clé API Firebase. |
  | VITE_FIREBASE_AUTH_DOMAIN | Remplacez par votre domaine d'authentification Firebase. |
  | VITE_FIREBASE_PROJECT_ID | Remplacez par l'ID de votre projet Firebase. |
  | VITE_FIREBASE_STORAGE_BUCKET | Remplacez par le bucket de stockage Firebase que vous souhaitez utiliser. |
  | VITE_FIREBASE_MESSAGING_SENDER_ID | Remplacez par l'ID de l'expéditeur de messagerie Firebase. |
  | VITE_FIREBASE_APP_ID | Remplacez par l'ID de votre application Firebase. |

Une fois que vous avez remplacé les valeurs par les informations d'identification correctes, enregistrez le fichier .env.

Pour commencer, dans Firebase, vous devez créer deux collections : une appelée 'users' et une autre appelée 'fileHistory'.

Une fois ces collections créées, vous pouvez enregistrer les informations de vos utilisateurs sans rencontrer de problèmes.

### Configuration de la partie BackEnd

Dans cette partie de la documentation, nous allons configurer la partie back-end de l'application. Pour commencer, suivez les étapes suivantes :

- Déplacez-vous vers le répertoire 'cardano-backend' en utilisant la commande suivante :

```bash
cd cardano-backend
```

- Une fois dans le répertoire 'cardano-backend', vous pouvez installer les dépendances nécessaires en utilisant la commande suivante :

```bash
npm install
```

### Configuration De FireBase Admin

Les projets Firebase prennent en charge les comptes de service Google, qui vous permettent d'appeler les API du serveur Firebase depuis votre serveur d'applications ou votre environnement de confiance.

Pour configurer le fichier FireBaseAdminConfigEnvLocal, vous devez générer un fichier de clé privée au format JSON. Suivez les étapes ci-dessous pour générer ce fichier pour votre compte de service :

- Dans la console Firebase, ouvrez Paramètres > Comptes de service .

- Cliquez sur Générer une nouvelle clé privée , puis confirmez en cliquant sur Générer la clé .

- Stockez en toute sécurité le fichier JSON contenant la clé.

Si vous rencontrez des problèmes lors de cette étape, référez-vous à la documentation de Firebase Admin disponible sur [Lien vers documentation FireBase Admin](https://firebase.google.com/docs/admin/setup?hl=fr)

Voici à quoi ressemble le contenu du fichier `FireBaseAdminConfigEnvLocal` que vous pouvez facilement configurer en utilisant les informations de votre compte de service :

```javascript
{
  "type": "",
  "project_id": "",
  "private_key_id": "",
  "private_key": "",
  "client_email": "",
  "client_id": "",
  "auth_uri": "",
  "token_uri": "",
  "auth_provider_x509_cert_url": "",
  "client_x509_cert_url": ""
}
```

Prenez le temps de remplir les champs du fichier `FireBaseAdminConfigEnvLocal` avec les valeurs correspondantes de votre compte de service Firebase. Une fois cela fait, vous aurez correctement configuré ce fichier pour votre application.

### Configuration De IPFS (InterPlanetary File System)

IPFS (InterPlanetary File System) est un protocole de stockage et de partage de fichiers décentralisé. Pour configurer les variables liées à IPFS, suivez les étapes ci-dessous :

1. Ouvrez le fichier **.env** de votre projet.
2. Recherchez les variables `IPFS_HOST`, `IPFS_PORT` et `IPFS_PROTOCOL`.
3. Remplacez les valeurs existantes par les configurations souhaitées :
   - `IPFS_HOST` : spécifie l'hôte IPFS que vous souhaitez utiliser.
   - `IPFS_PORT` : spécifie le port IPFS que vous souhaitez utiliser.
   - `IPFS_PROTOCOL` : spécifie le protocole IPFS que vous souhaitez utiliser.

### Configuration Cardano-Wallet-js

`cardano-wallet-js` est un SDK pour Cardano qui offre plusieurs fonctionnalités. Vous pouvez l'utiliser comme client pour le portefeuille officiel de Cardano et aussi pour créer des Tokens Natifs et des NFTs. plus d'informations sur [Cardano-wallet](https://developers.cardano.org/docs/get-started/cardano-wallet-js/)

Avant de commencer à utiliser la bibliothèque, vous aurez besoin d'un serveur `cardano-wallet` en cours d'exécution. Si vous avez Docker disponible, vous pouvez simplement télécharger le `docker-compose.yml` qu'ils fournissent et le démarrer en utilisant `docker-compose` :

```bash
wget https://raw.githubusercontent.com/input-output-hk/cardano-wallet/master/docker-compose.yml
NETWORK=testnet docker-compose up
```

Vous pouvez trouver plus d'informations sur les différentes options pour démarrer le serveur [ici](https://github.com/input-output-hk/cardano-wallet)

ensuite :

1. Ouvrez le fichier **.env** dans cardano-backend.
2. Recherchez la variable `WALLET_SERVER_URL`
3. Remplacez la valeur existante par le serveur Cardano

### Configuration BLOCKFROST

`BLOCKFROST` est une plateforme qui fournit des outils et des services pour interagir avec la blockchain Cardano. Elle permet aux développeurs d'accéder aux données de la blockchain Cardano, de créer des applications et de gérer les transactions.

Pour configurer la variable `BLOCKFROST_PROJECT_ID`, vous devez suivre les étapes suivantes :

1. Accédez au site Web de BLOCKFROST à l'adresse :[lien vers blockfrost](https://blockfrost.io/)

2. Créez un compte ou connectez-vous à votre compte BLOCKFROST existant.

3. Une fois connecté, accédez au tableau de bord ou à la page de gestion du projet.

4. Si vous n'avez pas encore créé de projet, vous devrez en créer un en cliquant sur le bouton "New Project" ou "Create New Project".

5. Après avoir créé ou sélectionné votre projet, vous devriez voir une page avec les détails de votre projet.

6. Recherchez l'ID du projet ou une section similaire contenant l'identifiant du projet.

7. Copiez l'ID du projet, qui ressemble généralement à une série de caractères alphanumériques, par exemple : "f1a2b3c4d5e6f7g8h9".

8. Ouvrez le fichier .env de configuration et recherchez la variable `BLOCKFROST_PROJECT_ID`.

9. Remplacez la valeur actuelle par l'ID du projet `BLOCKFROST` que vous avez copié à l'étape précédente.

10. Enregistrez les modifications et utilisez la variable `BLOCKFROST_PROJECT_ID` dans votre application pour interagir avec l'API de BLOCKFROST.

### Configuration NodeMailer

| Variable       | Valeur                |
| -------------- | --------------------- |
| EMAIL_SERVICE  | service de messagerie |
| EMAIL_USER     | votre adresse e-mail  |
| EMAIL_PASSWORD | votre mot de passe    |

Pour configurer les variables nécessaires à l'utilisation de NodeMailer, suivez les étapes suivantes :

`EMAIL_SERVICE` : Remplacez `service de messagerie` par le nom du service de messagerie que vous souhaitez utiliser, tel que "Gmail" ou "Outlook". Consultez la documentation de NodeMailer pour obtenir la liste des services de messagerie pris en charge.

`EMAIL_USER` : Remplacez `votre adresse e-mail` par votre adresse e-mail complète. Par exemple, "votre_nom@example.com".

`EMAIL_PASSWORD` : Remplacez `votre mot de passe` par votre mot de passe de messagerie. Assurez-vous de fournir le mot de passe correct associé à l'adresse e-mail spécifiée.
