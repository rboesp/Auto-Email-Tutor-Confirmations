const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 3000

const childProcess = require("child_process")
const fs = require("fs")

function run(scriptPath, callback) {
    // keep track of whether callback has been invoked to prevent multiple invocations
    var invoked = false

    var process = childProcess.fork(scriptPath)

    // listen for errors as they may prevent the exit event from firing
    process.on("error", function (err) {
        if (invoked) return
        invoked = true
        callback(err)
    })

    // execute the callback once the process has finished running
    process.on("exit", function (code) {
        if (invoked) return
        invoked = true
        var err = code === 0 ? null : new Error("exit code " + code)
        callback(err)
    })
}

function runScript(script) {
    return new Promise((resolve, reject) => {
        // Now we can run a script and invoke a callback when complete, e.g.
        run(`./${script}`, function (err) {
            if (err) reject(err)
            resolve(`FINISHED RUNNING ${script} \n`)
        })
    })
}

function log(msg) {
    console.log(`----> ${msg} `)
}

async function getEmailConfirmations() {
    log("Sending email confirmations!!")
    // console.log(path.dirname('/email_confirmations/email_confirmations.js'));
    // const url = path.join(__dirname, '/email_confirmations/email_confirmations.js')
    // console.log(url);
    let msg = await runScript('/email_confirmations/email_confirmations.js')
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/session-confirmations', (req, res) => {
    getEmailConfirmations()
})

//not so! haha

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

