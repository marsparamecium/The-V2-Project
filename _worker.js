//说明：在原版的基础上加入了totp和流浪地球史诗级背景，以及多状态跳转，有效防止家长没收手机造成的危害
let id = env.UUID || '00000000000000000';//这个请你通过环境变量注入

let pnum = atob('NDQz');
let paddrs = [
    atob('cHJveHlpcC5hbWNsdWJzLmNhbWR2ci5vcmc='),
    atob('cHJveHlpcC5hbWNsdWJzLmtvem93LmNvbQ==')
];
let paddr = paddrs[Math.floor(Math.random() * paddrs.length)];
let pDomain = [];
let p64 = true;
let p64DnUrl = atob('aHR0cHM6Ly8xLjEuMS4xL2Rucy1xdWVyeQ==');
let p64Prefix = atob('MjYwMjpmYzU5OmIwOjY0Ojo=');
let p64Domain = [];

let s5 = '';
let s5Enable = false;
let parsedS5 = {};

let durl = atob('aHR0cHM6Ly9za3kucmV0aGlua2Rucy5jb20vMTotUGZfX19fXzlfOEFfQU1BSWdFOGtNQUJWRERtS09IVEFLZz0=');
let fname = atob('5pa56IifOeWPt+ihjOaYn+WPkeWKqOacuuWOn+Wei+acug==');
const dataTypeTr = 'EBMbCxUX';
let enableLog = false;

let ytName = atob('bm8gcmVzdWx0');
let tgName = atob('bm8gcmVzdWx0');
let ghName = atob('bm8gcmVzdWx0');
let bName = atob('bm8gcmVzdWx0');
let pName = '5pa56IifOeWPt+ihjOaYn+WPkeWKqOacuuWOn+Wei+acug==';

import { connect } from 'cloudflare:sockets';

if (!isValidUserId(id)) {
    throw new Error('id is invalid');
}

export default {
    async fetch(request, env, ctx) {
        try {
            let { ID, PADDR, P64, P64PREFIX, S5, D_URL, ENABLE_LOG } = env;

            const kvCheckResponse = await check_kv(env);
            let kvData = {};
            if (!kvCheckResponse) {
                kvData = await get_kv(env) || {};
                log(`[fetch]--> kv_id = ${kvData.kv_id}, kv_pDomain = ${JSON.stringify(kvData.pDomain)}, kv_p64Domain = ${JSON.stringify(kvData.kv_p64Domain)}`);
            }

            const url = new URL(request.url);
            enableLog = url.searchParams.get('ENABLE_LOG') || ENABLE_LOG || enableLog;
            id = (kvData.kv_id || ID || id).toLowerCase();
            log(`[fetch]--> id = ${id}`);

            paddr = url.searchParams.get('PADDR') || PADDR || paddr;
            if (paddr) {
                const [ip, port] = paddr.split(':');
                paddr = ip;
                pnum = port || pnum;
            }
            pDomain = kvData.kv_pDomain || pDomain;
            log(`[fetch]--> pDomain = ${JSON.stringify(pDomain)}`);

            p64 = url.searchParams.get('P64') || P64 || p64;
            p64Prefix = url.searchParams.get('P64PREFIX') || P64PREFIX || p64Prefix;
            p64Domain = kvData.kv_p64Domain || p64Domain;
            log(`[fetch]--> p64Domain = ${JSON.stringify(p64Domain)}`);

            s5 = url.searchParams.get('S5') || S5 || s5;
            parsedS5 = await requestParserFromUrl(s5, url);
            if (parsedS5) {
                s5Enable = true;
            }

            durl = url.searchParams.get('D_URL') || D_URL || durl;
            let prType = url.searchParams.get(atob('UFJPVF9UWVBF'));
            if (prType) {
                prType = prType.toLowerCase();
            }

            if (request.headers.get('Upgrade') === 'websocket') {
                if (prType === xorDe(dataTypeTr, 'datatype')) {
                    return await websvcExecutorTr(request);
                }
                return await websvcExecutor(request);
            }
            switch (url.pathname.toLowerCase()) {
                case '/': {
                    return await login(request, env);
                }
                case `/${id}/get`: {
                    return get_kv(env);
                }
                case `/${id}/set`: {
                    return set_kv_data(request, env);
                }
                default: {
                    return Response.redirect(new URL('/', request.url));
                }
            }
        } catch (err) {
            console.error('Error processing request:', err);
            return new Response(`Error: ${err.message}`, { status: 500 });
        }
    },
};


/** ---------------------tools------------------------------ */
function log(...args) {
    if (enableLog) console.log(...args);
}

function error(...args) {
    if (enableLog) console.error(...args);
}

function isValidUserId(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

const byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 256).toString(16).slice(1));
}

function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

function stringify(arr, offset = 0) {
    const uuid = unsafeStringify(arr, offset);
    if (!isValidUserId(uuid)) {
        throw TypeError("Stringified ID is invalid");
    }
    return uuid;
}

function b64ToBuf(base64Str) {
    if (!base64Str) {
        return { earlyData: null, error: null };
    }
    try {
        base64Str = base64Str.replace(/-/g, '+').replace(/_/g, '/');
        const decode = atob(base64Str);
        const arryBuffer = Uint8Array.from(decode, (c) => c.charCodeAt(0));
        return { earlyData: arryBuffer.buffer, error: null };
    } catch (error) {
        return { earlyData: null, error };
    }
}

function decodeBase64Utf8(str) {
    const bytes = Uint8Array.from(atob(str), c => c.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
}

function requestParser(s5) {
    let [latter, former] = s5.split("@").reverse();
    let username, password, hostname, port;

    if (former) {
        const formers = former.split(":");
        if (formers.length !== 2) {
            throw new Error('Invalid S address format: authentication must be in the "username:password" format');
        }
        [username, password] = formers;
    }

    const latters = latter.split(":");
    port = Number(latters.pop());
    if (isNaN(port)) {
        throw new Error('Invalid S address format: port must be a number');
    }

    hostname = latters.join(":");
    const isIPv6 = hostname.includes(":") && !/^\[.*\]$/.test(hostname);
    if (isIPv6) {
        throw new Error('Invalid S address format: IPv6 addresses must be enclosed in brackets, e.g., [2001:db8::1]');
    }

    return { username, password, hostname, port };
}

async function requestParserFromUrl(s5, url) {
    if (/\/s5?=/.test(url.pathname)) {
        s5 = url.pathname.split('5=')[1];
    } else if (/\/socks[5]?:\/\//.test(url.pathname)) {
        s5 = url.pathname.split('://')[1].split('#')[0];
    }

    const authIdx = s5.indexOf('@');
    if (authIdx !== -1) {
        let userPassword = s5.substring(0, authIdx);
        const base64Regex = /^(?:[A-Z0-9+/]{4})*(?:[A-Z0-9+/]{2}==|[A-Z0-9+/]{3}=)?$/i;
        if (base64Regex.test(userPassword) && !userPassword.includes(':')) {
            userPassword = atob(userPassword);
        }
        s5 = `${userPassword}@${s5.substring(authIdx + 1)}`;
    }

    if (s5) {
        try {
            return requestParser(s5);
        } catch (err) {
            error(err.toString());
            return null;
        }
    }
    return null;
}

function xorEn(plain, key) {
    const encoder = new TextEncoder();
    const p = encoder.encode(plain);
    const k = encoder.encode(key);
    const out = new Uint8Array(p.length);
    for (let i = 0; i < p.length; i++) {
        out[i] = p[i] ^ k[i % k.length];
    }
    return btoa(String.fromCharCode(...out));
}

function xorDe(b64, key) {
    const data = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const k = encoder.encode(key);
    const out = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        out[i] = data[i] ^ k[i % k.length];
    }
    return decoder.decode(out);
}

