import { readFileSync } from "fs";
import { resolve } from "path";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

import {
  type Finish,
  type Selected,
  type Condition,
  type SelectedAll,
  Tables,
  type FullRow,
} from "../interfaces";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We have a very basic system of handling database schema upgrades. This code
// will work with databases with this schema version
const SCHEMA_VERSION_REQUIRED = 1;

// Let's load the database
const db = new Database(process.env.TAURUS_DB || "cards.db");
type Db = typeof db;
db.pragma("journal_mode = WAL");

// Let's check whether this database has anything in it
{
  const s = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
  );
  // Is this a Tabito database?
  const hit = s.get("_taurus_db_state");
  if (hit) {
    // Yes. So ensure it's the correct version, else bail; implement up/down
    // migration later
    dbVersionCheck(db);
  } else {
    // nope this is a fresh/clean database. Initialize it with our schema
    db.exec(
      readFileSync(
        resolve(
          __dirname,
          "..",
          "..",
          "sql",
          `db-v${SCHEMA_VERSION_REQUIRED}.sql`
        ),
        "utf8"
      )
    );
    dbVersionCheck(db);
  }
  function dbVersionCheck(db: Db) {
    const s = db.prepare(`select schemaVersion from _taurus_db_state`);
    const dbState = s.get() as Selected<Tables._taurus_db_stateRow>;
    if (dbState?.schemaVersion !== SCHEMA_VERSION_REQUIRED) {
      throw new Error("db wrong version: need " + SCHEMA_VERSION_REQUIRED);
    }
  }
}

// new card!
const newCardStatement =
  db.prepare<Tables.individualRow>(`insert into individual 
(cardId, location, condition, finish, notes, addedUnixMs, editedUnixMs)
values ($cardId, $location, $condition, $finish, $notes, $addedUnixMs, $editedUnixMs)`);
const locationStatement = db.prepare<Tables.locationRow>(
  `insert or ignore into location (location) values ($location)`
);
const updateCardStatement = db.prepare<
  FullRow<Tables.individualRow>
>(`update individual 
set
  cardId=$cardId,
  location=$location,
  finish=$finish,
  condition=$condition,
  notes=$notes,
  addedUnixMs=$addedUnixMs,
  editedUnixMs=$editedUnixMs
where id=$id`);

export interface NewUpdateCardArgs {
  id?: number;
  cardId: string;
  location: string;
  finish: Finish;
  condition: Condition;
  notes?: string;
  addedUnixMs?: number;
  editedUnixMs?: number;
}
export function newUpdateCard({
  id,
  cardId,
  location,
  finish,
  condition,
  notes = "",
  addedUnixMs,
  editedUnixMs,
}: NewUpdateCardArgs) {
  let now = Date.now();
  const payload = {
    cardId,
    location,
    finish,
    condition,
    notes,
    addedUnixMs: addedUnixMs || now,
    editedUnixMs: editedUnixMs || now,
  };
  const ret =
    id !== undefined
      ? updateCardStatement.run({ ...payload, id })
      : newCardStatement.run(payload);
  locationStatement.run({ location });
  return ret;
}

// list cards we added with the above!
const getAllCardsStatement = db.prepare(`select * from individual`);

export function getAllCards(): Tables.individualRow[] {
  return getAllCardsStatement.all() as Tables.individualRow[];
}

// get just one card:
const getIndividualsStatement = db.prepare(
  `select * from individual where cardId=?`
);

export function getIndividuals(
  cardIds: string[]
): SelectedAll<Tables.individualRow> {
  return db.transaction((cardIds: string[]) =>
    cardIds.flatMap(
      (cardId) =>
        getIndividualsStatement.all(cardId) as SelectedAll<Tables.individualRow>
    )
  )(cardIds);
}

const getLocationsStatement = db.prepare(`select location from location`);
export function getLocations() {
  return getLocationsStatement.all() as Pick<Tables.locationRow, "location">[];
}

const deleteIndividualStatement = db.prepare<
  Pick<FullRow<Tables.individualRow>, "id">
>(`delete from individual where id=$id`);
export function deleteIndividual(id: number) {
  return deleteIndividualStatement.run({ id });
}
