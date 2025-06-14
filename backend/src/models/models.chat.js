// chat fields :
// id -> PRIMARY KEY
// sender_id -> FOREING KEY (user id)
// recipient_id -> FOREING KEY (user id)
// message -> TEXT
// delivered -> BOOLEAN
// delivered_at -> DATE
// created_at  -> DATE

const ChatModel = {

    chat_init() {
        return `CREATE TABLE IF NOT EXISTS chat (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			sender_id INTEGER NOT NULL,
			recipient_id INTEGER NOT NULL,
			message TEXT NOT NULL,
			is_delivered BOOLEAN NOT NULL DEFAULT 0,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			delivered_at TIMESTAMP,
			FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
		);`
    },

    chat_sender_id_index() {
        return `CREATE INDEX IF NOT EXISTS idx_chat_sender ON chat (sender_id);`;
    },

	chat_recipient_id_index() {
        return `CREATE INDEX IF NOT EXISTS idx_chat_recipient ON chat (recipient_id);`;
    },

    async chat_get_all(db) {
        try {
            const stmt = db.prepare(`SELECT * FROM chat`);
            const res = await stmt.all();
            return { success: true, code: 200, result: res };
        } catch (err) {
            return { success: false, code: 500, result: err.message };
        }
    },

    async chat_get_by_id(db, sender_id, recipient_id, limit = 50, offset = 0) {
        try {
            const stmt = db.prepare(`
                SELECT * FROM chat
                WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
				ORDER BY created_at ASC
				LIMIT ? OFFSET ?
            `);
            const res = await stmt.all(sender_id, recipient_id, recipient_id, sender_id, limit, offset);
            return { success: true, code: 200, result: res };
        } catch (err) {
            return { success: false, code: 500, result: err.message };
        }
    },
    
    async chat_create(db, msg_data) {
        try {
            const stmt = db.prepare(`
                INSERT INTO chat (sender_id, recipient_id, message, is_delivered, delivered_at)
                VALUES (?, ?, ?, ?, ?)
            `);
            const { sender_id, recipient_id, message, is_delivered, delivered_at = null } = msg_data;
            const res = await stmt.run(sender_id, recipient_id, message, is_delivered, delivered_at);
            return { success: true, code: 201, result: res.lastInsertRowid };
        } catch (err) {
            return { success: false, code: 500, result: err.message };
		}
    },

	async chat_get_unread(db, recipient_id) {
		try {
            const stmt = db.prepare(`
				SELECT * FROM chat
				WHERE recipient_id = ? AND is_delivered = 0
				ORDER BY created_at
            `);
            const res = await stmt.all(recipient_id);
            return { success: true, code: 200, result: res };
        } catch (err) {
            return { success: false, code: 500, result: err.message };
		}
	},

    async chat_mark_delivered_bulk(db, recipient_id) {
        try {
            const stmt = await db.prepare(`
                UPDATE chat
                SET is_delivered = 1, delivered_at = CURRENT_TIMESTAMP
                WHERE recipient_id = ? AND is_delivered = 0
            `);
            const res = await stmt.run(recipient_id);
            return { success: true, code: 200, result: res.changes };
        } catch (err) {
            return { success: false, code: 500, result: err.message };
        }
    },

    async chat_get_profiles(db, user_id) {
        try {
             const stmt = db.prepare(`
                SELECT u.id, u.name, u.email, u.avatar, u.wins, u.loses
                FROM users u
                WHERE u.id IN (
                    -- Get users from existing chat history
                    SELECT recipient_id FROM chat WHERE sender_id = ?
                    UNION
                    SELECT sender_id FROM chat WHERE recipient_id = ?
                    UNION
                    -- Get users from the friendships table
                    SELECT friend_id FROM friendships WHERE user_id = ?
                    UNION
                    SELECT user_id FROM friendships WHERE friend_id = ?
                )
                AND u.id != ?
                ORDER BY u.name;
            `);

            const res = await stmt.all(user_id, user_id, user_id, user_id, user_id);
        
            return { success: true, code: 200, result: res };
        }
        catch (err) {
            return { success: false, code: 500, result: err.message };
        }
    }
};

module.exports = ChatModel;
