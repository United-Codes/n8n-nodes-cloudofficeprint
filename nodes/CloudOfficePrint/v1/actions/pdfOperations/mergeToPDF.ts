import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions, NodeOperationError } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc } from '../../descriptions/common.description';
import {
    appendPrependFileSupportedType,
    getFileCollectionDesc,
    resolveFileList,
} from '../../utils/file_utils';
import { toNodeOutput } from '../../utils/output_utils';

export const properties: INodeProperties[] = [
    getFileCollectionDesc(
        'file',
        'Files',
        'Files to join into one PDF, in the order listed. Click Add Files once per file; each picks its own source, so a link and an uploaded file can be merged together. Office files and images are converted on the way in.',
        appendPrependFileSupportedType,
    ),
    outputFileNameDesc,
    outputBinaryPropertyDesc,
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['mergeToPDF'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
    const entries = this.getNodeParameter('file.fileConfig', index, null) as IDataObject[] | null;
    if (!entries || entries.length === 0) {
        throw new NodeOperationError(this.getNode(), 'No files found. Please add at least one file to merge.');
    }

    const files = await resolveFileList(this, index, entries, appendPrependFileSupportedType);
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    const body: IDataObject = {
        // converter template: inputs are converted and appended to the output PDF
        template: { template_type: 'converter' },
        append_files: files,
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
