import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions, NodeOperationError } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc } from '../../descriptions/common.description';
import { fileFieldNames, getFileFields, pdfTemplateSources, resolveTemplate } from '../../utils/file_utils';
import { toNodeOutput } from '../../utils/output_utils';

const supportedTypes = ['pdf'];
const fileNames = fileFieldNames();

export const properties: INodeProperties[] = [
    ...getFileFields(fileNames, supportedTypes, '', pdfTemplateSources),
    {
        displayName: 'Identify Field Names',
        name: 'identifyFormFields',
        type: 'boolean',
        default: false,
        description: 'Whether to write each field\'s own name into it instead of filling values, so you can see what the fields are called. Run this once, then fill in the names it shows.',
    },
    {
        displayName: 'Form Data (JSON)',
        name: 'formData',
        type: 'json',
        default: '{}',
        required: true,
        placeholder: '{ "first_name": "John", "agree": true }',
        description: 'Field names and the values to fill in. Text fields take strings, checkboxes true or false, and radio buttons the value of the chosen option. Give an array when several fields share one name, e.g. { "agree": [true, false] }.',
        hint: 'Turn on Identify Field Names once to find out what the fields are called',
        displayOptions: { show: { identifyFormFields: [false] } },
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
        placeholder: 'e.g. ArialBlack',
        description: 'Font used for the filled values, as a font name or a font file the server has. Leave empty to let Cloud Office Print decide; it falls back to Arial when the font is not found.',
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
    const template = await resolveTemplate(this, index, fileNames, supportedTypes, pdfTemplateSources);
    const identifyFormFields = this.getNodeParameter('identifyFormFields', index) as boolean;
    const lockForm = this.getNodeParameter('lockForm', index) as boolean;
    const formFillFont = this.getNodeParameter('formFillFont', index, '') as string;
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    let data: IDataObject = {};
    if (!identifyFormFields) {
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
        // the server reads the values from this key inside the file's data
        data = { aop_pdf_form_data: formDataObject };
    }

    const body: IDataObject = {
        template,
        files: [{
            filename: outputFileName,
            data,
        }],
        output: {
            output_type: 'pdf',
            output_encoding: 'base64',
            lock_form: lockForm,
            ...(identifyFormFields && { identify_form_fields: true }),
            ...(formFillFont && { output_form_fill_font: formFillFont }),
        },
    };

    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    return await toNodeOutput(this, index, responseData, outputFileName, 'pdf');
}
