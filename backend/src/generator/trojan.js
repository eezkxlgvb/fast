const crypto = require('../core/crypto');
const { v4: uuidv4 } = require('uuid');

class TrojanGenerator {
    static generate(configData) {
        const {
            server,
            port,
            password = crypto.generateKey(16),
            path = '/',
            sni = server
        } = configData;

        const config = {
            name: configData.name || 'Trojan Config',
            type: 'trojan',
            server,
            port,
            password,
            path,
            sni,
            security: 'tls'
        };

        const link = `trojan://${password}@${server}:${port}?sni=${sni}&path=${path}#${encodeURIComponent(configData.name || 'Trojan')}`;
        const base64Link = Buffer.from(link).toString('base64');

        return {
            config,
            link,
            base64Link,
            json: JSON.stringify(config, null, 2)
        };
    }
}

module.exports = TrojanGenerator;
