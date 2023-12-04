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
  Tables,
} from "../interfaces";
import { textMatch } from "../utils/utils";

interface Props {
  action?: string;
  cardId: string;
  individual?: Tables.individualRow;
}

const TYPE_IN_LOCATION_KEY = "__TyPe_In_LocAtIOn";
// Careful! This will be lost when Astro does hot module reloading (even if this is a Signal)
let mostRecentLocation: string | undefined = undefined;

export const AddEditCard: FunctionalComponent<Props> = ({
  cardId,
  individual,
  action = "Add!",
}) => {
  const details = useSignal<
    | { location: string; condition: Condition; finish: Finish; notes: string }
    | undefined
  >(undefined);
  const networkError = useSignal("");
  const showLocationTextInput = useSignal(false);

  function handleAdd() {
    networkError.value = "";
    details.value = {
      location:
        individual?.location ??
        mostRecentLocation ??
        LOCATIONS_TABLE.value[0]?.location,
      condition: (individual?.condition as Condition) ?? CONDITIONS[0],
      finish: (individual?.finish as Finish) ?? FINISHES[0],
      notes: individual?.notes ?? "",
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

  async function handleDelete() {
    if (!individual) return;
    if (!window.confirm("Are you sure you want to delete?")) return;
    const response = await fetch("/api/individual/" + individual.id, {
      method: "DELETE",
    });
    if (response.ok) {
      loadData();
    } else {
      networkError.value = `Network error while deleting: ${response.status} ${response.statusText}`;
    }
    details.value = undefined;
  }
  async function handleSubmit(e: TargetedEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!details.value) return; // should never happen
    const cleanedLocation = textMatch(
      LOCATIONS_TABLE.value.map((l) => l.location),
      details.value.location
    );
    const response = await fetch("/api/individual/" + cardId, {
      method: "POST",
      body: JSON.stringify({
        ...details.value,
        id: individual?.id, // in case of editing
        location: cleanedLocation,
      }),
      headers: { "Content-Type": "application/json" },
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
      <button
        onClick={handleCancel}
        style={{ backgroundColor: "orange" }}
        type="button"
      >
        Cancel
      </button>
      {individual?.id && (
        <button
          onClick={handleDelete}
          style={{ backgroundColor: "red" }}
          type="button"
        >
          Delete
        </button>
      )}
    </form>
  ) : networkError.value ? (
    <>
      {networkError.value} <button onClick={handleAdd}>Retry?</button>
    </>
  ) : (
    <button onClick={handleAdd}>{action}</button>
  );
};
