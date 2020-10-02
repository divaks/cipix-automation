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
