const axios = require("axios").default;
require('dotenv').config()

const process_name = 'CRM.Ticket.Assignment',
base_url = `https://cloud.uipath.com/${process.env.tm_org_name}/${process.env.tm_tenant_name}/orchestrator_`

let access_token='',
    release_key='',
    access_token_req_data = `grant_type=client_credentials&client_id=${process.env.tm_client_id}&client_secret=${process.env.tm_client_secret}&scope=OR.Execution+OR.Folders+OR.Jobs+OR.Machines+OR.Queues+OR.Robots`

exports.handler = async (event, context) => {
    try {
        let {case_id, case_title, case_category, case_type, case_detail} = JSON.parse(event.body)

        /* GET ACCESS TOKEN */
        let response = await axios.post('https://cloud.uipath.com/identity_/connect/token', access_token_req_data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })

        access_token = response.data.access_token

        console.log('access_token: ', access_token)
        
        /* GET RELEASE KEY */
        response = await axios.get(`${base_url}/odata/Releases?$filter=ProcessKey etm_q \'${process_name_}\'`, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'X-UIPATH-OrganizationUnitId': process.env.tm_org_unit_id
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
                "InputArguments": `{'case_id': '${case_id}', 'case_title': '${case_title}', 'case_category': '${case_category}', 'case_type': '${case_type}', 'case_detail': '${case_detail}'}`
            } 
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'X-UIPATH-OrganizationUnitId': process.env.tm_org_unit_id,
                'X-UIPATH-Tenant': process.env.tm_tenant_name
            }
        })

        if (response.status == '201' && response.statusText=='Created') {
            console.log('Job started!')
        }

        console.log(response.status, response.statusText)
        console.log("case id: " + case_id, case_title, case_category, case_type, case_type_detail)

        return {
            statusCode: 204,
            body: JSON.stringify({ message: "OK" }),
        }

    } catch (err) {
        return { statusCode: 500, body: err.toString() };
    }
}

