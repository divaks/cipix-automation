const NodeGeocoder = require('node-geocoder');
const dotenv = require('dotenv').config();
const cityTimezones = require('city-timezones');

const geocoderOptions = {
  provider: 'google',
  apiKey: process.env.GOOGLE_API_KEY
};

/**
 * Gets timezone from city
 *
 * Gets timezone for a given city
 *
 * @param {string}   city       City name
 * @return {string}   Timezone in the format 'Europe/Moscow' */
function getTimeZone(city) {
  let cityLookup = cityTimezones.lookupViaCity(city);
  return cityLookup[0].timezone;
}

/**
 * Gets coordinates from address
 *
 * Gets latitude and longitude for a given city/address by invoking Google API
 *
 * @param {string}   address       Address/city
 * @return {object}   Coordinates for the city 
 * @return {number}  return.latitude  Latitude of the city 
 * @return {number}  return.longitude Longitude of the city
 * */
async function getCoordinates(address) {
    const geocoder = NodeGeocoder(geocoderOptions);
    const res = await geocoder.geocode(address);

    return { latitude: res[0].latitude, longitude: res[0].longitude }
}

exports.getTimeZone = getTimeZone;
exports.getCoordinates = getCoordinates;