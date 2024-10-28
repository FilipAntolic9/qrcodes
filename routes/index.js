var express = require('express');
var router = express.Router();
var QRCode = require('qrcode')
const db = require('../db');

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    const result = await db.query('SELECT * FROM qrcodes');

    var ticket_id = "7b73fd67-2597-4b00-b9e9-81f43c00fb8e";
    var qrcodeData = "http://localhost:3000/ticket/" + ticket_id
    const qrcode = await QRCode.toDataURL(qrcodeData);

    res.render('index', { title: 'Sustav za izdavanje karata', result: result, qrcode: qrcode });
    //res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Stranica je trenutno nedostupna.');
  }

});

module.exports = router;
