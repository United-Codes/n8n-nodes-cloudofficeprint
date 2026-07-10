import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from 'n8n-workflow';

import { getFileDesc } from '../../utils/file_utils';
import { runFileToPdf } from './runFileToPdf';

export const properties: INodeProperties[] = [
    getFileDesc(
        'template',
        'File',
        'PDF file to compress',
        false,
        true,
        ['pdf'],
    ),
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['compressPDF'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
    return runFileToPdf(this, index, 'template', { output_compress_pdf: true });
}
