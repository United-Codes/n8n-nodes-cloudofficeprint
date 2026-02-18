import {
    IHttpRequestMethods,
    IHttpRequestOptions,
    IExecuteFunctions,
    IExecuteSingleFunctions,
    ILoadOptionsFunctions,
    IPollFunctions,
    IDataObject,
    JsonObject
} from 'n8n-workflow';

import { NodeApiError } from 'n8n-workflow';

/**
 * 
 * @param this - The execute functions
 * @param method - The HTTP method
 * @param resource - The resource
 * @param body - The body
 * @param qs - The query string
 * @param url - The URL
 * @param headers - The headers
 * @param option - The options
 * @returns The response
 * @throws {NodeApiError} If the request fails
 */
export async function APEXOfficePrintRequest(
    this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IPollFunctions,
    method: IHttpRequestMethods,
    resource: string,
    body: IDataObject = {},
    qs: IDataObject = {},
    url?: string,
    headers: IDataObject = {},
    option: IDataObject = {},
) {
    const credentials = await this.getCredentials('copApi');

    const apiUrl = credentials.apiBaseUrl as string;
    const apiKey = credentials.apiKey;

    // const copLoggingData = {}
    // try{
    //     const workflowData = this.getWorkflowData();
    //     copLoggingData.platform = 'COP n8n';
    //     copLoggingData.workflow_id = workflowData.id;
    //     copLoggingData.workflow_name = workflowData.name;
    // }


    const requestBody: IDataObject = {
        ...body,
        api_key: apiKey,
        // logging: copLoggingData
    };

    const options: IHttpRequestOptions = {
        method,
        url: apiUrl,
        qs,
        body: requestBody,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },

        // 🔑 IMPORTANT FOR BASE64 / BINARY
        // @ts-expect-error asd
        encoding: null,
        returnFullResponse: true,
    };

    // Merge optional overrides (timeout, proxy, etc.)
    Object.assign(options, option);

    // Remove body for GET / empty payload
    if (!requestBody || Object.keys(requestBody).length === 0) {
        delete options.body;
    }

    try {
        const response = await this.helpers.httpRequest.call(this, options);
        return response;
    } catch (error) {
        let copErrorFile: string | undefined;
        if (error.status === 500 && error.response.data) {
            let errorDescription = ""
            if (error.response.headers['error_description']) {
                errorDescription = error.response.headers['error_description'];
                try{
                    errorDescription = Buffer.from(errorDescription, 'base64').toString('utf-8');
                }catch{
                    // do nothing
                }
                copErrorFile = error.response.data;
            }
            throw new NodeApiError(this.getNode(), {
                description: errorDescription || error.message || 'Cloud Office Print request failed',
                message: 'Error file: ' + copErrorFile,
                httpCode: error.status,

            });
        }
        throw new NodeApiError(this.getNode(), error.response as JsonObject, {
            message: error.message || 'Cloud Office Print request failed',
            httpCode: error.status
        });
    }
}
