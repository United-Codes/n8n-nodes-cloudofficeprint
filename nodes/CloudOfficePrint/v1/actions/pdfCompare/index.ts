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
                description: 'Produce a PDF that marks every difference between an original and a changed version',
                action: 'Compare two PDF files',
            }
        ],
        default: 'pdfCompare',
    },
    ...pdfCompare.description,
];
