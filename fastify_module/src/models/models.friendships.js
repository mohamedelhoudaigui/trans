// friendships fields :
// id -> PRIMARY KEY
// user_id -> FOREIGN KEY
// friend_id -> FOREIGN KEY
// created_at -> DATE


function setup_friendships_table(app) {
    app.after(() => {
        app.db.prepare(friendships_define()).run();
    });
}

function friendships_define() {
    return `CREATE TABLE IF NOT EXISTS friendships (
            user_id INTEGER NOT NULL,
            friend_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, friend_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE);`
}

function add_friend(db, user_id, friend_id) {
    const stmt = db.prepare('INSERT INTO friendships (user_id, friend_id) VALUES (?, ?)');
    const result = stmt.run(user_id, friend_id);
    return result.changes;
}

function remove_friend(db, user_id, friend_id) {
    const stmt = db.prepare('DELETE FROM friendships WHERE user_id = ? AND friend_id = ?');
    const result = stmt.run(user_id, friend_id);
    return result.changes;
}

function check_friendship(db, user_id, friend_id) {
    const stmt = db.prepare(`
        SELECT * FROM friendships 
        WHERE (user_id = ? AND friend_id = ?)
        OR (user_id = ? AND friend_id = ?)
    `)
    const res = stmt.get(user_id, friend_id, friend_id, user_id)
    return res !== undefined
}

function get_friends(db, user_id) {
    const stmt = db.prepare(`
        SELECT u.id, u.name, u.email 
        FROM users u
        JOIN friendships f ON u.id = f.friend_id
        WHERE f.user_id = ?
        UNION
        SELECT u.id, u.name, u.email 
        FROM users u
        JOIN friendships f ON u.id = f.user_id
        WHERE f.friend_id = ?
    `);
    const result = stmt.all(user_id, user_id);
    return result; // return the list of friends
}


module.exports = {
	setup_friendships_table,
	add_friend,
	remove_friend,
	get_friends,
    check_friendship,
}