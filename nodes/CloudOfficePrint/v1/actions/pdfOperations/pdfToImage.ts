import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc } from '../../descriptions/common.description';
import { fileFieldNames, getFileFields, resolveTemplate } from '../../utils/file_utils';
import { toNodeOutput } from '../../utils/output_utils';

const supportedTypes = ['pdf'];
const fileNames = fileFieldNames();

export const properties: INodeProperties[] = [
    ...getFileFields(fileNames, supportedTypes),
    {
        displayName: 'Resolution in DPI',
        name: 'imageResolution',
        type: 'number',
        default: 300,
        required: true,
        typeOptions: { minValue: 1, maxValue: 1200 },
        description: 'Dots per inch the pages are rendered at, up to 1200. Higher is sharper and larger; 300 suits print, 96 suits the screen. This is the only quality setting the converter takes. See <a href="https://www.apexofficeprint.com/docs/pdf-operations/general/">PDF operations</a>.',
    },
    outputFileNameDesc,
    outputBinaryPropertyDesc,
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['pdfToImage'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
    const template = await resolveTemplate(this, index, fileNames, supportedTypes);
    const imageResolution = this.getNodeParameter('imageResolution', index) as number;
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    const body: IDataObject = {
        template,
        files: [{
            filename: outputFileName,
            data: [],
        }],
        output: {
            output_type: 'jpeg',
            output_encoding: 'base64',
            // the only knob the pdf -> jpeg converter takes; there is no quality setting
            output_image_resolution: imageResolution,
        },
    };

    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    // a one page PDF returns the image itself, more pages return a zip of them
    return await toNodeOutput(this, index, responseData, outputFileName, 'jpeg');
}
