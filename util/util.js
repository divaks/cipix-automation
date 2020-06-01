const moment = require('moment');
const moment_tz = require('moment-timezone');

/**
 * mps to Kmph.
 *
 * Convert meters per second to kilometers per hour.
 *
 * @param {number}   mps          mps value.
 * @return {number}               Corresponding Kmph value without decimals.
 */
function mpsToKmph(mps) {
    return Math.trunc(mps * 3.6);
}

/**
 * Find nearest date.
 *
 * Find date nearest to a given date from an array of dates.
 *
 * @param {string}   date          Date for which nearest date is to be determined in String format.
 * @param {Array}    dateArray      Array of dates from which nearest date value is to be determined.
 * @return {string}               Nearest date from the string array.
 */
function findNearestDateFromList(date, dateArray) {
    let dateDiffs = dateArray.map(n => Math.abs(new Date(n)-new Date(date)));
    let idx = dateDiffs.indexOf(Math.min.apply(null,dateDiffs));
    return dateArray[idx];
}

/**
 * Check if date-time is in future.
 *
 * Check if date-time is in future. 
 * If the date-time is upto 2 min in the past, it still returns true. This is a buffer to handle corner cases such as lags between the time user asks the question and the validation is applied.
 *
 * @param {string}   date          Date-time to be checked.
 * @return {boolean}               Returns true if the date is in future or upto 2 min in the past. Else returns false.
 */
function isDateInFuture(date) {
    return (new Date().getTime() - 120000) <= new Date(date).getTime();
}

/**
 * Check if date-time is in the next 5 days.
 *
 * Check if date-time is before next 5 days. 
 * If the date-time is upto 2 min in the past, it still returns true. This is a buffer to handle corner cases such as lags between the time user asks the question and the validation is applied.
 * Past dates are not checked.
 *
 * @param {string}   date          Date-time to be checked.
 * @return {boolean}               Returns true if the date is before 5 days from now. Else returns false. Also returns true if it's upto 2 min in the past.
 */
function isDateInRange(date) {
    let last = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    return new Date(date).getTime() <= last.getTime();
}

/**
 * Format date.
 *
 * Formats given date for displaying to the end user. 
 *
 * @param {string}   dt          Date-time to be formatted.
 * @return {Object}  
 * @return {string} return.date date in the format YYYY-MM-DD 
 * @return {string} return.time time in the format HH:MM
 * @return {string} return.dateTime  date-time in the format YYYY-MM-DD HH:MM */
function formatDateForDisplay(dt) {
    let dateTime = '', date = '', time = '';
    dateTime = moment(dt).format('YYYY-MM-DD HH:mm');
    date = moment(dt).format('YYYY-MM-DD');
    time = moment(dt).format('HH:mm');
    return { dateTime, date, time };
}

/**
 * Get date time 30 min from now.
 *
 * Get date time value for 30 min from current time.
 *
 * @return {Object} Date-time for time 30 min from current time 
 * @return {string} return.date date in the format YYYY-MM-DD 
 * @return {string} return.time time in the format HH:MM
 * @return {string} return.dateTime  date-time in the format YYYY-MM-DD HH:MM */
function get30minFromNow() {
    let newDate = moment(new Date()).add(30, 'm').toDate();
    return formatDateForDisplay(newDate);
}

/**
 * Add duration to time.
 *
 * Add duration in minutes to a given date time.
 *
 * @return {Object} Date-time after adding duratin to the specified date-time
 * @return {string} return.date date in the format YYYY-MM-DD 
 * @return {string} return.time time in the format HH:MM
 * @return {string} return.dateTime  date-time in the format YYYY-MM-DD HH:MM */
function addDurationToDate(dt, duration) {
    let newDate = moment(new Date(dt)).add(duration, 'm').toDate();
    return formatDateForDisplay(newDate);
}

/**
 * Split flight number.
 *
 * Split flight number into carrier and number part.
 * 'LH123' is split into 'LH' and '123'
 *
 * @param {string}   flightId          Flight number in the format 'LH123'.
 * @return {Object} 
 * @return {string} return.carrier (LH)
 * @return {number} return.flightNumber (123)*/
function splitFlightId(flightId) {
    carrier = flightId.match(/[0-9]*[A-za-z]+/).join(); 
    flightNumber = flightId.match(/\d+$/).join(); 
    return({carrier, flightNumber});
}

/**
 * Get today's and tomorrow's date.
 *
 * Get today's and tomorrow's date in the format required by the flight API
 *
 * @return {Object} 
 * @return {string} today's date in the format YYYY/MM/DD
 * @return {string} tomorrow's date in the format YYYY/MM/DD */
function get2DaysForFlight(){
    let today = moment();
    let tomorrow = moment(today).add(1, 'days').toDate();
    today = moment(today).format('YYYY/MM/DD');
    tomorrow = moment(tomorrow).format('YYYY/MM/DD');
    return {today, tomorrow}
  }

/**
 * Format weather info.
 *
 * Format weather for final user output.
 *
 * @param {number}   temp          Temperature.
 * @param {string}   main          Main weather - Clouds, Haze, etc.
 * @param {number}   wind          Wind in kmph.
 * @return {string} Final weather response string */
 function formatWeatherResponse(temp, main, wind) {
    return '\n  Temperature: ' + temp + '°C,\n  Main: ' + main + ',\n  Wind: ' + wind + 'km/h';
}

/**
 * Get formatted local time.
 *
 * Get formatted local time from ISO time and timezone.
 *
 * @param {string}   dateTime          Date time to be formatted.
 * @param {string}   timezone          Timezone string.
 * @return {string} Formatted string in local time */
function getFormattedLocalTime(dateTime, timezone) {
    let time;
    time = moment_tz(dateTime);
    return time.tz(timezone).format('YYYY-MM-DD HH:mm z');
}

exports.mpsToKmph = mpsToKmph;
exports.findNearestDateFromList = findNearestDateFromList;
exports.isDateInFuture = isDateInFuture;
exports.isDateInRange = isDateInRange;
exports.formatDateForDisplay = formatDateForDisplay;
exports.get30minFromNow = get30minFromNow;
exports.addDurationToDate = addDurationToDate;
exports.splitFlightId = splitFlightId;
exports.get2DaysForFlight = get2DaysForFlight;
exports.formatWeatherResponse = formatWeatherResponse;
exports.getFormattedLocalTime = getFormattedLocalTime;
