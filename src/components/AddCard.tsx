import type { FunctionalComponent } from "preact";
import { effect, signal, useSignal } from "@preact/signals";
import type { TargetedEvent } from "preact/compat";

import type { PokemonTCG } from "pokemon-tcg-sdk-typescript";
import { pokemonTcgData } from "./tgcData";
import { INDIVIDUALS_DB, loadIndividuals } from "./Library";

type Hit = { set: PokemonTCG.Set; card: PokemonTCG.Card };

export const AddCard: FunctionalComponent = () => {
  const input = useSignal("");
  const hits = useSignal<Hit[]>([]);

  function handleChange(e: TargetedEvent<HTMLInputElement, Event>) {
    input.value = (e.target as HTMLInputElement).value;
    const raw = (e.target as HTMLInputElement).value;
    const tokens = raw.split(/\s+/);
    const firstAllAlpha = tokens
      .find((s) => /^[A-Za-z]+$/.test(s))
      ?.toLowerCase();
    const firstNumber = tokens.find((s) => /^\d+$/.test(s));
    if (firstAllAlpha && firstNumber) {
      const nextHits: Hit[] = [];
      for (const set in pokemonTcgData.cards) {
        for (const card of pokemonTcgData.cards[set]) {
          if (
            card.number === firstNumber &&
            card.name.toLowerCase().startsWith(firstAllAlpha)
          ) {
            nextHits.push({
              card,
              set: pokemonTcgData.sets.find((s) => s.id === set)!,
            });
          }
        }
      }
      hits.value = nextHits;
    }
  }

  async function handleClick(cardId: string) {
    await fetch("/api/individual/" + cardId, {
      method: "POST",
      body: JSON.stringify({ location: "", finish: "", notes: "" }),
      headers: { "Content-Type": "application/json" },
    });

    await loadIndividuals();
  }

  return (
    <div>
      <div>
        <input onInput={handleChange} type="text" value={input} />
      </div>
      <table>
        <caption>Search results</caption>
        <thead>
          <tr>
            <td>Name</td>
            <td>Text</td>
            <td>Number</td>
            <td>Add?</td>
          </tr>
        </thead>
        <tbody>
          {hits.value.map((hit) => (
            <tr key={hit.card.id}>
              <td>{hit.card.name}</td>
              <td>{hit.card.flavorText}</td>
              <td>
                {hit.card.number}/{hit.set.total}
              </td>
              <td>
                <button onClick={() => handleClick(hit.card.id)}>Add!</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
