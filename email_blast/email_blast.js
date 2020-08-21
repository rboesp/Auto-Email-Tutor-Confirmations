const fs = require("fs")
const readline = require("readline")
const { google } = require("googleapis")

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json"

// Load client secrets from a local file.
fs.readFile("credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err)
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), listMajors)
})

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    )

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback)
        oAuth2Client.setCredentials(JSON.parse(token))
        callback(oAuth2Client)
    })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
    })
    console.log("Authorize this app by visiting this url:", authUrl)
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    rl.question("Enter the code from that page here: ", (code) => {
        rl.close()
        oAuth2Client.getToken(code, (err, token) => {
            if (err)
                return console.error(
                    "Error while trying to retrieve access token",
                    err
                )
            oAuth2Client.setCredentials(token)
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err)
                console.log("Token stored to", TOKEN_PATH)
            })
            callback(oAuth2Client)
        })
    })
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1hiRdYWOxF1-yYHqIcSr8ebGiCLXTQXvgNbqqFtSLPqY/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
    const sheets = google.sheets({ version: "v4", auth })
    sheets.spreadsheets.values.get(
        {
            spreadsheetId: "1hiRdYWOxF1-yYHqIcSr8ebGiCLXTQXvgNbqqFtSLPqY",
            range: "Student Roster!D3:D200",
        },
        (err, res) => {
            if (err) return console.log("The API returned an error: " + err)
            const rows = res.data.values
            // console.log(rows)
            writeEmailToAll(rows)
            // if (rows.length) {
            //     console.log("Name, Major:")
            //     // Print columns A and E, which correspond to indices 0 and 4.
            //     rows.map((row) => {
            //         console.log(`${row[0]}, ${row[4]}`)
            //     })
            //  else {
            //     console.log("No data found.")
            // }
        }
    )
}

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

// async function start(rows) {
//     sendEmailBlast(rows)
//     // sendConfirmationEmails().then(
//     //     async (sent_sessions) => {
//     //         await writeFileAsync(
//     //             "store/sessions_to_send.json",
//     //             JSON.stringify([])
//     //         )
//     //         await writeFileAsync(
//     //             "store/sent_sessions.json",
//     //             JSON.stringify(sent_sessions)
//     //         )
//     //     }
//     // )
// }

// function sendEmailBlast(rows) {
//     return new Promise((resolve, reject) => {
//         let email_send_count = 0
//         rows.forEach((row, i) => {
//             // console.log(row)
//             writeEmailToAll(rows)
//             //         .then((res) => {
//             //             email_send_count++
//             //             console.log(`Sent email to ${session.data.email}`)
//             //             sent_sessions.push(session)
//             //             if (email_send_count === sessions_to_send.length) {
//             //                 resolve(sent_sessions)
//             //             }
//             //         })
//             //         .catch((err) => {
//             //             console.log(err)
//             //             reject()
//             //         })
//             // })
//         })
//     })
// }

function getDate(time) {
    return new Promise((resolve, reject) => {
        let date = time.split("T")[0]
        date = date.split("-")
        date = date[1] + "/" + date[2]
        if (!date) reject("Err with date")
        resolve(date)
    })
}

function formatTime(time) {
    return new Promise((resolve, reject) => {
        time = formatDate(time)
        time = time.split("T")[1].split("-")[0]
        if (!time) reject("Err with time")
        resolve(time)
    })
}

const writeEmailToAll = async (emails) => {
    return new Promise((resolve, err) => {
        e_arr = []
        emails.map((email) => e_arr.push(email[0]))
        console.log("**Sending emails to: **")
        console.log(e_arr)
        let mailOptions = {
            from: "rboesp@gmail.com",
            to: ``,
            cc: "centralsupport@bootcampspot.com",
            bcc: `${e_arr}`,
            subject: `Coding Boot Camp - Tutor Available`,
            html: e.email_body(
                "https://calendly.com/robertboespflug/tutorial-session"
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

// start()

//from https://stackoverflow.com/questions/4898574/converting-24-hour-time-to-12-hour-time-w-am-pm-using-javascript
function formatDate(date) {
    var d = new Date(date)
    var hh = d.getHours()
    var m = d.getMinutes()
    var s = d.getSeconds()
    var dd = "am"
    var h = hh
    if (h >= 12) {
        h = hh - 12
        dd = "pm"
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
