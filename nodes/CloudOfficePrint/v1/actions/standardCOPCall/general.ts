import type {
    IDataObject,
    IExecuteFunctions,
    INodeProperties,
} from 'n8n-workflow';

import {
    fileFieldNames,
    getFileFields,
    resolveTemplate,
    supportedOutputTypeBasedOnTemplate,
    templateSupportedType,
} from '../../utils/file_utils';
import { extensionForOutputType, toNodeOutput } from '../../utils/output_utils';
import { getJsonObjectParameter } from '../../utils/param_utils';

import { updateDisplayOptions } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc, outputTypeDesc } from '../../descriptions/common.description';

const templateNames = fileFieldNames('template');

/** Template types with a single possible output, e.g. a PDF template only ever yields a PDF. */
const fixedOutputTemplateTypes = templateSupportedType
    .map((templateType) => ({
        templateType,
        outputTypes:
            supportedOutputTypeBasedOnTemplate[templateType as keyof typeof supportedOutputTypeBasedOnTemplate] ?? [],
    }))
    .filter((entry) => entry.outputTypes.length === 1);

/** Hide the dropdown for those, so it cannot offer a choice that does not exist. */
const outputTypeSelect: INodeProperties = fixedOutputTemplateTypes.length
    ? {
        ...outputTypeDesc,
        displayOptions: {
            hide: { [templateNames.type]: fixedOutputTemplateTypes.map((entry) => entry.templateType) },
        },
    }
    : outputTypeDesc;

/** Show a disabled field instead, so the output type stays visible. */
// eslint-disable-next-line n8n-nodes-base/node-param-default-missing -- default is computed
const fixedOutputTypes: INodeProperties[] = fixedOutputTemplateTypes.map(({ templateType, outputTypes }) => ({
    displayName: 'Output Type',
    name: 'outputType',
    type: 'options',
    default: outputTypes[0],
    options: [{ name: outputTypes[0].toUpperCase(), value: outputTypes[0] }],
    description: `A ${templateType.toUpperCase()} template can only produce ${outputTypes[0].toUpperCase()}`,
    displayOptions: { show: { [templateNames.type]: [templateType] } },
    disabledOptions: { show: { [templateNames.type]: [templateType] } },
}));

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
    outputTypeSelect,
    ...fixedOutputTypes,
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
    const dataObject = getJsonObjectParameter(this, index, 'data', 'Data (JSON)');
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
