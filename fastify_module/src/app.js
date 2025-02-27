const app = require('fastify')({ logger: true })
const { setup_user_table } = require('./modules/user/serve');
const user_routes = require('./modules/user/routes')

// register plugins:
app.register(require('./plugins/db'));

// make db tables :
setup_user_table(app)

// modules routes:
user_routes(app)

async function start()
{
    try
    {
        await app.listen({ port: 3000 });
        app.log.info('Server listening on http://localhost:3000');
    }
    catch  (err)
    {
        app.log.error(err);
        process.exit(1);
    }
}

start()
