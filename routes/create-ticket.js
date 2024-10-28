var express = require('express');
var router = express.Router();
const db = require('../db');
var QRCode = require('qrcode');

router.post('/', async function (req, res, next) {
    const { vatin, firstname, lastname } = req.body;

    if (!vatin || !firstname || !lastname) {
        return res.status(400).json({
            message: "Potrebno je popuniti parametre vatin, firstname i lastname.",
            status: 400
        });
    }

    try {
        const result1 = await db.query("SELECT count(*) cnt FROM public.qrcodes WHERE vatin = $1;", [vatin]);
        const userTicketCount = result1.rows[0].cnt;

        if (userTicketCount >= 3) {
            return res.status(400).json({
                message: "Korisnik već ima 3 ulaznice.",
                status: 400
            });
        }

        const result = await db.query("INSERT INTO qrcodes (vatin, firstname, lastname) VALUES ($1, $2, $3) RETURNING id;", [vatin, firstname, lastname]);
        const ticketId = result.rows[0].id;

        var qrcodeData = "https://qr-codes-mk80.onrender.com/ticket-details/" + ticketId;
        const qrcode = await QRCode.toDataURL(qrcodeData);
        const responseData = {
            qrCode: qrcode
        };
        res.json(responseData);

    } catch (err) {
        console.error(err);
        res.status(500).send('Stranica je trenutno nedostupna.');
    }
});

module.exports = router;
