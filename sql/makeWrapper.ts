/*
Equivalent to the following:

```sh
#!/bin/sh
for i in 1 2 3; do
  rm -f __empty.db
  sqlite3 __empty.db < db-v$i.sql
  npx @rmp135/sql-ts -c sqlite-v$i.json
  rm __empty.db
  echo "done v$i"
done
```
Except, below, we'll probably only run this for ONE schema version.
*/

var VERSIONS = [1];

var { mkdir, rm, readFile, writeFile } = require("fs/promises");
var { resolve } = require("path");

var sqlite3 = require("better-sqlite3");
var sqlts = require("@rmp135/sql-ts");
var emptyDb = "./__empty.db";
var config = {
  client: "sqlite3",
  connection: { filename: emptyDb },
  interfaceNameFormat: "${table}Row",
  typeMap: {
    "Buffer|string|Uint8Array": ["blob"], // I like having blob be generic like this
    "number|bigint": ["integer"], // better-sqlite3 will return bigint to avoid float problems!
  },
};

if (require.main === module) {
  (async function main() {
    for (const i of VERSIONS) {
      await mkdir(resolve(__dirname, "..", "src", "interfaces"), {
        recursive: true,
      });

      await rm(emptyDb, { force: true });

      const sql = await readFile(resolve(__dirname, `db-v${i}.sql`), "utf8");
      sqlite3(emptyDb).exec(sql);

      await writeFile(
        resolve(__dirname, "..", "src", "interfaces", `DbTablesV${i}.ts`),
        await sqlts.toTypeScript(config)
      );

      await rm(emptyDb, { force: true });
    }
  })();
}
