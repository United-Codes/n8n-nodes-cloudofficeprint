import type { INodeProperties } from 'n8n-workflow';
import * as convertFileToPDF from './convertFileToPDF';
import * as mergeToPDF from './mergeToPDF';
import * as splitPDF from './splitPDF';
import * as compressPDF from './compressPDF';
import * as watermarkPDF from './watermarkPDF';
import * as pdfToImage from './pdfToImage';
import * as readPDFFormFields from './readPDFFormFields';
import * as fillPDFForm from './fillPDFForm';
import * as createPDFForm from './createPDFForm';
import * as extractPDFAttachments from './extractPDFAttachments';
import * as embedPDFAttachments from './embedPDFAttachments';

export {
    convertFileToPDF,
    mergeToPDF,
    splitPDF,
    compressPDF,
    watermarkPDF,
    pdfToImage,
    readPDFFormFields,
    fillPDFForm,
    createPDFForm,
    extractPDFAttachments,
    embedPDFAttachments,
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
        // ordered by how often each one is reached for, with the merge/split,
        // form and attachment pairs kept next to each other
        // eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
        options: [
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
                name: 'Split PDF',
                value: 'splitPDF',
                description: 'Split a PDF into several PDFs, by page count or by text on the page',
                action: 'Split a PDF',
            },
            {
                name: 'Compress PDF',
                value: 'compressPDF',
                description: 'Compress a PDF file',
                action: "Compress PDF"
            },
            {
                name: 'PDF Watermark',
                value: 'watermarkPDF',
                description: 'Add a watermark to a PDF',
                action: 'Add a watermark to a PDF',
            },
            {
                name: 'PDF to Image',
                value: 'pdfToImage',
                description: 'Convert the pages of a PDF to JPEG images',
                action: 'Convert a PDF to images',
            },
            {
                name: 'Read PDF Form Fields',
                value: 'readPDFFormFields',
                description: 'List the fields of a PDF form with their values, or mark their names onto the PDF',
                action: 'Read the fields of a PDF form',
            },
            {
                name: 'Fill PDF Form',
                value: 'fillPDFForm',
                description: 'Fill in the form fields of an existing PDF and optionally flatten it',
                action: 'Fill a PDF form',
            },
            {
                name: 'Create PDF Form',
                value: 'createPDFForm',
                description: 'Build a fillable PDF from a Word template that contains {?form ...} tags',
                action: 'Create a PDF form',
            },
            {
                name: 'Extract Attachments From PDF',
                value: 'extractPDFAttachments',
                description: 'Get the files attached inside a PDF',
                action: 'Extract attachments from a PDF',
            },
            {
                name: 'Embed Attachments in PDF',
                value: 'embedPDFAttachments',
                description: 'Attach one or more files inside a PDF',
                action: 'Embed attachments in a PDF',
            },
        ],
        default: 'convertFileToPDF',
    },
    ...convertFileToPDF.description,
    ...mergeToPDF.description,
    ...splitPDF.description,
    ...compressPDF.description,
    ...watermarkPDF.description,
    ...pdfToImage.description,
    ...readPDFFormFields.description,
    ...fillPDFForm.description,
    ...createPDFForm.description,
    ...extractPDFAttachments.description,
    ...embedPDFAttachments.description,
];
