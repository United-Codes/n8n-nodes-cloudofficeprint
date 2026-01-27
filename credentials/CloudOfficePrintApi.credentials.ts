/* eslint-disable @n8n/community-nodes/icon-validation */
import {
    IAuthenticateGeneric,
    Icon,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

// eslint-disable-next-line @n8n/community-nodes/credential-test-required
export class CloudOfficePrintApi implements ICredentialType {
    name = 'copApi';
    displayName = 'Cloud Office Print API';
    // Uses the link to this tutorial as an example
    // Replace with your own docs links when building your own nodes
    documentationUrl = 'https://apexofficeprint.com/docs/api/';
    icon: Icon = { light: 'file:../icons/cop.svg', dark: 'file:../icons/cop.dark.svg' }
    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            default: '',
            typeOptions: { password: true },
        },
        {
            displayName: 'API Base URL',
            name: 'apiBaseUrl',
            type: 'string',
            default: 'https://api.cloudofficeprint.com',
            required: true,
            description: 'The base URL of the Cloud Office Print API',
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
}