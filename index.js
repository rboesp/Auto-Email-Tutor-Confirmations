const fs = require("fs")
const readline = require("readline")
const { google } = require("googleapis")
const util = require("util")
const { parse } = require("path")

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json"

// Load client secrets from a local file.
fs.readFile("credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err)
    // Authorize a client with credentials, then call the Google Calendar API.
    authorize(JSON.parse(content), listEvents)
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
        if (err) return getAccessToken(oAuth2Client, callback)
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
function getAccessToken(oAuth2Client, callback) {
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
            if (err) return console.error("Error retrieving access token", err)
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
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
    const calendar = google.calendar({ version: "v3", auth })
    calendar.events.list(
        {
            calendarId: "primary",
            timeMin: new Date().toISOString(),
            maxResults: 20,
            singleEvents: true,
            orderBy: "startTime",
        },
        handleResponse
    )
}

/**
 * Handles incoming response from google API request
 * @param {res}
 * @param {err}
 */
const handleResponse = async (err, res) => {
    if (err) return console.log("The API returned an error: " + err)
    const events = res.data.items
    if (!events.length) return console.log("No Events!")
    const fileStr = await readFileAsync("savedSessions.json", "utf8")
    let savedSessions = JSON.parse(fileStr)
    let calendar_sessions = getTutoringSessionsFromEvents(events)
    console.log(calendar_sessions) //now you can check if different than file *THINK ABOUT WHAT DATA STRUCTURES YOU WANT TO USE TO MODEL DATA*
}

/**
 * Filters for tutoring session from other calandar events
 * @param {events} array[Object] Represents next 20 events in my google calendar
 * @returns {array[Object]}
 */
const getTutoringSessionsFromEvents = (events) => {
    let sessions = []
    events.map((event) => {
        if (event.organizer.email === "jalexander@2u.com") return
        if (!event.description.includes("Tutorial Session")) return
        let session = getSessionProperties(event)
        sessions.push(session)
    })
    return sessions
}

/**
 * Gets the useful properties needed to make an email to student from tutoring event
 * @param {validEvent} Object A tutoring session the has been made through calendly
 * and retrieved through api call from google calendar above
 * @returns {array}
 */
const getSessionProperties = (validEvent) => {
    let student
    const session_time = validEvent.start.dateTime
    const event_id = validEvent.id
    // console.log(time)
    validEvent.attendees.forEach((attendee) => {
        student = getStudent(attendee)
    })
    // console.log(a)
    return [event_id, session_time, student]
}

/**
 * Parses student from myself in attendees
 * @param {attendees} array[Object]
 * @returns {Object}
 */
const getStudent = (attendees) => {
    // console.log(attendee)
    if (!attendees.organizer) {
        // console.log(attendee)
        return attendees
    }
}

// // console.log(attendee.email)
// if (!emails.includes(attendee.email)) {
//     emails.push({
//         email: attendee.email,
//         date: event.start.dateTime,
//     })
//     console.log("Pushed email!")
// } else {
//     console.log("Email already in file!")
// }
