import type {
    IDataObject,
    IExecuteFunctions,
    INodeProperties,
} from 'n8n-workflow';

import { fileFieldNames, getFileFields, resolveTemplate, templateSupportedType } from '../../utils/file_utils';
import { extensionForOutputType, toNodeOutput } from '../../utils/output_utils';

import {
    updateDisplayOptions,
    NodeOperationError,
} from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc, outputTypeDesc } from '../../descriptions/common.description';

const templateNames = fileFieldNames('template');

export const properties: INodeProperties[] = [
    ...getFileFields(templateNames, templateSupportedType, 'Template'),
    {
        displayName: 'Data (JSON)',
        name: 'data',
        type: 'json',
        default: '{}',
        required: true,
        placeholder: '{ "customer": "John Doe", "total": "250.00" }',
        description: 'Values for the tags in the template. A key must match a tag name exactly: <code>{customer}</code> in the template needs a "customer" key here. Loops, conditions, images, charts, barcodes and hyperlinks are all driven from this one object - see the <a href="https://www.apexofficeprint.com/docs/templates/general_tags/">tag overview</a>.',
        hint: 'Not sure what tags a template has? Set Output Type to count_tags and run it once',
    },
    outputFileNameDesc,
    outputTypeDesc,
    outputBinaryPropertyDesc,
];

const displayOptions = {
    show: {
        resource: ['documentGeneration'],
        operation: ['general'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);
export async function execute(this: IExecuteFunctions, index: number) {
    const template = await resolveTemplate(this, index, templateNames, templateSupportedType);
    const data = this.getNodeParameter('data', index) as string;
    const dataObject = JSON.parse(data);
    if (!dataObject) {
        throw new NodeOperationError(this.getNode(), 'No data found. Please add data to the input.');
    }
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;
    const outputType = this.getNodeParameter('outputType', index) as string;
    const body: IDataObject = {
        template: template,
        files: [{
            filename: outputFileName,
            data: dataObject,
        }],
        output: {
            output_type: outputType,
            output_encoding: 'base64',
        }
    };
    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    return await toNodeOutput(this, index, responseData, outputFileName, extensionForOutputType(outputType));
}
