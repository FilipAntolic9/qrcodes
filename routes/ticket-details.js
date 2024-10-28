var express = require('express');
var router = express.Router();
const db = require('../db');

// DD/MM/YYYY HH:mm
function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    return new Date(dateString).toLocaleDateString('hr-HR', options).replace(',', '');
}

function showErrorPage(res, message, status, errorStack = '') {
    res.status(status).render('error', {
        title: 'Error',
        message: message,
        status: status,
        errorStack: errorStack
    });
}


router.get('/:ticketId', async function (req, res, next) {
    const ticketId = req.params.ticketId;

    try {
        const result = await db.query("SELECT * FROM qrcodes WHERE id = $1;", [ticketId]);

        if (result.rows.length === 0) {
            return showErrorPage(res, "Ulaznica nije pronađena.", 404);
        }

        const ticket = result.rows[0];
        const userName = req.user ? req.user.name : 'Posjetitelj #5443';

        res.render('ticket-details', {
            title: 'Podatci o ulaznici',
            ticket: ticket,
            userName: userName,
            formattedDate: formatDate(ticket.datecreated)
        });

    } catch (err) {
        // console.error(err);
        // res.status(500).send('Stranica je trenutno nedostupna.');
        console.error(err);
        renderErrorPage(res, 'Stranica je trenutno nedostupna.', 500, err.stack);
    }
});

module.exports = router;
