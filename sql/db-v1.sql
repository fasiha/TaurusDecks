create table
  _taurus_db_state (schemaVersion integer not null unique);

insert into
  _taurus_db_state (schemaVersion)
values
  (1);

create table
  individual (
    id integer primary key not null,
    cardId string not null,
    location string not null,
    finish string not null,
    notes string not null
  );