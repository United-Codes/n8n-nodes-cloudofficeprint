import type { INodeProperties } from 'n8n-workflow';
import * as singlePagePDF from './singlePagePDF';
import * as pdfACompliance from './pdfACompliance';
import * as pdfUACompliance from './pdfUACompliance';
import * as protectPDF from './protectPDF';
import * as removeLastPage from './removeLastPage';
import * as watermarkPDF from './watermarkPDF';

export { singlePagePDF, pdfACompliance, pdfUACompliance, protectPDF, removeLastPage, watermarkPDF };

export const description: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['pdfOperations'],
            },
        },
        options: [
            {
                name: 'pdfACompliance',
                value: 'pdfACompliance',
                description: 'Make a PDF PDF/A compliant',
                action: 'Make a PDF PDF/A compliant',
            },
            {
                name: 'pdfUACompliance',
                value: 'pdfUACompliance',
                description: 'Make a PDF PDF/UA compliant',
                action: 'Make a PDF PDF/UA compliant',
            },
            {
                name: 'protectPDF',
                value: 'protectPDF',
                description: 'Protect a PDF with a password',
                action: 'Protect a PDF',
            },
            {
                name: 'removeLastPage',
                value: 'removeLastPage',
                description: 'Remove last page from a PDF',
                action: 'Remove last page from a PDF',
            },
            {
                name: 'singlePagePdf',
                value: 'singlePagePDF',
                description: 'Convert to a single-page PDF',
                action: 'Convert to a single page pdf',

            },
            {
                name: 'watermarkPDF',
                value: 'watermarkPDF',
                description: 'Add a watermark to a PDF',
                action: 'Add a watermark to a PDF',
            },

        ],
        default: 'singlePagePDF',
    },
    ...singlePagePDF.description,
    ...pdfACompliance.description,
    ...pdfUACompliance.description,
    ...protectPDF.description,
    ...removeLastPage.description,
    ...watermarkPDF.description,
];
