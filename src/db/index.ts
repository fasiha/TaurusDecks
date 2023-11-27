import { readFileSync } from "fs";
import { resolve } from "path";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

import type * as Table from "../interfaces/DbTablesV1";
import type { Finish, Selected } from "../interfaces";

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
  const hit = s.get("_tabito_db_state");
  if (hit) {
    // Yes. So ensure it's the correct version, else bail; implement up/down
    // migration later
    dbVersionCheck(db);
  } else {
    // nope this is a fresh/clean database. Initialize it with our schema
    db.exec(
      readFileSync(
        resolve(__dirname, "..", "sql", `db-v${SCHEMA_VERSION_REQUIRED}.sql`),
        "utf8"
      )
    );
    dbVersionCheck(db);
  }
  function dbVersionCheck(db: Db) {
    const s = db.prepare(`select schemaVersion from _tabito_db_state`);
    const dbState = s.get() as Selected<Table._taurus_db_stateRow>;
    if (dbState?.schemaVersion !== SCHEMA_VERSION_REQUIRED) {
      throw new Error("db wrong version: need " + SCHEMA_VERSION_REQUIRED);
    }
  }
}

// new card!
const newCardStatement =
  db.prepare<Table.individualRow>(`insert into individual 
(cardId, location, finish, notes)
values ($cardId, $location, $finish, $notes)`);

export function newCard(
  cardId: string,
  location: string,
  finish: Finish,
  notes = ""
) {
  newCardStatement.run({ cardId, location, finish, notes });
}

// list cards we added with the above!
const getAllCardsStatement = db.prepare(`select * from individual`);

export function getAllCards(): Table.individualRow[] {
  return getAllCardsStatement.all() as Table.individualRow[];
}

// get just one card:
const getIndividualsStatement = db.prepare<Pick<Table.individualRow, "cardId">>(
  `select * from individual where cardId=$cardId`
);

export function getIndividuals(cardId: string): Table.individualRow[] {
  return getIndividualsStatement.all({ cardId }) as Table.individualRow[];
}
