import type { FunctionalComponent } from "preact";
import { pokemonTcgData } from "./tgcData";
import type { Tables } from "../interfaces";

interface Props {
  cardId: string;
}

export const ImageCard: FunctionalComponent<Props> = ({ cardId }) => {
  const hit = pokemonTcgData.cards[cardId];
  if (!hit) return <></>;
  return <img src={hit.images.small} alt={`${hit.name}. ${hit.flavorText}`} />;
};
