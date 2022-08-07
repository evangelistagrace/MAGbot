const axios = require("axios").default;
require('dotenv').config()

const process_name = 'Send.Telegram.Notifications',
base_url = `https://cloud.uipath.com/${process.env.org_name}/${process.env.tenant_name}/orchestrator_`

let access_token='',
release_key='',
access_token_req_data = `grant_type=client_credentials&client_id=${process.env.client_id}&client_secret=${process.env.client_secret}&scope=OR.Execution+OR.Folders+OR.Jobs+OR.Machines+OR.Queues+OR.Robots`;

exports.handler = async (event, context) => {
    try {
        /* GET ACCESS TOKEN */
        let response = await axios.post('https://cloud.uipath.com/identity_/connect/token', access_token_req_data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })

        access_token = response.data.access_token

        console.log('access_token: ', access_token)
        
        /* GET RELEASE KEY */
        response = await axios.get(`${base_url}/odata/Releases?$filter=ProcessKey eq \'${process_name}\'`, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'X-UIPATH-OrganizationUnitId': process.env.org_unit_id
            }
        })

        release_key = response.data.value[0]['Key']

        console.log('release_key: ', release_key)

        /* START JOB */
        response = await axios.post(`${base_url}/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs`, {
            "startInfo": {
                "ReleaseKey": release_key,
                "Strategy": "ModernJobsCount",
                "JobsCount": "1",
                "InputArguments": "{'textArg': 'Hello from app'}"
            } 
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'X-UIPATH-OrganizationUnitId': process.env.org_unit_id,
                'X-UIPATH-Tenant': process.env.tenant_name
            }
        })

        if (response.status == '201' && response.statusText=='Created') {
            console.log('Job started!')
        }

    } catch (err) {
        console.log(err)
    }
}

