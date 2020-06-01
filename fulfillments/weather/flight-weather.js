const weather = require('../../services/weather.js');
const util = require('../../util/util.js');

module.exports = {
    fulfillment: async function (agent) {
        let textResponse = '';
        let departureCity, arrivalCity, flightNumber, duration;
        departureCity = agent.parameters.departureCity;
		arrivalCity = agent.parameters.arrivalCity;
		flightNumber = agent.parameters.flightNumber;
        duration = agent.parameters.duration;

        if(flightNumber) {
            let flightWeather = await weather.getWeatherByFlightNumber(flightNumber);

            if(flightWeather.departureWeather) {
                if(flightWeather.departureWeather.status == 'SUCCESS' && flightWeather.arrivalWeather.status == 'SUCCESS') {
                    let depWeather = flightWeather.departureWeather, arrWeather = flightWeather.arrivalWeather;
            
                    textResponse = "Here is the weather for your flight " + flightNumber + 
                    ": \n\nDeparture city: " + depWeather.city + ", Departure time: " + depWeather.localTime + 
                    util.formatWeatherResponse(depWeather.temperature, depWeather.main, depWeather.windSpeed) +
                    "  \n\nArrival city: " + arrWeather.city + ", Arrival time: " + arrWeather.localTime +
                    util.formatWeatherResponse(arrWeather.temperature, arrWeather.main, arrWeather.windSpeed)
                } else {
                    let code = (flightWeather.departureWeather.code)?flightWeather.departureWeather.code:flightWeather.arrivalWeather.code;

                    if(code == 'ERR-FL-03') {
                        textResponse = 'Sorry, I could not find any flights scheduled for flight number ' + flightNumber + ' in the next 24 hours. You may want to check and try again';
                    } else {
                        textResponse = 'I did not seem to find a match to the flight number you entered. Please check and try again';
                    }
                }
            } else {
                let code = flightWeather.code;
                if(code == 'ERR-FL-03') {
                    textResponse = 'Sorry, I could not find any flights scheduled for flight number ' + flightNumber + ' in the next 24 hours. You may want to check and try again';
                } else {
                    textResponse = 'I did not seem to find a match to the flight number you entered. Please check and try again';
                }
            }
    
            agent.add(textResponse);
        } else { 
            agent.add(' ');
            agent.setFollowupEvent('flightCities-followup-event');
        }
    }
}
