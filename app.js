// Variables pour stocker les fichiers par jour
const files = {
    lundi: null,
    mardi: null,
    mercredi: null,
    jeudi: null,
    vendredi: null
};

// Références DOM
const generateBtn = document.getElementById('generateBtn');
const globalStatus = document.getElementById('global-status');
const filenameInput = document.getElementById('filename');

// Écouteurs pour chaque input fichier
['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'].forEach(day => {
    document.getElementById(day).addEventListener('change', function(event) {
        const file = event.target.files[0];
        files[day] = file || null;
        updateGenerateButtonState();
    });
});

// Met à jour le bouton et le message global
function updateGenerateButtonState() {
    const count = Object.values(files).filter(f => f !== null).length;
    generateBtn.disabled = count === 0;

    if (count > 0) {
        globalStatus.textContent = `✅ ${count} document${count > 1 ? 's' : ''} chargé${count > 1 ? 's' : ''}.`;
    } else {
        globalStatus.textContent = '';
    }
}

// Conversion PDF → image avec pdf.js
function convertPDFToImage(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = function () {
            const pdfData = new Uint8Array(this.result);

            pdfjsLib.getDocument(pdfData).promise.then(function (pdf) {
                pdf.getPage(1).then(function (page) {
                    const scale = 1.5;
                    const viewport = page.getViewport({ scale });

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    page.render({ canvasContext: context, viewport }).promise.then(function () {
                        const img = new Image();
                        img.src = canvas.toDataURL();
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

// Génération du PDF
generateBtn.addEventListener('click', async function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');

    let xPos = 10;
    let yPos = 20;
    const margin = 10;
    const columnWidth = (doc.internal.pageSize.width - 2 * margin) / 5;
    const lineHeight = 80;
    const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];

    let columnIndex = 0;

    for (const day of jours) {
        const file = files[day];
        if (!file) continue;

        try {
            let img = null;

            if (file.type.startsWith('image/')) {
                img = new Image();
                img.src = URL.createObjectURL(file);
                await new Promise((resolve) => img.onload = resolve);
            } else if (file.type === 'application/pdf') {
                img = await convertPDFToImage(file);
            }

            const aspectRatio = img.width / img.height;
            const imgHeight = columnWidth / aspectRatio;
            const x = xPos + (columnIndex * columnWidth);

            doc.text(day.charAt(0).toUpperCase() + day.slice(1), x, yPos - 5);
            doc.addImage(img, 'JPEG', x, yPos, columnWidth - 10, imgHeight);

            columnIndex++;
        } catch (error) {
            console.error(`Erreur lors du traitement de ${day}:`, error);
        }
    }

    // Utiliser le nom fourni par l'utilisateur ou un nom par défaut
    const customName = filenameInput.value.trim() || 'semaine';
    doc.save(`${customName}.pdf`);
});
