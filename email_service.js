const fs = require("fs")
const util = require("util")

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
    const fileStr = await readFileAsync("sessions_to_send.json", "utf8")
    let toSend_sessions = []
    try {
        if (fileStr) toSend_sessions = JSON.parse(fileStr)
    } catch (err) {
        throw new Error("File parse failed")
    }

    if (!toSend_sessions.length)
        return console.log("No sessions to send email to!")

    const sentFileStr = await readFileAsync("sent_sessions.json", "utf8")
    let sent_sessions = []
    try {
        if (sentFileStr) sent_sessions = JSON.parse(sentFileStr)
    } catch (err) {
        throw new Error("File parse failed")
    }
    // if (sent_sessions) console.log(sent_sessions)
    // else console.log("No sent sessions")

    // console.log(toSend_sessions)
    toSend_sessions.forEach((session) => {
        console.log(
            `Sending email to ${session.data.email} at ${session.data.startTime}`
        )
        sent_sessions.push(session)
    })

    // console.log(sent_sessions)
    await writeFileAsync("sent_sessions.json", JSON.stringify(sent_sessions))
    await writeFileAsync("sessions_to_send.json", "") //change this <- not necessarily
    console.log("Sent all sessions!")
}

start()
