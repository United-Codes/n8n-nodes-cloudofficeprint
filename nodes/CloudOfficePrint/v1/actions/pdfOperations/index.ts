import type { INodeProperties } from 'n8n-workflow';
import * as watermarkPDF from './watermarkPDF';
import * as convertFileToPDF from './convertFileToPDF';
import * as mergeToPDF from './mergeToPDF';
import * as compressPDF from './compressPDF';
import * as splitPDF from './splitPDF';
import * as fillPDFForm from './fillPDFForm';
import * as createPDFForm from './createPDFForm';
import * as pdfToImage from './pdfToImage';
import * as embedPDFAttachments from './embedPDFAttachments';
import * as extractPDFAttachments from './extractPDFAttachments';

export {
    watermarkPDF,
    convertFileToPDF,
    mergeToPDF,
    compressPDF,
    splitPDF,
    fillPDFForm,
    createPDFForm,
    pdfToImage,
    embedPDFAttachments,
    extractPDFAttachments,
};

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
                name: 'Create PDF Form',
                value: 'createPDFForm',
                description: 'Build a fillable PDF from a Word template that contains {?form ...} tags',
                action: 'Create a PDF form',
            },
            {
                name: 'Embed Attachments in PDF',
                value: 'embedPDFAttachments',
                description: 'Attach one or more files inside a PDF',
                action: 'Embed attachments in a PDF',
            },
            {
                name: 'Extract Attachments From PDF',
                value: 'extractPDFAttachments',
                description: 'Get the files attached inside a PDF',
                action: 'Extract attachments from a PDF',
            },
            {
                name: 'Fill PDF Form',
                value: 'fillPDFForm',
                description: 'Fill in the form fields of an existing PDF and optionally flatten it',
                action: 'Fill a PDF form',
            },
            {
                name: 'Merge to Single PDF File',
                value: 'mergeToPDF',
                description: 'Convert and merge files to PDF',
                action: "Merge to PDF"
            },
            {
                name: 'PDF to Image',
                value: 'pdfToImage',
                description: 'Convert the pages of a PDF to JPEG images',
                action: 'Convert a PDF to images',
            },
            {
                name: 'PDF Watermark',
                value: 'watermarkPDF',
                description: 'Add a watermark to a PDF',
                action: 'Add a watermark to a PDF',
            },
            {
                name: 'Split PDF',
                value: 'splitPDF',
                description: 'Split a PDF into several PDFs, by page count or by text on the page',
                action: 'Split a PDF',
            },
        ],
        default: 'convertFileToPDF',
    },
    ...watermarkPDF.description,
    ...convertFileToPDF.description,
    ...mergeToPDF.description,
    ...compressPDF.description,
    ...splitPDF.description,
    ...fillPDFForm.description,
    ...createPDFForm.description,
    ...pdfToImage.description,
    ...embedPDFAttachments.description,
    ...extractPDFAttachments.description,
];
