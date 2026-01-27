import type { INodeProperties } from 'n8n-workflow';
import * as singlePagePDF from './singlePagePDF';
import * as watermarkPDF from './watermarkPDF';
import * as pdfMetadata from './pdfMetadata';

export { singlePagePDF, watermarkPDF, pdfMetadata };

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
                name: 'PDF Metadata',
                value: 'pdfMetadata',
                description: 'Get PDF metadata',
                action: 'Get PDF metadata',
            },
            {
                name: 'PDF Watermark',
                value: 'watermarkPDF',
                description: 'Add a watermark to a PDF',
                action: 'Add a watermark to a PDF',
            },
            {
                name: 'Single Page PDF',
                value: 'singlePagePDF',
                description: 'Convert to a single-page PDF',
                action: 'Convert to a single page pdf',

            },
        ],
        default: 'singlePagePDF',
    },
    ...singlePagePDF.description,
    ...pdfMetadata.description,
    ...watermarkPDF.description,
];
