/** */
function extractDate(time) {
    return new Promise((resolve, reject) => {
        let date = time.split("T")[0]
        date = date.split("-")
        date = date[1] + "/" + date[2]
        if (!date) reject("Err with date")
        resolve(date)
    })
}

/** */
function formatTime(time) {
    return new Promise((resolve, reject) => {
        time = formatDate(time)
        time = time.split("T")[1].split("-")[0]
        if (!time) reject("Err with time")
        resolve(time)
    })
}

//from https://stackoverflow.com/questions/4898574/converting-24-hour-time-to-12-hour-time-w-am-pm-using-javascript
function formatDate(date) {
    var d = new Date(date)
    var hh = d.getHours()
    var m = d.getMinutes()
    var s = d.getSeconds()
    var dd = "am"
    var h = hh
    if (h >= 12) {
        h = hh - 12
        dd = "pm"
    }
    if (h == 0) {
        h = 12
    }
    m = m < 10 ? "0" + m : m

    s = s < 10 ? "0" + s : s

    /* if you want 2 digit hours:
    h = h<10?"0"+h:h; */

    var pattern = new RegExp("0?" + hh + ":" + m + ":" + s)

    var replacement = h + ":" + m
    /* if you want to add seconds
    replacement += ":"+s;  */
    replacement += " " + dd

    return date.replace(pattern, replacement)
}

module.exports.formatDate = formatDate
module.exports.formatTime = formatTime
module.exports.getDate = extractDate
