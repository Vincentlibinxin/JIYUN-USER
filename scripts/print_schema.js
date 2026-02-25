(async () => {
  try {
    const Database = (await import('better-sqlite3')).default;
    const path = (await import('path')).default;
    const dbPath = path.join(process.cwd(), 'data.db');
    const db = new Database(dbPath, { readonly: true });

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';").all();
    if (!tables.length) {
      console.log('No user tables found.');
      db.close();
      return;
    }

    for (const t of tables) {
      console.log(`Table: ${t.name}`);
      const cols = db.prepare(`PRAGMA table_info(${t.name})`).all();
      for (const c of cols) {
        console.log(`  - ${c.name}  |  ${c.type}  |  notnull=${c.notnull}  |  dflt_value=${c.dflt_value}  |  pk=${c.pk}`);
      }
      console.log('');
    }

    db.close();
  } catch (err) {
    console.error('Error reading database schema:', err);
    process.exit(1);
  }
})();
