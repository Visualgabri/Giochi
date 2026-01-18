const fs = require('fs');
const path = require('path');

const folders = ['./Chris', './Julie', './']; // Cartelle da scansionare
const outputFileName = 'games-data.json';
let allFiles = [];

folders.forEach(folder => {
    if (!fs.existsSync(folder)) return;
    
    const files = fs.readdirSync(folder);
    files.forEach(file => {
        if (file.endsWith('.html') && !file.startsWith('index')) {
            const filePath = path.join(folder, file);
            const stats = fs.statSync(filePath);
            
            allFiles.push({
                path: filePath.replace(/\\/g, '/'), // Converte i percorsi per il web
                name: file,
                category: folder === './' ? 'Vari' : folder.replace('./', ''),
                createdAt: stats.birthtimeMs // Data creazione file
            });
        }
    });
});

// Ordina dal più nuovo al più vecchio
allFiles.sort((a, b) => b.createdAt - a.createdAt);

fs.writeFileSync(outputFileName, JSON.stringify(allFiles, null, 2));
console.log(`✅ Lista aggiornata! Trovi ${allFiles.length} giochi in ${outputFileName}`);