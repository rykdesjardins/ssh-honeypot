class SSHClient {
    constructor(ip) {
        this.ip = ip;
    }

    setUser(username, password) {
        this.username = username;
        this.password = password;
    }

    setCommand(command) {
        this.command = command;
    }

    setLocation(loc) {
        this.location = loc;
    }

    getResponsePredicate(strategy) {
        switch (strategy) {
            case "includes": return (a, b) => a.includes(b);
            case "matches":  return (a, b) => a == b
            case "regexp":   return (a, b) => new RegExp(b).exec(a);

            default: return () => false;
        }
    }

    handleResponse(handlers) {
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];

            const predicate = this.getResponsePredicate(handler.strategy);
            if (predicate(this.command, handler.command)) {
                return handler.response + "\n";
            }
        }

        return "\n"
    }

    toString() {
        return `${this.username} | ${this.password} | ${this.ip} | ${this.location}`;
    }
}

module.exports = { SSHClient }
