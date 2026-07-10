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
                name: 'Compare Two PDF Files',
                value: 'pdfCompare',

                action: 'Compare two PDF files',
            }
        ],
        default: 'pdfCompare',
    },
    ...pdfCompare.description,
];
