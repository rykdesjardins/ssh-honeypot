const { Server } = require('ssh2');
const { SSHClient } = require('./sshclient');
const request = require('request');
const fs = require('fs');
const pathlib = require('path');

class SSHServer {
    constructor({ privatekey, responses, iplookup, outputfile, slackwebhook, slackformatter }) {
        this.ssh = new Server({ hostKeys : [fs.readFileSync(pathlib.join(HONEYPOT_ROOT, privatekey))] }, this.onConnect.bind(this));
        this.responseHandlers = responses;
        this.iplocator = iplookup;
        this.output = pathlib.join(HONEYPOT_ROOT, outputfile);
        this.slackwebhook = slackwebhook;
        this.slackformatter = slackformatter;
    }

    onConnect(client, info) {
        const sshcli = new SSHClient(info.ip);
        client.on('authentication', ctx => {
            sshcli.setUser(ctx.username, ctx.password);
            ctx.accept();
        });

        client.on('session', (accept, reject) => {
            accept().on('exec', (accept, reject, info) => {
                const stream = accept();

                sshcli.setCommand(info.command);
                const response = sshcli.handleResponse(this.responseHandlers);
                stream.write(response);
                stream.exit(0);
                stream.end();

                this.finishUp(sshcli);
            }); 
        });
    }

    finishUp(sshcli) {
        this.iplocator(sshcli.ip, loc => {
            sshcli.setLocation(loc);
            fs.appendFile(this.output, sshcli.toString(), { flags : 'a+' }, err => {
                this.slackwebhook && request(this.slackwebhook, {
                    json : true,
                    method : 'POST', 
                    body : {
                        text : this.slackformatter(sshcli)
                    }
                }, () => { /* noop */ });

                console.log(sshcli.toString());
                console.log(sshcli.command);
            });
        });
    }

    listen(port) {
        this.ssh.listen(port);
    }
}

module.exports = { SSHServer };
