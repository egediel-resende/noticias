const fs = require('fs');
const path = require('path');
const https = require('https');

const formatTeamFile = (teamName) => {
    return teamName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
};

// IDs Reais do SofaScore para os times
const teams = [
  { name: "Palmeiras", id: 1963 },
  { name: "Flamengo", id: 5981 },
  { name: "Fluminense", id: 1961 },
  { name: "Bahia", id: 1955 },
  { name: "São Paulo", id: 1981 },
  { name: "Athletico-PR", id: 1967 },
  { name: "Coritiba", id: 1982 },
  { name: "Vasco", id: 1974 },
  { name: "Grêmio", id: 1958 },
  { name: "Vitória", id: 1976 },
  { name: "Corinthians", id: 1966 },
  { name: "Botafogo", id: 1957 },
  { name: "Internacional", id: 1962 },
  { name: "Atlético-MG", id: 1977 },
  { name: "RB Bragantino", id: 1999 },
  { name: "Chapecoense", id: 1969 },
  { name: "Santos", id: 1968 },
  { name: "Cruzeiro", id: 1954 },
  { name: "Mirassol", id: 3237 },
  { name: "Remo", id: 10452 },
  { name: "Real Madrid", id: 2829 },
  { name: "Barcelona", id: 2817 },
  { name: "Manchester City", id: 17 },
  { name: "Manchester United", id: 35 },
  { name: "Chelsea", id: 38 },
  { name: "Arsenal", id: 42 },
  { name: "Liverpool", id: 44 },
  { name: "Aston Villa", id: 40 },
  { name: "Newcastle", id: 39 },
  { name: "Tottenham", id: 33 },
  { name: "Atlético de Madrid", id: 2836 },
  { name: "Inter de Milão", id: 2697 },
  { name: "Bayern de Munique", id: 2672 }
];

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Status ${res.statusCode}`));
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        });
        req.on('error', reject);
    });
};

async function main() {
    const dir = path.join(__dirname, 'public', 'escudos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    for (const team of teams) {
        const slug = formatTeamFile(team.name);
        const dest = path.join(dir, `${slug}.png`);
        const url = `https://api.sofascore.app/api/v1/team/${team.id}/image`;
        
        try {
            console.log(`Baixando ${team.name}...`);
            await downloadFile(url, dest);
        } catch (e) {
            console.error(`Erro ao baixar ${team.name}: ${e.message}`);
        }
    }
    console.log("Downloads SofaScore finalizados.");
}
main();
