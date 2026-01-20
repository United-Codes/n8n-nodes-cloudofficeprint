import type {
    IDataObject,
    IExecuteFunctions,
    INodeProperties,
} from 'n8n-workflow';

import { getFileDesc, getFilesData } from '../../utils/file_utils';

import {
    updateDisplayOptions,
    NodeOperationError,
    // LoggerProxy as Logger
} from 'n8n-workflow';

import { APEXOfficePrintRequest } from '../../transport';


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
        operation: ['pdfACompliance'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);
export async function execute(this: IExecuteFunctions, index: number) {
    const files = this.getNodeParameter('file.fileConfig', index) as { fileSource: string; fileData: string; filename: string; mimeType: string; }[];
    if (!files || files.length === 0) {
        throw new NodeOperationError(this.getNode(), 'No file configuration found. Please add a file to the input.');
    }
    const filesData = getFilesData(files);


    const body: IDataObject = {
        prepend_files: filesData,
        template: {
            template_type: "converter"
        },
        files: [{
            filename: 'output.pdf',
            data: [],
        }],
        output: {
            output_converter: "openoffice",
            output_convert_to_pdfa: "1b",
            output_type: 'pdf',
            output_encoding: 'base64',
        }
    };
    // const responseData = body
    const responseData = await APEXOfficePrintRequest.call(this, 'POST', '', body);

    const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData as IDataObject),
        { itemData: { item: index } },
    );

    return executionData;
}