async function getDomainToRouteX(addressRemote, portRemote, s5Enable, p64Flag = false) {
    let finalTargetHost = addressRemote;
    let finalTargetPort = portRemote;
    try {
        log(`[getDomainToRouteX]--> paddr=${paddr}, p64Prefix=${p64Prefix}, addressRemote=${addressRemote}, p64=${p64}`);
        log(`[getDomainToRouteX]--> pDomain=${JSON.stringify(pDomain)}, p64Domain=${JSON.stringify(p64Domain)}`);

        const safeMatch = (domains, target) => {
            try {
                return Array.isArray(domains) && domains.some(domain => matchesDomainPattern(target, domain));
            } catch (e) {
                log(`[error]--> matchesDomainPattern failed: ${e.message}`);
                return false;
            }
        };

        const resultDomain = safeMatch(pDomain, addressRemote);
        const result64Domain = safeMatch(p64Domain, addressRemote);
        log(`[getDomainToRouteX]--> match pDomain=${resultDomain}, match p64Domain=${result64Domain}, p64Flag=${p64Flag}`);

        if (s5Enable) {
            log(`[getDomainToRouteX]--> s5Enable=true, use remote directly`);
        } else if (resultDomain) {
            finalTargetHost = paddr;
            finalTargetPort = pnum || portRemote;
            log(`[getDomainToRouteX]--> Matched pDomain, use paddr=${finalTargetHost}, port=${finalTargetPort}`);
        } else if (result64Domain || (p64Flag && p64)) {
            try {
                finalTargetHost = await resolveDomainToRouteX(addressRemote);
                finalTargetPort = portRemote;
                log(`[getDomainToRouteX]--> Resolved p64Domain via resolveDomainToRouteX: ${finalTargetHost}`);
            } catch (err) {
                log(`[retry]--> resolveDomainToRouteX failed: ${err.message}`);
                finalTargetHost = paddr || addressRemote;
                finalTargetPort = pnum || portRemote;
            }
        } else if (p64Flag) {
            finalTargetHost = paddr || addressRemote;
            finalTargetPort = portRemote;
            log(`[getDomainToRouteX]--> fallback by p64Flag, host=${finalTargetHost}, port=${finalTargetPort}`);
        }

        log(`[getDomainToRouteX]--> Final target: ${finalTargetHost}:${finalTargetPort}`);
        return { finalTargetHost, finalTargetPort };
    } catch (err) {
        log(`[fatal]--> getDomainToRouteX failed: ${err.message}`);
        if (p64Flag) {
            finalTargetHost = paddr || addressRemote;
            finalTargetPort = portRemote;
            log(`[fatal-fallback]--> fallback by p64Flag, host=${finalTargetHost}, port=${finalTargetPort}`);
        }
        return { finalTargetHost, finalTargetPort };
    }
}

function matchesDomainPattern(hostname, pattern) {
    if (!hostname || !pattern) return false;

    hostname = hostname.toLowerCase();
    pattern = pattern.toLowerCase();
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^\[?([a-f0-9:]+)\]?$/i;
    if (ipv4Regex.test(hostname) || ipv6Regex.test(hostname)) {
        return false;
    }

    const hostParts = hostname.split('.');
    const patternParts = pattern.split('.');

    if (hostParts.length < patternParts.length) return false;

    for (let i = 1; i <= patternParts.length; i++) {
        if (hostParts[hostParts.length - i] !== patternParts[patternParts.length - i]) {
            return false;
        }
    }
    return true;
}

async function resolveDomainToRouteX(domain) {
    try {
        log(`[resolveDomainToRouteX] Starting domain resolution: ${domain}`);
        const response = await fetch(`${p64DnUrl}?name=${domain}&type=A`, {
            headers: {
                Accept: "application/dns-json",
            },
        });
        if (!response.ok) {
            throw new Error(`[resolveDomainToRouteX] request failed with status code: ${response.status}`);
        }

        const result = await response.json();
        log(`[resolveDomainToRouteX] Query result: ${JSON.stringify(result, null, 2)}`);
        const aRecord = result?.Answer?.find(record => record.type === 1 && record.data);
        if (!aRecord) {
            throw new Error("No valid A record found");
        }
        const ipv4 = aRecord.data;
        log(`[resolveDomainToRouteX] Found IPv4 address: ${ipv4}`);
        const ipv6 = convertToRouteX(ipv4);
        log(`[resolveDomainToRouteX] Converted IPv6 address: ${ipv6}`);
        return ipv6;
    } catch (err) {
        error(`[Error] Failed to get routeX address: ${err.message}`);
        throw new Error(`[resolveDomainToRouteX] resolution failed: ${err.message}`);
    }
}

function convertToRouteX(ipv4Address) {
    const parts = ipv4Address.trim().split('.');
    if (parts.length !== 4) {
        throw new Error('Invalid IPv4 address');
    }
    const hexParts = parts.map(part => {
        const num = Number(part);
        if (!/^\d+$/.test(part) || isNaN(num) || num < 0 || num > 255) {
            throw new Error(`Invalid IPv4 segment: ${part}`);
        }
        return num.toString(16).padStart(2, '0');
    });

    let withBrackets = true
    log(`[convertToRouteX] p64Prefix--->: ${p64Prefix}`);
    if (!p64Prefix || typeof p64Prefix !== 'string' || !p64Prefix.includes('::')) {
        throw new Error('[convertToRouteX] Invalid manual prefix; must be a valid IPv6 prefix');
    }
    const ipv6Tail = `${hexParts[0]}${hexParts[1]}:${hexParts[2]}${hexParts[3]}`.toLowerCase();
    const fullIPv6 = `${p64Prefix}${ipv6Tail}`;
    return withBrackets ? `[${fullIPv6}]` : fullIPv6;
}

function stringToArray(str) {
    if (!str) return [];
    return str
        .split(/[\n,]+/)
        .map(s => s.trim())
        .filter(Boolean);
}

