import type {
    IDataObject,
    IExecuteFunctions,
    INodeProperties,
} from 'n8n-workflow';

import { updateDisplayOptions } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc } from '../../descriptions/common.description';
import { fileFieldNames, getFileFields, resolveTemplate } from '../../utils/file_utils';
import { toNodeOutput } from '../../utils/output_utils';

const supportedTypes = ['docx', 'xlsx', 'pptx'];
const fileNames = fileFieldNames();

export const properties: INodeProperties[] = [
    ...getFileFields(fileNames, supportedTypes),
    {
        displayName: 'Open Password',
        name: 'read_password',
        description: 'Password needed to open the document. Word, Excel and PowerPoint encrypt the whole file, so without it the contents cannot be read at all.',
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
        operation: ['protectOfficeDocument'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);
export async function execute(this: IExecuteFunctions, index: number) {
    const readPassword = this.getNodeParameter('read_password', index) as string;
    const template = await resolveTemplate(this, index, fileNames, supportedTypes);
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    const body: IDataObject = {
        template,
        files: [{
            filename: outputFileName,
            data: [],
        }],
        output: {
            output_type: template.template_type,
            output_encoding: 'base64',
            output_read_password: readPassword,
        }
    };
    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    return await toNodeOutput(this, index, responseData, outputFileName, template.template_type);
}
