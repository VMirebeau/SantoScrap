
cancel = false;

// Fonction pour charger un script externe avec une promesse
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Charger toutes les bibliothèques nécessaires de manière asynchrone

// Fonction pour extraire les données des copies
function extractData() {
    return Array.from(document.querySelectorAll("tr.listeCopiesRow")).map(row => ({
        Id: "https://cyclades.education.gouv.fr/santorin/th/correction/telechargerCopie/" + row.id.replace("copie_", ""),
        NomCopie: row.querySelector("span.nomCopie").textContent
    }));
}

// Fonction pour obtenir le contenu binaire d'une URL avec une promesse
function getBinaryContent(url) {
    return new Promise((resolve, reject) => {
        JSZipUtils.getBinaryContent(url, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// Fonction pour télécharger toutes les copies
async function downloadAllFiles() {
    const copies = extractData();
    await downloadFiles(copies);
}

// Fonction pour télécharger les copies sélectionnées avec mise à jour de la progression
async function downloadFiles(copies) {
    cancel = false;
    const zip = new JSZip();
    let fileCount = 1;
    const totalFiles = copies.length;
    const startTime = Date.now();

    // Afficher la popup de progression
    showProgressPopup(totalFiles);

    for (const copy of copies) {
        if (!cancel) {
        const url = copy.Id;
        const fileName = copy.NomCopie + ".pdf";
        try {
            console.log(`Téléchargement du fichier ${fileCount}/${totalFiles} : ${fileName}`);
            const data = await getBinaryContent(url);
            zip.file(fileName, data, { binary: true });

            // Mettre à jour la progression
            updateProgress(fileCount, totalFiles, startTime);

            fileCount++;
        } catch (error) {
            console.error(`Erreur lors du téléchargement du fichier ${fileName} :`, error);
            if (!cancel) erreur(`Erreur lors du téléchargement du fichier ${fileName} : ${error}`);
        }
    }
    }

    try {
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "Fichiers.zip");
        console.log("Exportation du zip terminée.");

        // Appeler la fonction pour gérer la fin du téléchargement
        completeDownload();

    } catch (error) {
        console.error("Erreur lors de la création du fichier zip :", error);
        if (!cancel) erreur("Erreur lors de la création du fichier zip : " + error);
    }
}

// Fonction pour réinitialiser les paramètres
function resetPopupParameters() {
    const downloadAllCheckbox = document.querySelector('.popup-overlay input[type="checkbox"]');
    const inputX = document.querySelector('.popup-overlay input[type="number"][value="1"]');
    const inputY = document.querySelector('.popup-overlay input[type="number"][value]');

    if (downloadAllCheckbox) {
        downloadAllCheckbox.checked = true;
        inputX.disabled = true;
        inputY.disabled = true;
        inputX.value = '1';
        inputY.value = extractData().length;
        inputX.style.borderColor = '';
        inputY.style.borderColor = '';
    }
}




// Fonction principale pour télécharger les copies spécifiées
function telecharger(x, y) {
    let copies = extractData();

    // Filtrer les copies si des indices x et y sont fournis
    if (x !== undefined && y !== undefined) {
        copies = copies.slice(x - 1, y); // `x - 1` car l'indexation commence à 0, et `y` car la méthode slice exclut la fin
    }

    // Appel à la fonction de téléchargement avec les copies sélectionnées
    downloadFiles(copies);
}

// Fonction pour afficher la popup principale
function showPopup() {
    const totalCopies = extractData().length;

    // Création de l'arrière-plan gris
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = 1000;

    // Création de la popup
    const popup = document.createElement('div');
    popup.style.width = '400px';
    popup.style.height = '200px';
    popup.style.backgroundColor = 'white';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    popup.style.padding = '20px';
    popup.style.textAlign = 'center';
    popup.style.position = 'relative';

    // Titre de la popup
    const title = document.createElement('h2');
    title.textContent = "SantoScrap v3";
    title.style.marginBottom = '20px';

    // Conteneur pour la checkbox et son label
    const checkboxContainer = document.createElement('div');
    checkboxContainer.style.display = 'flex';
    checkboxContainer.style.justifyContent = 'center';
    checkboxContainer.style.alignItems = 'center';
    checkboxContainer.style.marginBottom = '15px';

    // Checkbox "Télécharger tout le lot"
    const downloadAllCheckbox = document.createElement('input');
    downloadAllCheckbox.type = 'checkbox';
    downloadAllCheckbox.checked = true;
    downloadAllCheckbox.style.marginRight = '5px';

    // Label de la checkbox
    const checkboxLabel = document.createElement('label');
    checkboxLabel.textContent = 'Télécharger tout le lot (' + totalCopies + ' copies)';
    checkboxLabel.style.fontWeight = 'normal';

        resetPopupParameters();

    // Gestion du changement d'état de la checkbox
    downloadAllCheckbox.addEventListener('change', () => {
        const isChecked = downloadAllCheckbox.checked;
        inputX.disabled = isChecked;
        inputY.disabled = isChecked;
        messageText.style.color = isChecked ? '#ccc' : '#000';
        toText.style.color = isChecked ? '#ccc' : '#000';

        if (isChecked) {
            inputX.value = 1;
            inputY.value = totalCopies;
        }
    });

    // Ajouter la checkbox et son label au conteneur
    checkboxContainer.appendChild(downloadAllCheckbox);
    checkboxContainer.appendChild(checkboxLabel);

    // Conteneur pour le message avec champs de texte
    const messageContainer = document.createElement('div');
    messageContainer.style.display = 'flex';
    messageContainer.style.justifyContent = 'center';
    messageContainer.style.alignItems = 'center';
    messageContainer.style.color = '#ccc';
    messageContainer.style.marginBottom = '20px';

    // Champs de texte pour X et Y
    const inputX = document.createElement('input');
    inputX.type = 'number';
    inputX.value = '1';
    inputX.style.margin = '0 5px';
    inputX.style.width = '50px';
    inputX.style.textAlign = 'center';
    inputX.disabled = true;

    const inputY = document.createElement('input');
    inputY.type = 'number';
    inputY.value = totalCopies;
    inputY.style.margin = '0 5px';
    inputY.style.width = '50px';
    inputY.style.textAlign = 'center';
    inputY.disabled = true;

    // Message avec les champs de texte intégrés
    const messageText = document.createElement('span');
    messageText.textContent = "De ";

    const toText = document.createElement('span');
    toText.textContent = " à ";

    // Ajouter les éléments au conteneur de message
    messageContainer.appendChild(messageText);
    messageContainer.appendChild(inputX);
    messageContainer.appendChild(toText);
    messageContainer.appendChild(inputY);

    // Conteneur pour le bouton Télécharger
    const buttonContainer = document.createElement('div');
    buttonContainer.style.textAlign = 'center';

    // Bouton Télécharger
    const downloadButton = document.createElement('button');
    downloadButton.textContent = "Télécharger";
    downloadButton.style.padding = '10px 50px';
    downloadButton.style.width = '120px';
    downloadButton.style.cursor = 'pointer';

    // Gestion du clic sur le bouton Télécharger
    downloadButton.addEventListener('click', () => {
        if (downloadAllCheckbox.checked) {
            downloadAllFiles();
        } else {
            const x = parseInt(inputX.value);
            const y = parseInt(inputY.value);
            if (validateInputs(x, y, totalCopies)) {
                closePopup();
                telecharger(x, y);
            } else {
                erreur("Les valeurs entrées sont invalides, veuillez les vérifier.");
            }
        }
    });

    // Fonction de validation des champs X et Y
    function validateInputs(x, y, max) {
        if (isNaN(x) || isNaN(y)) {
            return false;
        }
        if (x < 1 || y > max || x > y) {
            return false;
        }
        return true;
    }

    // Gestion des modifications des champs de texte
    inputX.addEventListener('input', () => {
        const x = parseInt(inputX.value);
        const y = parseInt(inputY.value);
        if (!validateInputs(x, y, totalCopies)) {
            inputX.style.borderColor = 'red';
        } else {
            inputX.style.borderColor = '';
        }
    });

    inputY.addEventListener('input', () => {
        const x = parseInt(inputX.value);
        const y = parseInt(inputY.value);
        if (!validateInputs(x, y, totalCopies)) {
            inputY.style.borderColor = 'red';
        } else {
            inputY.style.borderColor = '';
        }
    });

    // Assemblage des éléments dans la popup
    popup.appendChild(title);
    popup.appendChild(checkboxContainer);
    popup.appendChild(messageContainer);
    popup.appendChild(buttonContainer);
    buttonContainer.appendChild(downloadButton);

    // Assemblage final de la popup et de l'overlay à la page
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Gestion du clic en dehors de la popup pour fermer
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closePopup();
        }
    });
}

