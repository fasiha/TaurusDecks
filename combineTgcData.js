import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";

const DIR = "./pokemon-tcg-data";
if (!existsSync(DIR)) {
  console.error(
    `USAGE: download https://github.com/PokemonTCG/pokemon-tcg-data and put it in this directory`
  );
  process.exit(1);
}

const DATA = {};

const sets = JSON.parse(readFileSync(`${DIR}/sets/en.json`));
DATA.sets = sets;

DATA.cards = {};
const cardsParent = `${DIR}/cards/en`;
for (const file of readdirSync(cardsParent)) {
  const cardSet = JSON.parse(readFileSync(`${cardsParent}/${file}`));
  DATA.cards[file.split(".")[0]] = cardSet;
}

writeFileSync("pokemon-tcg-data.json", JSON.stringify(DATA));
