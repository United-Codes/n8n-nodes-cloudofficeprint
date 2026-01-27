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
                name: 'Password protect Office Documents',
                value: 'protectOfficeDocument',
                description: 'Password protect DOCX/PPTX/XLSX Document',
                action: 'Password protect DOCX/PPTX/XLSX Document',
            },
            {
                name: 'Password protect PDF',
                value: 'protectPDF',
                description: 'Protect a PDF with a password',
                action: 'Protect a PDF',
            }
        ],
        default: 'protectPDF',
    },
    ...protectOfficeDocument.description,
    ...protectPDF.description,
];
