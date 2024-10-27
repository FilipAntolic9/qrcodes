var express = require('express');
const db = require('../db');
var router = express.Router();

/* GET qrcodes listing. */
router.get('/', async function (req, res, next) {
  try {
    const result = await db.query('SELECT * FROM qrcodes');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
  //res.send('respond with a resource');
});


router.post('/', async function (req, res, next) {
  try {
    var name = "some name";
    var sql = "INSERT INTO public.qrcodes (id, username) VALUES(gen_random_uuid(), '" + name + "') returning id;";
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
  //res.send('respond with a resource');
});

module.exports = router;
