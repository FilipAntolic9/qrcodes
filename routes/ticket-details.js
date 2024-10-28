var express = require('express');
var router = express.Router();
const db = require('../db');

router.get('/:ticketId', async function (req, res, next) {
    const ticketId = req.params.ticketId;

    try {
        const result = await db.query("SELECT * FROM qrcodes WHERE id = $1;", [ticketId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Ulaznica nije pronađena.",
                status: 404
            });
        }

        const ticket = result.rows[0];
        const userName = req.user ? req.user.name : 'Posjetitelj #5443';

        res.render('ticket-details', {
            title: 'Podatci o ulaznici',
            ticket: ticket,
            userName: userName
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Stranica je trenutno nedostupna.');
    }
});

module.exports = router;
