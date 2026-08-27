import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc } from '../../descriptions/common.description';
import { fileFieldNames, getFileFields, resolveTemplate } from '../../utils/file_utils';
import { toNodeOutput } from '../../utils/output_utils';

const supportedTypes = ['pdf'];
const fileNames = fileFieldNames();

/** The marked-up PDF is the one result that is a file rather than data. */
const MARKED_PDF = 'marked';

export const properties: INodeProperties[] = [
    ...getFileFields(fileNames, supportedTypes),
    {
        displayName: 'Return',
        name: 'returnAs',
        type: 'options',
        default: 'form_fields',
        required: true,
        description: 'What to get back about the form',
        options: [
            {
                name: 'Field Names and Values as JSON',
                value: 'form_fields',
                description: 'Every field in the form with its current value, ready to feed into the next node',
            },
            {
                name: 'XFA Form Structure as JSON',
                value: 'xfa_form_fields',
                description: 'For an XFA form: the field names, values and types',
            },
            {
                name: 'PDF With the Names Marked on the Fields',
                value: MARKED_PDF,
                description: 'A copy of the PDF with each field showing its own name, to open and read by eye',
            },
        ],
    },
    {
        ...outputFileNameDesc,
        displayOptions: { show: { returnAs: [MARKED_PDF] } },
    },
    {
        ...outputBinaryPropertyDesc,
        displayOptions: { show: { returnAs: [MARKED_PDF] } },
    },
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['readPDFFormFields'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
    const template = await resolveTemplate(this, index, fileNames, supportedTypes);
    const returnAs = this.getNodeParameter('returnAs', index) as string;
    const marked = returnAs === MARKED_PDF;
    const outputFileName = marked
        ? this.getNodeParameter('outputFileName', index) as string
        : 'form_fields';

    const body: IDataObject = {
        template,
        files: [{
            filename: outputFileName,
            // reading a form needs no data, but the key has to be there
            data: {},
        }],
        output: marked
            ? { output_type: 'pdf', output_encoding: 'base64', identify_form_fields: true }
            : { output_type: returnAs, output_encoding: 'base64' },
    };

    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    return await toNodeOutput(this, index, responseData, outputFileName, marked ? 'pdf' : returnAs);
}
