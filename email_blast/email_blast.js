//google
const fs = require("fs")
const { google } = require("googleapis")
const readline = require("readline")

//user
const util = require("util")
require("dotenv").config()
const nodemailer = require("nodemailer")
const create_email = require("./email_text")
const connect_to_google = require("./google")
const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)

/**
 * Writes to actual email blast to all the addresses passed in
 * @param {Object} emails
 * @return {void}
 */
const writeEmailToAll = async (emails) => {
    return new Promise((resolve, err) => {
        e_arr = []
        emails.map((email) => e_arr.push(email[0]))
        console.log("**Sending emails to: **")
        console.log(e_arr)
        let mailOptions = {
            from: "rboesp@gmail.com",
            to: ``,
            cc: "centraltutorsupport@bootcampspot.com",
            bcc: `${e_arr}`,
            subject: `Coding Boot Camp - Tutor Available`,
            html: create_email.email_body("https://calendly.com/robertboespflug/tutorial-session"),
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

/**
 * Get student emails from spreadsheet so we can can write email to them
 * @see https://docs.google.com/spreadsheets/d/1hiRdYWOxF1-yYHqIcSr8ebGiCLXTQXvgNbqqFtSLPqY/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function start(auth) {
    const sheets = google.sheets({ version: "v4", auth })
    sheets.spreadsheets.values.get(
        {
            spreadsheetId: "1rr4_HHt3B8Ci4lIP-EK6pn2DD2XIFh4G_zzclBzUlpA",
            range: "Student Roster!D3:D200",
        },
        (err, res) => {
            if (err) return console.log("The API returned an error: " + err)
            const rows = res.data.values

            /*TO TEST UNCOMMENT LOG BELOW AND COMMENT OUT FUNCTION CALL */
            // console.log(rows)
            writeEmailToAll(rows)
        }
    )
}

/*ENTRY POINT */
const main = () => {
    // Load client secrets from a local file.
    fs.readFile("credentials.json", (err, content) => {
        if (err) return console.log("Error loading client secret file:", err)
        // Authorize a client with credentials
        // Then call the Google Sheets API.
        connect_to_google.authorize(JSON.parse(content), start) //USER DEFINED CALLBACK FUNCTION PASSED IN
    })
}
main()
