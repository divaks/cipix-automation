## Flight weather chatbot - Dialogflow
This application creates webhook for a dialogflow based virtual agent to fetch weather for flights.
There are 2 scenarios - 

**Flight weather** is when the user is interested in knowing weather information for a given flight for departure and arrival city. This can be either by simply providing flight number or by providing more discrete info such as departure city, arrival city and flight duration.

**General weather** is when the user needs weather information for a given city. This can be current weather or forecast for a given time for up to 5 days in the future. 


## Prerequisites

**1. Install Node.js**  
    The application is built using Node.js v14.0.0 and hence it is necessary to have Node.js installed on the machine.
    If you do not have Node.js, you may download and install from the official website - https://nodejs.org/en/download/

**2. Install nodemon:**  
    In case you don't have nodemon installed, run below command from any folder of your local machine. This will install nodemon globally.
    ```
    npm install -g nodemon
    ```
**3. Install ngrok:**  
    In case you don't have ngrok installed, 
    Download ngrok from https://ngrok.com/download

## Environment setup
You will need the environment variables in '.env' file in the root folder that must contain the following. You may start by making a copy of '.env.example' file into '.env':
```
# Weather API
WEATHER_APP_ID=                         #Weather API App ID
WEATHER_URL=http://api.openweathermap.org/data/2.5/
WEATHER_BY_CITY_PREFIX=weather?q=
WEATHER_BY_CITYTIME_PREFIX=forecast?q=
WEATHER_HOURLY_PREFIX=onecall?lat=
WEATHER_HOURLY2=&lon=
WEATHER_HOURLY3=&exclude=current,minutely,daily
WEATHER_SUFFIX=&units=metric&APPID=     #Weather API App ID

# Google API
GOOGLE_API_KEY=                         #Google API Key

# Flight API
FLIGHTSTATS_URL=https://api.flightstats.com/flex/schedules/rest/v1/json/flight/
FLIGHTSTATS_2=/departing/
FLIGHTSTATS_SUFFIX=?appId=0ff39606&appKey=      #Flight Stats API App key
FLIGHTSTATS_APP_ID=                             #Flight Stats API App ID
FLIGHTSTATS_APP_KEY=                            #Flight Stats API App key

# PORT
PORT=3000   #You can set port number here. Default port is 3000.
```

## Installation of dependent packages
```
npm install
```

## Running the project
```
npm start
```
'npm start' is aliased to 'nodemon app', which runs the application using nodemon.  
Access the local application using a browser:  
http://localhost:{PORT-NUMBER}/  
If you use the default port (3000):  
http://localhost:3000/  

## Using tunnel
```
npm start tunnel
```
This is aliased to 'ngrok http 3000'.
Running this command returns the public URL for the application, which needs to be configured in dialogflow webhook.