// Fonction pour fermer la popup de progression
function closeProgressPopup() {
    const overlay = document.getElementById('progress-popup-overlay');
    if (overlay) {
        document.body.removeChild(overlay);
    }
}


// Fonction pour fermer la popup
function closePopup() {
    const overlay = document.querySelector('.popup-overlay');
    if (overlay) {
        document.body.removeChild(overlay);
    }
}

// Fonction pour afficher la popup de progression
function showProgressPopup(totalFiles) {
    // Création de l'arrière-plan gris
    const overlay = document.createElement('div');
    overlay.id = 'progress-popup-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = 1000;

    // Création de la popup
    const popup = document.createElement('div');
    popup.id = 'progress-popup';
    popup.style.width = '400px'; // même taille que la popup de choix des copies
    popup.style.height = '200px'; // même taille que la popup de choix des copies
    popup.style.backgroundColor = 'white';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    popup.style.padding = '20px';
    popup.style.textAlign = 'center';
    popup.style.position = 'relative';

    // Titre de la popup
    const title = document.createElement('h3');
    title.textContent = "Téléchargement en cours...";
    title.style.marginBottom = '15px';

    // Barre de progression
    const progressBarContainer = document.createElement('div');
    progressBarContainer.style.width = '100%';
    progressBarContainer.style.backgroundColor = '#e0e0e0';
    progressBarContainer.style.borderRadius = '5px';
    progressBarContainer.style.marginBottom = '15px';

    const progressBar = document.createElement('div');
    progressBar.id = 'progress-bar';
    progressBar.style.width = '0%';
    progressBar.style.height = '20px';
    progressBar.style.backgroundColor = '#4caf50';
    progressBar.style.borderRadius = '5px';
    progressBar.style.transition = 'width 0.3s ease-in-out';

    progressBarContainer.appendChild(progressBar);

    // Texte d'information
    const infoText = document.createElement('p');
    infoText.id = 'progress-info';
    infoText.textContent = `0 / ${totalFiles} fichiers`;

    // Bouton Annuler
    const cancelButton = document.createElement('button');
    cancelButton.textContent = "Annuler";
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.marginTop = '15px';
    cancelButton.id = 'cancel-button';
    cancelButton.addEventListener('click', () => {
        cancel = true;
        closeProgressPopup();
        showPopup(); // Revenir à la popup de choix des copies
    });

    // Ajouter les éléments à la popup
    popup.appendChild(title);
    popup.appendChild(progressBarContainer);
    popup.appendChild(infoText);
    popup.appendChild(cancelButton); // Ajouter le bouton Annuler

    // Ajouter la popup et l'arrière-plan au document
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}

