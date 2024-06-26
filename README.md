A injecter dans la console :

fetch('https://raw.githubusercontent.com/VMirebeau/SantoScrap/main/santoscrap.js').then(response => response.text()).then(scriptContent => { const script = document.createElement('script'); script.textContent = scriptContent; document.head.appendChild(script); console.log('Le script a été chargé et exécuté avec succès.'); }).catch(error => console.error('Erreur de chargement du script', error));
