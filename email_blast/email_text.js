function email_body(link) {
    return `
    Hi Everyone!
     <br/> <br/>
    I hope you had a great week! I have attached a link below to schedule another tutoring session if you wish. <span style="font-weight:bold;"> If you are already scheduled, please ignore this email. </span>
     <br/> <br/>
    ${link} 
     <br/>
     <span style="font-weight:bold;text-decoration-line: underline;text-decoration-style: solid;"><mark>On the Calendly page, be sure you have the correct time zone selected in the section labeled "Times are in"</mark> </span>
     <br/>
     <span style="font-weight:bold;">If our availability doesn’t sync, let me know and I'll see if we can figure something out. </span>
     <br/> <br/>
    <span style="font-weight:bold;text-decoration-line: underline;text-decoration-style: solid;">Maximum tutorial sessions per week - our week is Monday - Sunday.</span>
    <ul style="margin:0px;">
    <li style="font-weight:bold;">Part-time (6 month boot camp) students are entitled to 1 session per week.</li>
    <li style="font-weight:bold;">Full-time (3 month boot camp) students are entitled to 2 sessions per week. </li>
    </ul>
     <br/> 
    If you have any questions or none of the times available work for you please let me know and I would be happy to help.
     <br/> <br/>
    If you would like to schedule regular, recurring sessions at the same day/time each week, just let me know by REPLY ALL and we can work it out.  This is particularly useful if you have a strict schedule so you won't have to compete for time on my calendar.
     <br/> <br/>
     <span style="font-weight:bold;">CC Central Support on all email by always using REPLY ALL.</span>
     <br/> <br/>
    <span style="font-weight:bold;">Boot camp tip! - Our Learning Assistant team is available to help you every day with your curriculum-based questions.  We think you’ll find this resource very helpful as a supplement to tutor support, TA office hours, and class time.  If you’re unsure how to utilize that resource please speak to your TAs, Instructor, or Success Manager (SSM / PSM). </span>
     <br/> <br/>
    Sincerely,
    <br/>
    Robert Boespflug

    `
}

module.exports.email_body = email_body
