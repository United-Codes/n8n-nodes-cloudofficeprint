import type {
    IDataObject,
    IExecuteFunctions,
    INodeProperties,
} from 'n8n-workflow';

import {
    updateDisplayOptions,
    NodeOperationError,
} from 'n8n-workflow';

import { APEXOfficePrintRequest } from '../../transport';
import { getFileDesc, getFilesData, type FileNodeParameters } from '../../utils/file_utils';

export const properties: INodeProperties[] = [
    getFileDesc(
        'template',
        'File',
        'PDF file to read metadata from',
        false,
        true,
        ['pdf'],
    ),
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['pdfMetadata'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
    const files = this.getNodeParameter('template.fileConfig', index, null) as FileNodeParameters | null;
    if (!files) {
        throw new NodeOperationError(this.getNode(), 'No file configuration found. Please add a file to the input.');
    }
    const template = getFilesData(files);

    const body: IDataObject = {
        template: template,
        files: [{
            filename: 'output.json',
            data: [],
        }],
        output: {
            output_type: 'meta_data',
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
