const fs = require("fs")
const util = require("util")
require("dotenv").config()
const nodemailer = require("nodemailer")
const e = require("./email_text")

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

    sendConfirmationEmails(toSend_sessions, sent_sessions).then(
        async (sent_sessions) => {
            await writeFileAsync(
                "store/sessions_to_send.json",
                JSON.stringify([])
            )
            await writeFileAsync(
                "store/sent_sessions.json",
                JSON.stringify(sent_sessions)
            )
        }
    )
}

function sendConfirmationEmails(sessions_to_send, sent_sessions) {
    return new Promise((resolve, reject) => {
        sessions_to_send.forEach(async (session, i) => {
            console.log(session)
            writeEmail(
                session.data.email,
                session.data.name,
                session.data.startTime
            )
                .then((res) => {
                    console.log(`Sent email to ${session.data.email}`)
                    sent_sessions.push(session)
                    if (sent_sessions.length === sessions_to_send.length) {
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

const writeEmail = (email, name, time) => {
    time = formatDate(time)
    let date = time.split("T")[0]
    time = time.split("T")[1].split("-")[0]
    date = date.split("-")
    date = date[1] + "/" + date[2]
    console.log(time)
    console.log(date)

    return new Promise((resolve, err) => {
        let mailOptions = {
            from: "rboesp@gmail.com",
            to: "rboesp@gmail.com",
            cc: "rboesp@gmail.com",
            subject: `Coding Boot Camp - Tutor Confirmation - ${date} ${time} PST`,
            text: e.email_body(
                name,
                time,
                "https://us04web.zoom.us/j/79938221437?pwd=dksrN3dtOVduQ1JSbVpuV3M4Q0dzZz09",
                "6HUuS2"
            ),
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

/*ENTRY POINT*/
start()

//from https://stackoverflow.com/questions/4898574/converting-24-hour-time-to-12-hour-time-w-am-pm-using-javascript
function formatDate(date) {
    var d = new Date(date)
    var hh = d.getHours()
    var m = d.getMinutes()
    var s = d.getSeconds()
    var dd = "AM"
    var h = hh
    if (h >= 12) {
        h = hh - 12
        dd = "PM"
    }
    if (h == 0) {
        h = 12
    }
    m = m < 10 ? "0" + m : m

    s = s < 10 ? "0" + s : s

    /* if you want 2 digit hours:
    h = h<10?"0"+h:h; */

    var pattern = new RegExp("0?" + hh + ":" + m + ":" + s)

    var replacement = h + ":" + m
    /* if you want to add seconds
    replacement += ":"+s;  */
    replacement += " " + dd

    return date.replace(pattern, replacement)
}
