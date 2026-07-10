import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions, NodeOperationError } from 'n8n-workflow';

import { APEXOfficePrintRequest } from '../../transport';
import { getFileDesc, getFilesData, appendPrependFileSupportedType, type FileNodeParameters } from '../../utils/file_utils';

export const properties: INodeProperties[] = [
    getFileDesc(
        'file',
        'Files',
        'Files to merge (supports multiple files)',
        true,
        true,
        appendPrependFileSupportedType,
    ),
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['mergeToPDF'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
    const files = this.getNodeParameter('file.fileConfig', index, null) as FileNodeParameters[] | null;
    if (!files || files.length === 0) {
        throw new NodeOperationError(this.getNode(), 'No files found. Please add at least one file to merge.');
    }

    // The first file acts as the template; the rest are appended to the output PDF.
    const [firstFile, ...restFiles] = files;
    const body: IDataObject = {
        template: getFilesData(firstFile),
        append_files: getFilesData(restFiles),
        files: [{
            filename: 'output.pdf',
            data: [],
        }],
        output: {
            output_type: 'pdf',
            output_encoding: 'base64',
        },
    };

    const responseData = await APEXOfficePrintRequest.call(this, 'POST', '', body);

    return this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData as IDataObject),
        { itemData: { item: index } },
    );
}
