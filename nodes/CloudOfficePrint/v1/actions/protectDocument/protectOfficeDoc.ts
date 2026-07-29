import type {
    IDataObject,
    IExecuteFunctions,
    INodeProperties,
} from 'n8n-workflow';

import { updateDisplayOptions } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputFileNameDesc } from '../../descriptions/common.description';
import { getFilesData, getSingleFileDesc, getSingleFileParameters } from '../../utils/file_utils';

const supportedTypes = ['docx', 'xlsx', 'pptx'];

export const properties: INodeProperties[] = [
    ...getSingleFileDesc('Content of the Office document to protect, encoded as Base64', supportedTypes),
    {
        displayName: 'Password',
        name: 'read_password',
        description: 'Password required to open the document',
        type: 'string',
        typeOptions: { password: true },
        default: '',
    },
    outputFileNameDesc,
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
    const file = getSingleFileParameters(this, index, supportedTypes);
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    const body: IDataObject = {
        template: getFilesData(file),
        files: [{
            filename: outputFileName,
            data: [],
        }],
        output: {
            output_type: file.mimeType,
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
