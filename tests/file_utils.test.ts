import { describe, expect, it } from 'vitest';
import type { INodeProperties, INodePropertyCollection } from 'n8n-workflow';
import { getFileDesc, getFilesData } from '../nodes/CloudOfficePrint/v1/utils/file_utils';

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
        const a = getFileDesc('template', 'Template', 'x', false, true, ['docx']);
        const b = getFileDesc('file', 'Files', 'y', true, true, ['pdf']);
        expect(mimeField(a).options).toEqual([{ name: 'docx', value: 'docx' }]);
        expect(mimeField(b).options).toEqual([{ name: 'pdf', value: 'pdf' }]);
        // a must not have been clobbered by building b
        expect(mimeField(a).options).toEqual([{ name: 'docx', value: 'docx' }]);
    });

    it('limits single-value fields to exactly one entry', () => {
        const a = getFileDesc('template', 'Template', 'x', false, true, ['docx']);
        expect(a.typeOptions).toEqual({ multipleValues: false, minValue: 1, maxValue: 1 });
    });
});
