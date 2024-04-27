const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');

let data = JSON.parse(fs.readFileSync(path.join(__dirname, "data.json")));
function saveData(data) {
    fs.writeFileSync(path.join(__dirname, "data.json"), JSON.stringify(data));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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