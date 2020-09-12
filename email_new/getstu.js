const fs = require("fs")
const readline = require("readline")
const { google } = require("googleapis")

const util = require("util")
require("dotenv").config()
const nodemailer = require("nodemailer")
const e = require("./email_text")

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json"

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
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

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
            if (err) return console.error("Error while trying to retrieve access token", err)
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
            range: "Student Roster!C3:D200",
        },
        (err, res) => {
            if (err) return console.log("The API returned an error: " + err)
            const rows = res.data.values
            console.log(rows)
            let stu_name = rows[rows.length - 1][0]
            let stu_email = rows[rows.length - 1][1]
            stu_name = stu_name.split(" ")[0]
            console.log(stu_name)
            console.log(stu_email)
            writeEmail(stu_email, stu_name).then((res) => {
                console.log("Done writing email")
            })
        }
    )
}

//cc and real email later
function writeEmail(email, name) {
    return new Promise((resolve) => {
        let mailOptions = {
            from: "rboesp@gmail.com",
            to: `${email}`,
            cc: "centraltutorsupport@bootcampspot.com",
            subject: `Coding Boot Camp - Tutor Available`,
            html: e.email_body(name),
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
