import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions, NodeOperationError } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc } from '../../descriptions/common.description';
import { fileFieldNames, getFileFields, resolveTemplate } from '../../utils/file_utils';
import { toNodeOutput } from '../../utils/output_utils';

const supportedTypes = ['pdf'];
const fileNames = fileFieldNames();

export const properties: INodeProperties[] = [
    ...getFileFields(fileNames, supportedTypes),
    {
        displayName: 'Form Data (JSON)',
        name: 'formData',
        type: 'json',
        default: '{}',
        required: true,
        placeholder: '{ "first_name": "John", "subscribed": true }',
        description: 'Field names and the values to fill in. Text fields take strings, checkboxes and radio buttons take true or false.',
        hint: 'To find the field names, run Document Generation on the same PDF with Output Type "form_fields"',
    },
    {
        displayName: 'Flatten the Form',
        name: 'lockForm',
        type: 'boolean',
        default: false,
        description: 'Whether to lock the fields so the filled values can no longer be edited',
    },
    {
        displayName: 'Font',
        name: 'formFillFont',
        type: 'string',
        default: '',
        placeholder: 'e.g. Arial',
        description: 'Font used for the filled values. Leave empty to let Cloud Office Print decide; it falls back to Arial when the font is not found.',
    },
    outputFileNameDesc,
    outputBinaryPropertyDesc,
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['fillPDFForm'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
    const template = await resolveTemplate(this, index, fileNames, supportedTypes);
    const formData = this.getNodeParameter('formData', index) as string;

    let formDataObject: IDataObject;
    try {
        formDataObject = JSON.parse(formData) as IDataObject;
    } catch {
        throw new NodeOperationError(this.getNode(), 'Form Data (JSON) is not valid JSON', { itemIndex: index });
    }
    if (!formDataObject || typeof formDataObject !== 'object' || Array.isArray(formDataObject)) {
        throw new NodeOperationError(this.getNode(), 'Form Data (JSON) must be an object of field names and values', { itemIndex: index });
    }

    const lockForm = this.getNodeParameter('lockForm', index) as boolean;
    const formFillFont = this.getNodeParameter('formFillFont', index, '') as string;
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    const body: IDataObject = {
        template,
        files: [{
            filename: outputFileName,
            // the API reads the field values from this key inside the file's data
            data: [{ aop_pdf_form_data: [formDataObject] }],
        }],
        output: {
            output_type: 'pdf',
            output_encoding: 'base64',
            lock_form: lockForm,
            ...(formFillFont && { output_form_fill_font: formFillFont }),
        },
    };

    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    return await toNodeOutput(this, index, responseData, outputFileName, 'pdf');
}
