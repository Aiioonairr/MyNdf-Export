// Variables pour stocker les fichiers par jour
const files = {
    lundi: null,
    mardi: null,
    mercredi: null,
    jeudi: null,
    vendredi: null
};

// Variables pour stocker les fichiers des justificatifs
const justificatifsFiles = {
    train_avion: [],
    transport: [],
    taxe: [],
    courses: []
};

// Variables pour stocker les repas du soir (même structure que les repas par jour)
const repasSoirFiles = {
    lundi_soir: null,
    mardi_soir: null,
    mercredi_soir: null,
    jeudi_soir: null,
    vendredi_soir: null
};

// Références DOM
const generateBtn = document.getElementById('generateBtn');
const globalStatus = document.getElementById('global-status');
const filenameInput = document.getElementById('filename');

// Écouteurs pour chaque input fichier des jours
['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'].forEach(day => {
    document.getElementById(day).addEventListener('change', function(event) {
        const file = event.target.files[0];
        files[day] = file || null;
        updateGenerateButtonState();
    });
});

// Écouteurs pour les checkboxes des justificatifs
document.querySelectorAll('input[type="checkbox"][name="justificatif"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const inputDiv = document.getElementById('input-' + this.value);
        
        if (this.checked) {
            if (this.value === 'repas_soir') {
                // Traitement spécial pour les repas du soir
                createRepasSoirInputs(inputDiv);
            } else {
                // Crée un input multiple pour les autres justificatifs
                if (!inputDiv.querySelector('input[type="file"]')) {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.name = this.value + '[]';
                    input.multiple = true;
                    input.accept = 'image/*,application/pdf';
                    input.addEventListener('change', function(event) {
                        justificatifsFiles[checkbox.value] = Array.from(event.target.files);
                        updateGenerateButtonState();
                    });
                    inputDiv.appendChild(input);
                }
            }
        } else {
            // Supprime l'input si décoché
            inputDiv.innerHTML = '';
            if (this.value === 'repas_soir') {
                // Remet à zéro les repas du soir
                Object.keys(repasSoirFiles).forEach(key => {
                    repasSoirFiles[key] = null;
                });
            } else {
                justificatifsFiles[this.value] = [];
            }
            updateGenerateButtonState();
        }
    });
});

// Fonction pour créer les inputs des repas du soir
function createRepasSoirInputs(container) {
    const repasSoirSection = document.createElement('div');
    repasSoirSection.className = 'repas-soir-section';
    
    const jours = [
        { key: 'lundi_soir', label: 'Lundi soir' },
        { key: 'mardi_soir', label: 'Mardi soir' },
        { key: 'mercredi_soir', label: 'Mercredi soir' },
        { key: 'jeudi_soir', label: 'Jeudi soir' },
        { key: 'vendredi_soir', label: 'Vendredi soir' }
    ];
    
    jours.forEach(jour => {
        const label = document.createElement('label');
        label.textContent = jour.label;
        label.setAttribute('for', jour.key);
        
        const input = document.createElement('input');
        input.type = 'file';
        input.id = jour.key;
        input.accept = 'image/*,application/pdf';
        input.addEventListener('change', function(event) {
            const file = event.target.files[0];
            repasSoirFiles[jour.key] = file || null;
            updateGenerateButtonState();
        });
        
        repasSoirSection.appendChild(label);
        repasSoirSection.appendChild(input);
    });
    
    container.appendChild(repasSoirSection);
}

// Met à jour le bouton et le message global
function updateGenerateButtonState() {
    const dayCount = Object.values(files).filter(f => f !== null).length;
    const justifCount = Object.values(justificatifsFiles).reduce((total, arr) => total + arr.length, 0);
    const repasSoirCount = Object.values(repasSoirFiles).filter(f => f !== null).length;
    const totalCount = dayCount + justifCount + repasSoirCount;
    
    generateBtn.disabled = totalCount === 0;

    if (totalCount > 0) {
        let message = `✅ ${totalCount} document${totalCount > 1 ? 's' : ''} chargé${totalCount > 1 ? 's' : ''}.`;
        let details = [];
        
        if (dayCount > 0) {
            details.push(`${dayCount} repas par jour`);
        }
        if (repasSoirCount > 0) {
            details.push(`${repasSoirCount} repas du soir`);
        }
        if (justifCount > 0) {
            details.push(`${justifCount} autres justificatifs`);
        }
        
        if (details.length > 0) {
            message += ` (${details.join(', ')})`;
        }
        
        globalStatus.textContent = message;
    } else {
        globalStatus.textContent = '';
    }
}

