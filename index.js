const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const exec = require('child_process').exec;

const languageDetails = {
    javascript: "js",
    c: "c",
    "c++": "cpp",
    java: "java",
    python: "py" 
}

const imageName = "compiler-image";

const saveCode = (code, language,  id, callback) => {
    console.log(`code ${code}, language ${language}, id: ${id}`);
    exec(`mkdir temp/${id}`, (err) => {
        if(err) {
            console.log(err);
        } else {
            fs.writeFile(path.join(__dirname, "temp", id, `code.${languageDetails[language]}`), code,  (err) => {
                console.log("File saved");
                const folderToMount = path.join(__dirname, "temp", id);
                console.log(folderToMount);
                exec(`sudo docker run --rm -v ${folderToMount}:/app/usercode ${imageName} node . ${language}`, (error, stdout, stderr) => {
                    const result = (fs.readFileSync(path.join(__dirname, "temp", id, "completed.txt"))).toString();
                    console.log(`result: ${result}`)
                    callback(result);
                })
            });
        }
    });
}

const generateId = (size) => {
    return crypto.randomBytes(size).toString('hex');
}


const app = express();
const port = 3000;

app.use(bodyParser.urlencoded());

app.get("/", (req, res, next) => {
    res.sendFile(path.join(__dirname, "index.html"))
})

app.post("/compile", (req, res, next) => {
    console.log(req.body)
    const { code, language } = req.body;
    saveCode(code, language, generateId(16), (result) => {
        res.send(`<h1>${result}</h1>`);
    });

})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});