import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions, NodeOperationError } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc } from '../../descriptions/common.description';
import {
    attachmentSupportedType,
    fileFieldNames,
    getFileCollectionDesc,
    getFileFields,
    resolveFileList,
    resolveTemplate,
} from '../../utils/file_utils';
import type { FileSource } from '../../descriptions/common.description';
import { toNodeOutput } from '../../utils/output_utils';

const supportedTypes = ['pdf'];
const pdfNames = fileFieldNames('pdf');
const attachmentSources: FileSource[] = ['binary', 'base64'];
const withFileName = true;

export const properties: INodeProperties[] = [
    ...getFileFields(pdfNames, supportedTypes, 'PDF'),
    getFileCollectionDesc(
        'attachment',
        'Attachments',
        'Files to attach inside the PDF. Click Add Attachments once per file; each picks its own source. Attachments cannot come from a URL - the server does not fetch them.',
        attachmentSupportedType,
        attachmentSources,
        withFileName,
    ),
    outputFileNameDesc,
    outputBinaryPropertyDesc,
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['embedPDFAttachments'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
    const template = await resolveTemplate(this, index, pdfNames, supportedTypes);

    const entries = this.getNodeParameter('attachment.fileConfig', index, null) as IDataObject[] | null;
    if (!entries || entries.length === 0) {
        throw new NodeOperationError(this.getNode(), 'No attachments found. Please add at least one file to embed.', { itemIndex: index });
    }
    const attachments = await resolveFileList(this, index, entries, attachmentSupportedType, attachmentSources);

    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    const body: IDataObject = {
        template,
        attachments,
        files: [{
            filename: outputFileName,
            data: [],
        }],
        output: {
            output_type: 'pdf',
            output_encoding: 'base64',
        },
    };

    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    return await toNodeOutput(this, index, responseData, outputFileName, 'pdf');
}
