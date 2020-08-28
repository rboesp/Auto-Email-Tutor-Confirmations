const fs = require("fs")
const util = require("util")
require("dotenv").config()
const nodemailer = require("nodemailer")
const email_text = require("./email_text")
const date_time = require("./time_formatting")

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)

/* Sets which account the emails will be sent from */
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

/*Function that goes through process of sending confirmation emails */
async function start() {
    //
    console.log("**********************")

    /* get sessions that need to be sent */
    const fileStr = await readFileAsync("store/sessions_to_send.json", "utf8")
    let toSend_sessions = []
    try {
        if (fileStr) toSend_sessions = JSON.parse(fileStr)
    } catch (err) {
        throw new Error(`File read failed: ${err}`)
    }

    if (!toSend_sessions.length) return console.log("No sessions to send email to!")

    /* get the sessions that we have already sent emails to
    so the new sessions being sent now can be written to the file */
    const sentFileStr = await readFileAsync("store/sent_sessions.json", "utf8")
    let sent_sessions = []
    try {
        if (sentFileStr) sent_sessions = JSON.parse(sentFileStr)
    } catch (err) {
        throw new Error("File parse failed")
    }

    /*Sends confirmation emails to all the sessions that need one */
    const new_sent_sessions = await sendConfirmationEmails(toSend_sessions, sent_sessions)

    /*clear out to_send file and overwrite sent_sessions file 
    to make sure to not have duplicate confirmation emails sent*/
    await writeFileAsync("store/sessions_to_send.json", JSON.stringify([]))
    await writeFileAsync("store/sent_sessions.json", JSON.stringify(new_sent_sessions))
    console.log("**********************")
}

/** */
function sendConfirmationEmails(sessions_to_send, sent_sessions) {
    return new Promise((resolve, reject) => {
        let email_send_count = 0
        sessions_to_send.forEach(async (session, i) => {
            try {
                await writeEmail(session.data.email, session.data.name, session.data.startTime)
            } catch (err) {
                console.log(err)
                reject()
            }

            email_send_count++
            sent_sessions.push(session)

            if (email_send_count === sessions_to_send.length) {
                console.log("") //cmd formatting space
                resolve(sent_sessions)
            }
        })
    })
}

/** */
const writeEmail = async (email, name, timestamp) => {
    const formatted_time = await date_time.formatTime(timestamp)
    const formatted_date = await date_time.extractDate(date_time.formatDate(timestamp))

    return new Promise((resolve, err) => {
        console.log(`Sending email to: ${name} at email ${email} for session at ${formatted_time}`)
        //centralsupport@bootcampspot.com
        //${email}
        let mailOptions = {
            from: "rboesp@gmail.com",
            to: `rboesp@gmail.com`,
            cc: "",
            subject: `Coding Boot Camp - Tutor Confirmation - ${formatted_date} ${formatted_time} PST`,
            text: email_text.email_body(name, formatted_time),
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                err(error)
            } else {
                console.log(`Email sent: ${info.response} \n`)
                resolve()
            }
        })
    })
}

/*ENTRY POINT*/
start()
