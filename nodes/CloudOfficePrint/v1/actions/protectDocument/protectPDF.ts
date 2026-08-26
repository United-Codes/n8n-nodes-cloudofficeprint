import type {
    IDataObject,
    IExecuteFunctions,
    INodeProperties,
} from 'n8n-workflow';

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
        displayName: 'Read Password',
        name: 'read_password',
        description: 'Password required to open the PDF (leave empty to skip)',
        type: 'string',
        typeOptions: { password: true },
        default: '',
    },
    {
        displayName: 'Modify Password',
        name: 'modify_password',
        description: 'Password required to edit the PDF (leave empty to skip)',
        type: 'string',
        typeOptions: { password: true },
        default: '',
    },
    outputFileNameDesc,
    outputBinaryPropertyDesc,
];

const displayOptions = {
    show: {
        resource: ['protectDocument'],
        operation: ['protectPDF'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);
export async function execute(this: IExecuteFunctions, index: number) {
    const readPassword = this.getNodeParameter('read_password', index) as string;
    const modifyPassword = this.getNodeParameter('modify_password', index) as string;
    const template = await resolveTemplate(this, index, fileNames, supportedTypes, pdfTemplateSources);
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    const body: IDataObject = {
        template,
        files: [{
            filename: outputFileName,
            data: [],
        }],
        output: {
            output_type: 'pdf',
            output_encoding: 'base64',
            output_read_password: readPassword,
            output_modify_password: modifyPassword,
        }
    };

    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    return await toNodeOutput(this, index, responseData, outputFileName, 'pdf');
}
