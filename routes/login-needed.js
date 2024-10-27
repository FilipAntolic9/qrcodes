var express = require('express');
var router = express.Router();


/* GET login needed page. */
router.get('/', async function (req, res, next) {
    res.render('login-needed', { title: 'Niste prijavljeni' });
});

module.exports = router;
