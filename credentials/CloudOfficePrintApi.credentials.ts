import {
    IAuthenticateGeneric,
    ICredentialTestRequest,
    ICredentialType,
    Icon,
    INodeProperties,
} from 'n8n-workflow';

export class CloudOfficePrintApi implements ICredentialType {
    name = 'copApi';
    displayName = 'Cloud Office Print API';
    documentationUrl = 'https://www.apexofficeprint.com/docs/';
    icon: Icon = {
        light: 'file:../nodes/CloudOfficePrint/v1/cop.svg',
        dark: 'file:../nodes/CloudOfficePrint/v1/cop.dark.svg',
    };
    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            default: '',
            typeOptions: { password: true },
            description: 'API key from your Cloud Office Print account',
        },
        {
            displayName: 'API Base URL',
            name: 'apiBaseUrl',
            type: 'string',
            default: 'https://api.cloudofficeprint.com',
            required: true,
            description: 'The base URL of the Cloud Office Print API',
        },
        {
            displayName: 'Mode',
            name: 'mode',
            type: 'options',
            default: 'production',
            options: [
                { name: 'Development', value: 'development' },
                { name: 'Production', value: 'production' },
            ],
            description: 'In development mode, requests are marked with mode: development',
        }
    ];
    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            qs: {
                'api_key': '={{$credentials.apiKey}}'
            },
        },
    };
    test: ICredentialTestRequest = {
        request: {
            baseURL: '={{$credentials.apiBaseUrl}}',
            url: '/marco',
            method: 'GET',
        },
    };
}
