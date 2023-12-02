import type { FunctionalComponent } from "preact";
import { useSignal } from "@preact/signals";
import type { TargetedEvent } from "preact/compat";

import { pokemonTcgData } from "./tgcData";
import type { Hit } from "./types";
import { AddCard } from "./AddCard";
import { groupBy } from "../utils/utils";
import { OwnedSummary } from "./OwnedSummary";
import type { SelectedAll, Tables } from "../interfaces";

export const Search: FunctionalComponent = () => {
  const input = useSignal("");
  const hits = useSignal<Hit[]>([]);
  const owned = useSignal<Record<string, SelectedAll<Tables.individualRow>>>(
    {}
  );

  async function handleChange(e: TargetedEvent<HTMLInputElement, Event>) {
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
      const response = await fetch("/api/individuals", {
        method: "POST",
        headers: JSON_MIME,
        body: JSON.stringify(nextHits.map((o) => o.card.id)),
      });
      if (response.ok) {
        const results: SelectedAll<Tables.individualRow> =
          await response.json();
        owned.value = groupBy(results, (c) => c.cardId);
      }
    }
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
            <td>Owned</td>
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
                {(owned.value[hit.card.id] ?? []).map((card) => (
                  <OwnedSummary individual={card} />
                ))}
              </td>
              <td>
                <AddCard hit={hit} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const JSON_MIME = { "Content-Type": "application/json" };
