const express = require('express')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const sqlite = require('./db/sqlite').sqlite;
const multer = require('multer');
var cors = require('cors')

var userRoutes = require('./users/user');

const app = express()
const port = 3200
var corsOptions = {
	origin: 'http://127.0.0.1:3000',
	optionsSuccessStatus: 200,
	credentials: true
}
app.use(cors(corsOptions))

app.use(cookieParser());
app.use(session({
	secret: "5s1laviETstKoZjz7Bu8HwzphpOYXpNE",
	resave: true,
	saveUninitialized: true
})
);


//var bodyParser = require('body-parser');
//app.use(bodyParser.json()); // support json encoded bodies
//app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


const upload = multer();
app.use(express.json());  // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(upload.array()); // for parsing multipart/form-data
app.use(express.static('public'));

app.get('/', (req, res) => {
	res.send('You have reached Nehan Technologies expressJS server')
})

/*    ********************************************************  **/
/**   Declare route handlers defined on other files here        **/
/*    ********************************************************  **/

app.use('/users', userRoutes);


/*    ********************************************************  **/
/**   Route handler declarations ends                          **/
/*    ********************************************************  **/

app.listen(port, () => {
	console.log(`Nehan Technologies demo server listening at http://127.0.0.1:${port}`)
});

app.on('exit', function() {
	sqlite.close((err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Close the database connection.');
	});
});