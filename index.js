global.HONEYPOT_ROOT = __dirname;
const { HoneyPot } = require('./lib/honeypot');
let config = {};

try {
    config = require('./config.js');
} catch (err) {}

const honeypot = new HoneyPot(config);
honeypot.start();
