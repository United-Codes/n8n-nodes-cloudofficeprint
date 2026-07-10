import type {
    IDataObject,
    IExecuteFunctions,
    INodeProperties,
} from 'n8n-workflow';

import {
    updateDisplayOptions,
    NodeOperationError,
} from 'n8n-workflow';

import { APEXOfficePrintRequest } from '../../transport';
import { getFileDesc, getFilesData, type FileNodeParameters } from '../../utils/file_utils';

export const properties: INodeProperties[] = [
    getFileDesc(
        'compare_file1',
        'PDF File - 1',
        'Select PDF File - 1',
        false,
        true,
        ['pdf'],
    ),
    getFileDesc(
        'compare_file2',
        'PDF File - 2',
        'Select PDF File - 2',
        false,
        true,
        ['pdf'],
    ),
];

const displayOptions = {
    show: {
        resource: ['pdfCompare'],
        operation: ['pdfCompare'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);
export async function execute(this: IExecuteFunctions, index: number) {
    const file1 = this.getNodeParameter('compare_file1.fileConfig', index, null) as FileNodeParameters | null;
    const file2 = this.getNodeParameter('compare_file2.fileConfig', index, null) as FileNodeParameters | null;
    if (!file1 || !file2) {
        throw new NodeOperationError(this.getNode(), 'Both PDF files are required. Please add both files to the input.');
    }

    const filesData1 = getFilesData(file1, 'compare') as unknown as IDataObject[];
    const filesData2 = getFilesData(file2, 'compare') as unknown as IDataObject[];

    const body: IDataObject = {
        compare_files: [filesData1[0], filesData2[0]],
        template: null,
        files: [{
            filename: 'output.pdf',
            data: [],
        }],
        output: {
            output_type: 'pdf',
            output_encoding: 'base64',
        }
    };

    const responseData = await APEXOfficePrintRequest.call(this, 'POST', '', body);

    const executionData = this.helpers.constructExecutionMetaData(

        this.helpers.returnJsonArray(responseData as IDataObject),
        { itemData: { item: index } },
    );

    return executionData;
}
