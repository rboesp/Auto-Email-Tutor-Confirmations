const fs = require("fs")
const readline = require("readline")
const { google } = require("googleapis")
const util = require("util")
const { parse } = require("path")

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)

class Data {
    constructor(email, name, startTime) {
        this.email = email
        this.name = name
        this.startTime = startTime
    }
}

class Session {
    constructor(id, email, name, startTime) {
        this.id = id
        this.data = new Data(email, name, startTime)
    }
}

class SavedSessionList {
    constructor(list = []) {
        this.saved_sessions = {}
        list.forEach((item) => {
            this.saved_sessions[item.id] = item.data
        })
        // console.log("****SAVED SESSIONS LIST ******")
        // console.log(this.saved_sesssions)
    }
}

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
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

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
    if (err) return console.log("**** ---> The API returned an error: " + err)
    const events = res.data.items
    if (!events.length) return console.log("No Events!")
    let savedSessions
    try {
        const fileStr = await readFileAsync("email_confirmations/store/upcoming_sessions.json", "utf8")
        if (fileStr) savedSessions = JSON.parse(fileStr)
    } catch (err) {
        throw new Error("File parse failed")
    }
    // console.log(events);
    let calendar_sessions = getTutoringSessionsFromEvents(events)
    let sessionList = new SavedSessionList(savedSessions)
    console.log(sessionList)
    checkForNewSessions(sessionList, calendar_sessions)
}

const checkForNewSessions = async (sessionList, calendar_sessions) => {
    for (let i = 0; i < calendar_sessions.length; i++) {
        const idSavedAlready = sessionList.saved_sessions[`${calendar_sessions[i].id}`]
        if (!idSavedAlready) {
            //finding a new session not saved before
            console.log("**Found new sessions to put in email queue!**")
            await writeFileAsync("email_confirmations/store/upcoming_sessions.json", JSON.stringify(calendar_sessions))
            i = calendar_sessions.length
        }
    }
    console.log("----> Done checking Sessions!")
}

/**
 * Filters for tutoring session from other calandar events
 * @param {events} array[Object] Represents next 20 events in my google calendar
 * @returns {array[Object]}
 */
const getTutoringSessionsFromEvents = (events) => {
    let sessions = []
    events.map((event) => {
        // console.log(event)
        if (!event.organizer) return
        if (event.organizer.email === "jalexander@2u.com") return //don't think I need this
        if (!event.description) return
        if (!event.description.includes("Tutorial Session")) return
        let session = getSessionProperties(event)
        if (!session) return
        sessions.push(session)
    })
    console.log(sessions)
    return sessions
}

/**
 * Gets the useful properties needed to make an email to student from tutoring event
 * @param {validEvent} Object A tutoring session the has been made through calendly
 * and retrieved through api call from google calendar above
 * @returns {array}
 */
const getSessionProperties = (validEvent) => {
    // console.log(validEvent);
    // console.log(validEvent.attendees)
    // console.log(time)
    let student_name = validEvent.summary.split(" and ")[0]
    if (!student_name.split("Canceled: ")[0]) {
        return //skip this session
    }
    student_name = student_name.split(" ")[0] //get first name
    // console.log(student_name)

    let student //find way to re-do this and make it const
    // console.log(validEvent.attendees);
    validEvent.attendees.forEach((attendees) => {
        student = filterStudentFromAttendees(attendees)
    })
    // console.log(student);
    if (!student) {
        return //either no attendees or only myself, skip this session
    }

    const session_time = validEvent.start.dateTime
    const event_id = validEvent.id

    const session = new Session(event_id, student.email, student_name, session_time)
    return session
}

/**
 * Parses student from myself in attendees
 * @param {attendees} array[Object]
 * @returns {Object}
 */
const filterStudentFromAttendees = (attendees) => {
    // console.log(attendees)
    // if (!attendees.organizer) {
        // console.log(attendee)
        return attendees
    // }
}
