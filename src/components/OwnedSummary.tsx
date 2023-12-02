import type { FunctionalComponent } from "preact";
import type { FullRow, Tables } from "../interfaces";

interface Props {
  individual: FullRow<Tables.individualRow>;
  detailed?: boolean;
}

export const OwnedSummary: FunctionalComponent<Props> = ({
  individual,
  detailed = false,
}) => {
  if (!detailed)
    return (
      <div>
        ✅ {individual.location}/{individual.condition}/{individual.finish}
        {individual.notes ? <> ({individual.notes})</> : ""}
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
