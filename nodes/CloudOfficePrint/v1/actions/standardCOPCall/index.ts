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
                description: 'Document generation with template',
                action: 'Document generation with template',
            },

        ],
        default: 'general',
    },
    ...general.description,
];
