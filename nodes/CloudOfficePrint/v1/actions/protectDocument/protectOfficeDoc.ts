import type {
    IDataObject,
    IExecuteFunctions,
    INodeProperties,
} from 'n8n-workflow';

import { getFileDesc, getFilesData, type FileNodeParameters, Template  } from '../../utils/file_utils';


import {
    updateDisplayOptions,
    NodeOperationError,
} from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';


export const properties: INodeProperties[] = [
    getFileDesc(
        'file',
        'File',
        'Office document to protect',
        false,
        true,
        ['docx', 'xlsx', 'pptx'],
    ),
    {
        displayName: 'Password',
        name: 'read_password',
        description: 'Password required to open the document',
        // eslint-disable-next-line n8n-nodes-base/node-param-type-options-password-missing
        type: 'string',
        default: '',
    }
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
    const files = this.getNodeParameter('file.fileConfig', index, null) as FileNodeParameters | null;
    if (!files) {
        throw new NodeOperationError(this.getNode(), 'No file configuration found. Please add a file to the input.');
    }
    const template = getFilesData(files);


    const body: IDataObject = {
        template: template,
        files: [{
            filename: 'output.pdf',
            data: [],
        }],
        output: {
            output_type: (template as Template).template_type,
            output_encoding: 'base64',
            output_read_password: readPassword,
        }
    };
    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData as IDataObject),
        { itemData: { item: index } },
    );

    return executionData;
}
