/*
* This file was generated by a tool.
* Rerun sql-ts to regenerate this file.
*/
export interface _taurus_db_stateRow {
  'schemaVersion': number|bigint;
}
export interface individualRow {
  'addedUnixMs': number;
  'cardId': string;
  'condition': string;
  'editedUnixMs': number;
  'finish': string;
  'id'?: number|bigint;
  'location': string;
  'notes': string;
}
export interface locationRow {
  'location': string;
}
