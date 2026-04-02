const fs = require('fs');
const path = require('path');
const https = require('https');

const formatTeamFile = (teamName) => {
    return teamName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
};

const teams = [
  { name: "Palmeiras", wiki: "Sociedade_Esportiva_Palmeiras", lang: "pt" },
  { name: "Flamengo", wiki: "Clube_de_Regatas_do_Flamengo", lang: "pt" },
  { name: "Fluminense", wiki: "Fluminense_Football_Club", lang: "pt" },
  { name: "Bahia", wiki: "Esporte_Clube_Bahia", lang: "pt" },
  { name: "São Paulo", wiki: "São_Paulo_Futebol_Clube", lang: "pt" },
  { name: "Athletico-PR", wiki: "Club_Athletico_Paranaense", lang: "pt" },
  { name: "Coritiba", wiki: "Coritiba_Foot_Ball_Club", lang: "pt" },
  { name: "Vasco", wiki: "Club_de_Regatas_Vasco_da_Gama", lang: "pt" },
  { name: "Grêmio", wiki: "Grêmio_Foot-Ball_Porto_Alegrense", lang: "pt" },
  { name: "Vitória", wiki: "Esporte_Clube_Vitória", lang: "pt" },
  { name: "Corinthians", wiki: "Sport_Club_Corinthians_Paulista", lang: "pt" },
  { name: "Botafogo", wiki: "Botafogo_de_Futebol_e_Regatas", lang: "pt" },
  { name: "Internacional", wiki: "Sport_Club_Internacional", lang: "pt" },
  { name: "Atlético-MG", wiki: "Clube_Atlético_Mineiro", lang: "pt" },
  { name: "RB Bragantino", wiki: "Red_Bull_Bragantino", lang: "pt" },
  { name: "Chapecoense", wiki: "Associação_Chapecoense_de_Futebol", lang: "pt" },
  { name: "Santos", wiki: "Santos_Futebol_Clube", lang: "pt" },
  { name: "Cruzeiro", wiki: "Cruzeiro_Esporte_Clube", lang: "pt" },
  { name: "Mirassol", wiki: "Mirassol_Futebol_Clube", lang: "pt" },
  { name: "Remo", wiki: "Clube_do_Remo", lang: "pt" },
  { name: "Real Madrid", wiki: "Real_Madrid_CF", lang: "en" },
  { name: "Barcelona", wiki: "FC_Barcelona", lang: "en" },
  { name: "Manchester City", wiki: "Manchester_City_F.C.", lang: "en" },
  { name: "Manchester United", wiki: "Manchester_United_F.C.", lang: "en" },
  { name: "Chelsea", wiki: "Chelsea_F.C.", lang: "en" },
  { name: "Arsenal", wiki: "Arsenal_F.C.", lang: "en" },
  { name: "Liverpool", wiki: "Liverpool_F.C.", lang: "en" },
  { name: "Aston Villa", wiki: "Aston_Villa_F.C.", lang: "en" },
  { name: "Newcastle", wiki: "Newcastle_United_F.C.", lang: "en" },
  { name: "Tottenham", wiki: "Tottenham_Hotspur_F.C.", lang: "en" },
  { name: "Atlético de Madrid", wiki: "Atlético_Madrid", lang: "en" },
  { name: "Inter de Milão", wiki: "Inter_Milan", lang: "en" },
  { name: "Bayern de Munique", wiki: "FC_Bayern_Munich", lang: "en" }
];

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Status ${res.statusCode} for ${url}`));
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
            file.on('error', (err) => {
                fs.unlink(dest, () => reject(err));
            });
        });
        req.on('error', reject);
    });
};

const getImageUrl = (wiki, lang) => {
    return new Promise((resolve, reject) => {
        const url = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(wiki)}&pithumbsize=200&format=json`;
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const pages = parsed.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pageId === '-1' || !pages[pageId].thumbnail) {
                        return reject(new Error('No image found'));
                    }
                    resolve(pages[pageId].thumbnail.source);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
};

async function main() {
    for (const team of teams) {
        const slug = formatTeamFile(team.name);
        const dest = path.join(__dirname, 'public', 'escudos', `${slug}.png`);
        
        try {
            let imgUrl = await getImageUrl(team.wiki, team.lang);
            console.log(`Baixando ${team.name}...`);
            await downloadFile(imgUrl, dest);
        } catch (e) {
            console.error(`Falha ao pegar ${team.name}: ${e.message}`);
        }
    }
    console.log("Downloads finalizados.");
}
main();
