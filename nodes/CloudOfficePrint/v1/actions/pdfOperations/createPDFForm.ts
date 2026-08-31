import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc } from '../../descriptions/common.description';
import { fileFieldNames, getFileFields, resolveTemplate } from '../../utils/file_utils';
import { toNodeOutput } from '../../utils/output_utils';
import { getJsonObjectParameter } from '../../utils/param_utils';

// the form fields are built by a docxtemplater module the server registers for Word only
const supportedTypes = ['docx', 'docm'];
const templateNames = fileFieldNames('template');

export const properties: INodeProperties[] = [
    ...getFileFields(templateNames, supportedTypes, 'Template'),
    {
        displayName: 'Data (JSON)',
        // not 'formData': Fill PDF Form owns that name, and n8n stores parameters
        // per node rather than per operation
        name: 'formFieldData',
        type: 'json',
        default: '{}',
        required: true,
        placeholder: '{ "first_name": { "type": "text", "name": "first_name", "value": "John" } }',
        description: 'Values for the tags in the template, keyed by tag name. A <code>{?form name}</code> tag takes an object describing the field to build there, with "type" and "name" required. Ordinary tags take their usual values, so one template can mix form fields with normal text, images and loops. See <a href="https://www.apexofficeprint.com/docs/pdf-operations/pdf-forms/">PDF forms</a>.',
        hint: 'Types: text, password, checkbox, radio, dropdown, combobox, listbox, pushbutton. All accept width, height and lock. A checkbox value can be true/false or 1/0.',
    },
    {
        displayName: 'Flatten the Form',
        name: 'lockForm',
        type: 'boolean',
        default: false,
        description: 'Whether to lock every field in the finished PDF so the values can no longer be edited. To lock just one field, leave this off and set "lock": true on that field instead.',
    },
    outputFileNameDesc,
    outputBinaryPropertyDesc,
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['createPDFForm'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
    const template = await resolveTemplate(this, index, templateNames, supportedTypes);
    const formDataObject = getJsonObjectParameter(this, index, 'formFieldData', 'Data (JSON)');

    const lockForm = this.getNodeParameter('lockForm', index) as boolean;
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    const body: IDataObject = {
        template,
        files: [{
            filename: outputFileName,
            // field descriptions sit directly in the data, keyed by tag name
            data: formDataObject,
        }],
        output: {
            output_type: 'pdf',
            output_encoding: 'base64',
            ...(lockForm && { lock_form: true }),
        },
    };

    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    return await toNodeOutput(this, index, responseData, outputFileName, 'pdf');
}
