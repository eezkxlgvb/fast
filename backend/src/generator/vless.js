const crypto = require('../core/crypto');
const { v4: uuidv4 } = require('uuid');

class VLESSGenerator {
    static generate(configData) {
        const {
            server,
            port,
            uuid = uuidv4(),
            path = '/',
            flow = 'xtls-rprx-vision',
            encryption = 'none'
        } = configData;

        const config = {
            name: configData.name || 'VLESS Config',
            type: 'vless',
            server,
            port,
            uuid,
            path,
            flow,
            encryption,
            security: 'reality',
            sni: server,
            fingerprint: 'chrome'
        };

        // ساخت لینک
        const params = new URLSearchParams({
            security: 'reality',
            sni: server,
            fp: 'chrome',
            pbk: configData.realityPublicKey || '',
            sid: configData.realityShortId || '',
            type: 'tcp',
            flow: flow,
            enc: encryption
        });

        const link = `vless://${uuid}@${server}:${port}?${params.toString()}#${encodeURIComponent(configData.name || 'VLESS')}`;
        const base64Link = Buffer.from(link).toString('base64');

        return {
            config,
            link,
            base64Link,
            json: JSON.stringify(config, null, 2)
        };
    }
}

module.exports = VLESSGenerator;
