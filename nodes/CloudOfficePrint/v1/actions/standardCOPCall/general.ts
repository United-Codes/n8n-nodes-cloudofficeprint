import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions, NodeOperationError } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc, outputTypeDesc } from '../../descriptions/common.description';
import {
    fileFieldNames,
    getFileFields,
    onlyOutputTypeFor,
    resolveTemplate,
    supportedOutputTypesFor,
    templateSupportedType,
} from '../../utils/file_utils';
import { extensionForOutputType, toNodeOutput } from '../../utils/output_utils';
import { getJsonObjectParameter } from '../../utils/param_utils';

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
        hint: 'Not sure what tags an Office template has? Set Output Type to count_tags and run it once',
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
    const dataObject = getJsonObjectParameter(this, index, 'data', 'Data (JSON)');
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    // the field is not required, so it can arrive empty; the table fills it in when the
    // template type allows only one output, and otherwise the choice is genuinely the user's.
    // n8n keeps a stored value when the template type changes, so the table wins over it
    const chosen = this.getNodeParameter('outputType', index, '') as string;
    const outputType = onlyOutputTypeFor(template.template_type) ?? chosen;
    if (!outputType) {
        throw new NodeOperationError(
            this.getNode(),
            `Choose an Output Type. A ${template.template_type} template can produce more than one format, so the node cannot pick for you.`,
            { itemIndex: index },
        );
    }
    const supported = supportedOutputTypesFor(template.template_type);
    if (!supported.includes(outputType)) {
        throw new NodeOperationError(
            this.getNode(),
            `A ${template.template_type} template cannot produce ${outputType}. Choose one of: ${supported.join(', ')}.`,
            { itemIndex: index },
        );
    }
    const body: IDataObject = {
        template,
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
