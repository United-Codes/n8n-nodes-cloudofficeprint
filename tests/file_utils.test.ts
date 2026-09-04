// vitest is a devDependency; tests are not shipped
import { describe, expect, it } from 'vitest';
import type { IBinaryData, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import {
    allFileSources,
    appendPrependFileSupportedType,
    attachmentSupportedType,
    fileFieldNames,
    getFileCollectionDesc,
    getFileFields,
    officeEncryptionSupportedType,
    resolveFile,
    resolveFileList,
    resolveTemplate,
} from '../nodes/CloudOfficePrint/v1/utils/file_utils';

const names = fileFieldNames();
const templateNames = fileFieldNames('template');

function ctxWith(parameters: Record<string, unknown>, binary: Record<string, IBinaryData> = {}) {
    return {
        getNodeParameter: (name: string, _index: number, fallback?: unknown) =>
            parameters[name] ?? fallback,
        getNode: () => ({ name: 'Cloud Office Print' }),
        helpers: {
            assertBinaryData: (_index: number, property: string) => {
                if (!binary[property]) {
                    throw new Error(`No binary data property "${property}" exists on item`);
                }
                return binary[property];
            },
            getBinaryDataBuffer: async (_index: number, property: string) =>
                Buffer.from(binary[property].data, 'base64'),
        },
    } as unknown as IExecuteFunctions;
}

function binaryItem(base64: string, fileName?: string): IBinaryData {
    return { data: base64, mimeType: 'application/pdf', fileName } as IBinaryData;
}

function field(fields: INodeProperties[], name: string): INodeProperties {
    const found = fields.find((f) => f.name === name);
    if (!found) throw new Error(`no field ${name}`);
    return found;
}

describe('supported type lists', () => {
    // each list mirrors one in the AOP server; these pin them so a drift is visible
    it('offers xml for attachments and nowhere else in the file lists', () => {
        expect(attachmentSupportedType).toEqual([...appendPrependFileSupportedType, 'xml']);
        expect(appendPrependFileSupportedType).not.toContain('xml');
    });

    it('does not offer types the server rejects as attachments', () => {
        // the docs say any type; attachmentMimeTypes is a fixed list
        for (const type of ['json', 'zip', 'ics', 'ifb', 'xlsm']) {
            expect(attachmentSupportedType).not.toContain(type);
        }
    });

    it('offers every Office type the server can encrypt', () => {
        expect(officeEncryptionSupportedType).toEqual(['docx', 'docm', 'xlsx', 'xlsm', 'pptx', 'pptm']);
    });
});

describe('fileFieldNames', () => {
    it('keeps the shipped names for an unprefixed slot', () => {
        expect(names).toEqual({
            source: 'fileSource',
            binaryProperty: 'binaryProperty',
            url: 'fileUrl',
            data: 'fileData',
            type: 'mimeType',
            fileName: 'fileName',
        });
    });

    it('prefixes every name so two slots can coexist on one operation', () => {
        expect(fileFieldNames('compareFile1').source).toBe('compareFile1Source');
        expect(fileFieldNames('compareFile1').type).toBe('compareFile1Type');
        expect(templateNames.data).toBe('templateData');
    });
});

describe('getFileFields', () => {
    const fields = getFileFields(names, ['docx', 'xlsx']);

    it('shows each value field only for its own source', () => {
        expect(field(fields, 'binaryProperty').displayOptions).toEqual({ show: { fileSource: ['binary'] } });
        expect(field(fields, 'fileUrl').displayOptions).toEqual({ show: { fileSource: ['url'] } });
        expect(field(fields, 'fileData').displayOptions).toEqual({ show: { fileSource: ['base64'] } });
    });

    it('always shows the source and file type selects', () => {
        expect(field(fields, 'fileSource').displayOptions).toBeUndefined();
        expect(field(fields, 'mimeType').displayOptions).toBeUndefined();
    });

    it('defaults to the binary source', () => {
        expect(field(fields, 'fileSource').default).toBe('binary');
        expect(field(fields, 'binaryProperty').default).toBe('data');
    });

    it('limits the file type select to the allowed types', () => {
        expect(field(fields, 'mimeType').options).toEqual([
            { name: 'DOCX', value: 'docx' },
            { name: 'XLSX', value: 'xlsx' },
        ]);
    });

    it('labels a type in upper case but keeps the value as the extension', () => {
        // the value reaches the API as template_type, so it must stay lower case
        const options = field(fields, 'mimeType').options as Array<{ name: string; value: string }>;
        for (const option of options) {
            expect(option.name).toBe(option.value.toUpperCase());
        }
    });

    it('drops the description of a hidden type field, since nothing shows it', () => {
        const single = field(getFileFields(names, ['pdf']), 'mimeType');
        expect(single.description).toBeUndefined();
        expect(single.hint).toBeUndefined();
    });

    it('gives the URL example an extension the slot actually accepts', () => {
        expect(field(getFileFields(names, ['pdf']), 'fileUrl').placeholder).toContain('.pdf');
        expect(field(getFileFields(names, ['docx', 'xlsx']), 'fileUrl').placeholder).toContain('.docx');
    });

    it('hides the file type select when only one type is allowed', () => {
        const single = field(getFileFields(names, ['pdf']), 'mimeType');
        expect(single.type).toBe('hidden');
        expect(single.default).toBe('pdf');
        expect(single.options).toBeUndefined();
    });

    it('does not leak allowed types between slots', () => {
        getFileFields(names, ['pdf']);
        expect(field(getFileFields(names, ['docx', 'xlsx']), 'mimeType').options).toEqual([
            { name: 'DOCX', value: 'docx' },
            { name: 'XLSX', value: 'xlsx' },
        ]);
    });

    it('offers every source by default', () => {
        expect(field(fields, 'fileSource').options?.map((o) => (o as { value: string }).value))
            .toEqual(allFileSources);
    });

    it('drops a source the operation does not allow, and its value field', () => {
        // the API never fetches an attachment, so URL cannot work there
        const narrowed = getFileFields(names, ['pdf'], '', ['binary', 'base64']);
        expect(narrowed.map((f) => f.name)).toEqual([
            'fileSource', 'binaryProperty', 'fileData', 'mimeType',
        ]);
        expect(field(narrowed, 'fileSource').options?.map((o) => (o as { value: string }).value))
            .toEqual(['binary', 'base64']);
        expect(field(narrowed, 'fileSource').default).toBe('binary');
    });

    it('labels every field when a slot label is given', () => {
        const labelled = getFileFields(fileFieldNames('compareFile1'), ['pdf'], 'PDF 1');
        expect(field(labelled, 'compareFile1Source').displayName).toBe('PDF 1 Source');
        expect(field(labelled, 'compareFile1Url').displayName).toBe('PDF 1 URL');
    });
});

describe('getFileCollectionDesc', () => {
    it('repeats the unprefixed fields inside the collection', () => {
        const desc = getFileCollectionDesc('file', 'Files', 'y', ['pdf', 'docx']);
        expect(desc.type).toBe('fixedCollection');
        expect(desc.typeOptions?.multipleValues).toBe(true);
        const values = (desc.options?.[0] as { values: INodeProperties[] }).values;
        expect(values.map((v) => v.name)).toEqual([
            'fileSource', 'binaryProperty', 'fileUrl', 'fileData', 'mimeType',
        ]);
    });
});

describe('resolveTemplate', () => {
    it('sends base64 content as the file key', async () => {
        const ctx = ctxWith({ templateSource: 'base64', templateData: 'AAAA', templateType: 'docx' });
        expect(await resolveTemplate(ctx, 0, templateNames, ['docx', 'pdf'])).toEqual({
            template_type: 'docx',
            filename: 'template.docx',
            file: 'AAAA',
        });
    });

    it('encodes an input binary field and keeps its file name', async () => {
        const ctx = ctxWith(
            { templateSource: 'binary', templateBinaryProperty: 'data', templateType: 'docx' },
            { data: binaryItem('QUFBQQ==', 'invoice.docx') },
        );
        expect(await resolveTemplate(ctx, 0, templateNames, ['docx'])).toEqual({
            template_type: 'docx',
            filename: 'invoice.docx',
            file: 'QUFBQQ==',
        });
    });

    it('falls back to a generated name when the binary has none', async () => {
        const ctx = ctxWith(
            { templateSource: 'binary', templateBinaryProperty: 'data', templateType: 'docx' },
            { data: binaryItem('QUFBQQ==') },
        );
        expect((await resolveTemplate(ctx, 0, templateNames, ['docx'])).filename).toBe('template.docx');
    });

    it('sends a URL template under the url key, with no file_source', async () => {
        // the server reads json.template.url; file_source is never read for a template
        const ctx = ctxWith({
            templateSource: 'url',
            templateUrl: 'https://example.com/invoice.docx',
            templateType: 'docx',
        });
        expect(await resolveTemplate(ctx, 0, templateNames, ['docx'])).toEqual({
            template_type: 'docx',
            url: 'https://example.com/invoice.docx',
        });
    });

    it('passes any URL straight through, whatever the type', async () => {
        // Cloud Office Print decides which template URLs it will fetch; the node does not guess
        const url = 'https://drive.google.com/uc?export=download&id=abc123';
        const ctx = ctxWith({ templateSource: 'url', templateUrl: url, templateType: 'pdf' });
        expect(await resolveTemplate(ctx, 0, templateNames, ['pdf'])).toEqual({
            template_type: 'pdf',
            url,
        });
    });

    it('rejects a source the operation does not allow', async () => {
        const ctx = ctxWith({
            templateSource: 'url',
            templateUrl: 'https://example.com/a.docx',
            templateType: 'docx',
        });
        await expect(resolveTemplate(ctx, 0, templateNames, ['docx'], ['binary', 'base64']))
            .rejects.toThrow('This operation cannot take a file from url');
    });
});

describe('resolveFile', () => {
    it('builds a base64 secondary file entry', async () => {
        const ctx = ctxWith({ fileSource: 'base64', fileData: 'BBBB', mimeType: 'pdf' });
        expect(await resolveFile(ctx, 0, names, ['pdf'])).toEqual({
            file_source: 'base64',
            file_content: 'BBBB',
            mime_type: 'application/pdf',
            filename: 'file.pdf',
        });
    });

    it('builds a url secondary file entry and names it from the URL', async () => {
        const ctx = ctxWith({ fileSource: 'url', fileUrl: 'https://example.com/a/report.pdf?v=2', mimeType: 'pdf' });
        expect(await resolveFile(ctx, 0, names, ['pdf'])).toEqual({
            file_source: 'url',
            file_url: 'https://example.com/a/report.pdf?v=2',
            mime_type: 'application/pdf',
            filename: 'report.pdf',
        });
    });

    it('falls back to the slot name when the URL has no file name', async () => {
        const ctx = ctxWith({ fileSource: 'url', fileUrl: 'https://example.com/download', mimeType: 'pdf' });
        expect((await resolveFile(ctx, 0, names, ['pdf'], 'file_2')).filename).toBe('file_2.pdf');
    });

    it('uses the only allowed type instead of the stored value', async () => {
        // n8n keeps the type of the operation the user came from
        const ctx = ctxWith({ fileSource: 'base64', fileData: 'AAAA', mimeType: 'docx' });
        expect((await resolveFile(ctx, 0, names, ['pdf'])).mime_type).toBe('application/pdf');
    });

    it('rejects a type the operation does not support', async () => {
        const ctx = ctxWith({ fileSource: 'base64', fileData: 'AAAA', mimeType: 'xlsm' });
        await expect(resolveFile(ctx, 0, names, ['pdf', 'docx'])).rejects.toThrow('Unsupported file type: xlsm');
    });

    it('rejects an empty base64 file', async () => {
        const ctx = ctxWith({ fileSource: 'base64', fileData: '', mimeType: 'pdf' });
        await expect(resolveFile(ctx, 0, names, ['pdf'])).rejects.toThrow('No file content found');
    });

    it('rejects a missing binary field name', async () => {
        const ctx = ctxWith({ fileSource: 'binary', binaryProperty: '', mimeType: 'pdf' });
        await expect(resolveFile(ctx, 0, names, ['pdf'])).rejects.toThrow('No input binary field given');
    });

    it('reports a binary field that is not on the item', async () => {
        const ctx = ctxWith({ fileSource: 'binary', binaryProperty: 'missing', mimeType: 'pdf' });
        await expect(resolveFile(ctx, 0, names, ['pdf'])).rejects.toThrow('No binary data property "missing"');
    });

    it('accepts an ftp URL, which the server supports', async () => {
        const ctx = ctxWith({ fileSource: 'url', fileUrl: 'ftp://example.com/a.pdf', mimeType: 'pdf' });
        expect((await resolveFile(ctx, 0, names, ['pdf'])).file_source).toBe('url');
    });
});

describe('attachment names', () => {
    it('keeps the name of an incoming binary file', async () => {
        const ctx = ctxWith(
            { fileSource: 'binary', binaryProperty: 'data', mimeType: 'xml' },
            { data: binaryItem('QUFBQQ==', 'factur-x.xml') },
        );
        expect((await resolveFile(ctx, 0, names, ['xml'])).filename).toBe('factur-x.xml');
    });

    it('uses a given file name over the binary one', async () => {
        const ctx = ctxWith(
            { fileSource: 'binary', binaryProperty: 'data', mimeType: 'xml', fileName: 'zugferd-invoice.xml' },
            { data: binaryItem('QUFBQQ==', 'download.xml') },
        );
        expect((await resolveFile(ctx, 0, names, ['xml'])).filename).toBe('zugferd-invoice.xml');
    });

    it('names a Base64 attachment, which otherwise gets file_1.ext', async () => {
        // the embedded name is what a reader shows, and e-invoicing requires a set name
        const ctx = ctxWith({ fileSource: 'base64', fileData: 'BBBB', mimeType: 'xml', fileName: 'factur-x.xml' });
        expect((await resolveFile(ctx, 0, names, ['xml'])).filename).toBe('factur-x.xml');
    });

    it('falls back to the slot name when none is given', async () => {
        const ctx = ctxWith({ fileSource: 'base64', fileData: 'BBBB', mimeType: 'xml' });
        expect((await resolveFile(ctx, 0, names, ['xml'], 'file_2')).filename).toBe('file_2.xml');
    });
});

describe('resolveFileList', () => {
    it('rejects a source the operation does not allow', async () => {
        const ctx = ctxWith({});
        const entries = [{ fileSource: 'url', fileUrl: 'https://example.com/a.pdf', mimeType: 'pdf' }];
        await expect(resolveFileList(ctx, 0, entries, ['pdf'], ['binary', 'base64']))
            .rejects.toThrow('This operation cannot take a file from url');
    });

    it('resolves each entry independently and numbers the fallback names', async () => {
        const ctx = ctxWith({}, { data: binaryItem('QUFBQQ==') });
        const entries = [
            { fileSource: 'base64', fileData: 'BBBB', mimeType: 'pdf' },
            { fileSource: 'binary', binaryProperty: 'data', mimeType: 'docx' },
            { fileSource: 'url', fileUrl: 'https://example.com/appendix.pdf', mimeType: 'pdf' },
        ];
        expect(await resolveFileList(ctx, 0, entries, ['pdf', 'docx'])).toEqual([
            {
                file_source: 'base64',
                file_content: 'BBBB',
                mime_type: 'application/pdf',
                filename: 'file_1.pdf',
            },
            {
                file_source: 'base64',
                file_content: 'QUFBQQ==',
                mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                filename: 'file_2.docx',
            },
            {
                file_source: 'url',
                file_url: 'https://example.com/appendix.pdf',
                mime_type: 'application/pdf',
                filename: 'appendix.pdf',
            },
        ]);
    });
});