(function () {
    'use strict';

    var ERROR = 'input is invalid type';
    var WINDOW = typeof window === 'object';
    var root = WINDOW ? window : {};
    if (root.JS_SHA256_NO_WINDOW) {
        WINDOW = false;
    }
    var WEB_WORKER = !WINDOW && typeof self === 'object';
    var NODE_JS = !root.JS_SHA256_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node;
    if (NODE_JS) {
        root = global;
    } else if (WEB_WORKER) {
        root = self;
    }
    var COMMON_JS = !root.JS_SHA256_NO_COMMON_JS && typeof module === 'object' && module.exports;
    var AMD = typeof define === 'function' && define.amd;
    var ARRAY_BUFFER = !root.JS_SHA256_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
    var HEX_CHARS = '0123456789abcdef'.split('');
    var EXTRA = [-2147483648, 8388608, 32768, 128];
    var SHIFT = [24, 16, 8, 0];
    var K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    var OUTPUT_TYPES = ['hex', 'array', 'digest', 'arrayBuffer'];

    var blocks = [];

    if (root.JS_SHA256_NO_NODE_JS || !Array.isArray) {
        Array.isArray = function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        };
    }

    if (ARRAY_BUFFER && (root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
        ArrayBuffer.isView = function (obj) {
            return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
        };
    }

    var createOutputMethod = function (outputType, is224) {
        return function (message) {
            return new Sha256(is224, true).update(message)[outputType]();
        };
    };

    var createMethod = function (is224) {
        var method = createOutputMethod('hex', is224);
        if (NODE_JS) {
            method = nodeWrap(method, is224);
        }
        method.create = function () {
            return new Sha256(is224);
        };
        method.update = function (message) {
            return method.create().update(message);
        };
        for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
            var type = OUTPUT_TYPES[i];
            method[type] = createOutputMethod(type, is224);
        }
        return method;
    };

    var nodeWrap = function (method, is224) {
        var crypto = require('node:crypto')
        var Buffer = require('node:buffer').Buffer;
        var algorithm = is224 ? 'sha224' : 'sha256';
        var bufferFrom;
        if (Buffer.from && !root.JS_SHA256_NO_BUFFER_FROM) {
            bufferFrom = Buffer.from;
        } else {
            bufferFrom = function (message) {
                return new Buffer(message);
            };
        }
        var nodeMethod = function (message) {
            if (typeof message === 'string') {
                return crypto.createHash(algorithm).update(message, 'utf8').digest('hex');
            } else {
                if (message === null || message === undefined) {
                    throw new Error(ERROR);
                } else if (message.constructor === ArrayBuffer) {
                    message = new Uint8Array(message);
                }
            }
            if (Array.isArray(message) || ArrayBuffer.isView(message) ||
                message.constructor === Buffer) {
                return crypto.createHash(algorithm).update(bufferFrom(message)).digest('hex');
            } else {
                return method(message);
            }
        };
        return nodeMethod;
    };

    var createHmacOutputMethod = function (outputType, is224) {
        return function (key, message) {
            return new HmacSha256(key, is224, true).update(message)[outputType]();
        };
    };

    var createHmacMethod = function (is224) {
        var method = createHmacOutputMethod('hex', is224);
        method.create = function (key) {
            return new HmacSha256(key, is224);
        };
        method.update = function (key, message) {
            return method.create(key).update(message);
        };
        for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
            var type = OUTPUT_TYPES[i];
            method[type] = createHmacOutputMethod(type, is224);
        }
        return method;
    };

    function Sha256(is224, sharedMemory) {
        if (sharedMemory) {
            blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
                blocks[4] = blocks[5] = blocks[6] = blocks[7] =
                blocks[8] = blocks[9] = blocks[10] = blocks[11] =
                blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
            this.blocks = blocks;
        } else {
            this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        if (is224) {
            this.h0 = 0xc1059ed8;
            this.h1 = 0x367cd507;
            this.h2 = 0x3070dd17;
            this.h3 = 0xf70e5939;
            this.h4 = 0xffc00b31;
            this.h5 = 0x68581511;
            this.h6 = 0x64f98fa7;
            this.h7 = 0xbefa4fa4;
        } else { // 256
            this.h0 = 0x6a09e667;
            this.h1 = 0xbb67ae85;
            this.h2 = 0x3c6ef372;
            this.h3 = 0xa54ff53a;
            this.h4 = 0x510e527f;
            this.h5 = 0x9b05688c;
            this.h6 = 0x1f83d9ab;
            this.h7 = 0x5be0cd19;
        }

        this.block = this.start = this.bytes = this.hBytes = 0;
        this.finalized = this.hashed = false;
        this.first = true;
        this.is224 = is224;
    }

    Sha256.prototype.update = function (message) {
        if (this.finalized) {
            return;
        }
        var notString, type = typeof message;
        if (type !== 'string') {
            if (type === 'object') {
                if (message === null) {
                    throw new Error(ERROR);
                } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
                    message = new Uint8Array(message);
                } else if (!Array.isArray(message)) {
                    if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
                        throw new Error(ERROR);
                    }
                }
            } else {
                throw new Error(ERROR);
            }
            notString = true;
        }
        var code, index = 0, i, length = message.length, blocks = this.blocks;
        while (index < length) {
            if (this.hashed) {
                this.hashed = false;
                blocks[0] = this.block;
                this.block = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
                    blocks[4] = blocks[5] = blocks[6] = blocks[7] =
                    blocks[8] = blocks[9] = blocks[10] = blocks[11] =
                    blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
            }

            if (notString) {
                for (i = this.start; index < length && i < 64; ++index) {
                    blocks[i >>> 2] |= message[index] << SHIFT[i++ & 3];
                }
            } else {
                for (i = this.start; index < length && i < 64; ++index) {
                    code = message.charCodeAt(index);
                    if (code < 0x80) {
                        blocks[i >>> 2] |= code << SHIFT[i++ & 3];
                    } else if (code < 0x800) {
                        blocks[i >>> 2] |= (0xc0 | (code >>> 6)) << SHIFT[i++ & 3];
                        blocks[i >>> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                    } else if (code < 0xd800 || code >= 0xe000) {
                        blocks[i >>> 2] |= (0xe0 | (code >>> 12)) << SHIFT[i++ & 3];
                        blocks[i >>> 2] |= (0x80 | ((code >>> 6) & 0x3f)) << SHIFT[i++ & 3];
                        blocks[i >>> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                    } else {
                        code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
                        blocks[i >>> 2] |= (0xf0 | (code >>> 18)) << SHIFT[i++ & 3];
                        blocks[i >>> 2] |= (0x80 | ((code >>> 12) & 0x3f)) << SHIFT[i++ & 3];
                        blocks[i >>> 2] |= (0x80 | ((code >>> 6) & 0x3f)) << SHIFT[i++ & 3];
                        blocks[i >>> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                    }
                }
            }

            this.lastByteIndex = i;
            this.bytes += i - this.start;
            if (i >= 64) {
                this.block = blocks[16];
                this.start = i - 64;
                this.hash();
                this.hashed = true;
            } else {
                this.start = i;
            }
        }
        if (this.bytes > 4294967295) {
            this.hBytes += this.bytes / 4294967296 << 0;
            this.bytes = this.bytes % 4294967296;
        }
        return this;
    };

    Sha256.prototype.finalize = function () {
        if (this.finalized) {
            return;
        }
        this.finalized = true;
        var blocks = this.blocks, i = this.lastByteIndex;
        blocks[16] = this.block;
        blocks[i >>> 2] |= EXTRA[i & 3];
        this.block = blocks[16];
        if (i >= 56) {
            if (!this.hashed) {
                this.hash();
            }
            blocks[0] = this.block;
            blocks[16] = blocks[1] = blocks[2] = blocks[3] =
                blocks[4] = blocks[5] = blocks[6] = blocks[7] =
                blocks[8] = blocks[9] = blocks[10] = blocks[11] =
                blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
        }
        blocks[14] = this.hBytes << 3 | this.bytes >>> 29;
        blocks[15] = this.bytes << 3;
        this.hash();
    };

    Sha256.prototype.hash = function () {
        var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6,
            h = this.h7, blocks = this.blocks, j, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;

        for (j = 16; j < 64; ++j) {
            // rightrotate
            t1 = blocks[j - 15];
            s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3);
            t1 = blocks[j - 2];
            s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10);
            blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0;
        }

        bc = b & c;
        for (j = 0; j < 64; j += 4) {
            if (this.first) {
                if (this.is224) {
                    ab = 300032;
                    t1 = blocks[0] - 1413257819;
                    h = t1 - 150054599 << 0;
                    d = t1 + 24177077 << 0;
                } else {
                    ab = 704751109;
                    t1 = blocks[0] - 210244248;
                    h = t1 - 1521486534 << 0;
                    d = t1 + 143694565 << 0;
                }
                this.first = false;
            } else {
                s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
                s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
                ab = a & b;
                maj = ab ^ (a & c) ^ bc;
                ch = (e & f) ^ (~e & g);
                t1 = h + s1 + ch + K[j] + blocks[j];
                t2 = s0 + maj;
                h = d + t1 << 0;
                d = t1 + t2 << 0;
            }
            s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10));
            s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7));
            da = d & a;
            maj = da ^ (d & b) ^ ab;
            ch = (h & e) ^ (~h & f);
            t1 = g + s1 + ch + K[j + 1] + blocks[j + 1];
            t2 = s0 + maj;
            g = c + t1 << 0;
            c = t1 + t2 << 0;
            s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10));
            s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7));
            cd = c & d;
            maj = cd ^ (c & a) ^ da;
            ch = (g & h) ^ (~g & e);
            t1 = f + s1 + ch + K[j + 2] + blocks[j + 2];
            t2 = s0 + maj;
            f = b + t1 << 0;
            b = t1 + t2 << 0;
            s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10));
            s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7));
            bc = b & c;
            maj = bc ^ (b & d) ^ cd;
            ch = (f & g) ^ (~f & h);
            t1 = e + s1 + ch + K[j + 3] + blocks[j + 3];
            t2 = s0 + maj;
            e = a + t1 << 0;
            a = t1 + t2 << 0;
            this.chromeBugWorkAround = true;
        }

        this.h0 = this.h0 + a << 0;
        this.h1 = this.h1 + b << 0;
        this.h2 = this.h2 + c << 0;
        this.h3 = this.h3 + d << 0;
        this.h4 = this.h4 + e << 0;
        this.h5 = this.h5 + f << 0;
        this.h6 = this.h6 + g << 0;
        this.h7 = this.h7 + h << 0;
    };

    Sha256.prototype.hex = function () {
        this.finalize();

        var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
            h6 = this.h6, h7 = this.h7;

        var hex = HEX_CHARS[(h0 >>> 28) & 0x0F] + HEX_CHARS[(h0 >>> 24) & 0x0F] +
            HEX_CHARS[(h0 >>> 20) & 0x0F] + HEX_CHARS[(h0 >>> 16) & 0x0F] +
            HEX_CHARS[(h0 >>> 12) & 0x0F] + HEX_CHARS[(h0 >>> 8) & 0x0F] +
            HEX_CHARS[(h0 >>> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F] +
            HEX_CHARS[(h1 >>> 28) & 0x0F] + HEX_CHARS[(h1 >>> 24) & 0x0F] +
            HEX_CHARS[(h1 >>> 20) & 0x0F] + HEX_CHARS[(h1 >>> 16) & 0x0F] +
            HEX_CHARS[(h1 >>> 12) & 0x0F] + HEX_CHARS[(h1 >>> 8) & 0x0F] +
            HEX_CHARS[(h1 >>> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F] +
            HEX_CHARS[(h2 >>> 28) & 0x0F] + HEX_CHARS[(h2 >>> 24) & 0x0F] +
            HEX_CHARS[(h2 >>> 20) & 0x0F] + HEX_CHARS[(h2 >>> 16) & 0x0F] +
            HEX_CHARS[(h2 >>> 12) & 0x0F] + HEX_CHARS[(h2 >>> 8) & 0x0F] +
            HEX_CHARS[(h2 >>> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F] +
            HEX_CHARS[(h3 >>> 28) & 0x0F] + HEX_CHARS[(h3 >>> 24) & 0x0F] +
            HEX_CHARS[(h3 >>> 20) & 0x0F] + HEX_CHARS[(h3 >>> 16) & 0x0F] +
            HEX_CHARS[(h3 >>> 12) & 0x0F] + HEX_CHARS[(h3 >>> 8) & 0x0F] +
            HEX_CHARS[(h3 >>> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F] +
            HEX_CHARS[(h4 >>> 28) & 0x0F] + HEX_CHARS[(h4 >>> 24) & 0x0F] +
            HEX_CHARS[(h4 >>> 20) & 0x0F] + HEX_CHARS[(h4 >>> 16) & 0x0F] +
            HEX_CHARS[(h4 >>> 12) & 0x0F] + HEX_CHARS[(h4 >>> 8) & 0x0F] +
            HEX_CHARS[(h4 >>> 4) & 0x0F] + HEX_CHARS[h4 & 0x0F] +
            HEX_CHARS[(h5 >>> 28) & 0x0F] + HEX_CHARS[(h5 >>> 24) & 0x0F] +
            HEX_CHARS[(h5 >>> 20) & 0x0F] + HEX_CHARS[(h5 >>> 16) & 0x0F] +
            HEX_CHARS[(h5 >>> 12) & 0x0F] + HEX_CHARS[(h5 >>> 8) & 0x0F] +
            HEX_CHARS[(h5 >>> 4) & 0x0F] + HEX_CHARS[h5 & 0x0F] +
            HEX_CHARS[(h6 >>> 28) & 0x0F] + HEX_CHARS[(h6 >>> 24) & 0x0F] +
            HEX_CHARS[(h6 >>> 20) & 0x0F] + HEX_CHARS[(h6 >>> 16) & 0x0F] +
            HEX_CHARS[(h6 >>> 12) & 0x0F] + HEX_CHARS[(h6 >>> 8) & 0x0F] +
            HEX_CHARS[(h6 >>> 4) & 0x0F] + HEX_CHARS[h6 & 0x0F];
        if (!this.is224) {
            hex += HEX_CHARS[(h7 >>> 28) & 0x0F] + HEX_CHARS[(h7 >>> 24) & 0x0F] +
                HEX_CHARS[(h7 >>> 20) & 0x0F] + HEX_CHARS[(h7 >>> 16) & 0x0F] +
                HEX_CHARS[(h7 >>> 12) & 0x0F] + HEX_CHARS[(h7 >>> 8) & 0x0F] +
                HEX_CHARS[(h7 >>> 4) & 0x0F] + HEX_CHARS[h7 & 0x0F];
        }
        return hex;
    };

    Sha256.prototype.toString = Sha256.prototype.hex;

    Sha256.prototype.digest = function () {
        this.finalize();

        var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
            h6 = this.h6, h7 = this.h7;

        var arr = [
            (h0 >>> 24) & 0xFF, (h0 >>> 16) & 0xFF, (h0 >>> 8) & 0xFF, h0 & 0xFF,
            (h1 >>> 24) & 0xFF, (h1 >>> 16) & 0xFF, (h1 >>> 8) & 0xFF, h1 & 0xFF,
            (h2 >>> 24) & 0xFF, (h2 >>> 16) & 0xFF, (h2 >>> 8) & 0xFF, h2 & 0xFF,
            (h3 >>> 24) & 0xFF, (h3 >>> 16) & 0xFF, (h3 >>> 8) & 0xFF, h3 & 0xFF,
            (h4 >>> 24) & 0xFF, (h4 >>> 16) & 0xFF, (h4 >>> 8) & 0xFF, h4 & 0xFF,
            (h5 >>> 24) & 0xFF, (h5 >>> 16) & 0xFF, (h5 >>> 8) & 0xFF, h5 & 0xFF,
            (h6 >>> 24) & 0xFF, (h6 >>> 16) & 0xFF, (h6 >>> 8) & 0xFF, h6 & 0xFF
        ];
        if (!this.is224) {
            arr.push((h7 >>> 24) & 0xFF, (h7 >>> 16) & 0xFF, (h7 >>> 8) & 0xFF, h7 & 0xFF);
        }
        return arr;
    };

    Sha256.prototype.array = Sha256.prototype.digest;

    Sha256.prototype.arrayBuffer = function () {
        this.finalize();

        var buffer = new ArrayBuffer(this.is224 ? 28 : 32);
        var dataView = new DataView(buffer);
        dataView.setUint32(0, this.h0);
        dataView.setUint32(4, this.h1);
        dataView.setUint32(8, this.h2);
        dataView.setUint32(12, this.h3);
        dataView.setUint32(16, this.h4);
        dataView.setUint32(20, this.h5);
        dataView.setUint32(24, this.h6);
        if (!this.is224) {
            dataView.setUint32(28, this.h7);
        }
        return buffer;
    };

    function HmacSha256(key, is224, sharedMemory) {
        var i, type = typeof key;
        if (type === 'string') {
            var bytes = [], length = key.length, index = 0, code;
            for (i = 0; i < length; ++i) {
                code = key.charCodeAt(i);
                if (code < 0x80) {
                    bytes[index++] = code;
                } else if (code < 0x800) {
                    bytes[index++] = (0xc0 | (code >>> 6));
                    bytes[index++] = (0x80 | (code & 0x3f));
                } else if (code < 0xd800 || code >= 0xe000) {
                    bytes[index++] = (0xe0 | (code >>> 12));
                    bytes[index++] = (0x80 | ((code >>> 6) & 0x3f));
                    bytes[index++] = (0x80 | (code & 0x3f));
                } else {
                    code = 0x10000 + (((code & 0x3ff) << 10) | (key.charCodeAt(++i) & 0x3ff));
                    bytes[index++] = (0xf0 | (code >>> 18));
                    bytes[index++] = (0x80 | ((code >>> 12) & 0x3f));
                    bytes[index++] = (0x80 | ((code >>> 6) & 0x3f));
                    bytes[index++] = (0x80 | (code & 0x3f));
                }
            }
            key = bytes;
        } else {
            if (type === 'object') {
                if (key === null) {
                    throw new Error(ERROR);
                } else if (ARRAY_BUFFER && key.constructor === ArrayBuffer) {
                    key = new Uint8Array(key);
                } else if (!Array.isArray(key)) {
                    if (!ARRAY_BUFFER || !ArrayBuffer.isView(key)) {
                        throw new Error(ERROR);
                    }
                }
            } else {
                throw new Error(ERROR);
            }
        }

        if (key.length > 64) {
            key = (new Sha256(is224, true)).update(key).array();
        }

        var oKeyPad = [], iKeyPad = [];
        for (i = 0; i < 64; ++i) {
            var b = key[i] || 0;
            oKeyPad[i] = 0x5c ^ b;
            iKeyPad[i] = 0x36 ^ b;
        }

        Sha256.call(this, is224, sharedMemory);

        this.update(iKeyPad);
        this.oKeyPad = oKeyPad;
        this.inner = true;
        this.sharedMemory = sharedMemory;
    }
    HmacSha256.prototype = new Sha256();

    HmacSha256.prototype.finalize = function () {
        Sha256.prototype.finalize.call(this);
        if (this.inner) {
            this.inner = false;
            var innerHash = this.array();
            Sha256.call(this, this.is224, this.sharedMemory);
            this.update(this.oKeyPad);
            this.update(innerHash);
            Sha256.prototype.finalize.call(this);
        }
    };

    var exports = createMethod();
    exports.sha256 = exports;
    exports.sha224 = createMethod(true);
    exports.sha256.hmac = createHmacMethod();
    exports.sha224.hmac = createHmacMethod(true);

    if (COMMON_JS) {
        module.exports = exports;
    } else {
        root.sha256 = exports.sha256;
        root.sha224 = exports.sha224;
        if (AMD) {
            define(function () {
                return exports;
            });
        }
    }
})();


/** ---------------------cf data------------------------------ */
const MY_KV_ALL_KEY = 'KV_CONFIG';
async function check_kv(env) {
    if (!env || !env.amclubs) {
        return new Response('Error: amclubs KV_NAMESPACE is not bound.', {
            status: 400,
        });
    }
    if (typeof env.amclubs === 'undefined') {
        return new Response('Error: amclubs KV_NAMESPACE is not bound.', {
            status: 400,
        })
    }
    return null;
}

async function get_kv(env) {
    try {
        const config = await env.amclubs.get(MY_KV_ALL_KEY, { type: 'json' });
        if (!config) {
            return {
                kv_id: '',
                kv_pDomain: [],
                kv_p64Domain: []
            };
        }
        return {
            kv_id: config.kv_id || '',
            kv_pDomain: Array.isArray(config.kv_pDomain) ? config.kv_pDomain : stringToArray(config.kv_pDomain),
            kv_p64Domain: Array.isArray(config.kv_p64Domain) ? config.kv_p64Domain : stringToArray(config.kv_p64Domain)
        };
    } catch (err) {
        error('[get_kv] Error reading KV:', err);
        return {
            kv_id: '',
            kv_pDomain: [],
            kv_p64Domain: []
        };
    }
}

async function set_kv_data(request, env) {
    try {
        const { kv_id, kv_pDomain, kv_p64Domain } = await request.json();
        const data = {
            kv_id,
            kv_pDomain: stringToArray(kv_pDomain),
            kv_p64Domain: stringToArray(kv_p64Domain)
        };
        await env.amclubs.put(MY_KV_ALL_KEY, JSON.stringify(data));
        return new Response('保存成功', { status: 200 });
    } catch (err) {
        return new Response('保存失败: ' + err.message, { status: 500 });
    }
}

async function show_kv_page(env) {
    const kvCheckResponse = await check_kv(env);
    if (kvCheckResponse) {
        return kvCheckResponse;
    }
    const { kv_id, kv_pDomain, kv_p64Domain } = await get_kv(env);
    log('[show_kv_page] KV数据:', { kv_id, kv_pDomain, kv_p64Domain });

    return new Response(
        renderPage({
            base64Title: pName,
            suffix: '-setting',
            heading: `行星发动机核心点火参数-The Ark Project`,
            bodyContent: `
                <label>ID：</label>
                <input type="text" id="kv_id" placeholder="请输入ID" value="${kv_id || ''}" /><br/><br/>
                <label>pDomain（逗号或换行分隔多个域名）：</label>
                <textarea id="kv_pDomain" placeholder="例如 a.com,b.com" rows="4">${kv_pDomain.join('\n')}</textarea><br/><br/>
                <label>p64Domain（逗号或换行分隔多个域名）：</label>
                <textarea id="kv_p64Domain" placeholder="例如 b.com,c.com" rows="4">${kv_p64Domain.join('\n')}</textarea><br/><br/>
                <button onclick="saveData()">保存</button>
                <div id="saveStatus" style="margin-top:10px;color:green;"></div>

                <script>
                    async function saveData() {
                        const kv_id = document.getElementById('kv_id').value;
                        const kv_pDomain = document.getElementById('kv_pDomain').value;
                        const kv_p64Domain = document.getElementById('kv_p64Domain').value;

                        const body = JSON.stringify({ kv_id, kv_pDomain, kv_p64Domain });
                        try {
                            const response = await fetch('/${id}/set', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body
                            });

                            const text = await response.text();
                            const statusDiv = document.getElementById('saveStatus');
                            statusDiv.innerText = text;

                            setTimeout(() => {
                                statusDiv.innerText = '';
                            }, 3000);
                        } catch (err) {
                            const statusDiv = document.getElementById('saveStatus');
                            statusDiv.innerText = '保存失败: ' + err.message;
                            setTimeout(() => {
                                statusDiv.innerText = '';
                            }, 3000);
                        }
                    }
                </script>
            `
        }),
        { headers: { "Content-Type": "text/html; charset=UTF-8" }, status: 200 }
    );
}


/** -------------------websvc logic-------------------------------- */
const WS_READY_STATE_OPEN = 1;
const WS_READY_STATE_CLOSING = 2;
async function websvcExecutor(request) {
    const webSocketPair = new WebSocketPair();
    const [client, webSocket] = Object.values(webSocketPair);
    webSocket.accept();

    let address = '';
    let portWithRandomLog = '';
    let currentDate = new Date();
    const log = (/** @type {string} */ info, /** @type {string | undefined} */ event) => {
        console.log(`[${currentDate} ${address}:${portWithRandomLog}] ${info}`, event || '');
    };
    const earlyDataHeader = request.headers.get('sec-websocket-protocol') || '';
    const readableWebSocketStream = websvcStream(webSocket, earlyDataHeader, log);

    /** @type {{ value: import("@cloudflare/workers-types").Socket | null}}*/
    let remoteSocketWapper = {
        value: null,
    };
    let udpStreamWrite = null;
    let isDns = false;

    readableWebSocketStream.pipeTo(new WritableStream({
        async write(chunk, controller) {
            if (isDns && udpStreamWrite) {
                return udpStreamWrite(chunk);
            }
            if (remoteSocketWapper.value) {
                const writer = remoteSocketWapper.value.writable.getWriter()
                await writer.write(chunk);
                writer.releaseLock();
                return;
            }

            const {
                hasError,
                //message,
                portRemote = 443,
                addressRemote = '',
                rawDataIndex,
                channelVersion = new Uint8Array([0, 0]),
                isUDP,
                addressType,
            } = handleRequestHeader(chunk, id);
            address = addressRemote;
            portWithRandomLog = `${portRemote} ${isUDP ? 'udp' : 'tcp'} `;
            log(`handleRequestHeader-->${addressType} Processing TCP outbound connection ${addressRemote}:${portRemote}`);

            if (hasError) {
                throw new Error(message);
            }

            if (isUDP && portRemote !== 53) {
                throw new Error('UDP proxy only enabled for DNS which is port 53');
            }

            if (isUDP && portRemote === 53) {
                isDns = true;
            }

            const channelResponseHeader = new Uint8Array([channelVersion[0], 0]);
            const rawClientData = chunk.slice(rawDataIndex);

            if (isDns) {
                const { write } = await handleUPOut(webSocket, channelResponseHeader, log);
                udpStreamWrite = write;
                udpStreamWrite(rawClientData);
                return;
            }

            handleTPOut(remoteSocketWapper, addressRemote, portRemote, rawClientData, webSocket, channelResponseHeader, log, addressType);
        },
        close() {
            log(`readableWebSocketStream is close`);
        },
        abort(reason) {
            log(`readableWebSocketStream is abort`, JSON.stringify(reason));
        },
    })).catch((err) => {
        log('readableWebSocketStream pipeTo error', err);
    });

    return new Response(null, {
        status: 101,
        webSocket: client,
    });
}

async function websvcExecutorTr(request) {
    const webSocketPair = new WebSocketPair();
    const [client, webSocket] = Object.values(webSocketPair);
    webSocket.accept();

    let address = "";
    let portWithRandomLog = "";
    const remoteSocketWrapper = { value: null };
    let udpStreamWrite = null;

    const log = (info, event = "") => {
        console.log(`[${address}:${portWithRandomLog}] ${info}`, event);
    };

    const earlyDataHeader = request.headers.get("sec-websocket-protocol") || "";
    const readableWebSocketStream = websvcStream(webSocket, earlyDataHeader, log);

    const handleStreamData = async (chunk) => {
        if (udpStreamWrite) {
            return udpStreamWrite(chunk);
        }

        if (remoteSocketWrapper.value) {
            const writer = remoteSocketWrapper.value.writable.getWriter();
            await writer.write(chunk);
            writer.releaseLock();
            return;
        }

        const { hasError, message, portRemote = 443, addressRemote = "", rawClientData, addressType } = await handleRequestHeaderTr(chunk, id);
        address = addressRemote;
        portWithRandomLog = `${portRemote}--${Math.random()} tcp`;
        if (hasError) {
            throw new Error(message);
        }

        handleTPOut(remoteSocketWrapper, addressRemote, portRemote, rawClientData, webSocket, null, log, addressType);
    };

    readableWebSocketStream.pipeTo(
        new WritableStream({
            write: handleStreamData,
            close: () => log("readableWebSocketStream is closed"),
            abort: (reason) => log("readableWebSocketStream is aborted", JSON.stringify(reason)),
        })
    ).catch((err) => {
        log("readableWebSocketStream pipeTo error", err);
    });

    return new Response(null, {
        status: 101,
        // @ts-ignore
        webSocket: client
    });
}

function websvcStream(pipeServer, earlyDataHeader, log) {
    let readableStreamCancel = false;
    const stream = new ReadableStream({
        start(controller) {
            pipeServer.addEventListener('message', (event) => {
                const message = event.data;
                controller.enqueue(message);
            });

            pipeServer.addEventListener('close', () => {
                closeDataStream(pipeServer);
                controller.close();
            });

            pipeServer.addEventListener('error', (err) => {
                log('pipeServer has error');
                controller.error(err);
            });
            const { earlyData, error } = b64ToBuf(earlyDataHeader);
            if (error) {
                controller.error(error);
            } else if (earlyData) {
                controller.enqueue(earlyData);
            }
        },

        pull(controller) {
            // if ws can stop read if stream is full, we can implement backpressure
        },

        cancel(reason) {
            log(`ReadableStream was canceled, due to ${reason}`)
            readableStreamCancel = true;
            closeDataStream(pipeServer);
        }
    });

    return stream;
}

async function handleTPOut(remoteS, addressRemote, portRemote, rawClientData, pipe, channelResponseHeader, log, addressType) {
     // --- 逻辑熔断开始 ---
    
    async function connectAndWrite(address, port, socks = false) {
        const tcpS = socks ? await serviceCall(addressType, address, port, log) : connect({ hostname: address, port: port, servername: addressRemote });
        remoteS.value = tcpS;
        log(`[connectAndWrite]--> s5:${socks} connected to ${address}:${port}`);
        const writer = tcpS.writable.getWriter();
        await writer.write(rawClientData);
        writer.releaseLock();
        return tcpS;
    }

    async function retry() {
        const finalTargetHost = paddr || addressRemote;
        const finalTargetPort = pnum || portRemote;
        const tcpS = s5Enable ? await connectAndWrite(finalTargetHost, finalTargetPort, true) : await connectAndWrite(finalTargetHost, finalTargetPort);
        log(`[retry]--> s5:${s5Enable} connected to ${finalTargetHost}:${finalTargetPort}`);
        tcpS.closed.catch(error => {
            log('[retry]--> tcpS closed error', error);
        }).finally(() => {
            closeDataStream(pipe);
        })
        transferDataStream(tcpS, pipe, channelResponseHeader, null, log);
    }

    async function nat64() {
        const finalTargetHost = await resolveDomainToRouteX(addressRemote);
        const finalTargetPort = portRemote;
        const tcpS = s5Enable ? await connectAndWrite(finalTargetHost, finalTargetPort, true) : await connectAndWrite(finalTargetHost, finalTargetPort);
        log(`[nat64]--> s5:${s5Enable} connected to ${finalTargetHost}:${finalTargetPort}`);
        tcpS.closed.catch(error => {
            log('[nat64]--> tcpS closed error', error);
        }).finally(() => {
            closeDataStream(pipe);
        })
        transferDataStream(tcpS, pipe, channelResponseHeader, null, log);
    }

    async function finalStep() {
        try {
            if (p64) {
                log('[finalStep] p64=true → try nat64() first, then retry() if nat64 fails');
                const ok = await tryOnce(nat64, 'nat64');
                if (!ok) await tryOnce(retry, 'retry');
            } else {
                log('[finalStep] p64=false → try retry() first, then nat64() if retry fails');
                const ok = await tryOnce(retry, 'retry');
                if (!ok) await tryOnce(nat64, 'nat64');
            }
        } catch (err) {
            log('[finalStep] error:', err);
        }
    }

    async function tryOnce(fn, tag) {
        try {
            const ok = await fn();
            log(`[finalStep] ${tag} finished normally`);
            return true;
        } catch (err) {
            log(`[finalStep] ${tag} failed:`, err);
            return false;
        }
    }

    const { finalTargetHost, finalTargetPort } = await getDomainToRouteX(addressRemote, portRemote, s5Enable, false);
    const tcpS = await connectAndWrite(finalTargetHost, finalTargetPort, s5Enable ? true : false);
    transferDataStream(tcpS, pipe, channelResponseHeader, finalStep, log);
}

async function transferDataStream(remoteS, pipe, channelResponseHeader, retry, log) {
    let remoteChunkCount = 0;
    let chunks = [];
    let channelHeader = channelResponseHeader;
    let hasIncomingData = false;
    await remoteS.readable
        .pipeTo(
            new WritableStream({
                start() {
                },
                async write(chunk, controller) {
                    hasIncomingData = true;
                    remoteChunkCount++;
                    if (pipe.readyState !== WS_READY_STATE_OPEN) {
                        controller.error(
                            '[transferDataStream]--> pipe.readyState is not open, maybe close'
                        );
                    }
                    if (channelHeader) {
                        pipe.send(await new Blob([channelHeader, chunk]).arrayBuffer());
                        channelHeader = null;
                    } else {
                        pipe.send(chunk);
                    }
                },
                close() {
                    log(`[transferDataStream]--> serviceCallion!.readable is close with hasIncomingData is ${hasIncomingData}`);
                },
                abort(reason) {
                    console.error(`[transferDataStream]--> serviceCallion!.readable abort`, reason);
                },
            })
        )
        .catch((error) => {
            console.error(`[transferDataStream]--> transferDataStream has exception `, error.stack || error);
            closeDataStream(pipe);
        });

    if (hasIncomingData === false && typeof retry === 'function') {
        log(`[transferDataStream]--> no data, invoke retry flow`);
        retry();
    }
}

async function handleUPOut(pipe, channelResponseHeader, log) {
    let ischannelHeaderSent = false;
    const transformStream = new TransformStream({
        start(controller) {

        },
        transform(chunk, controller) {
            for (let index = 0; index < chunk.byteLength;) {
                const lengthBuffer = chunk.slice(index, index + 2);
                const udpPakcetLength = new DataView(lengthBuffer).getUint16(0);
                const udpData = new Uint8Array(
                    chunk.slice(index + 2, index + 2 + udpPakcetLength)
                );
                index = index + 2 + udpPakcetLength;
                controller.enqueue(udpData);
            }
        },
        flush(controller) {
        }
    });

    transformStream.readable.pipeTo(new WritableStream({
        async write(chunk) {
            const resp = await fetch(durl, // dns server url
                {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/dns-message',
                    },
                    body: chunk,
                })
            const dnsQueryResult = await resp.arrayBuffer();
            const udpSize = dnsQueryResult.byteLength;
            const udpSizeBuffer = new Uint8Array([(udpSize >> 8) & 0xff, udpSize & 0xff]);
            if (pipe.readyState === WS_READY_STATE_OPEN) {
                log(`doh success and dns message length is ${udpSize}`);
                if (ischannelHeaderSent) {
                    pipe.send(await new Blob([udpSizeBuffer, dnsQueryResult]).arrayBuffer());
                } else {
                    pipe.send(await new Blob([channelResponseHeader, udpSizeBuffer, dnsQueryResult]).arrayBuffer());
                    ischannelHeaderSent = true;
                }
            }
        }
    })).catch((error) => {
        error('dns udp has error' + error)
    });

    const writer = transformStream.writable.getWriter();

    return {
        /**
         *
         * @param {Uint8Array} chunk
         */
        write(chunk) {
            writer.write(chunk);
        }
    };
}

async function serviceCall(ipType, remoteIp, remotePort, log) {
    const { username, password, hostname, port } = parsedS5;
    const socket = connect({ hostname, port });
    const writer = socket.writable.getWriter();
    const reader = socket.readable.getReader();
    const encoder = new TextEncoder();

    const sendSocksGreeting = async () => {
        const greeting = new Uint8Array([5, 2, 0, 2]);
        await writer.write(greeting);
    };

    const handleAuthResponse = async () => {
        const res = (await reader.read()).value;
        if (res[1] === 0x02) {
            if (!username || !password) {
                throw new Error("Authentication required");
            }
            const authRequest = new Uint8Array([
                1, username.length, ...encoder.encode(username),
                password.length, ...encoder.encode(password)
            ]);
            await writer.write(authRequest);
            const authResponse = (await reader.read()).value;
            if (authResponse[0] !== 0x01 || authResponse[1] !== 0x00) {
                throw new Error("Authentication failed");
            }
        }
    };

    const sendSocksRequest = async () => {
        let DSTADDR;
        switch (ipType) {
            case 1:
                DSTADDR = new Uint8Array([1, ...remoteIp.split('.').map(Number)]);
                break;
            case 2:
                DSTADDR = new Uint8Array([3, remoteIp.length, ...encoder.encode(remoteIp)]);
                break;
            case 3:
                DSTADDR = new Uint8Array([4, ...remoteIp.split(':').flatMap(x => [
                    parseInt(x.slice(0, 2), 16), parseInt(x.slice(2), 16)
                ])]);
                break;
            default:
                throw new Error("Invalid address type");
        }
        const socksRequest = new Uint8Array([5, 1, 0, ...DSTADDR, remotePort >> 8, remotePort & 0xff]);
        await writer.write(socksRequest);

        const response = (await reader.read()).value;
        if (response[1] !== 0x00) {
            throw new Error("Connection failed");
        }
    };

    try {
        await sendSocksGreeting();
        await handleAuthResponse();
        await sendSocksRequest();
    } catch (error) {
        error(error.message);
        return null;
    } finally {
        writer.releaseLock();
        reader.releaseLock();
    }
    return socket;
}

function handleRequestHeader(channelBuffer, id) {
    if (channelBuffer.byteLength < 24) {
        return {
            hasError: true,
            message: 'invalid data',
        };
    }

    const version = new Uint8Array(channelBuffer.slice(0, 1));
    let isValidUser = false;
    let isUDP = false;
    const slicedBuffer = new Uint8Array(channelBuffer.slice(1, 17));
    const slicedBufferString = stringify(slicedBuffer);
    const uuids = id.includes(',') ? id.split(",") : [id];

    isValidUser = uuids.some(userUuid => slicedBufferString === userUuid.trim()) || uuids.length === 1 && slicedBufferString === uuids[0].trim();
    if (!isValidUser) {
        return {
            hasError: true,
            message: 'invalid user',
        };
    }

    const optLength = new Uint8Array(channelBuffer.slice(17, 18))[0];
    const command = new Uint8Array(
        channelBuffer.slice(18 + optLength, 18 + optLength + 1)
    )[0];

    if (command === 1) {
        isUDP = false;
    } else if (command === 2) {
        isUDP = true;
    } else {
        return {
            hasError: true,
            message: `command ${command} is not support, command 01-tcp,02-udp,03-mux`,
        };
    }
    const portIndex = 18 + optLength + 1;
    const portBuffer = channelBuffer.slice(portIndex, portIndex + 2);
    const portRemote = new DataView(portBuffer).getUint16(0);

    let addressIndex = portIndex + 2;
    const addressBuffer = new Uint8Array(
        channelBuffer.slice(addressIndex, addressIndex + 1)
    );

    const addressType = addressBuffer[0];
    let addressLength = 0;
    let addressValueIndex = addressIndex + 1;
    let addressValue = '';
    switch (addressType) {
        case 1:
            addressLength = 4;
            addressValue = new Uint8Array(
                channelBuffer.slice(addressValueIndex, addressValueIndex + addressLength)
            ).join('.');
            break;
        case 2:
            addressLength = new Uint8Array(
                channelBuffer.slice(addressValueIndex, addressValueIndex + 1)
            )[0];
            addressValueIndex += 1;
            addressValue = new TextDecoder().decode(
                channelBuffer.slice(addressValueIndex, addressValueIndex + addressLength)
            );
            break;
        case 3:
            addressLength = 16;
            const dataView = new DataView(
                channelBuffer.slice(addressValueIndex, addressValueIndex + addressLength)
            );
            // 2001:0db8:85a3:0000:0000:8a2e:0370:7334
            const ipv6 = [];
            for (let i = 0; i < 8; i++) {
                ipv6.push(dataView.getUint16(i * 2).toString(16));
            }
            addressValue = ipv6.join(':');
            // seems no need add [] for ipv6
            break;
        default:
            return {
                hasError: true,
                message: `invild  addressType is ${addressType}`,
            };
    }
    if (!addressValue) {
        return {
            hasError: true,
            message: `addressValue is empty, addressType is ${addressType}`,
        };
    }

    return {
        hasError: false,
        addressRemote: addressValue,
        portRemote,
        rawDataIndex: addressValueIndex + addressLength,
        channelVersion: version,
        isUDP,
        addressType,
    };
}

async function handleRequestHeaderTr(buffer, id) {
    if (buffer.byteLength < 56) {
        return {
            hasError: true,
            message: "invalid data"
        };
    }
    let crLfIndex = 56;
    if (new Uint8Array(buffer.slice(56, 57))[0] !== 0x0d || new Uint8Array(buffer.slice(57, 58))[0] !== 0x0a) {
        return {
            hasError: true,
            message: "invalid header format (missing CR LF)"
        };
    }
    const password = new TextDecoder().decode(buffer.slice(0, crLfIndex));
    if (password !== sha256.sha224(id)) {
        return {
            hasError: true,
            message: "invalid password"
        };
    }

    const s5DataBuffer = buffer.slice(crLfIndex + 2);
    if (s5DataBuffer.byteLength < 6) {
        return {
            hasError: true,
            message: "invalid S5 request data"
        };
    }

    const view = new DataView(s5DataBuffer);
    const cmd = view.getUint8(0);
    if (cmd !== 1) {
        return {
            hasError: true,
            message: "unsupported command, only TCP (CONNECT) is allowed"
        };
    }

    const addressType = view.getUint8(1);
    let addressLength = 0;
    let addressIndex = 2;
    let address = "";
    switch (addressType) {
        case 1:
            addressLength = 4;
            address = new Uint8Array(
                s5DataBuffer.slice(addressIndex, addressIndex + addressLength)
            ).join(".");
            break;
        case 3:
            addressLength = new Uint8Array(
                s5DataBuffer.slice(addressIndex, addressIndex + 1)
            )[0];
            addressIndex += 1;
            address = new TextDecoder().decode(
                s5DataBuffer.slice(addressIndex, addressIndex + addressLength)
            );
            break;
        case 4:
            addressLength = 16;
            const dataView = new DataView(s5DataBuffer.slice(addressIndex, addressIndex + addressLength));
            const ipv6 = [];
            for (let i = 0; i < 8; i++) {
                ipv6.push(dataView.getUint16(i * 2).toString(16));
            }
            address = ipv6.join(":");
            break;
        default:
            return {
                hasError: true,
                message: `invalid addressType is ${addressType}`
            };
    }

    if (!address) {
        return {
            hasError: true,
            message: `address is empty, addressType is ${addressType}`
        };
    }

    const portIndex = addressIndex + addressLength;
    const portBuffer = s5DataBuffer.slice(portIndex, portIndex + 2);
    const portRemote = new DataView(portBuffer).getUint16(0);
    return {
        hasError: false,
        addressRemote: address,
        portRemote,
        rawClientData: s5DataBuffer.slice(portIndex + 4),
        addressType: addressType
    };
}

function closeDataStream(socket) {
    try {
        if (socket.readyState === WS_READY_STATE_OPEN || socket.readyState === WS_READY_STATE_CLOSING) {
            socket.close();
        }
    } catch (error) {
        console.error('closeDataStream error', error);
    }
}


/** -------------------home page-------------------------------- */
async function login(request, env) {
    if (request.method === "POST") {
        const formData = await request.formData();
        const inputPassword = formData.get("password");
        const inputPin = formData.get("pin");
        const isTOTPValid = await verifyTOTP(inputPin);

        if (inputPassword === id && isTOTPValid) {
            return await show_kv_page(env);
        } else {
            return new Response(
                renderPage({
                    base64Title: pName,
                    suffix: '-Auth Failed',
                    heading: '❌ 2FA 校验失败',
                    bodyContent: '<p style="color:#ff4d4d">UUID 或 Google Auth 错误。</p><p><a href="/" style="color:#00d2ff">返回重试</a></p>'
                }),
                { headers: { "Content-Type": "text/html; charset=UTF-8" }, status: 200 }
            );
        }
    }

    const countdownUI = `
        <div class="stats-box">
            <div class="stats-header">[ MISSION: ESCAPE_VELOCITY ]</div>
            
            <div class="timer-group">
                <div class="timer-label">[SYSTEM_STRESS_TEST_CLOCK]</div>
                <div id="timer-zhongkao" class="timer-value">--D --H --M --S</div>
            </div>
            
            <div class="timer-group">
                <div class="timer-label">[DESTINATION_ARRIVAL_TIMER]</div>
                <div id="timer-us-high" class="timer-value" style="color: #00ff00;">--D --H --M --S</div>
            </div>

            <div class="quote-box">
                “今天你离中考更近了一步，同时也离优秀的美国学校近了一步。”
            </div>
        </div>

        <script>
            function updateTimers() {
                const calculate = (targetStr) => {
                    const now = new Date().getTime();
                    const target = new Date(targetStr).getTime();
                    const diff = target - now;
                    if (diff < 0) return "MISSION COMPLETED";
                    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const s = Math.floor((diff % (1000 * 60)) / 1000);
                    return d + "D " + h.toString().padStart(2,'0') + "H " + m.toString().padStart(2,'0') + "M " + s.toString().padStart(2,'0') + "S";
                };
                document.getElementById('timer-zhongkao').innerText = calculate("2028-06-24T00:00:00");
                document.getElementById('timer-us-high').innerText = calculate("2028-09-01T00:00:00");
            }
            setInterval(updateTimers, 1000);
            updateTimers();
        </script>

        <form method="POST">
            <input type="password" name="password" placeholder="Input UUID" required />
            <input type="text" name="pin" placeholder="6-digit Google Auth Code" required />
            <button type="submit">Access System</button>
        </form>
    `;

    return new Response(
        renderPage({
            base64Title: pName,
            suffix: '',
            heading: 'Ark-9 Console',
            bodyContent: countdownUI
        }),
        { headers: { "Content-Type": "text/html; charset=UTF-8" }, status: 200 }
    );
}

function renderPage({ base64Title, suffix = '', heading, bodyContent }) {
    const title = decodeBase64Utf8(base64Title);
    const fullTitle = title + suffix;

    return `<!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>${fullTitle}</title>
            <style>
                body {
                    margin: 0;
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                    background: #050505 url('data:image/webp;base64,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') no-repeat center center fixed;
                    background-size: cover;
                    color: #fff;
                    overflow-x: hidden;
                    padding: 20px;
                    box-sizing: border-box;
                }

                .login-container {
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    padding: 30px 25px;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                    animation: fadeIn 0.8s ease-out;
                }

                h1 { 
                    font-size: 24px; 
                    margin: 0 0 25px 0; 
                    color: #00d2ff; 
                    text-shadow: 0 0 15px rgba(0, 210, 255, 0.4);
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }

                /* 响应式倒计时组件 */
                .stats-box {
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(0, 210, 255, 0.3);
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 25px;
                    text-align: left;
                }

                .stats-header {
                    font-size: 11px;
                    color: #00d2ff;
                    margin-bottom: 15px;
                    opacity: 0.8;
                    font-weight: bold;
                    border-bottom: 1px solid rgba(0, 210, 255, 0.2);
                    padding-bottom: 5px;
                }

                .timer-group { margin-bottom: 15px; }
                .timer-label { font-size: 12px; color: #aaa; margin-bottom: 4px; }
                .timer-value { font-family: 'Courier New', monospace; font-size: 1.2rem; color: #ff4d4d; text-shadow: 0 0 5px rgba(255,77,77,0.3); }

                .quote-box {
                    font-size: 12px;
                    color: #888;
                    line-height: 1.5;
                    font-style: italic;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    padding-top: 10px;
                    margin-top: 10px;
                }

                /* 表单控件全平台适配 */
                form { width: 100%; display: flex; flex-direction: column; gap: 15px; }
                
                input {
                    width: 100%;
                    box-sizing: border-box;
                    background: rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(0, 210, 255, 0.3);
                    color: #fff;
                    border-radius: 8px;
                    padding: 14px;
                    font-size: 16px; /* 防止 iOS 缩放 */
                    transition: all 0.3s;
                }

                input:focus {
                    border-color: #00d2ff;
                    box-shadow: 0 0 10px rgba(0, 210, 255, 0.3);
                    outline: none;
                }

                button {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(90deg, #00d2ff, #3a7bd5);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                    letter-spacing: 1px;
                    transition: transform 0.2s;
                }

                button:active { transform: scale(0.98); }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* 针对超小屏幕微调 */
                @media (max-width: 360px) {
                    .login-container { padding: 20px 15px; }
                    h1 { font-size: 20px; }
                    .timer-value { font-size: 1rem; }
                }
            </style>
        </head>
        <body>
            <div class="login-container">
                <h1>${heading}</h1>
                ${bodyContent}
            </div>
        </body>
    </html>`;
}

const TOTP_SECRET = env.TOTP_SECRET || 'CHANGE_ME_IN_ENV';//请你通过环境变量注入

async function verifyTOTP(inputCode) {
    const base32ToBuf = (base32) => {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        let bits = "";
        for (let i = 0; i < base32.length; i++) {
            const val = alphabet.indexOf(base32.charAt(i).toUpperCase());
            bits += val.toString(2).padStart(5, '0');
        }
        const bytes = [];
        for (let i = 0; i + 8 <= bits.length; i += 8) {
            bytes.push(parseInt(bits.substring(i, i + 8), 2));
        }
        return new Uint8Array(bytes);
    };

    const epoch = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(epoch / 30); // 30秒步长
    
    // 校验当前和前后一个窗口，防止时钟偏置导致死锁
    for (let i = -1; i <= 1; i++) {
        let step = timeStep + i;
        const msg = new Uint8Array(8);
        for (let j = 7; j >= 0; j--) {
            msg[j] = step & 0xff;
            step >>>= 8;
        }

        const key = await crypto.subtle.importKey(
            "raw", base32ToBuf(TOTP_SECRET),
            { name: "HMAC", hash: "SHA-1" },
            false, ["sign"]
        );
        const sig = await crypto.subtle.sign("HMAC", key, msg);
        const hmac = new Uint8Array(sig);
        const offset = hmac[hmac.length - 1] & 0x0f;
        const otp = (
            ((hmac[offset] & 0x7f) << 24) |
            ((hmac[offset + 1] & 0xff) << 16) |
            ((hmac[offset + 2] & 0xff) << 8) |
            (hmac[offset + 3] & 0xff)
        ) % 1000000;

        if (otp.toString().padStart(6, '0') === inputCode) return true;
    }
    return false;
}