// FONCTION QUALITÉ MAXIMALE ABSOLUE : Aucune compression, résolution maximale
function resizeAndCompressImage(img, maxWidth = 4000, maxHeight = 3000, quality = 1.0) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    let { width, height } = img;
    
    // Calcul du ratio pour respecter les dimensions max (très élevées)
    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
    
    canvas.width = width;
    canvas.height = height;
    
    // Paramètres de rendu ultra-haute qualité
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.globalCompositeOperation = 'source-over';
    
    // Dessine l'image redimensionnée avec la plus haute précision
    ctx.drawImage(img, 0, 0, width, height);
    
    // Retourne l'image sans compression (qualité = 1.0)
    return canvas.toDataURL('image/jpeg', quality);
}

// Conversion PDF → image avec pdf.js (QUALITÉ MAXIMALE ABSOLUE)
function convertPDFToImage(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = function () {
            const pdfData = new Uint8Array(this.result);

            pdfjsLib.getDocument(pdfData).promise.then(function (pdf) {
                pdf.getPage(1).then(function (page) {
                    // Échelle MAXIMALE pour une résolution parfaite
                    const scale = 4.0;
                    const viewport = page.getViewport({ scale });

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    // Paramètres de rendu ultra-haute qualité
                    context.imageSmoothingEnabled = true;
                    context.imageSmoothingQuality = 'high';
                    context.globalCompositeOperation = 'source-over';

                    page.render({ 
                        canvasContext: context, 
                        viewport: viewport,
                        intent: 'print' // Mode impression pour la meilleure qualité
                    }).promise.then(function () {
                        const img = new Image();
                        img.src = canvas.toDataURL('image/jpeg', 1.0); // AUCUNE compression
                        img.onload = function () {
                            resolve(img);
                        };
                    });
                });
            }).catch(reject);
        };

        fileReader.readAsArrayBuffer(file);
    });
}

// Fonction pour traiter une image
async function processImage(file) {
    if (file.type.startsWith('image/')) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => img.onload = resolve);
        return img;
    } else if (file.type === 'application/pdf') {
        return await convertPDFToImage(file);
    }
    return null;
}

