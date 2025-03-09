// refresh_token fields :
// id -> PRIMARY KEY
// token -> VARCHAR
// status -> BOOL
// created_at  -> DATE


function setup_refresh_tokens_table(app) {
    app.after(() => {
        app.db.prepare(refresh_tokens_define()).run()
        app.db.prepare(refresh_tokens_index()).run()
    });
}

function refresh_tokens_define() {
    return `CREATE TABLE IF NOT EXISTS refresh_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token VARCHAR UNIQUE NOT NULL,
            is_active BOOL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`
}

function refresh_tokens_index() {
    return `CREATE INDEX IF NOT EXISTS index_refresh_token ON refresh_tokens (token);`
}

function refresh_tokens_check(db, token) {
    const stmt = db.prepare('SELECT * FROM refresh_tokens WHERE  token = ?');
    const result = stmt.get(token);
    return !!result;
}

function refresh_tokens_create(db, token) {
    const stmt = db.prepare('INSERT INTO refresh_tokens (token) VALUES (?)');
    const result = stmt.run(token);
    return result.lastInsertRowid;
}

function refresh_tokens_delete(db, token) {
    const stmt = db.prepare('DELETE FROM refresh_tokens WHERE token = ?');
    const result = stmt.run(token);
    return result.changes;
}

module.exports = {
    setup_refresh_tokens_table,
    refresh_tokens_check,
    refresh_tokens_create,
    refresh_tokens_delete,
}
