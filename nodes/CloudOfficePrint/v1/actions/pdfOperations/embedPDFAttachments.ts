import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions, NodeOperationError } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc } from '../../descriptions/common.description';
import {
    appendPrependFileSupportedType,
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
// the API never fetches an attachment: `attachments` is left out of loadAllFileData
// and handed to pdfbox.embedFiles as-is, which reads file_content only
const attachmentSources: FileSource[] = ['binary', 'base64'];

export const properties: INodeProperties[] = [
    ...getFileFields(pdfNames, supportedTypes, 'PDF'),
    getFileCollectionDesc(
        'attachment',
        'Attachments',
        'Files to embed in the PDF (supports multiple files)',
        appendPrependFileSupportedType,
        attachmentSources,
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
    const attachments = await resolveFileList(this, index, entries, appendPrependFileSupportedType, attachmentSources);

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
