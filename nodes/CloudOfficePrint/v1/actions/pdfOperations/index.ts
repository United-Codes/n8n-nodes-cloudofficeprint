import type { INodeProperties } from 'n8n-workflow';
import * as singlePagePDF from './singlePagePDF';
import * as watermarkPDF from './watermarkPDF';
import * as pdfMetadata from './pdfMetadata';
import * as convertFileToPDF from './convertFileToPDF';
import * as mergeToPDF from './mergeToPDF';
import * as compressPDF from './compressPDF';

export { singlePagePDF, watermarkPDF, pdfMetadata, convertFileToPDF, mergeToPDF, compressPDF };

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
                name: 'Compress PDF',
                value: 'compressPDF',
                description: 'Compress a PDF file',
                action: "Compress PDF"
            },
            {
                name: 'Convert to PDF',
                value: 'convertFileToPDF',
                description: 'Convert files to PDF',
                action: "Convert to PDF"
            },
            {
                name: 'Merge to Single PDF File',
                value: 'mergeToPDF',
                description: 'Convert and merge files to PDF',
                action: "Merge to PDF"
            },
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
    ...convertFileToPDF.description,
    ...mergeToPDF.description,
    ...compressPDF.description
];
