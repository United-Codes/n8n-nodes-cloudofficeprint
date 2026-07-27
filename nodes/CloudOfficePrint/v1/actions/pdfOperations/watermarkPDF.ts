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
import { getFileDesc, getFilesData, appendPrependFileSupportedType, type FileNodeParameters } from '../../utils/file_utils';

export const properties: INodeProperties[] = [
    getFileDesc(
        'file',
        'File',
        'File to add a watermark to',
        false,
        true,
        appendPrependFileSupportedType,
    ),
    {
        displayName: 'Watermark Text',
        name: 'watermark_text',
        description: 'Text placed diagonally across every page',
        placeholder: 'e.g. CONFIDENTIAL',
        type: 'string',
        default: '',
    }, {
        displayName: 'Watermark Color',
        name: 'watermark_color',
        description: 'Color of the watermark text',
        type: 'color',
        default: '#D3D3D3 ',
    }, {
        displayName: 'Watermark Font',
        name: 'watermark_font',
        description: 'Font of the watermark text',
        type: 'string',
        default: 'Arial',
    },
    {
        displayName: 'Watermark Opacity in %',
        name: 'watermark_opacity',
        description: 'Opacity of the watermark text (0-100)',
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
        description: 'Size of the watermark text (in px)',
        type: 'number',
        typeOptions: {
            minValue: 1,
            maxValue: 1000,
        },
        default: 45,
    },
];

const displayOptions = {
    show: {
        resource: ['pdfOperations'],
        operation: ['watermarkPDF'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);
export async function execute(this: IExecuteFunctions, index: number) {
    const file = this.getNodeParameter('file.fileConfig', index, null) as FileNodeParameters | null;
    if (!file) {
        throw new NodeOperationError(this.getNode(), 'No file configuration found. Please add a file to the input.');
    }
    const filesData = getFilesData([file]);

    const watermarkText = this.getNodeParameter('watermark_text', index) as string;
    const watermarkColor = this.getNodeParameter('watermark_color', index) as string;
    const watermarkFont = this.getNodeParameter('watermark_font', index) as string;
    const watermarkOpacity = this.getNodeParameter('watermark_opacity', index) as number;
    const watermarkSize = this.getNodeParameter('watermark_size', index) as number;

    const body: IDataObject = {
        append_files: filesData,
        template: {
            template_type: "converter"
        },
        files: [{
            filename: 'input.pdf',
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

    const responseData = await APEXOfficePrintRequest.call(this, 'POST', '', body);

    const executionData = this.helpers.constructExecutionMetaData(

        this.helpers.returnJsonArray(responseData as IDataObject),
        { itemData: { item: index } },
    );

    return executionData;
}
