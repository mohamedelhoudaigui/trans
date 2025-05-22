// chat fields :
// id -> PRIMARY KEY
// sender_id -> FOREING KEY (user id)
// recipient_id -> FOREING KEY (user id)
// message -> TEXT
// delivered -> BOOLEAN
// delivered_at -> DATE
// created_at  -> DATE

const ChatModel = {

    chat_init()
    {
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

    chat_sender_id_index()
    {
        return `CREATE INDEX IF NOT EXISTS idx_chat_sender ON chat (sender_id);`;
    },

	chat_recipient_id_index()
    {
        return `CREATE INDEX IF NOT EXISTS idx_chat_recipient ON chat (recipient_id);`;
    },


    // this is for a dev purposes
    async chat_get_all(db)
    {
        try {
            const stmt = db.prepare(`
                    SELECT *
                    FROM chat
                `)

            const res = await stmt.all()
            return {
                success: true,
                code: 200,
                result: res
            }
        }
        catch (err)
        {
            return {
                success: false,
                code: 500,
                result: err.message
            }
        }
    },

    // get chat history with someone, user id is getted from the jwt token the other is passed in params :id
    // when you want to grab more from chat just do : offset += limit
    async chat_get_by_id(db, sender_id, recipient_id, limit = 50, offset = 0)
    {
        try
        {
            const stmt = db.prepare(`
                SELECT * FROM chat
                WHERE sender_id = ? AND recipient_id = ?
				ORDER BY created_at DESC
				LIMIT ? OFFSET ?
            `)

            const res = await stmt.all(sender_id, recipient_id, limit, offset)

            return {
                success: true,
                code: 200,
                result: res
            }
        }
        catch (err)
        {
            return {
                success: false,
                code: 500,
                result: err.message
            }
        }
    },
    
    // msg data object : {sender_id(int), recipient_id(int), message(text), is_delivered(0 or 1)}

    async chat_create(db, msg_data)
    {
        try
        {
            const stmt = db.prepare(`
                INSERT
                INTO chat (sender_id, recipient_id, message, is_delivered, delivered_at)
                VALUES (?, ?, ?, ?, ?)
            `)

            const { sender_id, recipient_id, message, is_delivered, delivered_at = null } = msg_data
            console.log(delivered_at)

            const res = await stmt.run(sender_id, recipient_id, message, is_delivered, delivered_at)
            return {
                success: true,
                code: 200,
                result: res.lastInsertRowid
            }
        }
        catch (err)
        {
            return {
                success: false,
                code: 500,
                result: err.message
            }
		}
    },

    // get unread messages so that we send them to the user when he connects back
	async chat_get_unread(db, recipient_id)
	{
		try
        {
            const stmt = db.prepare(`
				SELECT * FROM chat
				WHERE recipient_id = ? AND is_delivered = 0
				ORDER BY created_at
            `)

            const res = await stmt.all(recipient_id)
            return {
                success: true,
                code: 200,
                result: res
            }
        }
        catch (err)
        {
            return {
                success: false,
                code: 500,
                result: err.message
            }
		}
	},

    // use this after a offline user gets all his messages
    async chat_mark_delivered_bulk(db, recipient_id)
    {
        const stmt = await db.prepare(`
            UPDATE chat
            SET is_delivered = 1,
                delivered_at = CURRENT_TIMESTAMP
            WHERE recipient_id = ? AND is_delivered = 0
        `);
        await stmt.run(recipient_id);
    }

}

module.exports = ChatModel
