const fs = require('fs');
const path = require('path');

const rootDir = './';
const outputJs = 'dati.js'; // CAMBIATO: Ora è un file .js
const excludedFiles = ['index.html', 'update.js', 'dati.js', 'favicon.ico'];

function getGames(dir, category = 'Vari') {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            // Escludi cartelle di sistema o nascoste
            if (!file.startsWith('.') && file !== 'node_modules') {
                results = results.concat(getGames(filePath, file));
            }
        } else {
            if (file.toLowerCase().endsWith('.html') && !excludedFiles.includes(file.toLowerCase())) {
                results.push({
                    name: file,
                    path: filePath.replace(/\\/g, '/'),
                    category: category,
                    createdAt: stat.birthtimeMs // Data creazione reale
                });
            }
        }
    });
    return results;
}

console.log('--- Aggiornamento dati giochi ---');
const allGames = getGames(rootDir);

// Ordina per data: più recente sopra
allGames.sort((a, b) => b.createdAt - a.createdAt);

// Crea il contenuto del file JS
const content = `const GIOCHI_DATA = ${JSON.stringify(allGames, null, 2)};`;

fs.writeFileSync(outputJs, content);
console.log(`✅ Successo! Creato ${outputJs} con ${allGames.length} giochi.`);