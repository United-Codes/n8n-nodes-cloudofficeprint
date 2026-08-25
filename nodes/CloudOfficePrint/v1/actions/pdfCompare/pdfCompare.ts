import type {
    IDataObject,
    IExecuteFunctions,
    INodeProperties,
} from 'n8n-workflow';

import { updateDisplayOptions } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc } from '../../descriptions/common.description';
import { fileFieldNames, getFileFields, resolveFile } from '../../utils/file_utils';
import { toNodeOutput } from '../../utils/output_utils';

const supportedTypes = ['pdf'];
const file1Names = fileFieldNames('compareFile1');
const file2Names = fileFieldNames('compareFile2');

export const properties: INodeProperties[] = [
    ...getFileFields(file1Names, supportedTypes, 'PDF 1'),
    ...getFileFields(file2Names, supportedTypes, 'PDF 2'),
    outputFileNameDesc,
    outputBinaryPropertyDesc,
];

const displayOptions = {
    show: {
        resource: ['pdfCompare'],
        operation: ['pdfCompare'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);
export async function execute(this: IExecuteFunctions, index: number) {
    const file1 = await resolveFile(this, index, file1Names, supportedTypes, 'file_1');
    const file2 = await resolveFile(this, index, file2Names, supportedTypes, 'file_2');
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    const body: IDataObject = {
        compare_files: [file1, file2],
        template: null,
        files: [{
            filename: outputFileName,
            data: [],
        }],
        output: {
            output_type: 'pdf',
            output_encoding: 'base64',
        }
    };

    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    return await toNodeOutput(this, index, responseData, outputFileName, 'pdf');
}
