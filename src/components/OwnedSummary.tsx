import type { FunctionalComponent } from "preact";
import type { FullRow, Tables } from "../interfaces";
import { loadData } from "./Library";

interface Props {
  individual: FullRow<Tables.individualRow>;
  detailed?: boolean;
}

export const OwnedSummary: FunctionalComponent<Props> = ({
  individual,
  detailed = false,
}) => {
  async function handleDelete() {
    const safetyCheck = window.confirm("Are you sure you want to delete?");
    if (!safetyCheck) return;
    await fetch(`/api/individual/${individual.id}`, { method: "DELETE" });
    loadData();
  }
  if (!detailed)
    return (
      <div>
        ✅ {individual.location}, {individual.condition}, {individual.finish}
        {individual.notes ? <> ({individual.notes})</> : ""}{" "}
        <button onClick={handleDelete}>Delete</button>
      </div>
    );
  return (
    <dl>
      <dt>Location</dt>
      <dd>{individual.location}</dd>

      <dt>Notes</dt>
      <dd>{individual.notes}</dd>

      <dt>Condition</dt>
      <dd>{individual.condition}</dd>

      <dt>Finish</dt>
      <dd>{individual.finish}</dd>
    </dl>
  );
};
