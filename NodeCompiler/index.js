const fs = require("fs");
const cmd=require('node-cmd');
const exec = require('child_process').exec;
const glob = require('glob');

// Options for interpreted languages
const interpreterOptions = {
    javascript: {
        name: 'JavaScript',
        extension: 'js',
        interpreter: 'node'
    },
    python: {
        name: 'Python',
        extension: 'py',
        interpreter: 'py'
    }
}

function interpret(langName) {
    const name = interpreterOptions[langName].name;
    const extension = interpreterOptions[langName].extension;
    const interpreter = interpreterOptions[langName].interpreter;
    //Changing Working Directory to usercode
    process.chdir('/app/usercode');
    //Search for our source file by extension
    glob(`*.${extension}`, (err, files) => {
        if(err || files.length === 0){
            console.log(err);
            console.log('Found nothing.');
        }
        // If we found our file interpret it
        if(files.length > 0) {
            console.log(files);
            const fileName = files[0];
            console.log(`Processing a ${name} file.`)
            // Interpret our code
            exec(`${interpreter} ${fileName}`, (error, data, stderr) => {
            // If there are any errors write it to error.txt
            if(error) {
                console.log('There was an error :( ....');
                fs.writeFile('error.txt', error, () => {
                    console.log('Error happened, log created.');
                })
            }
            // If interpreted succesfully write stdout to completed.txt
            if(data) {
                console.log('Sucess');
                fs.writeFile('completed.txt', data, {encoding: 'utf8'}, () => {
                    console.log('Sucessful compilation');
                })
            }
            console.log(stderr);
            });
        }
    })
}

// Options for compiled languages
compilerOptions = {
    java: {
        name: 'Java',
        extension: 'java',
        compiler: 'javac',
        runner: 'java'
    },
    c: {
        name: 'C',
        extension: 'c',
        compiler: 'gcc',
        
    },
    'c++' : {
        name: 'C++',
        extension: 'cpp',
        compiler: 'g++'
    }
};


// For Compiled languages
function compile(langName) {
    const name = compilerOptions[langName].name;
    const extension = compilerOptions[langName].extension;
    const compiler = compilerOptions[langName].compiler;
    const runner = compilerOptions[langName].runner;
    //Changing Working Directory to usercode
    process.chdir('/app/usercode');
    //Search for our source file by extension
    glob(`*.${extension}`, (err, files) => {
        if(err || files.length === 0){
            console.log(err);
            console.log('Found nothing.');
        }
        // If we found our file compile and run
        if(files.length > 0) {
            console.log(files);
            //Getting our file in filename.extension format
            const fileName = files[0];
            //Getting only the filename
            const executable = files[0].split('.')[0];
            console.log(`Processing a ${name} file.`)
            exec(`${compiler} ${fileName}`, (error, stdout, stderr) => {
                console.log(error);
                console.log(stdout);
                console.log(stderr);
                //No errors good to go
                if(!err && !stderr) {
                    console.log('No errors my friend')
                    // Java runs by JVM which is different, take care of it here
                    if(name === "Java"){
                        exec(`${runner} ${executable}`, (error, stdout, stderr) => {
                            // Writing stdout to completed.txt
                            fs.writeFile('completed.txt', stdout + `\n Created @ ${new Date}`, {encoding: 'utf8'}, () => {
                                console.log('Sucessful compilation');
                            })
                        })
                    // Handling languages that gives us executable files
                    }else {
                        exec(`./a.out`, (error, stdout, stderr) => {
                            console.log(error);
                            console.log(stderr);
                            // Writing stdout to completed.txt
                            if(!error && !stderr) {
                                fs.writeFile('completed.txt', stdout + `\n Created @ ${new Date}`, {encoding: 'utf8'}, () => {
                                    console.log('Sucessful compilation');
                                })
                            } else {
                                fs.writeFile("errors.txt", err + stderr, () => {
                                    console.log("error logged");
                                })
                            }
                        })
                    }
                }else {
                    fs.writeFile("errors.txt", err + stderr, () => {
                        console.log("error logged");
                    })
                }
            })
        }
    })
}
// Command line arg
const whatToRun = process.argv.slice(2)[0]

// Checking if language is interpreted or compiled
if( whatToRun === 'javascript' || whatToRun === 'python'){
    console.log('Interpreting...');
    interpret(whatToRun);
} else {
    console.log("Compiling...");
    compile(whatToRun);
}

