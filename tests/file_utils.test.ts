// vitest is a devDependency; tests are not shipped
import { describe, expect, it } from 'vitest';
import type { IExecuteFunctions, INodeProperties, INodePropertyCollection } from 'n8n-workflow';
import {
    getFileDesc,
    getFilesData,
    getSingleFileDesc,
    getSingleFileParameters,
} from '../nodes/CloudOfficePrint/v1/utils/file_utils';

describe('getFilesData', () => {
    it('builds a Template from a single file config using the extension', () => {
        expect(getFilesData({ mimeType: 'docx', fileData: 'AAAA' })).toEqual({
            filename: 'template.docx',
            template_type: 'docx',
            file: 'AAAA',
        });
    });

    it('builds base64 File entries from an array of file configs', () => {
        expect(getFilesData([
            { mimeType: 'pdf', fileData: 'BBBB' },
            { mimeType: 'docx', fileData: 'CCCC' },
        ])).toEqual([
            {
                filename: 'file_1.pdf',
                mime_type: 'application/pdf',
                file_content: 'BBBB',
                file_source: 'base64',
            },
            {
                filename: 'file_2.docx',
                mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                file_content: 'CCCC',
                file_source: 'base64',
            },
        ]);
    });

    it('wraps a single compare file into a one-element File array', () => {
        const result = getFilesData({ mimeType: 'pdf', fileData: 'DDDD' }, 'compare');
        expect(Array.isArray(result)).toBe(true);
        expect((result as unknown[]).length).toBe(1);
    });

    it('throws on an unsupported extension', () => {
        expect(() => getFilesData({ mimeType: 'exe', fileData: 'EEEE' }))
            .toThrow('Unsupported file type: exe');
    });
});

function mimeField(desc: INodeProperties) {
    const collection = desc.options![0] as INodePropertyCollection;
    return collection.values.find((value) => value.name === 'mimeType') as INodeProperties;
}

describe('getFileDesc', () => {
    it('returns independent copies so type options do not leak across operations', () => {
        const a = getFileDesc('template', 'Template', 'x', false, true, ['docx', 'xlsx']);
        const b = getFileDesc('file', 'Files', 'y', true, true, ['pdf', 'html']);
        expect(mimeField(a).options).toEqual([{ name: 'docx', value: 'docx' }, { name: 'xlsx', value: 'xlsx' }]);
        expect(mimeField(b).options).toEqual([{ name: 'pdf', value: 'pdf' }, { name: 'html', value: 'html' }]);
        // a must not have been clobbered by building b
        expect(mimeField(a).options).toEqual([{ name: 'docx', value: 'docx' }, { name: 'xlsx', value: 'xlsx' }]);
    });

    it('limits single-value fields to exactly one entry', () => {
        const a = getFileDesc('template', 'Template', 'x', false, true, ['docx', 'xlsx']);
        expect(a.typeOptions).toEqual({ multipleValues: false, minValue: 1, maxValue: 1 });
    });

    it('hides the type select when only one type is supported', () => {
        const a = getFileDesc('template', 'File', 'x', false, true, ['pdf']);
        const field = mimeField(a);
        expect(field.type).toBe('hidden');
        expect(field.default).toBe('pdf');
        expect(field.options).toBeUndefined();
    });
});

describe('getSingleFileDesc', () => {
    it('returns both file fields at top level, so no collection has to be added', () => {
        const [dataField, typeField] = getSingleFileDesc('x', ['docx', 'xlsx']);
        expect(dataField.name).toBe('fileData');
        expect(dataField.description).toBe('x');
        expect(typeField.name).toBe('mimeType');
        expect(typeField.options).toEqual([{ name: 'docx', value: 'docx' }, { name: 'xlsx', value: 'xlsx' }]);
    });

    it('hides the type select when only one type is supported', () => {
        const [, typeField] = getSingleFileDesc('x', ['pdf']);
        expect(typeField.type).toBe('hidden');
        expect(typeField.default).toBe('pdf');
        expect(typeField.options).toBeUndefined();
    });

    it('does not leak into the shared file description', () => {
        getSingleFileDesc('x', ['pdf']);
        const field = mimeField(getFileDesc('template', 'Template', 'y', false, true, ['docx', 'xlsx']));
        expect(field.type).toBe('options');
        expect(field.options).toEqual([{ name: 'docx', value: 'docx' }, { name: 'xlsx', value: 'xlsx' }]);
    });
});

function ctxWith(parameters: Record<string, unknown>) {
    return {
        getNodeParameter: (name: string, _index: number, fallback?: unknown) =>
            parameters[name] ?? fallback,
        getNode: () => ({ name: 'Cloud Office Print' }),
    } as unknown as IExecuteFunctions;
}

describe('getSingleFileParameters', () => {
    it('reads the flattened fields', () => {
        const ctx = ctxWith({ fileData: 'AAAA', mimeType: 'docx' });
        expect(getSingleFileParameters(ctx, 0, ['docx', 'pdf'])).toEqual({ fileData: 'AAAA', mimeType: 'docx' });
    });

    it('uses the only allowed type instead of the stored value', () => {
        // the type field is hidden for single-type operations, but n8n keeps the value
        // of the operation the user came from
        const ctx = ctxWith({ fileData: 'AAAA', mimeType: 'docx' });
        expect(getSingleFileParameters(ctx, 0, ['pdf'])).toEqual({ fileData: 'AAAA', mimeType: 'pdf' });
    });

    it('rejects a type the operation does not support', () => {
        const ctx = ctxWith({ fileData: 'AAAA', mimeType: 'xlsm' });
        expect(() => getSingleFileParameters(ctx, 0, ['pdf', 'docx']))
            .toThrow('Unsupported file type: xlsm');
    });

    it('rejects an empty file', () => {
        const ctx = ctxWith({ fileData: '', mimeType: 'pdf' });
        expect(() => getSingleFileParameters(ctx, 0, ['pdf'])).toThrow('No file content found');
    });
});
