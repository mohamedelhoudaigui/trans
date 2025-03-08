// user fields:
// id -> PRIMARY KEY
// name -> VARCHAR 100
// email -> VARCHAR 100
// password -> VARCHAR 100 (hashed)
// wins -> INTEGER
// loses -> INTEGERT
// status -> BOOL for status (might change to redis or websocket ??)
// created_at -> TIMESTAMP


// resources:
// https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#class-statement

function setup_user_table(app) {
    app.after(() => {
        app.db.prepare(user_define()).run();
        app.db.prepare(user_name_index()).run();
        app.db.prepare(user_email_index()).run();
    });
}

function user_define() {
    return `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL,
            wins INTEGER DEFAULT 0,
            loses INTEGER DEFAULT 0,
            status BOOL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`
}

function user_email_index() {
    return `CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);`
}

function user_name_index() {
    return `CREATE INDEX IF NOT EXISTS idx_users_name ON users (name);`
}

function user_all(db) {
    const stmt = db.prepare('SELECT * from users');
    const result = stmt.all();
    return result; // Return the ID of the newly added user
}

function user_fetch(db, id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const result = stmt.get(id);
    return result; // Return the user object or undefined if not found
}

function user_create(db, name, email, password) {
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(name, email, password);
    return result.lastInsertRowid; // Return the ID of the newly added user
}

function user_delete(db, id) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes; // Return the number of rows deleted
}

function user_update(db, id, name, email, password) {
    const stmt = db.prepare('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?');
    const result = stmt.run(name, email, password, id);
    return result.changes; // Return the number of rows updated
}


module.exports = {
    setup_user_table,
    user_create,
    user_delete,
    user_fetch,
    user_update,
    user_all,
}

