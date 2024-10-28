// var express = require('express');
// var router = express.Router();
// const db = require('../db');
// var QRCode = require('qrcode')

// router.post('/', async function (req, res, next) {

//     try {
//         const result1 = await db.query("SELECT count(*) cnt FROM public.qrcodes where vatin = '" + req.body.vatin + "';");
//         const userTicketCount = result1.rows[0].cnt;
//         if (userTicketCount >= 3) {
//             const err_status = 400;

//             res.status(err_status);
//             const responseData = {
//                 message: "Korisnik već ima 3 ulaznice.",
//                 status: err_status
//             }

//             const jsonContent = JSON.stringify(responseData);
//             res.status(err_status).end(jsonContent);

//             return;
//         }

//         const result = await db.query("INSERT INTO qrcodes (vatin, firstname, lastname) VALUES('" + req.body.vatin + "', '" + req.body.firstname + "', '" + req.body.lastname + "') returning id;");
//         const ticketId = result.rows[0].id;

//         var qrcodeData = "https://qr-codes-mk80.onrender.com/ticket/" + ticketId
//         const qrcode = await QRCode.toDataURL(qrcodeData);
//         const responseData = {
//             qrCode: qrcode
//         }
//         const jsonContent = JSON.stringify(responseData);
//         res.end(jsonContent);

//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Web stranica je trenutno nedostupna.');
//     }
// });

// module.exports = router;


var express = require('express');
var router = express.Router();
const db = require('../db');
var QRCode = require('qrcode');

router.post('/', async function (req, res, next) {
    // Validate that vatin, firstname, and lastname are present in the request body
    const { vatin, firstname, lastname } = req.body;

    if (!vatin || !firstname || !lastname) {
        // Return a 400 status and an error message if any of the required fields are missing
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

        var qrcodeData = "https://qr-codes-mk80.onrender.com/ticket/" + ticketId;
        const qrcode = await QRCode.toDataURL(qrcodeData);
        const responseData = {
            qrCode: qrcode
        };
        res.json(responseData); // Send the QR code in JSON format

    } catch (err) {
        console.error(err);
        res.status(500).send('Stranica je trenutno nedostupna.');
    }
});

module.exports = router;
