import type { FunctionalComponent } from "preact";
import { useSignal } from "@preact/signals";
import type { TargetedEvent } from "preact/compat";

import { LOCATIONS_TABLE, loadData } from "./Library";
import type { Hit } from "./types";
import {
  FINISHES,
  type Condition,
  type Finish,
  isFinish,
  CONDITIONS,
  isCondition,
} from "../interfaces";
import { textMatch } from "../utils/utils";

interface Props {
  hit: Hit;
}

const TYPE_IN_LOCATION_KEY = "__TyPe_In_LocAtIOn";
let mostRecentLocation: string | undefined = undefined;

export const AddCard: FunctionalComponent<Props> = ({ hit }) => {
  const details = useSignal<
    | { location: string; condition: Condition; finish: Finish; notes: string }
    | undefined
  >(undefined);
  const networkError = useSignal("");
  const showLocationTextInput = useSignal(false);

  function handleAdd() {
    networkError.value = "";
    details.value = {
      location: mostRecentLocation ?? LOCATIONS_TABLE.value[0]?.location,
      condition: CONDITIONS[0],
      finish: FINISHES[0],
      notes: "",
    };
    showLocationTextInput.value = LOCATIONS_TABLE.value.length === 0;
  }
  function handleCancel() {
    networkError.value = "";
    details.value = undefined;
  }

  function handleSelectLocation(e: TargetedEvent<HTMLSelectElement>) {
    if (!details.value) return;
    const nextValue = e.currentTarget.value;
    if (nextValue === TYPE_IN_LOCATION_KEY) {
      showLocationTextInput.value = true;
      details.value.location = "";
    } else {
      details.value.location = nextValue;
      showLocationTextInput.value = false;
    }
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
    if (!details.value) return; // should never happen
    const cleanedLocation = textMatch(
      LOCATIONS_TABLE.value.map((l) => l.location),
      details.value.location
    );
    const response = await fetch("/api/individual/" + hit.card.id, {
      method: "POST",
      body: JSON.stringify({
        ...details.value,
        location: cleanedLocation,
      }),
      headers: JSON_MIME,
    });
    if (response.ok) {
      await loadData();
      mostRecentLocation = cleanedLocation;
    } else {
      networkError.value = `Network error: ${response.status} ${response.statusText}`;
    }
    details.value = undefined;
  }

  return details.value ? (
    <form onSubmit={handleSubmit}>
      <select
        onChange={handleSelectLocation}
        value={
          showLocationTextInput.value
            ? TYPE_IN_LOCATION_KEY
            : details.value.location
        }
      >
        <option value={TYPE_IN_LOCATION_KEY}>(enter new location)</option>
        {LOCATIONS_TABLE.value.map(({ location }) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </select>

      <br />

      {showLocationTextInput.value && (
        <>
          <input
            onInput={handleInputLocation}
            placeholder="Location"
            type="text"
            value={details.value.location}
          />
          <br />
        </>
      )}

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

      <input
        onInput={handleInputNotes}
        placeholder="Notes"
        type="text"
        value={details.value.notes}
      />

      <br />

      <button>Submit!</button>
      <button onClick={handleCancel} type="button">
        Cancel
      </button>
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
