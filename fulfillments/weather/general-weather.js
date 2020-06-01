const weather = require('../../services/weather.js');
const util = require('../../util/util.js');
const {WebhookClient, Card, Suggestion} = require('dialogflow-fulfillment');

const IMAGE_LIST = {
    'Clear': 'https://i.ibb.co/JtgHGsz/sun.png',
    'Clouds': 'https://i.ibb.co/RY21Z2N/clouds.png',
    'Rain': 'https://i.ibb.co/FzWfrcX/rain.png',
    'Snow': 'https://i.ibb.co/BcH9Ktt/snow.png'
}

module.exports = {
    fulfillment: async function (agent) {
        let dateTime, city, textResponse = '';
		dateTime = agent.parameters.dateTime.date_time || agent.parameters.dateTime;
        city = agent.parameters.city;
        
		if(dateTime) {
			let weatherResponse = await weather.getWeatherByCityAndTime(city, dateTime);
			if(weatherResponse.status == 'SUCCESS') {

				weatherImage = IMAGE_LIST[weatherResponse.main];

				textResponse = 'Weather at ' + city + ' on ' + util.formatDateForDisplay(dateTime).date + 
				' at ' + util.formatDateForDisplay(dateTime).time + 
				' is:' + util.formatWeatherResponse(weatherResponse.temperature, weatherResponse.main, weatherResponse.windSpeed);				
				if(weatherImage) {
                    agent.add(new Card({
                        title: util.formatWeatherResponse(weatherResponse.temperature, weatherResponse.main, weatherResponse.windSpeed),
                        imageUrl: weatherImage,
                        text: city + "," + util.formatDateForDisplay(dateTime).dateTime
                      })
                    );
				} else {
                    agent.add(textResponse);
				}						
			} else {
				if(weatherResponse.code == 'ERR-WT-CITYTIME-01') {
					textResponse = 'Looks like you have entered a date in the past. I can only get current or future weather forecast. Please try again';
				} else if(weatherResponse.code == 'ERR-WT-CITYTIME-02') {
					textResponse = 'I can only get you the weather upto 5 days in the future. Try again with a time within the next 5 days';
                }
                agent.add(textResponse);
			}
		} else {
			weatherResponse = await weather.getCurrentWeatherByCity(city);
			if(weatherResponse.status == 'SUCCESS') {

				weatherImage = IMAGE_LIST[weatherResponse.main];
				textResponse = 'Current weather at ' + city + ' is:' + 
				util.formatWeatherResponse(weatherResponse.temperature, weatherResponse.main, weatherResponse.windSpeed);

				if(weatherImage) {
                    agent.add('Current weather for ' + city + ':');
                    agent.add(new Card({
                        title: util.formatWeatherResponse(weatherResponse.temperature, weatherResponse.main, weatherResponse.windSpeed),
                        imageUrl: weatherImage,
                        text: city
                      })
                    );                    
					
		        } else {
                    agent.add(textResponse);
				}
			} else {
				if(weatherResponse.code == 'ERR-WT-CITY-01')
                    textResponse = 'Sorry, I was unable to get the current weather due to server issues. Please try again later';
				else
                    textResponse = 'Sorry, I was unable to get the current weather due to server issues. Please try again later';

                    agent.add(textResponse);
			}
		}
    }
}
