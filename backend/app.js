const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(cookieParser());

let data = JSON.parse(fs.readFileSync(path.join(__dirname, "data.json")));
function saveData(data) {
    fs.writeFileSync(path.join(__dirname, "data.json"), JSON.stringify(data));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



const dotenv = require('dotenv');
dotenv.config();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get("/", (req, res) => {
    res.render('add');
    
});

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

app.post('/', (req, res) => {
    let lessonId = req.body.id;
    let content = req.body.content;

    if(data[lessonId] ) {
        res.send("Lesson already exists");
    } else {
        try {
            content = replaceAll(content, '\n', '\\n')
            data[lessonId] = {"plik.cpp": content}
            saveData(data);
            res.send("Lesson added");
        } catch(e) {
            res.send("Invalid JSON");
        }
    }
});

app.get('/lesson/:id', (req, res) => {
    let lessonId = req.params.id;
    if(data[lessonId]) {
        res.render('lesson', {data: data[lessonId], id: lessonId});
    } else {
        res.send("No data for this lesson");
    }
});

app.get('/admin', (req, res) => {
    if(req.cookies.token === process.env.ADMIN_PASS) {
        res.render('admin', {data: data});
    } else {
        res.render('login');
    }
});

app.post('/admin/delete', (req, res) => {
    if(req.cookies.token === process.env.ADMIN_PASS) {
        let lessonId = req.body.id;
        delete data[lessonId];
        saveData(data);
        res.redirect('/admin');
    } else {
        res.redirect('/admin');
    }
});
app.post('/admin', (req, res) => {
    if(req.body.token === process.env.ADMIN_PASS) {
        res.cookie('token', req.body.token);
        res.redirect('/admin');
    }
});

app.get("/getLesson/", (req, res) => {
    const lessonId = req.query.id;
    if(!data[lessonId]) {
        res.send("No data for this lesson");
    }
    res.send(data[lessonId]);
});

app.get("/setLesson/", (req, res) => {
    let lessonId = req.query.id;
    let content = req.body;
    data[lessonId] = {};
    for(let key in content) {
        data[lessonId][key] = content[key];
    }
    saveData(data);
    res.send("Lesson saved");
});


const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});