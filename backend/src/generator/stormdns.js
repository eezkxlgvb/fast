const crypto = require('../core/crypto');
const { v4: uuidv4 } = require('uuid');

class StormDNSGenerator {
    static generate(configData) {
        const {
            server,
            port = 2053,
            uuid = uuidv4(),
            path = '/',
            flow = 'xtls-rprx-vision',
            encryption = 'none'
        } = configData;

        const config = {
            name: configData.name || 'StormDNS Config',
            type: 'stormdns',
            server,
            port,
            uuid,
            path,
            flow,
            encryption,
            security: 'tls'
        };

        const params = new URLSearchParams({
            security: 'tls',
            sni: server,
            fp: 'chrome',
            type: 'tcp',
            flow: flow,
            enc: encryption
        });

        const link = `vless://${uuid}@${server}:${port}?${params.toString()}#${encodeURIComponent(configData.name || 'StormDNS')}`;
        const base64Link = Buffer.from(link).toString('base64');

        return {
            config,
            link,
            base64Link,
            json: JSON.stringify(config, null, 2)
        };
    }
}

module.exports = StormDNSGenerator;
