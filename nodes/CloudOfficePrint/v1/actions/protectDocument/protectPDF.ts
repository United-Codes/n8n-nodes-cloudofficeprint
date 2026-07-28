import type {
    IDataObject,
    IExecuteFunctions,
    INodeProperties,
} from 'n8n-workflow';

import {
    updateDisplayOptions,
    NodeOperationError,
} from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { getFileDesc, getFilesData, type FileNodeParameters } from '../../utils/file_utils';

export const properties: INodeProperties[] = [
    getFileDesc(
        'template',
        'File',
        'PDF file to protect',
        false,
        true,
        ['pdf'],
    ),
    {
        displayName: 'Read Password',
        name: 'read_password',
        description: 'Password required to open the PDF (leave empty to skip)',
        // eslint-disable-next-line n8n-nodes-base/node-param-type-options-password-missing
        type: 'string',
        default: '',
    },
    {
        displayName: 'Modify Password',
        name: 'modify_password',
        description: 'Password required to edit the PDF (leave empty to skip)',
        // eslint-disable-next-line n8n-nodes-base/node-param-type-options-password-missing
        type: 'string',
        default: '',
    }
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
    const files = this.getNodeParameter('template.fileConfig', index, null) as FileNodeParameters | null;
    if (!files) {
        throw new NodeOperationError(this.getNode(), 'No file configuration found. Please add a file to the input.');
    }
    const filesData = getFilesData(files);

    const body: IDataObject = {
        template: filesData,
        files: [{
            filename: 'output.pdf',
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

    const executionData = this.helpers.constructExecutionMetaData(

        this.helpers.returnJsonArray(responseData as IDataObject),
        { itemData: { item: index } },
    );

    return executionData;
}
