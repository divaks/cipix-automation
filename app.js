const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const weather = require('./services/weather.js');
const util = require('./util/util.js');
const {WebhookClient, Card, Suggestion} = require('dialogflow-fulfillment');
const f_welcome = require('./fulfillments/default/welcome');
const f_fallback = require('./fulfillments/default/fallback');
const f_general_weather = require('./fulfillments/weather/general-weather');
const f_flight_weather = require('./fulfillments/weather/flight-weather');
const f_flight_followup_cities = require('./fulfillments/weather/flight-followup-cities');
const f_help = require('./fulfillments/general/help');

app.use(bodyParser.json());

app.post('/', async function(req, res) {

	let intentName = req.body.queryResult.intent.displayName;
	if(intentName != 'Flight-weather') {	

	const agent = new WebhookClient({ request: req, response: res });
	let intentMap = new Map()

	intentMap.set('First-welcome', f_welcome.fulfillment);
	intentMap.set('Default Fallback Intent', f_fallback.fulfillment);
	intentMap.set('Help', f_help.fulfillment);

	intentMap.set('General-weather', f_general_weather.fulfillment);
	intentMap.set('Flight-weather', f_flight_weather.fulfillment);
	intentMap.set('Flight-followup-cities', f_flight_followup_cities.fulfillment);
  	
	agent.handleRequest(intentMap)
	} else if(intentName == 'Flight-weather') {
		let finalResponse;
		let departureCity = req.body.queryResult.parameters.departureCity;
		let arrivalCity = req.body.queryResult.parameters.arrivalCity;
		let flightNumber = req.body.queryResult.parameters.flightNumber;
		let duration = req.body.queryResult.parameters.duration;

		if(flightNumber) {
			let flightNumber = req.body.queryResult.parameters.flightNumber;

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
		res.send(output);

	}	
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server running at ' + port);
});