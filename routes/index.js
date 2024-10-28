var express = require('express');
var router = express.Router();
var QRCode = require('qrcode')
const db = require('../db');

router.get('/', async function (req, res, next) {
  try {
    const result = await db.query('SELECT * FROM qrcodes');
    res.render('index', { title: 'Sustav za izdavanje ulaznica', result: result });

  } catch (err) {
    console.error(err);
    res.status(500).send('Stranica je trenutno nedostupna.');
  }

});

module.exports = router;
