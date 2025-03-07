const fp = require('fastify-plugin');
const Database = require('better-sqlite3');


function dbPlugin(fastify, options) {

    const db = new Database('database.db');

    fastify.decorate('db', db);

    fastify.addHook('onClose', (instance, done) => {
        instance.db.close();
        done();
    });
}



module.exports = fp(dbPlugin)
