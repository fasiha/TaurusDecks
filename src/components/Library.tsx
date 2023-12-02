import type { FunctionalComponent } from "preact";
import { signal } from "@preact/signals";

import type * as Table from "../interfaces/DbTablesV1";
import type { SelectedAll } from "../interfaces";

import { pokemonTcgData } from "./tgcData";
import { OwnedSummary } from "./OwnedSummary";

export const INDIVIDUALS_TABLE = signal<SelectedAll<Table.individualRow>>([]);
export const LOCATIONS_TABLE = signal<SelectedAll<Table.locationRow>>([]);

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
  return (
    <table>
      <caption>Cards we have</caption>
      <thead>
        <tr>
          <td>Name</td>
          <td>Text</td>
          <td>Number</td>
          <td>Details</td>
        </tr>
      </thead>
      <tbody>
        {INDIVIDUALS_TABLE.value.map((card) => {
          const set = card.cardId.split("-")[0];
          const tcg = pokemonTcgData.cards[set].find(
            (item) => item.id === card.cardId
          );
          return (
            <tr key={card.id}>
              <td>{tcg?.name}</td>
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
