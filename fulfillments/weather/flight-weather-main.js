const weather = require('../../services/weather.js');
const util = require('../../util/util.js');

/**
 * Fulfillment for Intent: Flight-weather
 *
 * If flight number is found, gets departure and arrival info by flight number using Flight API, and gets weather info for both cities.
 * If flight number is not found and/or one of these is found - departure city, arrival city, duration, calls event for followup event
 *
 * @param {Object}   parameters      Entity parameters from Dialogflow
 * @return {Object} Fulfillment output to Dialogflow  */
function fulfillment(parameters) {

    let promise = new Promise(async function(resolve, reject) {    
        let finalResponse, output;
        let departureCity = parameters.departureCity;
        let arrivalCity = parameters.arrivalCity;
        let flightNumber = parameters.flightNumber;
        let duration = parameters.duration;

        if(flightNumber) {
            let flightWeather = await weather.getWeatherByFlightNumber(flightNumber);

            if(flightWeather.departureWeather) {
                if(flightWeather.departureWeather.status == 'SUCCESS' && flightWeather.arrivalWeather.status == 'SUCCESS') {
                    let depWeather = flightWeather.departureWeather, arrWeather = flightWeather.arrivalWeather;
            
                    finalResponse = "Here is the weather for your flight " + flightNumber + 
                    ": \n\nDeparture city: " + depWeather.city + ", Departure time: " + depWeather.localTime + 
                    util.formatWeatherResponse(depWeather.temperature, depWeather.main, depWeather.windSpeed) +
                    "  \n\nArrival city: " + arrWeather.city + ", Arrival time: " + arrWeather.localTime +
                    util.formatWeatherResponse(arrWeather.temperature, arrWeather.main, arrWeather.windSpeed)
                } else {
                    let code = (flightWeather.departureWeather.code)?flightWeather.departureWeather.code:flightWeather.arrivalWeather.code;

                    if(code == 'ERR-FL-03') {
                        finalResponse = 'Sorry, I could not find any flights scheduled for flight number ' + flightNumber + ' in the next 24 hours. You may want to check and try again';
                    } else {
                        finalResponse = 'I did not seem to find a match to the flight number you entered. Please check and try again';
                    }
                }
            } else {
                let code = flightWeather.code;
                if(code == 'ERR-FL-03') {
                    finalResponse = 'Sorry, I could not find any flights scheduled for flight number ' + flightNumber + ' in the next 24 hours. You may want to check and try again';
                } else {
                    finalResponse = 'I did not seem to find a match to the flight number you entered. Please check and try again';
                }
            }

            output = {
                "fulfillmentMessages": [
                        {
                            "text": {
                                "text": [
                                    finalResponse
                                ]
                            }
                        }
                    ],
                    "payload": {
                        "google": {
                            "expectUserResponse": true,
                            "richResponse": {
                                "items": [
                                    {
                                        "simpleResponse": {
                                        "textToSpeech": finalResponse,
                                        "ssml": finalResponse
                                        }
                                    }
                                ]
                            }
                        }
                    }
            }
        } else { 
            output = {
                "followupEventInput": {
                    "name": "flightCities-followup-event",
                    "languageCode": "en-US",
                    "parameters": {
                        duration,
                        departureCity,
                        arrivalCity
                    }
                }
            }			
        }
        resolve(output);
    });
    return promise;
}	

exports.fulfillment = fulfillment;
