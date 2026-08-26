import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc } from '../../descriptions/common.description';
import { fileFieldNames, getFileFields, pdfTemplateSources, resolveTemplate } from '../../utils/file_utils';
import { toNodeOutput } from '../../utils/output_utils';

const supportedTypes = ['pdf'];
const fileNames = fileFieldNames();

export const properties: INodeProperties[] = [
    ...getFileFields(fileNames, supportedTypes, '', pdfTemplateSources),
    {
        displayName: 'Split By',
        name: 'splitBy',
        type: 'options',
        default: 'everyPage',
        required: true,
        description: 'How to decide where the PDF is cut',
        options: [
            {
                name: 'Every Page',
                value: 'everyPage',
                description: 'One PDF per page',
            },
            {
                name: 'Number of Pages',
                value: 'pageCount',
                description: 'One PDF per fixed number of pages',
            },
            {
                name: 'Text on the Page',
                value: 'text',
                description: 'Start a new PDF on every page that contains the given text, e.g. an invoice number label',
            },
        ],
    },
    {
        displayName: 'Pages per File',
        name: 'splitByPage',
        type: 'number',
        default: 1,
        required: true,
        typeOptions: { minValue: 1 },
        description: 'Number of pages in each returned PDF',
        displayOptions: { show: { splitBy: ['pageCount'] } },
    },
    {
        displayName: 'Text',
        name: 'splitByString',
        type: 'string',
        default: '',
        required: true,
        placeholder: 'e.g. Invoice No',
        description: 'Text that marks the start of a new document. Separate alternatives with ||, for example "Invoice No || Invoice Number".',
        displayOptions: { show: { splitBy: ['text'] } },
    },
    {
        displayName: 'Split After the Text',
        name: 'splitAfterString',
        type: 'boolean',
        default: false,
        description: 'Whether to cut after the matching page instead of before it',
        displayOptions: { show: { splitBy: ['text'] } },
    },
    outputFileNameDesc,
    outputBinaryPropertyDesc,
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['splitPDF'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
    const template = await resolveTemplate(this, index, fileNames, supportedTypes, pdfTemplateSources);
    const splitBy = this.getNodeParameter('splitBy', index) as string;
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    const output: IDataObject = {
        output_type: 'pdf',
        output_encoding: 'base64',
        output_split: true,
    };

    if (splitBy === 'pageCount') {
        output.output_split_by_page = this.getNodeParameter('splitByPage', index) as number;
    } else if (splitBy === 'text') {
        output.output_split_by_string = this.getNodeParameter('splitByString', index) as string;
        output.output_split_after_string = this.getNodeParameter('splitAfterString', index) as boolean;
    }

    const body: IDataObject = {
        template,
        files: [{
            filename: outputFileName,
            data: [],
        }],
        output,
    };

    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    // several PDFs come back as a zip; a single one keeps its own type
    return await toNodeOutput(this, index, responseData, outputFileName, 'zip');
}
