const { DataSource } = require("typeorm");
const { EntitySchema } = require("typeorm");
require('dotenv').config()




const User = new EntitySchema({
    name: "User",
    tableName: "users",
    columns: {
        id: {
            primary: true,
            type: "integer",
            generated: true,
        },
        name: {
            type: "varchar",
            length: 100,
        },
        email: {
            type: "varchar",
            length: 100,
            unique: true,
        },
        password: {
            type: "varchar",
            length: 100,
        },
        wins: {
            type: "integer",
            default: 0,
        },
        loses: {
            type: "integer",
            default: 0,
        },
        avatar: {
            type: "varchar",
            length: 100,
        },
        created_at: {
            type: "datetime",
            default: () => "CURRENT_TIMESTAMP"
        },
    },
})

const RefreshToken = new EntitySchema({
    name: "RefreshToken",
    tableName: "refresh_tokens",
    columns: {
        id: {
            primary: true,
            type: "integer",
            generated: true,
        },
        token: {
            type: "varchar",
            length: 100,
        },
        created_at: {
            type: "datetime",
            default: () => "CURRENT_TIMESTAMP"
        },
    },
})

const Friendship = new EntitySchema({
    name: "Friendship",
    tableName: "friendships",
    columns: {
        user_id: {
            primary: true,
            nullable: false,
            type: "integer",
        },

        friend_id: {
            primary: true,
            nullable: false,
            type: "integer",
        },

        created_at: {
            type: "datetime",
            default: () => "CURRENT_TIMESTAMP"
        }
    },

    relations: {
        user: {
            type: "many-to-one",
            target: "User",
            joinColumn: {
                name: "user_id",
                referencedColumnName: "id"
            },
            inverseSide: "friends",
            onDelete: "CASCADE"
        },

        friend: {
            type: "many-to-one",
            target: "User",
            joinColumn: {
                name: "friend_id",
                referencedColumnName: "id"
            },
            onDelete: "CASCADE"
        }
    }
})

const AppDataSource = new DataSource({
    type: "sqlite",
    database: process.env.DB_PATH,
    synchronize: true,
    logging: false,
    entities: [User, RefreshToken, Friendship],
});

module.exports = AppDataSource
