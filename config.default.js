const request = require('request');
const lookupcache = {};

module.exports = {
    // SSH port
    port : 22,
    
    // Output file
    outputfile : './honey.txt',

    // Private key file
    privatekey : './key',

    // Slack webhook
    slackwebhook : undefined,

    // Slack message format
    slackformatter : sshcli => `*SSH honeypot*\n> Username : *${sshcli.username}*\n> Password : *${sshcli.password}*\n> IP : *${sshcli.ip}*\n> Location : *${sshcli.location}*\n\n*Command executed*\n\`\`\` ${sshcli.command || "No command was sent."} \`\`\``,

    // IP reverse lookup procedure
    iplookup : (ip, sendback) => {
        // Only supports v4 for now, terrible string split for now
        const v4ip = ip.split(':').pop();

        lookupcache[v4ip] ? sendback(lookupcache[v4ip]) : request('https://tools.keycdn.com/geo.json?host=' + v4ip, { json : true }, (err, r, json) => {
            const country = json && json.data && json.data.geo && json.data.geo.country_name;

            lookupcache[v4ip] = country;
            sendback(err, country);
        });
    },

    // Custom responses
    responses : [
        {
            "strategy" : "includes",
            "command" : `cat /proc/cpuinfo | grep name | wc -l`,
            "response" : "32"
        },
        {
            "strategy" : "includes",
            "command" : `/etc/passwd`,
            "response" : "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin"
        }
    ]
};
