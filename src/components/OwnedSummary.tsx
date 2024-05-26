import type { FunctionalComponent } from "preact";
import type { FullRow, Tables } from "../interfaces";
import { loadData } from "./Library";
import { useSignal } from "@preact/signals";
import { AddEditCard } from "./AddEditCard";

interface Props {
  individual: FullRow<Tables.individualRow>;
}

export const OwnedSummary: FunctionalComponent<Props> = ({ individual }) => {
  return (
    <>
      <div>
        ✅ {individual.location}, {individual.condition}, {individual.finish}
        {individual.notes ? <> ({individual.notes})</> : ""} (quantity:{" "}
        {individual.quantity})
      </div>
      <AddEditCard
        action="Edit?"
        cardId={individual.cardId}
        individual={individual}
      />
    </>
  );
};
