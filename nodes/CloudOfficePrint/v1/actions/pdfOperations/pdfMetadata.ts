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
        'template',
        'File',
        'File to process',
        false,
        true)
];
// TODO:
// - [ ] For template show the file region always
// - [ ] For file template type should be PDF


const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['pdfMetadata'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
    let template = {};
    try {
        const files = this.getNodeParameter('template.fileConfig', index) as { fileSource: string; fileData: string; filename: string; mimeType: string; }[];
        template = getFilesData(files);
    } catch (error) {
        if(error instanceof Error && error.message.includes('Could not get parameter')) {
            throw new NodeOperationError(this.getNode(), 'No file configuration found. Please add a file to the input.');
        }
        throw new error;
    }
    const body: IDataObject = {
        template: template,
        files: [{
            filename: 'output.json',
            data: [],
        }],
        output: {
            output_type: "meta_data",
            output_encoding: 'raw',
        }
    };
    const responseData = await APEXOfficePrintRequest.call(this, 'POST', '', body);

    const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData as IDataObject),
        { itemData: { item: index } },
    );

    return executionData;
}
