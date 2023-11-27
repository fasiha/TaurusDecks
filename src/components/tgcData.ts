import rawData from "../../pokemon-tcg-data.json";
import { PokemonTCG } from "pokemon-tcg-sdk-typescript";

interface PokemonTcgData {
  sets: PokemonTCG.Set[];
  cards: Record<string, PokemonTCG.Card[]>;
}

export const pokemonTcgData: PokemonTcgData = rawData as PokemonTcgData;
