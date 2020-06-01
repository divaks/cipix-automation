const request = require('request-promise');
const dotenv = require('dotenv').config();
const moment_tz = require('moment-timezone');
const util = require('../util/util.js');

/**
 * Get flight info by flight number
 *
 * Gets departure and arrival info from flight number, by calling flight API
 *
 * @param {string}   flightId       Flight number in the format 'LH123'
 * @return {Object}                 Departure and arrival info
 *      Format: {status: 'SUCCESS', flightInfo: {departure: {city, time, timeZone}, arrival: {city, time, timeZone}}}
 * @return {Object}                 Error info when there is an error
 *       Format: {status: 'ERROR', code, message} */
 function getFlightInfo(flightId) {
    let flightNumberSplit = util.splitFlightId(flightId);

    let flightAPIOptionsToday = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    let flightAPIOptionsTomorrow = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    flightAPIOptionsToday.uri = process.env.FLIGHTSTATS_URL + flightNumberSplit.carrier + '/' + 
            flightNumberSplit.flightNumber + process.env.FLIGHTSTATS_2 + util.get2DaysForFlight().today + process.env.FLIGHTSTATS_SUFFIX;
    flightAPIOptionsTomorrow.uri = process.env.FLIGHTSTATS_URL + flightNumberSplit.carrier + '/' + 
            flightNumberSplit.flightNumber + process.env.FLIGHTSTATS_2 + util.get2DaysForFlight().tomorrow + process.env.FLIGHTSTATS_SUFFIX;

    let flightResponse = {}, finalResponse = {}, flightResponse1, flightResponse2;          
    return new Promise(async function(resolve, reject) {
        flightResponse1 = await request(flightAPIOptionsToday);
        flightResponse1 = JSON.parse(flightResponse1);

        let isDepTimeTodayInFuture = true;
        //Sometimes the flight API gets flights from past. Below is to handle it.
        if(flightResponse1.scheduledFlights && flightResponse1.scheduledFlights.length != 0) {
            let depTimeToday = flightResponse1.scheduledFlights[0].departureTime;
            let depAirportCodeToday = flightResponse1.scheduledFlights[0].departureAirportFsCode;
            let depAirportToday = flightResponse1.appendix.airports.filter(x => x.fs == depAirportCodeToday);
            departureTimeZone = depAirportToday[0].timeZoneRegionName;
            depTimeToday = moment_tz.tz(depTimeToday, departureTimeZone).toDate();
            isDepTimeTodayInFuture = util.isDateInFuture(depTimeToday);
        }

        if(!flightResponse1.scheduledFlights) {
            finalResponse = {status:'ERROR', code:'ERR-FL-01', message: 'Wrong flight info'};
            resolve(finalResponse);
        }  else if(flightResponse1.scheduledFlights.length == 0 || !isDepTimeTodayInFuture) {
          flightResponse2 = await request(flightAPIOptionsTomorrow);
          flightResponse2 = JSON.parse(flightResponse2);

          if(!flightResponse2.scheduledFlights) {
            finalResponse = {status:'ERROR', code:'ERR-FL-02', message: 'Wrong flight info'};
            resolve(finalResponse);
          } else if(flightResponse2.scheduledFlights.length == 0) {
            finalResponse = {status:'ERROR', code:'ERR-FL-03', message: 'No flights scheduled today or tomorrow for this flight number'};
            resolve(finalResponse);
          } else {
            flightResponse = flightResponse2;
          }
        } else {
          flightResponse = flightResponse1;
        }

        if(flightResponse && flightResponse.scheduledFlights && flightResponse.scheduledFlights.length != 0) {
            let departureCity, arrivalCity, departureTime, arrivalTime, departureUTCOffset, arrivalUTCOffset, departureTimeZone, arrivalTimeZone;
            let depAirportCode = flightResponse.scheduledFlights[0].departureAirportFsCode;
            let arrAirportCode = flightResponse.scheduledFlights[0].arrivalAirportFsCode;
            let depAirport = flightResponse.appendix.airports.filter(x => x.fs == depAirportCode);
            let arrAirport = flightResponse.appendix.airports.filter(x => x.fs == arrAirportCode);

            departureCity = depAirport[0].city;
            arrivalCity = arrAirport[0].city;
            departureTime = flightResponse.scheduledFlights[0].departureTime;
            arrivalTime = flightResponse.scheduledFlights[0].arrivalTime;
            departureTimeZone = depAirport[0].timeZoneRegionName;
            arrivalTimeZone = arrAirport[0].timeZoneRegionName;

            departureTime = moment_tz.tz(departureTime, departureTimeZone).toDate();
            arrivalTime = moment_tz.tz(arrivalTime, arrivalTimeZone).toDate();

            finalResponse = {
                status:'SUCCESS', 
                flightInfo:{
                    departure: {
                        city: departureCity,
                        time: departureTime,
                        timeZone: departureTimeZone
                    },
                    arrival: {
                        city: arrivalCity,
                        time: arrivalTime,
                        timeZone: arrivalTimeZone
                    }
                }
            };
            resolve(finalResponse);
        }
    });
}

exports.getFlightInfo = getFlightInfo;