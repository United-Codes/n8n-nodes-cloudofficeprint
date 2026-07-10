import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from 'n8n-workflow';

import { getFileDesc, templateSupportedType } from '../../utils/file_utils';
import { runFileToPdf } from './runFileToPdf';

export const properties: INodeProperties[] = [
    getFileDesc(
        'template',
        'File',
        'File to convert to a single page PDF',
        false,
        true,
        templateSupportedType,
    ),
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['singlePagePDF'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
    return runFileToPdf(this, index, 'template', { output_type: 'onepagepdf' });
}
