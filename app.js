// npm install --save express-oauth2-jwt-bearer
// // https://www.npmjs.com/package/express-oauth2-jwt-bearer?activeTab=readme
// postgresql:
// npm install --save pg
// npm install --save qrcode
// za drugu stranicu - prijava usera https://github.com/auth0-samples/auth0-api-auth-samples/blob/master/user-consent/calendarapp-authz-code-nodejs/server.js
// npm install --save passport-oauth2 passport
//npm install --save nconf             
//npm install --save express-session             

/*
set AUTH0_DOMAIN=dev-g3eljifs.eu.auth0.com
set AUTH0_CLIENT_ID=hEpVrcDd06StXabPb7PaCUpNPqMi40gc 
set AUTH0_CLIENT_SECRET=duvZUyEH4wV3EpHTLADCp8tNG8ko3h-wAM0Lrr6jEG_kMg9aDr-Od_0O0G262nWB

TICKET!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
set AUTH0_DOMAIN=dev-g3eljifs.eu.auth0.com
set AUTH0_CLIENT_ID=hVEVcWizGZj5MAAKO29YNGSxGbbxaNki
set AUTH0_CLIENT_SECRET=WxbKE8wpKOAz2RYDWHYA3ffMinzXGmyrZCzUUBwoioW6oBkPYz36ba1nQsVdpcwc
TICKET!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

*/


var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//const db = require('./db');
const { auth } = require('express-oauth2-jwt-bearer');
//stranica 2 za usera
var passport = require('passport');
var oauth2 = require('passport-oauth2');


var nconf = require('nconf');
nconf.env()
  .file({ file: './config.json' })
  .defaults({
    PORT: 7003,
    CALLBACK_URL: "http://localhost:3000/auth/organizer/callback"
  });


//oauth - https://manage.auth0.com/ - kreiran Applications / API (M2M)
const jwtCheck = auth({
  audience: 'https://qr-codes-mk80.onrender.com',
  issuerBaseURL: 'https://dev-4lu668zsbke41q0u.us.auth0.com/',  //BASIC/ DOMAIN
  tokenSigningAlg: 'RS256'
});


var indexRouter = require('./routes/index');
var allTicketsRouter = require('./routes/all-tickets');
var createTicketRouter = require('./routes/create-ticket');
var usersRouter = require('./routes/users');
var loginNeededRouter = require('./routes/login-needed');
var ticketRouter = require('./routes/ticket-details');

var app = express();
app.use(session({
  secret: 'ilovefer',
  resave: true,
  saveUninitialized: true
}));
//----------------------------------------------------------------
/*
 * Configure passport.
 */
passport.serializeUser(function (user, done) {
  console.log('serialize user');
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  console.log('deserialize user');
  done(null, user);
});
passport.use(new oauth2.Strategy({
  //AUTH0_DOMAIN dev-g3eljifs.eu.auth0.com
  //AUTH0_CLIENT_ID
  //AUTH0_CLIENT_SECRET
  //CALLBACK_URL

  // authorizationURL: 'https://' + nconf.get('dev-4lu668zsbke41q0u.us.auth0.com') + '/i/oauth2/authorize',
  authorizationURL: 'https://' + nconf.get('AUTH0_DOMAIN') + '/i/oauth2/authorize',
  tokenURL: 'https://' + nconf.get('AUTH0_DOMAIN') + '/oauth/token',
  clientID: nconf.get('AUTH0_CLIENT_ID'),
  clientSecret: nconf.get('AUTH0_CLIENT_SECRET'),
  callbackURL: nconf.get('CALLBACK_URL'),
  skipUserProfile: false,
  audience: "https://qr-codes-mk80.onrender.com",
}, function (accessToken, refreshToken, profile, done) {
  console.log('-----------------accessToken:', accessToken);
  var payload = jwt.decode(accessToken);
  console.log('-----------------accessToken PARSED');
  logger.info('Token received for:', payload.sub);

  done(null, {
    id: payload.sub,
    access_token: accessToken
  });
}));

/*
 * Initialize passport.
 */
app.use(passport.initialize());
app.use(passport.session());

/*
 * Middleware to require authentication.
example : app.get('/account', requiresLogin, function(req, res, next) {
 */
var requiresLogin = function (req, res, next) {
  console.log(req.user);
  if (!req.isAuthenticated()) {
    return res.redirect('/login-needed');
  }
  next();
};
//----------------------------------------------------------------


//app.use(jwtCheck);// enforce auth on all endpoints

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/all-tickets', requiresLogin, allTicketsRouter);
app.use('/create-ticket', createTicketRouter);
app.use('/users', jwtCheck, usersRouter);
app.use('/login-needed', loginNeededRouter); //dont check jwt, session....
app.use('/ticket-details', ticketRouter); //dont check jwt, session....


/*
 * Login with 'Organizer' (the Resource Server)
 */
app.get('/auth/organizer',
  passport.authenticate('oauth2', { scope: 'appointments contacts openid email' }));

/*
 * Handle callback from the Authorization Server.
 */
app.get('/auth/organizer/callback',
  passport.authenticate('oauth2', { failureRedirect: '/' }),
  function (req, res) {
    logger.debug('Login:', req.user.access_token);
    res.redirect('/account');
  });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  const err_status = err.status || 500;

  res.status(err_status);
  const responseData = {
    message: err.message,
    status: err_status
  }

  const jsonContent = JSON.stringify(responseData);
  res.status(err_status).end(jsonContent);
});



module.exports = app;
