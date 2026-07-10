import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { APEXOfficePrintRequest } from '../../transport';
import { getFilesData, type FileNodeParameters } from '../../utils/file_utils';

/** Shared executor for single-file to PDF operations. */
export async function runFileToPdf(
    ctx: IExecuteFunctions,
    index: number,
    paramName: 'template' | 'file',
    outputOverrides: IDataObject = {},
) {
    const fileConfig = ctx.getNodeParameter(`${paramName}.fileConfig`, index, null) as
        | FileNodeParameters
        | FileNodeParameters[]
        | null;
    if (!fileConfig || (Array.isArray(fileConfig) && fileConfig.length === 0)) {
        throw new NodeOperationError(ctx.getNode(), 'No file configuration found. Please add a file to the input.');
    }

    const body: IDataObject = {
        template: getFilesData(fileConfig),
        files: [{
            filename: 'output.pdf',
            data: [],
        }],
        output: {
            output_type: 'pdf',
            output_encoding: 'base64',
            ...outputOverrides,
        },
    };

    const responseData = await APEXOfficePrintRequest.call(ctx, 'POST', '', body);

    return ctx.helpers.constructExecutionMetaData(
        ctx.helpers.returnJsonArray(responseData as IDataObject),
        { itemData: { item: index } },
    );
}
