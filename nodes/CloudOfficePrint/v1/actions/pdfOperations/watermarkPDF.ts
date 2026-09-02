import type {
    IDataObject,
    IExecuteFunctions,
    INodeProperties,
} from 'n8n-workflow';

import { updateDisplayOptions } from 'n8n-workflow';

import { CloudOfficePrintRequest } from '../../transport';
import { outputBinaryPropertyDesc, outputFileNameDesc } from '../../descriptions/common.description';
import {
    appendPrependFileSupportedType,
    fileFieldNames,
    getFileFields,
    resolveFile,
} from '../../utils/file_utils';
import { toNodeOutput } from '../../utils/output_utils';

const fileNames = fileFieldNames();

export const properties: INodeProperties[] = [
    ...getFileFields(fileNames, appendPrependFileSupportedType),
    {
        displayName: 'Watermark Text',
        name: 'watermark_text',
        description: 'Words stamped diagonally across every page of the result',
        placeholder: 'e.g. CONFIDENTIAL',
        type: 'string',
        default: '',
    }, {
        displayName: 'Watermark Color',
        name: 'watermark_color',
        description: 'Color of the stamped text. A light grey stays readable underneath.',
        type: 'color',
        default: '#D3D3D3 ',
    }, {
        displayName: 'Watermark Font',
        name: 'watermark_font',
        description: 'Font of the stamped text. The server falls back to Arial if it does not have this one.',
        type: 'string',
        default: 'Arial',
    },
    {
        displayName: 'Watermark Opacity in %',
        name: 'watermark_opacity',
        description: 'How solid the stamp is, from 0 for invisible to 100 for fully opaque',
        type: 'number',
        typeOptions: {
            minValue: 0,
            maxValue: 100,
        },
        default: 30,
    },
    {
        displayName: 'Watermark Size',
        name: 'watermark_size',
        description: 'Height of the stamped text in pixels',
        type: 'number',
        typeOptions: {
            minValue: 1,
            maxValue: 1000,
        },
        default: 45,
    },
    outputFileNameDesc,
    outputBinaryPropertyDesc,
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['watermarkPDF'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);
export async function execute(this: IExecuteFunctions, index: number) {
    const file = await resolveFile(this, index, fileNames, appendPrependFileSupportedType);

    const watermarkText = this.getNodeParameter('watermark_text', index) as string;
    const watermarkColor = this.getNodeParameter('watermark_color', index) as string;
    const watermarkFont = this.getNodeParameter('watermark_font', index) as string;
    const watermarkOpacity = this.getNodeParameter('watermark_opacity', index) as number;
    const watermarkSize = this.getNodeParameter('watermark_size', index) as number;
    const outputFileName = this.getNodeParameter('outputFileName', index) as string;

    const body: IDataObject = {
        append_files: [file],
        template: {
            template_type: "converter"
        },
        files: [{
            filename: outputFileName,
            data: [],
        }],
        output: {
            output_type: 'pdf',
            output_encoding: 'base64',
            output_watermark: watermarkText,
            output_watermark_color: watermarkColor,
            output_watermark_font: watermarkFont,
            output_watermark_opacity: watermarkOpacity,
            output_watermark_size: watermarkSize
        }
    };

    const responseData = await CloudOfficePrintRequest.call(this, 'POST', '', body);

    return await toNodeOutput(this, index, responseData, outputFileName, 'pdf');
}
