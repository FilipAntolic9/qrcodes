const { Pool } = require('pg');

const pool = new Pool({
    user: 'qrcodes_b5qq_user',
    password: 'vG7t6R3Uu57SfhugtCEzKTe0pgm9yZWR',
    host: 'dpg-cse8rqbtq21c7386mvlg-a.frankfurt-postgres.render.com',
    port: 5432, // default Postgres port
    database: 'qrcodes_b5qq',
    ssl: true,
});


module.exports = {
    query: (text, params) => pool.query(text, params)
};