// Génération du PDF (QUALITÉ MAXIMALE ABSOLUE)
generateBtn.addEventListener('click', async function () {
    const { jsPDF } = window.jspdf;
    // Utilise la plus haute résolution possible pour jsPDF
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: false // Désactive la compression interne de jsPDF
    });
    
    let yPos = 20;
    const margin = 10;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const maxImageWidth = pageWidth - 2 * margin;
    const maxImageHeight = 80;

    // Fonction pour ajouter une nouvelle page si nécessaire
    function checkNewPage(neededHeight) {
        if (yPos + neededHeight > pageHeight - margin) {
            doc.addPage();
            yPos = 20;
        }
    }

    // 1. Traiter les repas par jour (format horizontal)
    const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
    const dayFiles = jours.filter(day => files[day] !== null);
    
    if (dayFiles.length > 0) {
        doc.setFontSize(16);
        doc.text('Repas par jour', margin, yPos);
        yPos += 15;
        
        const columnWidth = maxImageWidth / dayFiles.length;
        let xPos = margin;
        
        for (const day of dayFiles) {
            const file = files[day];
            if (!file) continue;

            try {
                const img = await processImage(file);
                if (img) {
                    const aspectRatio = img.width / img.height;
                    const imgHeight = Math.min(maxImageHeight, columnWidth / aspectRatio);
                    const imgWidth = columnWidth - 5;
                    
                    // QUALITÉ MAXIMALE ABSOLUE : Multiplicateur x10 avec qualité parfaite
                    const compressedDataUrl = resizeAndCompressImage(img, imgWidth * 10, imgHeight * 10, 1.0);
                    
                    doc.setFontSize(10);
                    doc.text(day.charAt(0).toUpperCase() + day.slice(1), xPos, yPos - 5);
                    doc.addImage(compressedDataUrl, 'JPEG', xPos, yPos, imgWidth, imgHeight, undefined, 'NONE');
                    xPos += columnWidth;
                }
            } catch (error) {
                console.error(`Erreur lors du traitement de ${day}:`, error);
            }
        }
        
        yPos += maxImageHeight + 20;
    }

    // 2. Traiter les repas du soir (même format que les repas par jour)
    const joursSoir = ['lundi_soir', 'mardi_soir', 'mercredi_soir', 'jeudi_soir', 'vendredi_soir'];
    const repasSoirFilesArray = joursSoir.filter(day => repasSoirFiles[day] !== null);
    
    if (repasSoirFilesArray.length > 0) {
        checkNewPage(100);
        
        doc.setFontSize(16);
        doc.text('Repas du soir', margin, yPos);
        yPos += 15;
        
        const columnWidth = maxImageWidth / repasSoirFilesArray.length;
        let xPos = margin;
        
        for (const daySoir of repasSoirFilesArray) {
            const file = repasSoirFiles[daySoir];
            if (!file) continue;

            try {
                const img = await processImage(file);
                if (img) {
                    const aspectRatio = img.width / img.height;
                    const imgHeight = Math.min(maxImageHeight, columnWidth / aspectRatio);
                    const imgWidth = columnWidth - 5;
                    
                    // QUALITÉ MAXIMALE ABSOLUE : Multiplicateur x10 avec qualité parfaite
                    const compressedDataUrl = resizeAndCompressImage(img, imgWidth * 10, imgHeight * 10, 1.0);
                    
                    // Nom du jour sans "_soir"
                    const dayName = daySoir.replace('_soir', '');
                    doc.setFontSize(10);
                    doc.text(dayName.charAt(0).toUpperCase() + dayName.slice(1), xPos, yPos - 5);
                    doc.addImage(compressedDataUrl, 'JPEG', xPos, yPos, imgWidth, imgHeight, undefined, 'NONE');
                    xPos += columnWidth;
                }
            } catch (error) {
                console.error(`Erreur lors du traitement de ${daySoir}:`, error);
            }
        }
        
        yPos += maxImageHeight + 20;
    }

    // 3. Traiter les autres justificatifs (un par page)
    const justificatifsLabels = {
        train_avion: 'Billet de train / avion',
        transport: 'Transport en commun',
        taxe: 'Taxe de séjour',
        courses: 'Courses (alimentation)'
    };

    for (const [type, filesList] of Object.entries(justificatifsFiles)) {
        if (filesList.length === 0) continue;

        for (let i = 0; i < filesList.length; i++) {
            const file = filesList[i];
            
            // Nouvelle page pour chaque justificatif
            if (i > 0 || yPos > 50) {
                doc.addPage();
                yPos = 20;
            }
            
            try {
                const img = await processImage(file);
                if (img) {
                    // Titre
                    doc.setFontSize(16);
                    doc.text(`${justificatifsLabels[type]} ${filesList.length > 1 ? `(${i + 1}/${filesList.length})` : ''}`, margin, yPos);
                    yPos += 20;
                    
                    // Calculer les dimensions de l'image
                    const aspectRatio = img.width / img.height;
                    let imgWidth = maxImageWidth;
                    let imgHeight = imgWidth / aspectRatio;
                    
                    // Si l'image est trop haute, ajuster
                    if (imgHeight > pageHeight - yPos - margin) {
                        imgHeight = pageHeight - yPos - margin;
                        imgWidth = imgHeight * aspectRatio;
                    }
                    
                    // QUALITÉ MAXIMALE ABSOLUE : Résolution ultra-haute avec qualité parfaite
                    const compressedDataUrl = resizeAndCompressImage(img, imgWidth * 6, imgHeight * 6, 1.0);
                    
                    // Centrer l'image
                    const xPos = (pageWidth - imgWidth) / 2;
                    
                    doc.addImage(compressedDataUrl, 'JPEG', xPos, yPos, imgWidth, imgHeight, undefined, 'NONE');
                    yPos += imgHeight + 20;
                }
            } catch (error) {
                console.error(`Erreur lors du traitement de ${type} ${i + 1}:`, error);
            }
        }
    }

    // Utiliser le nom fourni par l'utilisateur ou un nom par défaut
    const customName = filenameInput.value.trim() || 'justificatifs';
    doc.save(`${customName}.pdf`);
});
