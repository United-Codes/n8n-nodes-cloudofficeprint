import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions, NodeOperationError } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc } from '../../descriptions/common.description';
import { fileFieldNames, getFileFields, resolveTemplate } from '../../utils/file_utils';
import { toNodeOutput } from '../../utils/output_utils';

// the form fields are built by a docxtemplater module the server registers for Word only
const supportedTypes = ['docx', 'docm'];
const templateNames = fileFieldNames('template');

export const properties: INodeProperties[] = [
    ...getFileFields(templateNames, supportedTypes, 'Template'),
    {
        displayName: 'Data (JSON)',
        name: 'formData',
        type: 'json',
        default: '{}',
        required: true,
        placeholder: '{ "first_name": { "type": "text", "name": "first_name", "value": "John" } }',
        description: 'Data for the template, keyed by tag name. A {?form ...} tag takes a field description; ordinary tags take their usual values, so a template can mix form fields with normal text, images and loops.',
        hint: 'Field types: text, password, checkbox, radio, dropdown, combobox, listbox, pushbutton',
    },
    {
        displayName: 'Flatten the Form',
        name: 'lockForm',
        type: 'boolean',
        default: false,
        description: 'Whether to lock every field in the finished PDF so the values can no longer be edited. Set "lock" on a single field to lock only that one.',
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
    const formData = this.getNodeParameter('formData', index) as string;

    let formDataObject: IDataObject;
    try {
        formDataObject = JSON.parse(formData) as IDataObject;
    } catch {
        throw new NodeOperationError(this.getNode(), 'Data (JSON) is not valid JSON', { itemIndex: index });
    }
    if (!formDataObject || typeof formDataObject !== 'object' || Array.isArray(formDataObject)) {
        throw new NodeOperationError(this.getNode(), 'Data (JSON) must be an object keyed by the tag names used in the template', { itemIndex: index });
    }

    const lockForm = this.getNodeParameter('lockForm', index) as boolean;
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    const body: IDataObject = {
        template,
        files: [{
            filename: outputFileName,
            // the field descriptions sit directly in the file's data, keyed by tag name
            data: formDataObject,
        }],
        output: {
            output_type: 'pdf',
            output_encoding: 'base64',
            lock_form: lockForm,
        },
    };

    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    return await toNodeOutput(this, index, responseData, outputFileName, 'pdf');
}
