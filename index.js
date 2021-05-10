// https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=201014&date=10-05-2021

// CRON_JOB

// 1. x = api_response()
// 2. iterate over the response where min_age_limit >= 18 available capacity > 0
// 3. if true, send a message to telegram, https://api.telegram.org/bot1721531739:AAFnHqM2JHY6BOlZgiChxC6RjSeVEgiydSc/sendMessage?chat_id=@shan2newCowinAlerts&text=There%20are%20slots%20available

const moment = require("moment-timezone");
const fetch = require("node-fetch")

const sendMessageToTelegramGroup = (text) => {
    if(!text) {
        console.log("No slot found");
        return;
    }
    const TELEGRAM_ALERT_GROUP =
    "https://api.telegram.org/bot1721531739:AAFnHqM2JHY6BOlZgiChxC6RjSeVEgiydSc/sendMessage?chat_id=@shan2newCowinAlerts&parse_mode=markdown&text=";

    fetch(TELEGRAM_ALERT_GROUP + text);
}

// sendMessageToTelegramGroup("Hi");

const fetchCowinData = async () => {
    const currentDate = moment().tz("Asia/Kolkata").format("DD-MM-YYYY");
    const tomorrowDate = moment()
      .add(1, "days")
      .tz("Asia/Kolkata")
      .format("DD-MM-YYYY");

  
    const COWIN_CALENDER_BY_PIN_API =
      "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=201014&date=";
  
    const cowinTodayData = await fetch(COWIN_CALENDER_BY_PIN_API + currentDate, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36 Edg/90.0.818.56"
        }
    }).then((res) => {
      return res.json();
    }).catch((err) => {
        console.error("An error occurred in cowinTodayData:", err)
    })

    const cowinTomorrowData =  await fetch(COWIN_CALENDER_BY_PIN_API + tomorrowDate, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36 Edg/90.0.818.56"
        }
    }).then((res) => {
        return res.json();
    }).catch((err) => {
        console.log("An error occurred in cowinTomorrowData:", err)
    })

    return [cowinTodayData, cowinTomorrowData];
}

const formatCowinData = (cowinTodayData) => {
    // return
    
    // Center Name, numbers of slots
    
    let returnText = `
Update regarding slots availability:
    `

    let foundSlot = false;

    if(cowinTodayData && cowinTodayData.centers) {
        cowinTodayData.centers.map((centerDTO) => {
            // name

            let total_valid_sessions =  centerDTO.sessions.filter((session) => {
                return session.min_age_limit == 18 && session.available_capacity > 0 
            });

            if(total_valid_sessions.length > 0) {
                returnText += `\n
*${centerDTO.name}* has ${total_valid_sessions.length} slots\n`
                foundSlot = true;
            }
        })
    }

    // console.log(cowinTodayData);

    if(foundSlot) {
        return returnText;
    } else {
        return null
    } 
}

const runCode = async () => {
    [cowinTodayData, cowinTomorrowData] = await fetchCowinData();
    let sendingText = formatCowinData(cowinTodayData);
    sendMessageToTelegramGroup(sendingText);
};



runCode();