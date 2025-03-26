const fp = require('fastify-plugin');
const AppDataSource = require('../models/models.init.js')

function dbPlugin(fastify, options) {
    AppDataSource.initialize()
        .then(() => console.log("Database connected!"))
        .catch(err => console.error("Database connection error:", err));
    fastify.decorate('db', AppDataSource);
}

module.exports = fp(dbPlugin)
