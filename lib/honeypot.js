const pathlib = require('path');
const { SSHServer } = require('./server');
const defaultConfig = require(pathlib.join(HONEYPOT_ROOT, 'config.default.js'));

class HoneyPot {
    constructor(settings = {}) {
        this.settings = Object.assign({}, defaultConfig, settings);
        this.server = new SSHServer(this.settings);
    }

    start() {
        this.server.listen(this.settings.port);
    }
}

module.exports = { HoneyPot };
