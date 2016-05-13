import passport from 'passport';
// EchoSign is now AdobeSign
import { Strategy as AdobeSignStrategy } from 'passport-echosign';
import https from 'https';
import express from 'express';
import daplie from 'localhost.daplie.com-certificates';

const port = process.env.PORT || 8443;
const app = express();

//=========================================New Code
var accesstTok;
const adobeBaseURL = `https://api.na1.echosign.com/api/rest/v5`;
var code;

//---------superagent Promise
var Promise = new Promise();
var agent = require('superagent-promise')(require('superagent'), Promise);

// method, url form with `end`
agent('GET', `${adobeBaseURL}`)
  .end()
  .then(function onResult(res) {
    // do stuff
		console.log(`onResult res`);
		console.log(res);
  }, function onError(err) {
    //err.response has the response from the server
    console.log('onResult err');
		throw new(err);
  });

// // method, url form with `then`
// agent('GET', 'http://google.com')
//   .then(function onResult(res) {
//     // do stuff
//   });
//
//
// // helper functions: options, head, get, post, put, patch, del
// agent.put('http://myxfoo', 'data')
//   .end()
//   .then(function(res) {
//     // do stuff`
//   });
//
// // helper functions: options, head, get, post, put, patch, del
// agent.put('http://myxfoo', 'data').
//   .then(function(res) {
//     // do stuff
//   });
//==============================================New Code End

// Initialize passport
app.use(passport.initialize());

// Setup the AdobeSign strategy.
// Set `session` to false to avoid serialization errors. eg. We're not saving
// to the database right now.
passport.use(new AdobeSignStrategy({
	session: false,
	clientID: process.env.ADOBESIGN_CLIENT_ID,
	clientSecret: process.env.ADOBESIGN_CLIENT_SECRET,
	callbackURL: `https://localhost.daplie.com:${port}/auth/adobesign/callback`,
	scope: ['user_login:self', 'agreement_send:account', 'agreement_read']
}, (accessToken, refreshToken, profile, done) => {
	// Do real work here! Output for now.
	//
	accesstTok = accessToken;
	console.log(`access_token: ${accessToken}`);
	console.log(`refresh_token: ${refreshToken}`);
	console.log(profile);

	done(null, profile);
}));

// Show a simple signin button
app.get('/', (req, res) => {
	res.end('<a href="/auth/adobesign">Sign in<a/></br>\
		<a href="/auth/base_uris">base_uris<a/></br>\
		<a href="/transientDocuments">transientDocuments<a/');
});

// Initiate oauth process
app.get('/auth/adobesign', passport.authenticate('echosign'));

// Handle the adobesign callback.
app.get('/auth/adobesign/callback', ///base_uris/?access_token=${accesstTok}
	passport.authenticate('echosign', { session: false,  failureRedirect: '/login' }),
	(req, res) => {
		// Return relevant adobesign data.
		// res.json({
		// 	...req.query,
		// 	message: 'Check your console for tokens'
		// });
		console.log(code=req.query.code);

		console.log('req=====');
		console.log(req.query);
		 return res.redirect(`/success?code=${req.query.code}&web_access_point=${req.query.web_access_point}&api_access_point=${req.query.api_access_point}`);
	});

	//===================================================New Code
	//app.get('/base_uris', (req, res)=>{res.json({message: `Base accessiable`});});
	//app.get('/auth/adobesign/base_uris', (req, res)=>{console.log(res); res.json({message: `Base accessiable`});});

	const param = ``;
	app.get(`/${adobeBaseURL}/base_uris`, (req, res)=>{res.json({message: `Base accessiable`});});


	app.post(`/transientDocuments`, (req, res)=>{console.log('transitDocumentsQuery');console.log(req.query); return res.redirect(`/${adobeBaseURL}/transientDocuments`);});


	//===================================================End new Code

// Create a TLS supported server.
const server = https.createServer(daplie, app);

server.listen(port, (err) => {
	if (err) {
		console.error(err);
	} else {
		console.log(`==> 🌎 listening on ${port}. Open up https://localhost.daplie.com:${port} in your browser.`);
	}
});
