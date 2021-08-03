// importação de dependência(s)
import fs from "fs";
import express from "express";

const app = express();

// variáveis globais deste módulo
const PORT = 3000;

// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 1-4 linhas de código (você deve usar o módulo de filesystem (fs))

const players = JSON.parse(fs.readFileSync("server/data/jogadores.json"));
const games = JSON.parse(fs.readFileSync("server/data/jogosPorJogador.json"));

const db = { players: players, games: games };

// configurar qual templating engine usar. Sugestão: hbs (handlebars)
// dica: 2 linhas
app.set("view engine", "hbs");
app.set("views", "server/views");

// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json (~3 linhas)
app.get("/", (req, res) => {
    res.render("index", db.players);
});

// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter ~15 linhas de código

// https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
const copy = (obj) => JSON.parse(JSON.stringify(obj));

app.get("/jogador/:id/", (req, res) => {
    const id = req.params.id;
    const player = db.players.players.find((p) => p.steamid === id);

    // apenas o array de games vai ser "alterado" pra calcular minutos -> horas
    const currentPlayerGames = copy(db.games[id]);

    player.top5 = currentPlayerGames.games.sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, 5);
    player.top5.map((game) => (game.playtime_forever = Math.floor(game.playtime_forever / 60)));
    player.fav_game = player.top5.slice(0, 1)[0];
    player.not_played = currentPlayerGames.games.filter((game) => game.playtime_forever === 0).length;
    player.count = currentPlayerGames.game_count;

    res.render("jogador", player);
});

// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código

app.use(express.static("client/"));

// abrir servidor na porta 3000 (constante PORT)
// dica: 1-3 linhas de código

app.listen(PORT, () => {
    console.log("Escutando em: http://localhost:3000");
});
