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
        displayName: 'Identify Field Names',
        name: 'identifyFormFields',
        type: 'boolean',
        default: false,
        description: 'Whether to write each field\'s own name into it instead of filling values. Turn this on, run the operation once and open the result to read the names, then turn it off and use those names in Form Data.',
    },
    {
        displayName: 'Form Data (JSON)',
        name: 'formData',
        type: 'json',
        default: '{}',
        required: true,
        placeholder: '{ "first_name": "John", "agree": true }',
        description: 'The name of each field in the PDF and the value to put in it. Text fields take a string, checkboxes true or false, radio buttons the value of the chosen option. When several fields share one name, give an array - <code>{ "agree": [true, false] }</code>. See <a href="https://www.apexofficeprint.com/docs/pdf-operations/pdf-forms/#filling-pdf-forms">filling PDF forms</a>.',
        hint: 'Turn on Identify Field Names above and run once to find out what the fields are called',
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
        displayName: 'Fill Font',
        name: 'formFillFont',
        type: 'string',
        default: '',
        placeholder: 'e.g. ArialBlack',
        description: 'Font for the values being written in, as a font name or the name of a font file the server has. Leave empty to keep whatever the form itself specifies. Falls back to Arial when the font cannot be found.',
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
