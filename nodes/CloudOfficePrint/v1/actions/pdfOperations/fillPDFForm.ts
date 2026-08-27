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
        displayName: 'Data (JSON)',
        name: 'formData',
        type: 'json',
        default: '{\n  "aop_pdf_form_data": [{}]\n}',
        required: true,
        placeholder: '{ "aop_pdf_form_data": [{ "first_name": "John", "agree": true }] }',
        description: 'Data for the file, exactly as Cloud Office Print receives it. Put the field names and values inside <code>aop_pdf_form_data</code>: text fields take a string, checkboxes true or false, radio buttons the value of the chosen option. When several fields share one name, give an array - <code>{ "agree": [true, false] }</code>. See <a href="https://www.apexofficeprint.com/docs/pdf-operations/pdf-forms/#filling-pdf-forms">filling PDF forms</a>.',
        hint: 'Run the Read PDF Form Fields operation on this PDF to find out what the fields are called',
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
    const lockForm = this.getNodeParameter('lockForm', index) as boolean;
    const formFillFont = this.getNodeParameter('formFillFont', index, '') as string;
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;
    const formData = this.getNodeParameter('formData', index) as string;

    let dataObject: IDataObject;
    try {
        dataObject = JSON.parse(formData) as IDataObject;
    } catch {
        throw new NodeOperationError(this.getNode(), 'Data (JSON) is not valid JSON', { itemIndex: index });
    }
    if (!dataObject || typeof dataObject !== 'object' || Array.isArray(dataObject)) {
        throw new NodeOperationError(this.getNode(), 'Data (JSON) must be an object holding an "aop_pdf_form_data" key', { itemIndex: index });
    }

    // the server reads the values from this one key, so without it nothing is filled
    const wrapped = dataObject.aop_pdf_form_data ?? dataObject.AOP_PDF_FORM_DATA;
    if (wrapped === undefined) {
        throw new NodeOperationError(
            this.getNode(),
            'Data (JSON) has no "aop_pdf_form_data" key, so no field would be filled. Wrap the field names and values in it: { "aop_pdf_form_data": [{ "first_name": "John" }] }.',
            { itemIndex: index },
        );
    }
    const fields = (Array.isArray(wrapped) ? wrapped[0] : wrapped) as IDataObject | undefined;
    if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
        throw new NodeOperationError(
            this.getNode(),
            '"aop_pdf_form_data" must be an object of field names and values, or an array holding one such object',
            { itemIndex: index },
        );
    }

    // a field here holds a value, never a description of a field to build - that is
    // Create PDF Form, and its JSON pasted in here would silently fill nothing
    const [defined] = Object.entries(fields).filter(
        ([, value]) => value !== null && typeof value === 'object' && !Array.isArray(value),
    );
    if (defined) {
        throw new NodeOperationError(
            this.getNode(),
            `Data (JSON) gives an object for the field "${defined[0]}", but this operation fills an existing form, so each field takes a value - a string, true/false, a number, or an array of those. To build new form fields from a Word template, use the Create PDF Form operation instead.`,
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
            output_type: 'pdf',
            output_encoding: 'base64',
            ...(lockForm && { lock_form: true }),
            ...(formFillFont && { output_form_fill_font: formFillFont }),
        },
    };

    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    return await toNodeOutput(this, index, responseData, outputFileName, 'pdf');
}
