import type { INodeProperties } from 'n8n-workflow';
import * as pdfCompare from "./pdfCompare";

export { pdfCompare };

export const description: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['pdfCompare'],
            },
        },
        options: [
            {
                name: 'Compare two pdf',
                value: 'pdfCompare',
                description: 'Compare two pdf',
                action: 'Compare two pdf',
            }
        ],
        default: 'pdfCompare',
    },
    ...pdfCompare.description,
];
