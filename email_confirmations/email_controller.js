const fs = require("fs")
const util = require("util")

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)

//number of hours before the upcoming session the
//program will use to decide whether or not to send an
//email confirmation to the student
const time_frame = 25

//gets the difference in hours between two
//date objects
function diff_hours(dt2, dt1) {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000
    diff /= 60 * 60
    return Math.abs(Math.round(diff))
}

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
        let time = diff_hours(new Date(), new Date(session.data.startTime)) //first arg is date now, second is date of session

        //if we haven't sent email for session already, and within time frame, add to send pile
        if (!sent_ids.includes(session.id)) {
            if (time < time_frame) {
                console.log(`Session within ${time_frame} hours!`)
                to_send.push(session)
            }
        } else console.log("Already sent reminder email for this session!")
    })

    await writeFileAsync("store/sessions_to_send.json", JSON.stringify(to_send)) //write to send pile to file
}

/*ENTRY POINT*/
start()
