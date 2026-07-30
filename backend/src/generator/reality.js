const crypto = require('../core/crypto');
const { v4: uuidv4 } = require('uuid');

class RealityGenerator {
    static generate(configData) {
        const {
            server,
            port,
            uuid = uuidv4(),
            path = '/',
            flow = 'xtls-rprx-vision',
            encryption = 'none',
            publicKey = crypto.generateKey(32),
            shortId = crypto.generateKey(8),
            fingerprint = 'chrome'
        } = configData;

        const config = {
            name: configData.name || 'Reality Config',
            type: 'reality',
            server,
            port,
            uuid,
            path,
            flow,
            encryption,
            publicKey,
            shortId,
            fingerprint,
            security: 'reality'
        };

        // ساخت لینک
        const params = new URLSearchParams({
            security: 'reality',
            sni: server,
            fp: fingerprint,
            pbk: publicKey,
            sid: shortId,
            type: 'tcp',
            flow: flow,
            enc: encryption
        });

        const link = `vless://${uuid}@${server}:${port}?${params.toString()}#${encodeURIComponent(configData.name || 'Reality')}`;
        const base64Link = Buffer.from(link).toString('base64');

        return {
            config,
            link,
            base64Link,
            json: JSON.stringify(config, null, 2)
        };
    }
}

module.exports = RealityGenerator;
