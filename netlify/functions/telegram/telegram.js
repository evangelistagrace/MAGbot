const axios = require("axios").default;
require('dotenv').config()

const process_name = 'Send.Telegram.Notifications',
base_url = `https://cloud.uipath.com/${process.env.org_name}/${process.env.tenant_name}/orchestrator_`

let access_token='',
release_key='',
access_token_req_data = `grant_type=client_credentials&client_id=${process.env.client_id}&client_secret=${process.env.client_secret}&scope=OR.Execution+OR.Folders+OR.Jobs+OR.Machines+OR.Queues+OR.Robots`;


const url = 'https://api.telegram.org/bot';
exports.handler = async (event, context) => {
    try {
        let {case_id, case_title, case_category, case_type, case_type_detail} = JSON.parse(event.body)
    
        const res = await axios.post(`${url}${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,{
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: `[NEW CASE]\nCase#${case_id}: ${case_title}\nType: ${case_type}\nCategory: ${case_category} [${case_type_detail}]`
    
        }).then((response) => {
          let date = new Date()
            console.log("process executed at ", date) 
        })
        return {
          statusCode: 204,
          body: JSON.stringify({ message: "OK" }),
        };
      } catch (err) {
        return { statusCode: 500, body: err.toString() };
      }
}

