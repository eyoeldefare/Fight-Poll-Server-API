const {
    Pool,
    Client
} = require('pg')
const connection = `postgresql://eyoel:Aster@localhost:5432/fightpoll`;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || connection,
})

module.exports = {
    query: (query, callback) => pool.query(query, callback)
}