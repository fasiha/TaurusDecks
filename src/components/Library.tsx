import type { FunctionalComponent } from "preact";
import { effect, signal, useSignal } from "@preact/signals";
import type { TargetedEvent } from "preact/compat";

import type * as Table from "../interfaces/DbTablesV1";
import type { SelectedAll } from "../interfaces";

import { pokemonTcgData } from "./tgcData";

export const INDIVIDUALS_DB = signal<SelectedAll<Table.individualRow>>([]);

export async function loadIndividuals() {
  console.log("Running now", new Date().toString());
  const result = await fetch("/api/individuals");
  if (result.ok) {
    const payload = await result.json();
    INDIVIDUALS_DB.value = payload;
  }
}

// initial
loadIndividuals();

export const Library: FunctionalComponent = () => {
  console.log("REREDNDERING", INDIVIDUALS_DB.value);
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
        {INDIVIDUALS_DB.value.map((card) => {
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
                <dl>
                  <dt>Location</dt>
                  <dd>{card.location}</dd>

                  <dt>Notes</dt>
                  <dd>{card.notes}</dd>

                  <dt>Condition</dt>
                  <dd>{card.condition}</dd>

                  <dt>Finish</dt>
                  <dd>{card.finish}</dd>
                </dl>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