// Fonction pour gérer la fin du téléchargement
function completeDownload() {
    const popup = document.getElementById('progress-popup');
    const infoText = document.getElementById('progress-info');
    const cancelButton = document.getElementById('cancel-button');

    // Mettre à jour le texte de la popup
    infoText.textContent = "Retrouvez votre PDF dans vos téléchargements.";
    
    // Remplacer le bouton Annuler par un bouton Ok
    cancelButton.textContent = "Ok";
    cancelButton.removeEventListener('click', closeProgressPopup); // Supprimer l'ancien événement
    cancelButton.addEventListener('click', () => {
        closeProgressPopup();
        showPopup(); // Revenir à la popup de choix des copies
    });
}



// Fonction pour mettre à jour la progression
function updateProgress(current, total, startTime) {
    const progressBar = document.getElementById('progress-bar');
    const infoText = document.getElementById('progress-info');
    const progressPercentage = (current / total) * 100;

    progressBar.style.width = `${progressPercentage}%`;
    infoText.textContent = `${current} / ${total} fichiers`;

    const elapsedTime = (Date.now() - startTime) / 1000; // Temps écoulé en secondes
    const estimatedTotalTime = (elapsedTime / current) * total;
    const remainingTime = estimatedTotalTime - elapsedTime;

    // Formater le temps restant
    let remainingTimeFormatted;
    if (remainingTime >= 60) {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = Math.ceil(remainingTime % 60);
        remainingTimeFormatted = `${minutes} min ${seconds} s`;
    } else {
        remainingTimeFormatted = `${Math.ceil(remainingTime)} s`;
    }

    if (current < total) {
        infoText.textContent += ` - Temps restant estimé: ${remainingTimeFormatted}`;
    } else {
        infoText.textContent = "Votre PDF est en construction, veuillez patienter...";
    
        // Ajouter le message et le bouton à la popup de progression
        const progressPopup = document.getElementById('progress-popup-overlay').querySelector('div');
    }
}





