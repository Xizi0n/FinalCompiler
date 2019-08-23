const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const resposeTime = require("response-time");
const exec = require('child_process').exec;

const languageDetails = {
    javascript: "js",
    c: "c",
    "c++": "cpp",
    java: "java",
    python: "py" 
}

const imageName = "compiler-image";

// Getting classname of java code
function getClassName(string) {
    // Taking care of any parent classes
    const classname = string.split('{')[0].split('class')[1].split('extends')[0].trim();

    return classname;

}

const saveCode = (code, language,  id, callback) => {
    console.log(`code ${code}, language ${language}, id: ${id}`);
    exec(`mkdir temp/${id}`, (err) => {
        if(err) {
            console.log(err);
        } else {
            const filename = language === 'java' ? getClassName(code).toString() + '.java' : `code.${languageDetails[language]}`;
            console.log(filename);
            fs.writeFile(path.join(__dirname, "temp", id, filename ), code,  (err) => {
                console.log("File saved");
                const folderToMount = path.join(__dirname, "temp", id);
                console.log(folderToMount);
                exec(`sudo docker run --rm -v ${folderToMount}:/app/usercode ${imageName} node . ${language}`, (error, stdout, stderr) => {
                    fs.access(path.join(__dirname, "temp", id, "completed.txt"), (err) => {
                        if(!err){
                            const result = (fs.readFileSync(path.join(__dirname, "temp", id, "completed.txt"))).toString();
                            console.log(err)
                            callback(result);
                        } else {
                            const result = (fs.readFileSync(path.join(__dirname, "temp", id, "error.txt"))).toString();
                            console.log(err)
                            callback(result);
                        }
                    })
                })
            });
        }
    });
}

const generateId = (size) => {
    return crypto.randomBytes(size).toString('hex');
}


const app = express();
const port = 3333;

app.use(resposeTime());
app.use(bodyParser.urlencoded());

app.get("/", (req, res, next) => {
    res.sendFile(path.join(__dirname, "index.html"))
})

app.post("/compile", (req, res, next) => {
    console.log(req.body)
    const { code, language } = req.body;
    const id = generateId(16);
    saveCode(code, language, id, (result) => {
        exec(`rm -rf ./temp/${id}`, (err, stdout, stderr) => {
            console.log(err, stderr)
            res.send(`<h1>${result}</h1>`);
        });
    });

})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});