import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputFileNameDesc } from '../../descriptions/common.description';
import {
    getFilesData,
    getSingleFileDesc,
    getSingleFileParameters,
    templateSupportedType,
} from '../../utils/file_utils';

export const properties: INodeProperties[] = [
    ...getSingleFileDesc('Content of the file to convert to PDF, encoded as Base64', templateSupportedType),
    outputFileNameDesc,
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['convertFileToPDF'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
    const file = getSingleFileParameters(this, index, templateSupportedType);
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    const body: IDataObject = {
        // converter template: the input file is converted and prepended to the output PDF
        template: { template_type: 'converter' },
        prepend_files: getFilesData([file]),
        files: [{
            filename: outputFileName,
            data: [],
        }],
        output: {
            output_type: 'pdf',
            output_encoding: 'base64',
        },
    };

    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    return this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData as IDataObject),
        { itemData: { item: index } },
    );
}
