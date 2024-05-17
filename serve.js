const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config()
const token = process.env.TELEGRAMAPI;
const bot = new TelegramBot(token, { polling: true });
const api = require("./utils/apis")

const bot_tittle = '@Tonspay_status_bot '

var listener = {}
bot.on('message', async(msg) => {
    try {
        if (msg["reply_to_message"]) {
            console.log(msg)
        } else {
            await router(msg)
        }
    } catch (e) {
        console.log(e);
    }

});

bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
    };
    try {
        await callBackRouter(msg, action, opts);
    } catch (e) {
        console.log(e);
    }

});


async function router(data) {
    const uid = data.chat.id;
    listener[uid]=0;
    const req = data.text
    switch (req) {
        case "/start": case bot_tittle+"start":
            await start_menu(uid);
            break;
        case "/menu":case bot_tittle+"menu":
            await start_menu(uid);
            break;
        case "/ping_pro":case bot_tittle+"ping_pro":
            await ping_menu(uid,true);
            break;
        case "/function_test_pro":case bot_tittle+"function_test_pro":
            await function_test_menu(uid,true);
            break;
        case "/ping_test":case bot_tittle+"ping_test":
            await ping_menu(uid,false);
            break;
        case "/function_test_test":case bot_tittle+"function_test_test":
            await function_test_menu(uid,false);
            break;
        default:
            break;
    }
}

async function callBackRouter(data, action, opts) {
    const uid = data.chat.id;
    const req = action;
    switch (req) {
        case "/start":
            await start_menu(uid);
            break;
        case "/menu":
            await start_menu(uid);
            break;
        case "/ping_pro":
            await ping_menu(uid,true);
            break;
        case "/function_test_pro":
            await function_test_menu(uid,true);
            break;
        case "/ping_test":
            await ping_menu(uid,false);
            break;
        case "/function_test_test":
            await function_test_menu(uid,false);
            break;
        default:
            break;
    }
    // bot.deleteMessage(opts.chat_id, opts.message_id);
}

async function start_menu(uid)
{
    return await bot.sendMessage(uid, `🚧 Welcome to tonspay status checking bot 🚧

This bot can help you check the \`ProductionEVN\` & \`TestENV\` of Tonspay service in realtime.

You can \`@me command\` to see the status .

Commands support :

\`ping_pro\`
\`function_test_pro\`
\`ping_test\`
\`function_test_test\`

    `, {
        parse_mode: 'MarkDown',
        disable_web_page_preview: "true",
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{
                    "text": 'Ping Production ENV',
                    callback_data:'/ping_pro'
                }],
                [{
                    "text": 'Function Test Production ENV',
                    callback_data:'/function_test_pro'
                }],
                [{
                    "text": 'Ping Test ENV',
                    callback_data:'/ping_test'
                }],
                [{
                    "text": 'Function Test Test ENV',
                    callback_data:'/function_test_test'
                }],
                
            ]
        })
    });
}

async function ping_menu(uid,env)
{

    var ret_data = {
        msg_env : "",
        status : false,
        status_logo : false,
        check_time : Date.now()
    }
    if(env)
    {
        ret_data.msg_env = 'Production ENV'
    }else
    {
        ret_data.msg_env = 'Test ENV'
    }
    
    var ping = false;
    try{
        ping = await api.ping(env);
    }catch(e){}
    
    if(ping && ping.code == 200 &&  ping.data&& ping.data.createTime)
    {
        ret_data.status = 'Active',
        ret_data.status_logo = '🟢'
        ret_data.check_time = ping.data.createTime
    }else{
        ret_data.status = 'InActive',
        ret_data.status_logo = '🔴'
    }

    const ret = 
    `${ret_data.status_logo} Tonspay Server \`${ret_data.status}\`

ENV : \`${ret_data.msg_env}\`

Update Time : \`${ret_data.check_time}\`
    `

    return await bot.sendMessage(uid, ret, {
        parse_mode: 'MarkDown',
        disable_web_page_preview: "true",
        reply_markup: JSON.stringify({
            inline_keyboard: []
        })
    });
}

async function function_test_menu(uid,env)
{
    var ret_data = {
        ret_data:false,
        status : false,
        status_logo : false,
        check_time : Date.now()
    }
    if(env)
    {
        ret_data.msg_env = 'Production ENV'
    }else
    {
        ret_data.msg_env = 'Test ENV'
    }
    var ping = false;
    try{
        ping = await api.getMethod(env);
    }catch(e){}
    
    if(ping && ping.code == 200 &&  ping.data)
    {
        ret_data.status = 'Active',
        ret_data.status_logo = '🟢'
    }else{
        ret_data.status = 'InActive',
        ret_data.status_logo = '🔴'
    }

    const ret = 
    `${ret_data.status_logo} Tonspay Server \`${ret_data.status}\`

ENV : \`${ret_data.msg_env}\`

Update Time : \`${ret_data.check_time}\`
    `

    return await bot.sendMessage(uid, ret, {
        parse_mode: 'MarkDown',
        disable_web_page_preview: "true",
        reply_markup: JSON.stringify({
            inline_keyboard: []
        })
    });
}

function sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

async function loop()
{
    console.log("🚧 Loop listener start up")
    while(true)
    {
        var ping_pro = false
        var function_pro = false
        try{
            ping_pro = await api.ping(true);
            function_pro = await api.getMethod(true);
        }catch(e){}
        if(ping_pro && ping_pro.code == 200 && ping_pro.data &&function_pro && function_pro.code == 200 && function_pro.data)
        {}else{
            const alerts = Object.keys(listener)
            for(var i = 0; i < alerts.length ; i++)
            {
                await function_test_menu(alerts[i],true);
            }
            break;
        }
        await sleep(60000)
    }
}

loop()