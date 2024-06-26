// Fonction pour récupérer les notes des divs sous le conteneur spécifié
function collectNotes(container) {
  // Sélectionne tous les div de premier niveau directement à l'intérieur du conteneur
  const firstLevelDivs = container.querySelectorAll(':scope > div');
  
  // Parcourt chaque div de premier niveau
  firstLevelDivs.forEach(div => {
    // Sélectionne le div avec col-id "libelleAnonymat" à l'intérieur de ce div
    const libelleAnonymatDiv = div.querySelector('[col-id="libelleAnonymat"]');
    
    // Sélectionne le div avec col-id "correction.note" à l'intérieur de ce div
    const correctionNoteDiv = div.querySelector('[col-id="correction.note"]');
    
    // Si les deux divs sont trouvés, on les utilise pour ajouter un élément au tableau notes
    if (libelleAnonymatDiv && correctionNoteDiv) {
      // Récupère le texte affiché
      const x = libelleAnonymatDiv.textContent.trim();
      let y = correctionNoteDiv.textContent.trim();
      
      // Sépare y au niveau du '/' et garde la partie avant le '/' (la note)
      if (y.includes('/')) {
        y = y.split('/')[0].trim();
      }
      
      // Ajoute [x, y] au tableau notes
      notes.push([x, y]);
    }
  });
}

// Fonction pour convertir le tableau de notes en CSV et télécharger le fichier
function downloadCSV(notes) {
  // Convertit le tableau en chaîne CSV
  let csvContent = "Libelle Anonymat,Note\n"; // En-tête des colonnes
  notes.forEach(note => {
    csvContent += note.join(",") + "\n"; // Chaque élément de note est joint par une virgule
  });

  // Crée un objet Blob à partir de la chaîne CSV
  const blob = new Blob([csvContent], { type: 'text/csv' });

  // Crée un lien de téléchargement
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'notes.csv'; // Nom du fichier téléchargé
  document.body.appendChild(a);
  a.click(); // Déclenche le téléchargement
  document.body.removeChild(a); // Supprime le lien de l'élément DOM
  URL.revokeObjectURL(url); // Libère l'objet URL
}

// Fonction principale pour gérer la pagination et la collecte des notes
function handlePaginationAndCollectNotes() {
  // Sélectionne le conteneur avec la classe "ag-center-cols-container"
  const container = document.querySelector('.ag-center-cols-container');

  // Collecte les notes pour le conteneur actuel
  collectNotes(container);

  // Vérifie si le bouton de pagination "suivant" est activé
  const nextButton = document.querySelector('.fr-pagination__link--next');
  
  if (nextButton && !nextButton.disabled) {
    // Si le bouton n'est pas désactivé, simule un clic sur ce bouton
    nextButton.click();
    
    // Attends 1 seconde avant de recommencer la routine
    setTimeout(handlePaginationAndCollectNotes, 1000);
  } else {
    // Si le bouton est désactivé, affiche le tableau des notes et télécharge le fichier CSV
    console.log('Notes collected:', notes);
    downloadCSV(notes);
  }
}

// Initialise le tableau notes
const notes = [];

// Démarre la routine
handlePaginationAndCollectNotes();
