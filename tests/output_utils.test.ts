// vitest is a devDependency; tests are not shipped
import { describe, expect, it } from 'vitest';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
    extensionForContentType,
    extensionForOutputType,
    isJsonOutputType,
    toNodeOutput,
    withoutRedundantExtension,
} from '../nodes/CloudOfficePrint/v1/utils/output_utils';

function ctx(parameters: Record<string, unknown> = {}) {
    return {
        getNodeParameter: (name: string, _index: number, fallback?: unknown) =>
            parameters[name] ?? fallback,
        getNode: () => ({ name: 'Cloud Office Print' }),
        helpers: {
            returnJsonArray: (json: unknown) => [{ json }],
            constructExecutionMetaData: (data: INodeExecutionData[]) => data,
            prepareBinaryData: async (buffer: Buffer, fileName?: string, mimeType?: string) => ({
                data: buffer.toString('base64'),
                fileName,
                mimeType,
            }),
        },
    } as unknown as IExecuteFunctions;
}

/** A full response as the transport returns it: an unparsed Base64 body. */
function fileResponse(base64: string, contentType = 'application/pdf') {
    return { body: Buffer.from(base64, 'utf-8'), headers: { 'Content-Type': contentType }, statusCode: 200 };
}

describe('extensionForOutputType', () => {
    it('maps output types whose extension differs from the name', () => {
        expect(extensionForOutputType('onepagepdf')).toBe('pdf');
        expect(extensionForOutputType('get_attachments')).toBe('zip');
    });

    it('passes through output types that are already extensions', () => {
        expect(extensionForOutputType('docx')).toBe('docx');
        expect(extensionForOutputType('jpeg')).toBe('jpeg');
    });
});

describe('withoutRedundantExtension', () => {
    it('strips the extension that is about to be appended', () => {
        expect(withoutRedundantExtension('Rabin_Ghimire_Order_Report.pdf', 'pdf')).toBe('Rabin_Ghimire_Order_Report');
    });

    it('ignores the case the caller used', () => {
        expect(withoutRedundantExtension('report.PDF', 'pdf')).toBe('report');
    });

    it('leaves a different extension alone', () => {
        expect(withoutRedundantExtension('report.docx', 'pdf')).toBe('report.docx');
    });

    it('leaves a dot that is part of the name alone', () => {
        expect(withoutRedundantExtension('report.v2', 'pdf')).toBe('report.v2');
    });

    it('does not strip a name that is nothing but the extension', () => {
        expect(withoutRedundantExtension('.pdf', 'pdf')).toBe('.pdf');
    });
});

