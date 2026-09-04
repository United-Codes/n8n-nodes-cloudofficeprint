import type { INodeProperties } from 'n8n-workflow';
import * as compressPDF from './compressPDF';
import * as convertFileToPDF from './convertFileToPDF';
import * as createPDFForm from './createPDFForm';
import * as embedPDFAttachments from './embedPDFAttachments';
import * as extractPDFAttachments from './extractPDFAttachments';
import * as fillPDFForm from './fillPDFForm';
import * as mergeToPDF from './mergeToPDF';
import * as pdfToImage from './pdfToImage';
import * as watermarkPDF from './watermarkPDF';
import * as readPDFFormFields from './readPDFFormFields';
import * as splitPDF from './splitPDF';

export {
    compressPDF,
    convertFileToPDF,
    createPDFForm,
    embedPDFAttachments,
    extractPDFAttachments,
    fillPDFForm,
    mergeToPDF,
    pdfToImage,
    watermarkPDF,
    readPDFFormFields,
    splitPDF,
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
                action: 'Compress a PDF',
            },
            {
                name: 'Convert to PDF',
                value: 'convertFileToPDF',
                description: 'Turn an Office file, image or HTML document into a PDF',
                action: 'Convert a file to PDF',
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
                description: 'Join several files into one PDF, converting each of them on the way in',
                action: 'Merge files into one PDF',
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
                name: 'Read PDF Form Fields',
                value: 'readPDFFormFields',
                description: 'List the fields of a PDF form with their values, or mark their names onto the PDF',
                action: 'Read the fields of a PDF form',
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
    ...compressPDF.description,
    ...convertFileToPDF.description,
    ...createPDFForm.description,
    ...embedPDFAttachments.description,
    ...extractPDFAttachments.description,
    ...fillPDFForm.description,
    ...mergeToPDF.description,
    ...pdfToImage.description,
    ...watermarkPDF.description,
    ...readPDFFormFields.description,
    ...splitPDF.description,
];
