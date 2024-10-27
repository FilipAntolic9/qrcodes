var express = require('express');
var router = express.Router();
const db = require('../db');
var QRCode = require('qrcode')

/* GET home page. */
router.post('/', async function (req, res, next) {

    try {

        const result1 = await db.query("SELECT count(*) cnt FROM public.qrcodes where vatin = '" + req.body.vatin + "';");
        const vatinCount = result1.rows[0].cnt;
        if (vatinCount >= 3) {
            const err_status = 400;

            res.status(err_status);
            const responseData = {
                message: "Previše karata",
                status: err_status
            }

            const jsonContent = JSON.stringify(responseData);
            res.status(err_status).end(jsonContent);

            return;
        }

        const result = await db.query("INSERT INTO qrcodes (vatin, firstname, lastname) VALUES('" + req.body.vatin + "', '" + req.body.firstname + "', '" + req.body.lastname + "') returning id;");
        const ticketId = result.rows[0].id;
        // res.render('all-tickets', { title: 'Popis izdanih karata', result: ticketId });
        // res.json(ticketId);
        // res.json(ticketId);
        var qrcodeData = "https://qr-codes-mk80.onrender.com/ticket/" + ticketId
        const qrcode = await QRCode.toDataURL(qrcodeData);
        const responseData = {
            qrCode: qrcode
        }
        const jsonContent = JSON.stringify(responseData);
        // res.status(err_status).end(jsonContent);
        res.end(jsonContent);
    } catch (err) {
        console.error(err);
        res.status(500).send('Privremeno nedostupno');
    }
});

module.exports = router;