describe('extensionForContentType', () => {
    it('uses the type the node already knows', () => {
        expect(extensionForContentType('application/pdf')).toBe('pdf');
        expect(extensionForContentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe('docx');
        expect(extensionForContentType('text/plain')).toBe('txt');
    });

    it('reads a plain subtype, so text/xml needs no table entry', () => {
        expect(extensionForContentType('text/xml')).toBe('xml');
        expect(extensionForContentType('image/tiff')).toBe('tiff');
    });

    it('reads an RFC 6839 structured suffix', () => {
        expect(extensionForContentType('application/atom+xml')).toBe('xml');
        expect(extensionForContentType('application/vnd.api+json')).toBe('json');
    });

    it('maps the alternate zip spelling, which no rule can derive', () => {
        expect(extensionForContentType('application/x-zip-compressed')).toBe('zip');
    });

    it('says nothing for a type that says nothing', () => {
        expect(extensionForContentType('application/octet-stream')).toBeUndefined();
        expect(extensionForContentType('')).toBeUndefined();
    });
});

describe('isJsonOutputType', () => {
    it('recognises the data output types', () => {
        for (const type of ['count_tags', 'meta_data', 'form_fields', 'xfa_form_fields', 'validate_pdf']) {
            expect(isJsonOutputType(type)).toBe(true);
        }
    });

    it('does not treat file output types as data', () => {
        expect(isJsonOutputType('pdf')).toBe(false);
        expect(isJsonOutputType('docx')).toBe(false);
    });
});

describe('toNodeOutput', () => {
    it('decodes the Base64 body into a binary field', async () => {
        const base64 = Buffer.from('a pdf').toString('base64');
        const [item] = await toNodeOutput(ctx(), 0, fileResponse(base64), 'invoice', 'pdf');

        expect(item.binary?.data).toEqual({
            data: base64,
            fileName: 'invoice.pdf',
            mimeType: 'application/pdf',
        });
    });

    it('describes the file in the JSON, so an AI Agent tool call is not answered with {}', async () => {
        const base64 = Buffer.from('a pdf').toString('base64');
        const [item] = await toNodeOutput(ctx(), 0, fileResponse(base64), 'invoice', 'pdf');

        expect(item.json).toEqual({
            fileName: 'invoice.pdf',
            mimeType: 'application/pdf',
            fileSize: 5,
            binaryField: 'data',
        });
    });

    it('reports the configured binary field name in the JSON', async () => {
        const base64 = Buffer.from('a pdf').toString('base64');
        const parameters = { outputBinaryProperty: 'document' };
        const [item] = await toNodeOutput(ctx(parameters), 0, fileResponse(base64), 'invoice', 'pdf');

        expect(item.json).toMatchObject({ binaryField: 'document' });
    });

    it('does not repeat an extension the output file name already carries', async () => {
        const base64 = Buffer.from('a pdf').toString('base64');
        const [item] = await toNodeOutput(ctx(), 0, fileResponse(base64), 'invoice.pdf', 'pdf');

        expect(item.binary?.data).toMatchObject({ fileName: 'invoice.pdf' });
    });

    it('honours the configured output binary field name', async () => {
        const base64 = Buffer.from('a pdf').toString('base64');
        const parameters = { outputBinaryProperty: 'document' };
        const [item] = await toNodeOutput(ctx(parameters), 0, fileResponse(base64), 'invoice', 'pdf');

        expect(Object.keys(item.binary ?? {})).toEqual(['document']);
    });

    it('returns a JSON item when the response is JSON', async () => {
        const response = {
            body: Buffer.from('{"tags":3}', 'utf-8'),
            headers: { 'content-type': 'application/json; charset=utf-8' },
        };
        const [item] = await toNodeOutput(ctx(), 0, response, 'invoice', 'count_tags');

        expect(item.json).toEqual({ tags: 3 });
        expect(item.binary).toBeUndefined();
    });

    it('returns a JSON item for a data output type whatever the content type', async () => {
        const body = Buffer.from(Buffer.from('{"tags":3}').toString('base64'), 'utf-8');
        const [item] = await toNodeOutput(ctx(), 0, { body, headers: {} }, 'invoice', 'count_tags');

        expect(item.json).toEqual({ tags: 3 });
    });

    it('passes the Debug Mode payload straight through as JSON', async () => {
        const payload = { template: { template_type: 'docx' }, api_key: '<redacted>' };
        const [item] = await toNodeOutput(ctx(), 0, payload, 'invoice', 'pdf');

        expect(item.json).toEqual(payload);
        expect(item.binary).toBeUndefined();
    });

    it('names the file from the response content type when it differs from the request', async () => {
        // split, PDF to image and extract attachments return a zip when there is more than one file
        const base64 = Buffer.from('a zip').toString('base64');
        const response = fileResponse(base64, 'application/zip');
        const [item] = await toNodeOutput(ctx(), 0, response, 'invoice', 'jpeg');

        expect(item.binary?.data).toMatchObject({ fileName: 'invoice.zip', mimeType: 'application/zip' });
    });

    it('recognises the alternate zip content type', async () => {
        const response = fileResponse(Buffer.from('a zip').toString('base64'), 'application/x-zip-compressed');
        const [item] = await toNodeOutput(ctx(), 0, response, 'invoice', 'zip');

        expect(item.binary?.data).toMatchObject({ fileName: 'invoice.zip' });
    });

    it('uses the requested extension when the content type is not a known file type', async () => {
        const response = fileResponse(Buffer.from('a pdf').toString('base64'), 'application/octet-stream');
        const [item] = await toNodeOutput(ctx(), 0, response, 'invoice', 'pdf');

        expect(item.binary?.data).toMatchObject({ fileName: 'invoice.pdf' });
    });

    it('keeps a single extracted attachment as its own type instead of a zip', async () => {
        const response = fileResponse(Buffer.from('an xml').toString('base64'), 'application/xml');
        const [item] = await toNodeOutput(ctx(), 0, response, 'invoice', 'zip');

        expect(item.binary?.data).toMatchObject({ fileName: 'invoice.xml', mimeType: 'application/xml' });
    });

    it('ignores charset when matching the content type', async () => {
        const response = fileResponse(Buffer.from('a jpeg').toString('base64'), 'image/jpeg; charset=binary');
        const [item] = await toNodeOutput(ctx(), 0, response, 'page', 'jpeg');

        expect(item.binary?.data).toMatchObject({ fileName: 'page.jpeg' });
    });

    it('recognises text/xml, which the server returns for an extracted invoice attachment', async () => {
        // supportedMimeType lists xml as application/xml, so the alias is what resolves it
        const response = fileResponse(Buffer.from('<invoice/>').toString('base64'), 'text/xml');
        const [item] = await toNodeOutput(ctx(), 0, response, 'invoice', 'zip');

        expect(item.binary?.data).toMatchObject({ fileName: 'invoice.xml', mimeType: 'text/xml' });
    });

    it('falls back to a short subtype for a type not in the table', async () => {
        const response = fileResponse(Buffer.from('img').toString('base64'), 'image/tiff');
        const [item] = await toNodeOutput(ctx(), 0, response, 'scan', 'zip');

        expect(item.binary?.data).toMatchObject({ fileName: 'scan.tiff' });
    });

    it('does not turn a compound subtype into an extension', async () => {
        const response = fileResponse(Buffer.from('x').toString('base64'), 'application/octet-stream');
        const [item] = await toNodeOutput(ctx(), 0, response, 'thing', 'zip');

        expect(item.binary?.data).toMatchObject({ fileName: 'thing.zip' });
    });

    it('keeps an unparseable JSON body rather than throwing', async () => {
        const response = { body: Buffer.from('not json', 'utf-8'), headers: { 'content-type': 'application/json' } };
        const [item] = await toNodeOutput(ctx(), 0, response, 'invoice', 'pdf');

        expect(item.json).toEqual({ data: 'not json' });
    });
});
