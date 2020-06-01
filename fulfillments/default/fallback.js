/**
 * Intent: Default Fallback Intent
 * Fulfillment: default
 */

module.exports = {
    fulfillment: function (agent) {
        agent.add(
            `Sorry, I could not get you. Could you come again?`
        )
    }
}
