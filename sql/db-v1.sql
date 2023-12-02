create table
  _taurus_db_state (schemaVersion integer not null unique);

insert into
  _taurus_db_state (schemaVersion)
values
  (1);

create table
  individual (
    id integer primary key not null,
    cardId text not null,
    location text not null,
    finish text not null,
    notes text not null,
    condition text not null,
    addedUnixMs float not null,
    editedUnixMs float not null
  );

create table
  location (location text not null unique);