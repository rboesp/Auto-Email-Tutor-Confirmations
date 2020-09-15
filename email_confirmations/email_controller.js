const fs = require("fs")
const util = require("util")
const date_time = require("./time_formatting")

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)

//number of hours before the upcoming session the
//program will use to decide whether or not to send an
//email confirmation to the student
const time_frame = 25

//finds sessions which need a confirmation
//email send to the student
async function start() {
    //

    /*check which sessions are coming up*/
    const fileStr = await readFileAsync("store/upcoming_sessions.json", "utf8")
    let upcoming_sessions = []
    try {
        if (fileStr) upcoming_sessions = JSON.parse(fileStr)
    } catch (err) {
        throw new Error("File parse failed")
    }

    /*check which sessions we have already sent
    an email confirmation to*/
    const sentFileStr = await readFileAsync("store/sent_sessions.json", "utf8")
    let sent_sessions = []
    try {
        if (sentFileStr) sent_sessions = JSON.parse(sentFileStr)
    } catch (err) {
        throw new Error("File parse failed")
    }

    /*get sessions id's of sessions we have already sent */
    let sent_ids = []
    sent_sessions.forEach((session) => {
        sent_ids.push(session.id)
    })

    /*if any upcoming sessions not in sent sessions file, 
    store them in sessions_to_send file so they can be 
    sent by the email service*/
    let to_send = []
    upcoming_sessions.map((session) => {
        // console.log(session)
        //if we sent email already to session skip
        if (sent_ids.includes(session.id)) return

        //get time in hours between now and start of session
        let time_now = new Date()
        let session_time = new Date(session.data.startTime)
        let time = date_time.diff_hours(time_now, session_time)

        //if session within time frame, add to_send pile
        if (time < time_frame) {
            console.log(`Session within ${time_frame} hours!`)
            to_send.push(session)
        }
    })

    await writeFileAsync("store/sessions_to_send.json", JSON.stringify(to_send)) //write to_send pile to file
}

/*ENTRY POINT*/
start()
