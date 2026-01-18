const fs = require('fs');
const path = require('path');

// Configurazione
const rootDir = './'; // La cartella dove si trova lo script
const outputJson = 'games-data.json';
const excludedFiles = ['index.html', 'index2.html', 'index3.html', 'update.js', 'games-data.json'];

function getGames(dir, category = 'Vari') {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            // Se è una cartella (es. Chris o Julie), entra dentro
            // Usa il nome della cartella come categoria
            results = results.concat(getGames(filePath, file));
        } else {
            // Se è un file HTML
            if (file.endsWith('.html') && !excludedFiles.includes(file.toLowerCase())) {
                results.push({
                    name: file,
                    path: filePath.replace(/\\/g, '/'), // Converte percorsi Windows in web
                    category: category,
                    createdAt: stat.birthtimeMs // Data creazione file
                });
            }
        }
    });
    return results;
}

console.log('--- Scansione cartella C:\\Repos\\Giochi ---');
const allGames = getGames(rootDir);

// ORDINA: Dal più nuovo al più vecchio
allGames.sort((a, b) => b.createdAt - a.createdAt);

// Salva il file JSON
fs.writeFileSync(outputJson, JSON.stringify(allGames, null, 2));

console.log(`✅ Successo! Trovati ${allGames.length} giochi.`);
console.log(`Aggiornato: ${outputJson}`);