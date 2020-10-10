/* *SETUP */


//google sheets api and email 
const { google } = require("googleapis")
const nodemailer = require("nodemailer")

//file i/o
const fs = require("fs")
const util = require("util")
const readFileAsync = util.promisify(fs.readFile)

//loads environment variables
require("dotenv").config()

//user made imported files
const create_email = require("./email_text")
const connect_to_google = require("./google")

/* Sets which account the emails will be sent from */
const email_transport_options = {
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
}
const email_service = nodemailer.createTransport(email_transport_options)


/* *DONE SETUP */


/*FUNCTIONS*/


/**
 * writes actual email from mail options passed in 
 * @param {Object} mail_options 
 * @param {Function} resolve 
 * @param {Function} reject 
 */
const sendEmails = (mail_options, resolve, reject) => {
    /**This sends the actual emails to the recipients in mailOptions */
    email_service.sendMail(mail_options, (error, info) => {
        if (error) reject(error)
        else {
            /**This logs out info for a successfull email blast */
            console.log();
            console.log(info);
            resolve()
        }
    })
}


/**
 *Sets up email blast to all the addresses passed in
 * @param {Object} emails
 * @return {void}
 */
const setupEmailOptions = async (emails) => {
    /*
    this sets up the email structrure 
    with onc cc and an array of bcc recepients
    */
    const options = {
        from: "rboesp@gmail.com",
        to: ``,
        cc: "centraltutorsupport@bootcampspot.com ",
        bcc: `${emails}`,
        subject: `Coding Boot Camp - Tutor Available`,
        html: create_email.email_body("https://calendly.com/robertboespflug/tutorial-session"),
    }

    return new Promise(
        (resolve, reject) => sendEmails(options, resolve, reject)
    )
}


/**
 * Exctracts studetns emails from google sheets api call
 * @param {String} error 
 * @param {Object} response 
 */
const handleSheetsResponse = (error, response) => {
    if (error) return console.log("The API returned an error: " + error)

    //exctract student emails from response
    const rows = response.data.values

   /**This logs out the list of student emails returned from google sheet */
    console.log(rows)

    /**This sends the email blast to student emails in google sheet */
    const recipients = rows.map((row) => row[0])
    setupEmailOptions(recipients)
}


/**
 * Get student emails from spreadsheet so we can can write email to them
 * @see https://docs.google.com/spreadsheets/d/1hiRdYWOxF1-yYHqIcSr8ebGiCLXTQXvgNbqqFtSLPqY/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
const getGoogleSheet = (auth) => {
    const sheets = google.sheets({ version: "v4", auth })
    const sheetInfo = {
        spreadsheetId: process.env.SPREADSHEETID,
        range: process.env.SPREADSHEETRANGE,
    }
    sheets.spreadsheets.values.get(sheetInfo, handleSheetsResponse)
}


/*ENTRY POINT / START OF PROGRAM*/
const main = async () => {
    // Load client secrets from a local file
    const credentials = await readFileAsync("credentials.json")

    //connect to google sheets api
    //USER DEFINED CALLBACK FUNCTION PASSED IN
    connect_to_google.authorize(JSON.parse(credentials), getGoogleSheet)  
}
main()
