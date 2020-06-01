const weather = require('../../services/weather.js');
const util = require('../../util/util.js');

module.exports = {
    fulfillment: async function (agent) {
        let textResponse = '';
        let departureCity, arrivalCity, duration, departureTime, durationInMin, arrivalDateTime, depWeatherResponse, arrWeatherResponse;

        departureCity = agent.parameters.departureCity;
        arrivalCity = agent.parameters.arrivalCity;
        duration = agent.parameters.duration;
        departureTime = util.get30minFromNow();
    
        if(duration.unit == 'h')		
            durationInMin = duration.amount * 60;
        if(duration.unit == 'min')		
            durationInMin = duration.amount;
        if(duration.unit == 's')		
            durationInMin = duration.amount / 60;

        arrivalDateTime = util.addDurationToDate(departureTime.dateTime, durationInMin);

        depWeatherResponse = await weather.getWeatherByCityAndTime(departureCity, departureTime.dateTime);
        arrWeatherResponse = await weather.getWeatherByCityAndTime(arrivalCity, arrivalDateTime.dateTime);
        if(depWeatherResponse.status == 'SUCCESS' && arrWeatherResponse.status == 'SUCCESS') {
            textResponse = "Here is the weather for your flight: \n\nDeparture city: " + departureCity + 
                util.formatWeatherResponse(depWeatherResponse.temperature, depWeatherResponse.main, depWeatherResponse.windSpeed) +
                "  \n\nArrival city: " + arrivalCity + 
                util.formatWeatherResponse(arrWeatherResponse.temperature,arrWeatherResponse.main,arrWeatherResponse.windSpeed);

                agent.add(textResponse);
        } else {
            textResponse = 'Sorry, I was unable to get the weather data due to server issues. Please try again later';
            agent.add(textResponse);
        }	
    }
}
