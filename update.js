
const fs = require('fs');
const path = require('path');

const rootDir = './';
const outputJs = 'dati.js'; 
const excludedFiles = ['index.html', 'update.js', 'dati.js'];

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
                    updatedAt: stat.mtimeMs // USIAMO LA DATA DI ULTIMA MODIFICA
                });
            }
        }
    });
    return results;
}

console.log('--- Aggiornamento dati giochi (per data di modifica) ---');
const allGames = getGames(rootDir);

// Ordina per data di modifica: più recente sopra
allGames.sort((a, b) => b.updatedAt - a.updatedAt);

// Crea il contenuto del file JS
const content = `const GIOCHI_DATA = ${JSON.stringify(allGames, null, 2)};`;

fs.writeFileSync(outputJs, content);
console.log(`✅ Successo! Creato ${outputJs} con ${allGames.length} giochi.`);