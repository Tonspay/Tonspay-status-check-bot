const req = require("./request");

require('dotenv').config()

const publicEnv = 'https://api.tonspay.top/'
const testEnv = 'https://test-api.tonspay.top/'

const router = {
    ping: 'ping',
    invoice: 'invoice/new',
    getMethod : 'setting/paymentmethod/get',
}

function baseUrl(env)
{
    if(env)
    {
        return publicEnv
    }else
    {
        return testEnv
    }
}

function authToken(env)
{
    if(env)
    {
        return process.env.MERCHANT_KEY_PRO
    }else
    {
        return process.env.MERCHANT_KEY_DEV
    }
}

async function ping(env) {
    var options = {
        'method': 'GET',
        'url': baseUrl(env)+router.ping,
        'headers': {
            'token':authToken(env),
            'Content-Type': 'application/json'
        },
    };
    return req.doRequest(options);
}

async function getMethod(env) {
    var options = {
        'method': 'GET',
        'url': baseUrl(env)+router.getMethod,
        'headers': {
            'token':authToken(env),
            'Content-Type': 'application/json'
        },
    };
    return req.doRequest(options);
}
module.exports = {
    ping,
    getMethod
}