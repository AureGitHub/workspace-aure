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
  // Obtener DDL con restricciones (PK, FK, UNIQUE)
  const ddlResult = await client.queryObject<{ ddl: string }>(
    `SELECT pg_get_tabledef(format('%I.%I', 'inmueble', '${table}')) AS ddl;`
  );
  console.log(`\n-- DDL para tabla ${table} --`);
  console.log(ddlResult.rows[0]?.ddl ?? "-- No se pudo extraer DDL --");
}

await client.end();
