import {
    IHttpRequestMethods,
    IHttpRequestOptions,
    IExecuteFunctions,
    IExecuteSingleFunctions,
    ILoadOptionsFunctions,
    IPollFunctions,
    IDataObject,
    JsonObject,
    NodeApiError,
} from 'n8n-workflow';

/**
 * Decodes a Base64 header value. Buffer.from never throws on bad input, it returns
 * mojibake, so the encoding is checked first rather than caught after.
 */
function decodeBase64(value: string): string {
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return value;
    return Buffer.from(value, 'base64').toString('utf-8');
}

/** Sends a request to the Cloud Office Print API with the credential's api key and mode applied. */
export async function CloudOfficePrintRequest(
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
    const mode = credentials.mode as string;

    const requestBody: IDataObject = {
        ...body,
        api_key: apiKey,
        ...(mode === 'development' && { mode: 'development' }),
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
        // @ts-expect-error not in the type, but keeps the base64 response body unparsed
        encoding: null,
        returnFullResponse: true,
    };

    Object.assign(options, option);

    if (!requestBody || Object.keys(requestBody).length === 0) {
        delete options.body;
    }

    let debugMode = false;
    try {
        debugMode = (this as IExecuteFunctions).getNodeParameter('debugMode', 0, false) as boolean;
    } catch {
        // parameter not available in this context (e.g. load options)
    }
    if (debugMode) {
        return {
            ...requestBody,
            api_key: apiKey ? '<redacted>' : '',
        };
    }

    try {
        const response = await this.helpers.httpRequest.call(this, options);
        return response;
    } catch (error) {
        const response = error.response as { status?: number; headers?: IDataObject } | undefined;
        const status = error.status ?? response?.status;

        const errorResponse = (response ?? error) as JsonObject;
        const httpCode = status === undefined ? undefined : String(status);

        const encoded = response?.headers?.error_description;
        if (encoded) {
            throw new NodeApiError(this.getNode(), errorResponse, {
                message: 'Cloud Office Print could not process the request',
                description: decodeBase64(String(encoded)),
                httpCode,
            });
        }
        throw new NodeApiError(this.getNode(), errorResponse, {
            message: error.message || 'Cloud Office Print request failed',
            httpCode,
        });
    }
}
