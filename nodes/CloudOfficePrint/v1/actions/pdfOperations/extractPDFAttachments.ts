import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc } from '../../descriptions/common.description';
import { fileFieldNames, getFileFields, resolveTemplate } from '../../utils/file_utils';
import { toNodeOutput } from '../../utils/output_utils';

const supportedTypes = ['pdf'];
const fileNames = fileFieldNames();

export const properties: INodeProperties[] = [
    ...getFileFields(fileNames, supportedTypes),
    {
        displayName: 'Attachment Name',
        name: 'attachmentName',
        type: 'string',
        default: '',
        placeholder: 'e.g. invoice.xml',
        description: 'Name of the single attachment to return. Leave empty to get them all - one attachment comes back on its own, several come back together as a zip. See <a href="https://www.apexofficeprint.com/docs/pdf-operations/pdf-attachements/">PDF attachments</a>.',
    },
    outputFileNameDesc,
    outputBinaryPropertyDesc,
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['extractPDFAttachments'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
    const template = await resolveTemplate(this, index, fileNames, supportedTypes);
    const attachmentName = this.getNodeParameter('attachmentName', index, '') as string;
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    const body: IDataObject = {
        template,
        files: [{
            filename: outputFileName,
            data: [],
        }],
        output: {
            output_type: 'get_attachments',
            output_encoding: 'base64',
            ...(attachmentName && { output_attachment_name: attachmentName }),
        },
    };

    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    // several attachments come back as a zip; one comes back as itself, and the
    // response content type names it
    return await toNodeOutput(this, index, responseData, outputFileName, 'zip');
}
