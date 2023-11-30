import type { FunctionalComponent } from "preact";
import { effect, signal, useSignal } from "@preact/signals";
import type { TargetedEvent } from "preact/compat";

import type { PokemonTCG } from "pokemon-tcg-sdk-typescript";
import { pokemonTcgData } from "./tgcData";
import { INDIVIDUALS_DB, loadIndividuals } from "./Library";
import type { Hit } from "./types";
import {
  FINISHES,
  type Condition,
  type Finish,
  isFinish,
  CONDITIONS,
  isCondition,
} from "../interfaces";

interface Props {
  hit: Hit;
}

export const AddCard: FunctionalComponent<Props> = ({ hit }) => {
  const details = useSignal<
    | { location: string; condition: Condition; finish: Finish; notes: string }
    | undefined
  >(undefined);
  const networkError = useSignal("");

  function handleAdd() {
    networkError.value = "";
    details.value = {
      location: "",
      condition: CONDITIONS[0],
      finish: FINISHES[0],
      notes: "",
    };
  }

  function handleInputLocation(e: TargetedEvent<HTMLInputElement>) {
    if (!details.value) return;
    details.value.location = e.currentTarget.value;
  }
  function handleInputNotes(e: TargetedEvent<HTMLInputElement>) {
    if (!details.value) return;
    details.value.notes = e.currentTarget.value;
  }
  function handleChangeFinish(e: TargetedEvent<HTMLSelectElement>) {
    const candidate = e.currentTarget.value;
    if (!details.value || !isFinish(candidate)) return;
    details.value.finish = candidate;
  }
  function handleChangeCondition(e: TargetedEvent<HTMLSelectElement>) {
    const candidate = e.currentTarget.value;
    if (!details.value || !isCondition(candidate)) return;
    details.value.condition = candidate;
  }

  async function handleSubmit(e: TargetedEvent<HTMLFormElement>) {
    e.preventDefault();
    const response = await fetch("/api/individual/" + hit.card.id, {
      method: "POST",
      body: JSON.stringify(details.value),
      headers: JSON_MIME,
    });
    if (response.ok) {
      await loadIndividuals();
    } else {
      networkError.value = `Network error: ${response.status} ${response.statusText}`;
    }
    details.value = undefined;
  }

  return details.value ? (
    <form onSubmit={handleSubmit}>
      <input
        onInput={handleInputLocation}
        placeholder="Location"
        type="text"
        value={details.value.location}
      />

      <br />

      <input
        onInput={handleInputNotes}
        placeholder="Notes"
        type="text"
        value={details.value.notes}
      />

      <br />

      <select onChange={handleChangeFinish} value={details.value.finish}>
        {FINISHES.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>

      <br />

      <select onChange={handleChangeCondition} value={details.value.condition}>
        {CONDITIONS.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>

      <br />

      <button>Submit!</button>
    </form>
  ) : networkError.value ? (
    <>
      {networkError.value} <button onClick={handleAdd}>Retry?</button>
    </>
  ) : (
    <button onClick={handleAdd}>Add!</button>
  );
};

const JSON_MIME = { "Content-Type": "application/json" };
