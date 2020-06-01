const request = require('request');
const dotenv = require('dotenv').config();
const util = require('../util/util.js');
const location = require('./location.js');
const flight = require('./flight.js');

var weatherAPIOptions = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
}

/**
 * Get weather by city.
 *
 * Gets current weather for a given city by calling Weather API.
 *
 * @param {string}   city      Name of the city.
 * @return {Object} Weather info. 
 *  Format: {status: 'SUCCESS', temperature, main, windSpeed}
 * @return {Object} Error info. 
 *  Format: {status: 'ERROR', code, message}
 * */
function getCurrentWeatherByCity(city) {
    let weatherResponse = '';
    let promise = new Promise(function(resolve, reject) {
        weatherAPIOptions.uri =  process.env.WEATHER_URL + process.env.WEATHER_BY_CITY_PREFIX + city + process.env.WEATHER_SUFFIX;    

        request(weatherAPIOptions, function (error, response, body) {
            if(error) {
                weatherResponse = {status:'ERROR', code:'ERR-WT-CITY-01', message: 'Error from Weather API'};
            } else {
                let weatherInfo = JSON.parse(body, null, 3);
                let temperature = '', main = '', windSpeed = '';
        
                temperature = Math.trunc(weatherInfo.main.temp);
                main = weatherInfo.weather[0].main;
                windSpeed = util.mpsToKmph(weatherInfo.wind.speed);
        
                weatherResponse = {status:'SUCCESS', temperature, main, windSpeed};

                resolve(weatherResponse);
            }
        });
    });
    return promise;
}

/**
 * Get weather by city and time.
 *
 * Gets weather for a given city for a specified time by calling Weather API. The API gets weather on a 3-hourly basis.
 *
 * @param {string}   city             Name of the city.
 * @param {string}   dateTime         Date and time.
 * @return {Object} Weather info. 
 *  Format: {status: 'SUCCESS', temperature, main, windSpeed}
 * @return {Object} Error info. 
 *  Format: {status: 'ERROR', code, message} */
function getApproxWeatherByCityAndTime(city, dateTime) {
    let weatherResponse = '';
    let promise = new Promise(function(resolve, reject) {
        weatherAPIOptions.uri =  process.env.WEATHER_URL + process.env.WEATHER_BY_CITYTIME_PREFIX + city + process.env.WEATHER_SUFFIX;   

            request(weatherAPIOptions, function (error, response, body) {
                if(error) {
                    weatherResponse = {status:'ERROR', code:'ERR-WT-CITYTIME-03', message: 'Error from Weather API'};
                } else {
                    let weatherInfo = JSON.parse(body, null, 3);
                    let temperature = '', main = '', windSpeed = '', weatherList = null, dateList = null, nearestDate = null;
            
                    weatherList = weatherInfo.list;
                    dateList = weatherList.map(a => a.dt_txt);
                    nearestDate = util.findNearestDateFromList(dateTime, dateList);

                    let obj = weatherList.find(o => o.dt_txt == nearestDate);
                    temperature = Math.trunc(obj.main.temp);
                    main = obj.weather[0].main;
                    windSpeed = util.mpsToKmph(obj.wind.speed);
            
                    weatherResponse = {status:'SUCCESS', temperature, main, windSpeed};

                    resolve(weatherResponse);
                }
            });
    });
    return promise;
}

/**
 * Get weather by city and time.
 *
 * Gets weather for a given city for a specified time by calling Weather API. The API gets weather on a hourly basis.
 * First get coordinates for the city by calling Google API, and then get hourly weather.
 *
 * @param {string}   city            Name of the city.
 * @param {string}   dateTime        Date and time.
 * @return {Object} Weather info. 
 *  Format: {status: 'SUCCESS', temperature, main, windSpeed}
 * @return {Object} Error info. 
 *  Format: {status: 'ERROR', code, message}*/
function getHourlyWeatherByCityAndTime(city, dateTime) {
    let weatherResponse = '', coordinates = '', hList = '';
    let promise = new Promise(async function(resolve, reject) {
        coordinates = await location.getCoordinates(city);

        weatherAPIOptions.uri =  process.env.WEATHER_URL + process.env.WEATHER_HOURLY_PREFIX + coordinates.latitude + process.env.WEATHER_HOURLY2 + 
                    coordinates.longitude + process.env.WEATHER_HOURLY3 + process.env.WEATHER_SUFFIX;

            request(weatherAPIOptions, function (error, response, body) {
                if(error) {
                    weatherResponse = {status:'ERROR', code:'ERR-WT-CITYTIME-03', message: 'Error from Weather API'};
                } else {
                    let weatherInfo = JSON.parse(body, null, 3);
                    let temperature = '', main = '', windSpeed = '', weatherList = null, dateList = null, nearestDate = null;
            
                    hList = weatherInfo.hourly;
                    dateList = hList.map(a => a.dt);   
                    dateListMillis = dateList.map((e => e*1000));                    
                    nearestDate = util.findNearestDateFromList(dateTime, dateListMillis);
                    let obj = hList.find(o => o.dt == nearestDate/1000);
                    temperature = Math.trunc(obj.temp);
                    main = obj.weather[0].main;
                    windSpeed = util.mpsToKmph(obj.wind_speed);

                    weatherResponse = {status:'SUCCESS', temperature, main, windSpeed};

                    resolve(weatherResponse);
                }
                
            });
        
    });
    return promise;
}

