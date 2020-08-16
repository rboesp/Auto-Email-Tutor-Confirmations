const fs = require("fs")
const util = require("util")
require("dotenv").config()
const nodemailer = require("nodemailer")

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "rboesp@gmail.com",
        pass: process.env.GMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
})

async function start() {
    const fileStr = await readFileAsync("store/sessions_to_send.json", "utf8")
    let toSend_sessions = []
    try {
        if (fileStr) toSend_sessions = JSON.parse(fileStr)
    } catch (err) {
        throw new Error("File parse failed")
    }

    if (!toSend_sessions.length)
        return console.log("No sessions to send email to!")

    const sentFileStr = await readFileAsync("store/sent_sessions.json", "utf8")
    let sent_sessions = []
    try {
        if (sentFileStr) sent_sessions = JSON.parse(sentFileStr)
    } catch (err) {
        throw new Error("File parse failed")
    }

    sendSessions(toSend_sessions, sent_sessions).then(async (res) => {
        // console.log(res)
        await writeFileAsync("store/sessions_to_send.json", JSON.stringify([]))
        await writeFileAsync("store/sent_sessions.json", JSON.stringify(res))
    })
}

start()

function sendSessions(toSend_sessions, sent_sessions) {
    return new Promise((resolve, reject) => {
        toSend_sessions.forEach(async (session, i) => {
            writeEmail(session.data.email, session.data.startTime)
                .then((res) => {
                    console.log(`Sent email to ${session.data.email}`)
                    sent_sessions.push(session)
                    if (sent_sessions.length === toSend_sessions.length) {
                        resolve(sent_sessions)
                    }
                })
                .catch((err) => {
                    console.log(err)
                    reject()
                })
        })
    })
}

const writeEmail = (email, time) => {
    return new Promise((resolve, err) => {
        let mailOptions = {
            from: "rboesp@gmail.com",
            to: "rboesp@gmail.com",
            subject: `Send email to ${email}`,
            text: `This is coming up at ${time}`,
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                err(error)
            } else {
                console.log("Email sent: " + info.response)
                resolve()
            }
        })
    })
}
