const fs = require('fs');
const path = require('path');

// Configurazione
const rootDir = './';
const outputJs = 'dati.js';
// Lista file da NON mostrare come giochi
const excludedFiles = [
    'index.html', 
    'index2.html', 
    'index3.html', 
    'update.js', 
    'dati.js', 
    'favicon.ico', 
    'games-data.json',
    'package.json',
    'node_modules'
];

function getGames(dir, category = 'Vari') {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            // Se è una cartella, entra e usa il nome cartella come categoria
            if (!file.startsWith('.') && !excludedFiles.includes(file)) {
                results = results.concat(getGames(filePath, file));
            }
        } else {
            // Se è un file HTML ed è un gioco vero (non un index)
            const fileNameLower = file.toLowerCase();
            if (fileNameLower.endsWith('.html') && !excludedFiles.includes(fileNameLower)) {
                results.push({
                    name: file,
                    path: filePath.replace(/\\/g, '/'),
                    category: category,
                    updatedAt: stat.mtimeMs // USIAMO LA DATA DI ULTIMA MODIFICA
                });
            }
        }
    });
    return results;
}

console.log('--- Scansione file per Ultima Modifica ---');

try {
    const allGames = getGames(rootDir);

    // ORDINAMENTO: Il più recente (mtimeMs più alto) va in cima
    allGames.sort((a, b) => b.updatedAt - a.updatedAt);

    // Scrittura del file dati.js
    const content = `const GIOCHI_DATA = ${JSON.stringify(allGames, null, 2)};`;
    fs.writeFileSync(outputJs, content);

    console.log(`✅ Successo! ${allGames.length} giochi trovati.`);
    console.log(`Aggiornato ${outputJs} (Ordine: Ultima modifica).`);
} catch (error) {
    console.error('❌ Errore durante l\'aggiornamento:', error);
}