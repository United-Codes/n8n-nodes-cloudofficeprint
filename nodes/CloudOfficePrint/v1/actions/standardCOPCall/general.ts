import type {
    IDataObject,
    IExecuteFunctions,
    INodeProperties,
} from 'n8n-workflow';

import { getFileDesc, getFilesData, templateSupportedType, type FileNodeParameters } from '../../utils/file_utils';

import {
    updateDisplayOptions,
    NodeOperationError,
} from 'n8n-workflow';

import { APEXOfficePrintRequest } from '../../transport';
import { outputTypeDesc } from '../../descriptions/common.description';

export const properties: INodeProperties[] = [
    getFileDesc('template', 'Template', 'Template file to use', false, true, templateSupportedType),
    {
        displayName: 'Data (JSON)',
        name: 'data',
        type: 'json',
        default: '{}',
        required: true,
        placeholder: '{ "customer": "John Doe" }',
        description: 'JSON data used to fill the tags in the template',
        hint: 'Keys must match the tag names used in the template',
    },
    {
        displayName: 'Output File Name',
        name: 'outputFileName',
        type: 'string',
        default: 'output',
        required: true,
        placeholder: 'e.g. invoice',
        description: 'Name for the generated file, without extension',
    },
    outputTypeDesc,
];

const displayOptions = {
    show: {
        resource: ['documentGeneration'],
        operation: ['general'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);
export async function execute(this: IExecuteFunctions, index: number) {
    const files = this.getNodeParameter('template.fileConfig', index, null) as FileNodeParameters | null;
    const template = files ? getFilesData(files) : null;
    const data = this.getNodeParameter('data', index) as string;
    const dataObject = JSON.parse(data);
    if (!dataObject) {
        throw new NodeOperationError(this.getNode(), 'No data found. Please add data to the input.');
    }
    const body: IDataObject = {
        template: template,
        files: [{
            filename: 'input.pdf',
            data: dataObject,
        }],
        output: {
            output_type: this.getNodeParameter('outputType', index) as string,
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
