import type { FunctionalComponent } from "preact";
import { signal, effect } from "@preact/signals";

import type * as Table from "../interfaces/DbTablesV1";
import type { SelectedAll } from "../interfaces";

import { pokemonTcgData } from "./tgcData";
import { OwnedSummary } from "./OwnedSummary";
import { ImageCard } from "./ImageCard";

export const INDIVIDUALS_TABLE = signal<SelectedAll<Table.individualRow>>([]);
export const LOCATIONS_TABLE = signal<SelectedAll<Table.locationRow>>([]);

effect(() => {
  console.log("Hi", INDIVIDUALS_TABLE.value[0]?.quantity);
});

export async function loadData() {
  {
    const resultIndividuals = await fetch("/api/individuals");
    if (resultIndividuals.ok) {
      const payload = await resultIndividuals.json();
      INDIVIDUALS_TABLE.value = payload;
    }
  }
  {
    const resultLocations = await fetch("/api/locations");
    if (resultLocations.ok) {
      const payload = await resultLocations.json();
      LOCATIONS_TABLE.value = payload;
    }
  }
}

// initial
loadData();

export const Library: FunctionalComponent = () => {
  console.log("rerendering Library", INDIVIDUALS_TABLE.value[0]);
  return (
    <table>
      <tbody>
        {INDIVIDUALS_TABLE.value.map((card) => {
          const set = card.cardId.split("-")[0];
          const tcg = pokemonTcgData.cards[card.cardId];
          return (
            <tr key={card.id}>
              <td>
                <ImageCard cardId={card.cardId} />
              </td>
              <td>{tcg?.flavorText}</td>
              <td>
                {tcg
                  ? `${tcg.number}/${
                      pokemonTcgData.sets.find((s) => s.id === set)?.total ??
                      set
                    }`
                  : ""}
              </td>
              <td>
                <OwnedSummary individual={card} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
