
async function shutdown_handler(fastify) {
    const listeners = ['SIGINT', 'SIGTERM']
    listeners.forEach((signal) => {
        process.on(signal, async () => {
            fastify.log.info('shuting down server...')
            await fastify.close()
            process.exit(0)
        })
    })
}

module.exports = {
    shutdown_handler,
}

