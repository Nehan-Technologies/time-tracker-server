const sqlite = require('../db/sqlite').sqlite;
var express = require('express'),
	router = express.Router();

router.post('/login', (req, res) => {
	console.log(req.body.password);
	let username = req.body.username;
	var password = req.body.password;

	req.session.user = null;
	res.setHeader('Content-type', 'text/json');
	try {
		const row = sqlite.prepare('SELECT * FROM users where username=? and password=?').get([username, password]);
		if (row != null) {
			const user = row;
			req.session.user = user;
			res.json({ "code": 200, "message": "login successfull", data: user });
		} else {
			res.status(401).send({ message: 'Invalid username or password' });
		}
	} catch (err) {
		console.log(err);
		res.status(500).send({ message: 'Error occurred while trying to login' });
	}
})

router.get('/me', (req, res) => {
	if (req.session.user == null || req.session.user == undefined) {
		res.status(401).send({ message: 'Please login' });
	} else {
		res.json({ "code": 200, "message": "", data: req.session.user });
	}
})

router.get('/logout', (req, res) => {
	if (req.session.user == null || req.session.user == undefined) {
		res.json({ "code": 200, "message": "Success" });
	} else {
		req.session.user = null
		res.json({ "code": 200, "message": "logout successfull" });
	}
})


router.post('/login', (req, res) => {
	if (req.session.user == null || req.session.user == undefined) {
		res.json({ "code": 200, "message": "Success" });
	} else {
		req.session.user = null
		res.json({ "code": 200, "message": "logout successfull" });
	}
})

router.get('/projects', function(req, res) {
	res.json({ "code": 200, "message": "Success", data: getProjectsWithWorklog() });
})

function getProjectsWithWorklog() {
	let projects = getProjects();
	let dt = new Date();
	let worklogs = getWorklog(dt.getMonth(), dt.getFullYear());
	for (let proj of projects) {
		proj['worklog'] = [];
		proj['allocation'] = 0;
		proj['burned'] = 0;
		for (let wl of worklogs) {
			if (wl.project_id == proj.id) {
				proj['worklog'].push(wl);
				proj['allocation'] += wl.estimate_hours;
				proj['burned'] += wl.actual_hours;
			}
		}
		/*
		let curDate = new Date(dt.getFullYear(), dt.getMonth(), 1);
		let lastDate = new Date(dt.getFullYear(), dt.getMonth()+1, 0);
		while (curDate.getTime() < lastDate.getTime()) {
			let wl = {project_id: proj.id, user_id: userId, record_date: curDate, estimate_hours: 0, actual_hours: 0};
			proj['worklog'].push(wl);
		}
		*/
	}
	return projects;
}

function getProjects() {
	console.log('Retrieving all projects');
	let ret = sqlite.prepare('SELECT * FROM projects').all();
	console.log('Got ' + ret.length + ' projects');
	return ret;
}

function getWorklog(month, year) {
	let dateStart = new Date(year, month, 1);
	let dateEnd = new Date(year, month + 1, 0);
	console.log('Retrieving worklogs between ' + dateStart + ' and ' + dateEnd);
	let ret = sqlite.prepare('SELECT * FROM work_log where record_date >= datetime(?, \'unixepoch\') and record_date <= datetime(?, \'unixepoch\')').all(dateStart.getTime() / 1000, dateEnd.getTime() / 1000);
	console.log('Got ' + ret.length + ' work log entries');
	return ret;
}

router.get('/projects', (req, res) => {
	if (req.session.user == null || req.session.user == undefined) {
		res.json();
	} else {
		req.session.user = null
		res.json({ "code": 200, "message": "logout successfull" });
	}
})

router.post('/insertUpdateWorklog', (req, res) => {
	let description = req.body.description;
	let projectId = req.body.projectId;
	let recordDate = req.body.recordDate;
	let actualHours = req.body.actualHours;

	res.setHeader('Content-type', 'text/json');
	let ret = sqlite.prepare('SELECT * FROM work_log where user_id=? and project_id=? and record_date = ?').all(1, projectId, recordDate);
	if (ret.length != 0) {
		console.log('Updating work log');
		try {
			sqlite.prepare('UPDATE work_log set description=?, actual_hours=? where user_id=? and project_id=? and record_date = ?').run(description, actualHours, 1, projectId, recordDate);
			res.json({ "code": 200, "message": "Update successful" });
		} catch (err) {
			console.log(err);
			res.status(500).send({ message: 'Error occurred while trying update work log' });
		}
	} else {
		console.log('Inserting work log ');
		try {
			sqlite.prepare('INSERT INTO work_log (description, actual_hours, estimate_hours, user_id, project_id, record_date) VALUES (?, ?, ?, ?, ?, ?)').run(description, actualHours, 0, 1, projectId, recordDate);
			res.json({ "code": 200, "message": "Insert successful" });
		} catch (err) {
			console.log(err);
			res.status(500).send({ message: 'Error occurred while trying insert work log' });
		}
	}
})

module.exports = router;