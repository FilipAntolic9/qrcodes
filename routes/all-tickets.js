var express = require('express');
var router = express.Router();
const db = require('../db');

/* GET home page. */
router.get('/', async function (req, res, next) {

  try {
    const result = await db.query('SELECT * FROM qrcodes');
    res.render('all-tickets', { title: 'Popis izdanih karata', result: result });
    //res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Privremeno nedostupno');
  }
});

module.exports = router;
