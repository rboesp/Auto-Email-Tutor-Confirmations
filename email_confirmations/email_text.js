function email_body(name, time) {
    return `
Hi ${name}!

Thank you for scheduling your session with me. I am looking forward to our session tomorrow at ${time} PST.
	
If something comes up and the scheduled time will not work, let me know a minimum of 6 hours before the appointment time and we’ll figure something out.
	
This session will take place here: https://us04web.zoom.us/j/79938221437?pwd=dksrN3dtOVduQ1JSbVpuV3M4Q0dzZz09

    (If you have not used zoom before please join the meeting at least 15 minutes early because it may have you download and install some software.)

Again, all I need from you:

    \t\u2022 Be on Tutors & Students Slack 5 minutes before your time slot.
    \t\u2022 Make sure your computer/mic/internet connection are working.
    \t\u2022 Make sure your workspace is quiet and free from interruptions.
    \t\u2022 At the end of the session, I will provide you with a link to a 2 minute evaluation form that you are required to complete.

Slack or email me with any questions. I’m looking forward to our meeting!

Please Reply All to this email so that I know you have seen it.

(CC Central Support on all tutor email by always using REPLY ALL).

Sincerely,

Robert Boespflug  
    `
}

module.exports.email_body = email_body