// Fonction pour afficher une popup d'erreur
function erreur(message) {
    // Création de l'arrière-plan gris
    const errorOverlay = document.createElement('div');
    errorOverlay.className = 'error-overlay';
    errorOverlay.style.position = 'fixed';
    errorOverlay.style.top = 0;
    errorOverlay.style.left = 0;
    errorOverlay.style.width = '100%';
    errorOverlay.style.height = '100%';
    errorOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Fond gris avec opacité
    errorOverlay.style.display = 'flex';
    errorOverlay.style.justifyContent = 'center';
    errorOverlay.style.alignItems = 'center';
    errorOverlay.style.zIndex = 2000;

    // Création de la popup d'erreur
    const errorPopup = document.createElement('div');
    errorPopup.style.width = '300px';
    errorPopup.style.backgroundColor = 'rgba(255, 0, 0, 0.7)'; // Fond rouge avec opacité
    errorPopup.style.borderRadius = '8px';
    errorPopup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    errorPopup.style.padding = '20px';
    errorPopup.style.textAlign = 'center';
    errorPopup.style.position = 'relative';

    // Titre de la popup d'erreur
    const errorTitle = document.createElement('h3');
    errorTitle.textContent = "Erreur !";
    errorTitle.style.marginBottom = '10px';
    errorTitle.style.color = 'white'; // Titre en blanc pour contraster avec le fond rouge

    // Message de l'erreur
    const errorMessage = document.createElement('p');
    errorMessage.textContent = message;
    errorMessage.style.marginBottom = '20px';
    errorMessage.style.color = 'white'; // Texte en blanc pour contraster avec le fond rouge

    // Bouton OK pour fermer la popup d'erreur
    const okButton = document.createElement('button');
    okButton.textContent = "OK";
    okButton.style.padding = '10px 20px';
    okButton.style.cursor = 'pointer';
    okButton.style.backgroundColor = 'white'; // Bouton avec fond blanc pour contraster avec le fond rouge
    okButton.style.color = 'black'; // Texte en noir pour contraster avec le fond blanc
    okButton.addEventListener('click', () => {
        closeErrorPopup();
    });

    // Assemblage des éléments dans la popup d'erreur
    errorPopup.appendChild(errorTitle);
    errorPopup.appendChild(errorMessage);
    errorPopup.appendChild(okButton);

    // Assemblage final de la popup d'erreur et de l'overlay
    errorOverlay.appendChild(errorPopup);
    document.body.appendChild(errorOverlay);

    // Gestion du clic en dehors de la popup d'erreur pour fermer
    errorOverlay.addEventListener('click', (e) => {
        if (e.target === errorOverlay) {
            closeErrorPopup();
        }
    });
}

// Fonction pour fermer la popup d'erreur
function closeErrorPopup() {
    const errorOverlay = document.querySelector('.error-overlay');
    if (errorOverlay) {
        document.body.removeChild(errorOverlay);
    }
}

// Fonction pour charger un script externe avec une promesse
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = () => {
            reject(`Erreur lors du chargement du script ${url}`);
        };
        document.head.appendChild(script);
    });
}

// Fonction pour charger les dépendances avec async/await et gestion des erreurs
async function loadDependencies() {
    try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip-utils/0.0.2/jszip-utils.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.6.0/jszip.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js');
        console.log("Toutes les dépendances ont été chargées avec succès.");
    } catch (error) {
        console.error("Erreur lors du chargement des scripts :", error);
        erreur(error); // Afficher l'erreur avec la fonction erreur
        throw new Error("Erreur lors du chargement des dépendances.");
    }
}