/**
 * Get weather by city and time.
 *
 * Gets weather for a given city for a specified time by calling Weather API. The API gets weather on a hourly basis.
 * This function uses Google API to get latitude and longitude which is expected by the weather API.
 * In case Google API fails to get coordinates of a city, getApproxWeatherByCityAndTime is called for 3-hourly weather.
 *
 * @param {string}   city            Name of the city.
 * @param {string}   dateTime        Date and time.
 * @return {Object} Weather info. 
 *  Format: {status: 'SUCCESS', temperature, main, windSpeed}
 * @return {Object} Error info. 
 *  Format: {status: 'ERROR', code, message}*/
function getWeatherByCityAndTime(city, dateTime) {
    let weatherResponse = '';
    let promise = new Promise(async function(resolve, reject) {

        if(!util.isDateInFuture(dateTime)) {
            weatherResponse = {status:'ERROR', code:'ERR-WT-CITYTIME-01', message: 'Date is in the past'};
            resolve(weatherResponse);
        } else if(!util.isDateInRange(dateTime)) {
            weatherResponse = {status:'ERROR', code:'ERR-WT-CITYTIME-02', message: 'Date is not in range'};
            resolve(weatherResponse);
        } else {
            try {
                weatherResponse = await getHourlyWeatherByCityAndTime(city, dateTime);
                resolve(weatherResponse);
            } catch(err) {
                weatherResponse = await getApproxWeatherByCityAndTime(city, dateTime);
                resolve(weatherResponse);
            }
        }
    });
    return promise;
}

/**
 * Get weather by flight number.
 *
 * Gets weather for source and destination at departure time and arrival time by flight number.
 * Invokes Flight API to retrieve source/destination cities, time and timezones.
 * Then calls weather methods to get weather for each city at the respective time.
 *
 * @param {string}   flightNumber              Flight number in the format 'LH123'
 * @return {Object} Weather info. 
 * Contains 2 objects - departureWeather, arrivalWeather
 * Each object is of format: {status: 'SUCCESS', temperature, main, windSpeed, city, time, timeZone}
 * @return {Object} Error info. 
 * Object format: {status: 'ERROR', code, message ...}*/
function getWeatherByFlightNumber(flightNumber) {
    let weatherResponse = '';
    let promise = new Promise(async function(resolve, reject) {
        let flightResponse = await flight.getFlightInfo(flightNumber);
        if(flightResponse.status == 'SUCCESS') {
            let departureLocalTime, arrivalLocalTime, flightInfo;
            let departureCity, departureTime, arrivalCity, arrivalTime, departureWeather, arrivalWeather;
            flightInfo = flightResponse.flightInfo;
            departureCity = flightInfo.departure.city;
            departureTime = flightInfo.departure.time;
            arrivalCity = flightInfo.arrival.city;
            arrivalTime = flightInfo.arrival.time;
            departureWeather = await getWeatherByCityAndTime(departureCity, departureTime);
            arrivalWeather = await getWeatherByCityAndTime(arrivalCity, arrivalTime);

            departureLocalTime = util.getFormattedLocalTime(departureTime, flightInfo.departure.timeZone);
            arrivalLocalTime = util.getFormattedLocalTime(arrivalTime, flightInfo.arrival.timeZone);

            departureWeather = Object.assign(departureWeather, flightInfo.departure);
            arrivalWeather = Object.assign(arrivalWeather, flightInfo.arrival);
            departureWeather['localTime'] = departureLocalTime;
            arrivalWeather['localTime'] = arrivalLocalTime;
            weatherResponse = {departureWeather, arrivalWeather};
            resolve(weatherResponse);
        } else {
            resolve(flightResponse);
        }
    });
    return promise;
}

exports.getCurrentWeatherByCity = getCurrentWeatherByCity;
exports.getWeatherByCityAndTime = getWeatherByCityAndTime;
exports.getWeatherByFlightNumber = getWeatherByFlightNumber;