import type {
    IDataObject,
    IExecuteFunctions,
    // INodeExecutionData,
    INodeProperties,
} from 'n8n-workflow';

import {
    updateDisplayOptions,
    NodeOperationError,
    // LoggerProxy as Logger
} from 'n8n-workflow';

import { APEXOfficePrintRequest } from '../../transport';
import { getFileDesc, getFilesData } from '../../utils/file_utils';

export const properties: INodeProperties[] = [
    getFileDesc(
        'compare_file1',
        'PDF File - 1',
        'Select PDF File - 1',
        false,
        true
    ),
    getFileDesc(
        'compare_file2',
        'PDF File - 2',
        'Select PDF File - 2',
        false,
        true
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
    let file1;
    let file2;
    try {
        file1 = this.getNodeParameter('compare_file1.fileConfig', index) as { fileSource: string; fileData: string; filename: string; mimeType: string; }[];
        file2 = this.getNodeParameter('compare_file2.fileConfig', index) as { fileSource: string; fileData: string; filename: string; mimeType: string; }[];
    } catch (error) {
        throw new NodeOperationError(this.getNode(), 'No compare file configuration found. Please add a file to the input.');
    }

    const filesData1 = getFilesData(file1, "compare");
    const filesData2 = getFilesData(file2, "compare");

    const body: IDataObject = {
        compare_files: [(filesData1 as unknown as File[])[0], (filesData2 as unknown as File[])[0]],
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