// Fonction pour vérifier et récupérer les copies disponibles
function retrieveCopiesAndDownload() {
    // Obtenir l'URL actuelle de la page
    var currentUrl = window.location.href;

    // Vérifier si l'URL commence par "https://cyclades.education.gouv.fr/santorin/th/correction?idCopie="
    var expectedStart = "https://cyclades.education.gouv.fr/santorin/th/correction?idCopie=";

    if (currentUrl.startsWith(expectedStart)) {
        console.log("L'URL correspond au modèle attendu.");

        // Vérifier la classe de l'élément avec l'ID "showListCopies"
        var showListCopiesElement = document.getElementById("showListCopies");

        if (showListCopiesElement) {
            console.log("L'élément avec l'ID 'showListCopies' a été trouvé.");

            // Vérifier si l'élément a la classe "active"
            if (showListCopiesElement.classList.contains("active")) {
                console.log("L'élément 'showListCopies' est déjà actif.");
                
                // Récupérer et afficher les éléments <tr> avec la classe "listeCopiesRow"
                var copiesRows = document.querySelectorAll("tr.listeCopiesRow");
                console.log("Éléments 'tr.listeCopiesRow' trouvés après activation (ou déjà actifs) :");
                /*copiesRows.forEach(function(row) {
                    console.log("ID de l'élément : " + row.id);
                });*/

                // Charger les dépendances uniquement si des copies sont trouvées
                if (copiesRows.length > 0) {
                    loadDependencies().then(() => {
                        console.log("Prêt à télécharger les fichiers. Affichage de la popup.");
                        showPopup();
                    }).catch((error) => {
                        erreur(error);
                    });
                } else {
                    erreur("Aucune copie trouvée sur la page.");
                }

            } else {
                console.log("L'élément 'showListCopies' n'est pas actif. Simulation du clic...");
                // Si non, simuler un clic sur cet élément
                showListCopiesElement.click();
                console.log("Clic simulé sur l'élément 'showListCopies'.");

                // Ajouter un délai pour s'assurer que le DOM a eu le temps de se mettre à jour après le clic
                setTimeout(function() {
                    // Récupérer et afficher les éléments <tr> avec la classe "listeCopiesRow"
                    var copiesRows = document.querySelectorAll("tr.listeCopiesRow");
                    console.log("Éléments 'tr.listeCopiesRow' trouvés après clic simulé :");
                    copiesRows.forEach(function(row) {
                        console.log("ID de l'élément : " + row.id);
                    });

                    // Charger les dépendances uniquement si des copies sont trouvées
                    if (copiesRows.length > 0) {
                        loadDependencies().then(() => {
                            console.log("Prêt à télécharger les fichiers. Appelez la fonction `telecharger(x, y)` pour démarrer.");
                            showPopup();
                        }).catch((error) => {
                            erreur(error);
                        });
                    } else {
                        erreur("Aucune copie trouvée sur la page après simulation du clic.");
                    }
                }, 500); // Délai en millisecondes (ajustez si nécessaire)
            }
        } else {
            erreur("L'élément avec l'ID 'showListCopies' n'existe pas.");
        }
    } else {
        //if (currentUrl.startsWith(expectedStart))
        let errText = "Connectez-vous à Santorin, et ouvrez une copie du lot que vous voulez exporter avant de relancer le programme."
        if (currentUrl.startsWith("https://cyclades.education.gouv.fr/santorin/")) errText = "Ouvrez une copie du lot que vous voulez exporter avant de relancer le programme.";
        if (currentUrl.startsWith("https://cyclades.education.gouv.fr/santorin/an/accueil")) errText = "Ouvrez le lot à exporter en PDF, puis ouvrez une copie avant de relancer le programme";
        if (currentUrl.startsWith("https://cyclades.education.gouv.fr/santorin/an/lots/")) errText = "Ouvrez n'importe quelle copie du lot avant de relancer le programme";

        // Si l'URL ne commence pas comme attendu, afficher le message dans la console
        erreur(errText);
    }
}

// Appeler la fonction principale pour récupérer les copies et, si trouvées, charger les dépendances
retrieveCopiesAndDownload();
