import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputFileNameDesc } from '../../descriptions/common.description';
import { getFilesData, getSingleFileDesc, getSingleFileParameters } from '../../utils/file_utils';

const supportedTypes = ['pdf'];

export const properties: INodeProperties[] = [
    ...getSingleFileDesc('Content of the PDF to compress, encoded as Base64', supportedTypes),
    outputFileNameDesc,
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['compressPDF'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
    const file = getSingleFileParameters(this, index, supportedTypes);
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    const body: IDataObject = {
        template: getFilesData(file),
        files: [{
            filename: outputFileName,
            data: [],
        }],
        output: {
            output_type: 'pdf',
            output_encoding: 'base64',
            output_compress_pdf: true,
        },
    };

    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    return this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData as IDataObject),
        { itemData: { item: index } },
    );
}
