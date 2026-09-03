import type { INodeProperties } from 'n8n-workflow';
import * as general from './general';


export { general };

export const description: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['documentGeneration'],
            },
        },
        options: [
            {
                name: 'Document Generation',
                value: 'general',
                description: 'Fill a template with your data and render it to PDF, Office, HTML and more',
                action: 'Generate a document from a template',
            },

        ],
        default: 'general',
    },
    ...general.description,
];
