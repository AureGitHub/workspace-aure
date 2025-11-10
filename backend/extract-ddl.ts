import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const client = new Client({
  user: "aure",
  database: "zarzaland",
  hostname: "postgresql-118326-0.cloudclusters.net",
  password: "jas11jas11",
  port: 18718,
  tls: {
    enabled: false,
    enforce: false,
    caCertificates: []
  }
});

await client.connect();

// Obtener nombres de tablas en el esquema inmueble
const tablesResult = await client.queryObject<{ table_name: string }>(
  `SELECT table_name FROM information_schema.tables WHERE table_schema = 'inmueble' AND table_type = 'BASE TABLE';`
);

for (const row of tablesResult.rows) {
  const table = row.table_name;
  // Obtener DDL usando columnas e información de constraints
  const ddlResult = await client.queryObject<{ ddl: string }>(
    `SELECT 'CREATE TABLE "app-alquiler".' || relname || E'\n(\n' ||
      array_to_string(
        array_agg(
          '  ' || attname || ' ' || format_type(atttypid, atttypmod) ||
          CASE WHEN attnotnull THEN ' NOT NULL' ELSE '' END
        ), E',\n'
      ) || E'\n);'
    AS ddl
    FROM pg_attribute
    JOIN pg_class ON attrelid = pg_class.oid
    WHERE relname = '${table}' AND attnum > 0 AND NOT attisdropped
    GROUP BY relname;`
  );
  console.log(`\n-- DDL para tabla ${table} --`);
  console.log(ddlResult.rows[0]?.ddl ?? "-- No se pudo extraer DDL --");
}

await client.end();
