import type {
    IDataObject,
    IExecuteFunctions,
    INodeProperties,
} from 'n8n-workflow';

import {
    updateDisplayOptions,
    NodeOperationError,
    // LoggerProxy as Logger
} from 'n8n-workflow';
import { APEXOfficePrintRequest } from '../../transport';
import { getFileDesc, getFilesData } from '../../utils/file_utils';

export const properties: INodeProperties[] = [
    getFileDesc(
        'file',
        'File',
        'File to process (supports multiple files)',
        true,
        true)
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['pdfUACompliance'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);
export async function execute(this: IExecuteFunctions, index: number) {
    const files = this.getNodeParameter(`file.fileConfig`, index) as { fileSource: string; fileData: string; filename: string; mimeType: string; }[];
    if (!files || files.length === 0) {
        throw new NodeOperationError(this.getNode(), 'No file configuration found. Please add a file to the input.');
    }
    const filesData = getFilesData(files);

    const body: IDataObject = {
        append_files: filesData,
        template: {
            template_type: "converter"
        },
        files: [{
            filename: 'output.pdf',
            data: [],
        }],
        output: {
            output_converter: "openoffice",
            output_ua_compliant: true,
            output_encoding: 'base64',
            output_type: 'pdf',
        }
    };

    const responseData = await APEXOfficePrintRequest.call(this, 'POST', '', body);

    const executionData = this.helpers.constructExecutionMetaData(

        this.helpers.returnJsonArray(responseData as IDataObject),
        { itemData: { item: index } },
    );

    return executionData;
}
