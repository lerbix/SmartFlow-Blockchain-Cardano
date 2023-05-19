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
    git clone https://gitlab.com/votre-utilisateur/votre-depot.git
    ```
5. Appuyez sur Entrée pour exécuter la commande. Git va alors télécharger tous les fichiers du dépôt et les copier dans le répertoire spécifié.

Une fois la commande git clone terminée, vous aurez une copie locale complète du dépôt sur votre machine. Vous pouvez maintenant accédez au répertoire du projet en utilisant la commande suivante :

**TODO**

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

### Configuration de Firebase Front
Dans cette partie, nous allons configuré Firebase qui nous permettera de s'authentifier, 
