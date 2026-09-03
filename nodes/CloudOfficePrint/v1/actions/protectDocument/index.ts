import type { INodeProperties } from 'n8n-workflow';
import * as protectOfficeDocument from "./protectOfficeDoc";
import * as protectPDF from "./protectPDF";

export { protectOfficeDocument, protectPDF };

export const description: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['protectDocument'],
            },
        },
        options: [
            {
                name: 'Password Protect Office Document',
                value: 'protectOfficeDocument',
                description: 'Encrypt a Word, Excel or PowerPoint file so a password is needed to open it',
                action: 'Password protect an office document',
            },
            {
                name: 'Password Protect PDF',
                value: 'protectPDF',
                description: 'Set an open password, an edit password, or both, on a PDF',
                action: 'Protect a PDF',
            }
        ],
        default: 'protectPDF',
    },
    ...protectOfficeDocument.description,
    ...protectPDF.description,
];
