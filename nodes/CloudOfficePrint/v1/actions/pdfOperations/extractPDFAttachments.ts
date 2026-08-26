import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc } from '../../descriptions/common.description';
import { fileFieldNames, getFileFields, pdfTemplateSources, resolveTemplate } from '../../utils/file_utils';
import { toNodeOutput } from '../../utils/output_utils';

const supportedTypes = ['pdf'];
const fileNames = fileFieldNames();

export const properties: INodeProperties[] = [
    ...getFileFields(fileNames, supportedTypes, '', pdfTemplateSources),
    {
        displayName: 'Attachment Name',
        name: 'attachmentName',
        type: 'string',
        default: '',
        placeholder: 'e.g. invoice.xml',
        description: 'Return only this attachment. Leave empty to return every attachment, which comes back as a zip when there is more than one.',
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
    const template = await resolveTemplate(this, index, fileNames, supportedTypes, pdfTemplateSources);
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

    // one attachment comes back as itself, several as a zip
    return await toNodeOutput(this, index, responseData, outputFileName, 'zip');
}
