function email_body(name) {
    return `
<p>Hi ${name}!</p>

<p>Nice to meet you!  My name is Robert Boespflug and I was assigned to be your tutor. 
<br/>I am a recent computer science graduate from Oregon State University and a Trilogy TA for a full-stack development
bootcamp cohort out of Seattle, WA. 
I was a beginner developer not that long ago and 
have been assisting novice programmers for a 
couple of months now, so I understand the challenges 
you’re facing in the boot camp very well!    
</p>

<p>I just sent you an invite to our tutoring Slack channel, <span style="text-decoration-line: underline;text-decoration-style: solid;">Tutors & Students.</span> This is where we will be communicating through Direct Message (DM).  Let me know if you don't see the invite or have any issues getting signed up.  Please send me a direct message once you create your account there. You can DM me on that Slack by using my Slack name @Robert Boespflug. Make sure to have that Slack available on your mobile phone so that you can message me if there are problems with wifi, etc.</p>

     
    <span style="font-weight:bold;text-decoration-line: underline;text-decoration-style: solid;">Maximum tutorial sessions per week - our week is Monday - Sunday.</span>
    <ul style="margin:0px;">
    <li style="font-weight:bold;">Part-time (6 month boot camp) students are entitled to 1 session per week.</li>
    <li style="font-weight:bold;">Full-time (3 month boot camp) students are entitled to 2 sessions per week. </li>
    </ul>
     <p>Schedule your session at:  https://calendly.com/robertboespflug/tutorial-session</p>
     
     <span style="font-weight:bold;text-decoration-line: underline;text-decoration-style: solid;"><mark>On the Calendly page, be sure you have the correct time zone selected in the section labeled "Times are in"</mark> </span>
     <br/>
     <span style="font-weight:bold;">If our availability doesn’t sync, let me know and I'll see if we can figure something out. </span>
     <br/> 
     <p>
     Each session takes place over Zoom.us (video chat/screen sharing) and lasts about 50 minutes. I'll email you the Zoom.us link the day before our scheduled time. (If you have not used zoom before please join the meeting at least 15 minutes early as it may have you download and install some software.)
     </p>
    
     Again, all I need from you:
     <ul>
        <li>Be on Tutors & Students Slack 5 minutes before your time slot.</li>
        <li>Make sure your computer/mic/internet connection are working.</li>
        <li>Make sure your workspace is quiet and free from interruptions.</li>
        <li>At the end of the session, I will provide you with a link to a 2 minute evaluation form that you are required to complete.</li>
     </ul>

     <p>Slack or email me with any questions. I’m looking forward to our meeting!</p>
     <span style="font-weight:bold;">CC Central Support on all email by always using REPLY ALL.</span>
     <br/> <br/>
    
    Sincerely,
    <br/>
    Robert Boespflug
    `
}

module.exports.email_body = email_body
