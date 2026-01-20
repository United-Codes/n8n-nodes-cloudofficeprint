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
                resource: ['standardAOPCall'],
            },
        },
        options: [
            {
                name: 'General',
                value: 'general',
                description: 'General AOP call',
                action: 'General AOP call',
            },

        ],
        default: 'general',
    },
    ...general.description,
];
