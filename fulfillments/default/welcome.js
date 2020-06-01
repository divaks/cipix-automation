/**
 * Fulfillment for Intent: Default Welcome Intent (First-welcome)
 */
const {WebhookClient, Card, Suggestion} = require('dialogflow-fulfillment');

module.exports = {
    fulfillment: function (agent) {
        agent.add(
`I'm Ciphy, your flight weather bot.
You can ask me questions like:
  'Get me weather for flight LH1234'
  'I have a flight to Brussels. Can you tell me the source and destination weather?'
I can also provide you weather for a given time in the next 5 days for questions such as:
  'Tell me current weather'
  'Weather for Amsterdam at 10am tomorrow'

You may begin by choosing one of these options.`
        );
        agent.add(new Suggestion('Weather for flight'));
        agent.add(new Suggestion('What is the current weather?'));
    }
};