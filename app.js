const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const {WebhookClient} = require('dialogflow-fulfillment');
const f_welcome = require('./fulfillments/default/welcome');
const f_fallback = require('./fulfillments/default/fallback');
const f_general_weather = require('./fulfillments/weather/general-weather');
const f_flight_followup_cities = require('./fulfillments/weather/flight-followup-cities');
const f_help = require('./fulfillments/general/help');
const f_flight_weather_main = require('./fulfillments/weather/flight-weather-main');

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
		intentMap.set('Flight-followup-cities', f_flight_followup_cities.fulfillment);
		
		agent.handleRequest(intentMap)
	} else {
		let output = await f_flight_weather_main.fulfillment(req.body.queryResult.parameters);
		res.send(output);
	}	
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server running at ' + port);
});