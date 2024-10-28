var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { auth } = require('express-oauth2-jwt-bearer');

var passport = require('passport');
var oauth2 = require('passport-oauth2');


var nconf = require('nconf');
nconf.env()
  .file({ file: './config.json' })
  .defaults({
    PORT: 7003,
    CALLBACK_URL: "http://localhost:3000/auth/organizer/callback"
  });


const jwtCheck = auth({
  audience: 'https://qr-codes-mk80.onrender.com',
  issuerBaseURL: 'https://dev-4lu668zsbke41q0u.us.auth0.com/',
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
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

passport.serializeUser(function (user, done) {
  console.log('serialize user');
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  console.log('deserialize user');
  done(null, user);
});

passport.use(new oauth2.Strategy({
  authorizationURL: 'https://' + nconf.get('AUTH0_DOMAIN') + '/i/oauth2/authorize',
  tokenURL: 'https://' + nconf.get('AUTH0_DOMAIN') + '/oauth/token',
  clientID: nconf.get('AUTH0_CLIENT_ID'),
  clientSecret: nconf.get('AUTH0_CLIENT_SECRET'),
  callbackURL: nconf.get('CALLBACK_URL'),
  skipUserProfile: false,
  audience: "https://qr-codes-mk80.onrender.com",
}, function (accessToken, refreshToken, profile, done) {
  // console.log('-----------------accessToken:', accessToken);
  var payload = jwt.decode(accessToken);
  // console.log('-----------------accessToken PARSED');
  logger.info('Token received for:', payload.sub);

  done(null, {
    id: payload.sub,
    access_token: accessToken
  });
}));

app.use(passport.initialize());
app.use(passport.session());

var requiresLogin = function (req, res, next) {
  console.log(req.user);
  if (!req.isAuthenticated()) {
    return res.redirect('/login-needed');
  }
  next();
};

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/create-ticket', jwtCheck, createTicketRouter);
app.use('/login-needed', loginNeededRouter);
app.use('/ticket-details', ticketRouter);

app.get('/auth/organizer',
  passport.authenticate('oauth2', { scope: 'appointments contacts openid email' }));

app.get('/auth/organizer/callback',
  passport.authenticate('oauth2', { failureRedirect: '/' }),
  function (req, res) {
    logger.debug('Login:', req.user.access_token);
    res.redirect('/account');
  });

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
