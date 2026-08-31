import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { supportedMimeType } from './file_utils';

/** Output types that are data, not a file, whatever the response headers say. */
const jsonOutputTypes = ['count_tags', 'meta_data', 'form_fields', 'xfa_form_fields', 'validate_pdf'];

/** Output types whose file extension differs from the type name. */
const outputTypeExtension: Record<string, string> = {
    onepagepdf: 'pdf',
    get_attachments: 'zip',
};

/** Types the API only ever returns, so they are not offered as an input file type. */
const outputOnlyMimeType: Record<string, string> = {
    zip: 'application/zip',
};

/** Content type of the response back to a file extension, for the types the API returns. */
const extensionForMimeType: Record<string, string> = (() => {
    const map: Record<string, string> = { 'application/x-zip-compressed': 'zip' };
    for (const [extension, mime] of Object.entries({ ...supportedMimeType, ...outputOnlyMimeType })) {
        // first extension wins, so jpeg beats jpg and bmp beats msbmp
        if (!(mime in map)) map[mime] = extension;
    }
    return map;
})();

export function isJsonOutputType(outputType: string): boolean {
    return jsonOutputTypes.includes(outputType);
}

/** File extension for a Cloud Office Print output type. */
export function extensionForOutputType(outputType: string): string {
    return outputTypeExtension[outputType] ?? outputType;
}

function headerValue(response: IDataObject, name: string): string {
    const headers = (response.headers ?? {}) as IDataObject;
    for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() === name) {
            return String(value ?? '');
        }
    }
    return '';
}

/** Parses a response body that may be plain JSON or Base64 encoded JSON. */
function parseJsonBody(body: unknown): IDataObject {
    if (body === null || body === undefined) return {};
    if (typeof body === 'object' && !Buffer.isBuffer(body)) return body as IDataObject;

    const text = Buffer.isBuffer(body) ? body.toString('utf-8') : String(body);
    try {
        return JSON.parse(text) as IDataObject;
    } catch {
        try {
            return JSON.parse(Buffer.from(text, 'base64').toString('utf-8')) as IDataObject;
        } catch {
            return { data: text };
        }
    }
}

/**
 * Turns a response into node output: a binary item for files, a JSON item for the
 * data output types and for Debug Mode. The body is Base64 because the request asks
 * for it and the transport leaves it unparsed.
 *
 * `extension` is what the operation asked for; the response content type wins when
 * it names a known type, since split, PDF to image and extract attachments each
 * return either one file or a zip of them.
 */
export async function toNodeOutput(
    ctx: IExecuteFunctions,
    index: number,
    response: unknown,
    outputFileName: string,
    extension: string,
): Promise<INodeExecutionData[]> {
    const asObject = (response ?? {}) as IDataObject;

    // Debug Mode returns the request payload itself, with no response headers
    const isFullResponse = 'body' in asObject && 'headers' in asObject;
    const contentType = isFullResponse ? headerValue(asObject, 'content-type').split(';')[0].trim() : '';

    if (!isFullResponse || contentType === 'application/json' || isJsonOutputType(extension)) {
        const json = isFullResponse ? parseJsonBody(asObject.body) : asObject;
        return ctx.helpers.constructExecutionMetaData(ctx.helpers.returnJsonArray(json), {
            itemData: { item: index },
        });
    }

    const body = asObject.body;
    const base64 = Buffer.isBuffer(body) ? body.toString('utf-8') : String(body ?? '');
    const buffer = Buffer.from(base64, 'base64');

    const outputBinaryProperty = ctx.getNodeParameter('outputBinaryProperty', index, 'data') as string;
    const actualExtension = extensionForMimeType[contentType] ?? extension;
    const fileName = `${outputFileName}.${actualExtension}`;
    const mimeType = contentType
        || supportedMimeType[actualExtension as keyof typeof supportedMimeType]
        || outputOnlyMimeType[actualExtension];

    const binaryData = await ctx.helpers.prepareBinaryData(buffer, fileName, mimeType);

    return ctx.helpers.constructExecutionMetaData(
        [{ json: {}, binary: { [outputBinaryProperty || 'data']: binaryData } }],
        { itemData: { item: index } },
    );
}
