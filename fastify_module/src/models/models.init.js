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
        created_at: {
            type: "datetime",
            default: () => "CURRENT_TIMESTAMP"
        },
    },
})

const AppDataSource = new DataSource({
    type: "sqlite",
    database: process.env.DB_PATH,
    synchronize: true,
    logging: false,
    entities: [User],
});

module.exports = AppDataSource;
