// vitest is a devDependency; tests are not shipped
import { describe, expect, it } from 'vitest';
import type { IExecuteFunctions } from 'n8n-workflow';
import { execute } from '../nodes/CloudOfficePrint/v1/actions/pdfOperations/fillPDFForm';

/** Enough of IExecuteFunctions to reach the Form Data checks. */
function ctxWith(parameters: Record<string, unknown>) {
    return {
        getNodeParameter: (name: string, _index: number, fallback?: unknown) =>
            parameters[name] ?? fallback,
        getNode: () => ({ name: 'Cloud Office Print' }),
        helpers: {
            assertBinaryData: () => ({ fileName: 'form.pdf' }),
            getBinaryDataBuffer: async () => Buffer.from('a pdf'),
        },
    } as unknown as IExecuteFunctions;
}

const base = {
    fileSource: 'base64',
    fileData: 'AAAA',
    mimeType: 'pdf',
    lockForm: false,
    outputFileName: 'filled',
};

describe('Fill PDF Form data checks', () => {
    it('rejects invalid JSON', async () => {
        const ctx = ctxWith({ ...base, formData: '{ not json' });
        await expect(execute.call(ctx, 0)).rejects.toThrow('is not valid JSON');
    });

    it('accepts data an expression already parsed into an object', async () => {
        const formData = { aop_pdf_form_data: [{ first_name: 'John' }] };
        const ctx = ctxWith({ ...base, formData });
        await expect(execute.call(ctx, 0)).rejects.not.toThrow(/Data \(JSON\)/);
    });

    it('rejects an array at the top level', async () => {
        const ctx = ctxWith({ ...base, formData: '[]' });
        await expect(execute.call(ctx, 0)).rejects.toThrow('Data (JSON) must be a JSON object');
    });

    it('rejects field values given without the aop_pdf_form_data wrapper', async () => {
        const ctx = ctxWith({ ...base, formData: '{ "first_name": "John" }' });
        await expect(execute.call(ctx, 0)).rejects.toThrow('has no "aop_pdf_form_data" key');
    });

    it('rejects a wrapper holding something other than an object', async () => {
        const ctx = ctxWith({ ...base, formData: '{ "aop_pdf_form_data": "John" }' });
        await expect(execute.call(ctx, 0)).rejects.toThrow('must be an object of field names and values');
    });

    it('rejects a Create PDF Form field definition pasted in by mistake', async () => {
        const formData = '{ "aop_pdf_form_data": [{ "first_name": { "type": "text", "name": "first_name" } }] }';
        const ctx = ctxWith({ ...base, formData });
        await expect(execute.call(ctx, 0)).rejects.toThrow('gives an object for the field "first_name"');
    });

    it('accepts the wrapper as an array, as the docs show', async () => {
        // reaches the request, which the stub context cannot make - so it fails later, not on validation
        const formData = '{ "aop_pdf_form_data": [{ "first_name": "John", "agree": true, "c1_1": [true, false] }] }';
        const ctx = ctxWith({ ...base, formData });
        await expect(execute.call(ctx, 0)).rejects.not.toThrow(/Data \(JSON\)/);
    });

    it('accepts the wrapper as a plain object, as the fixtures use', async () => {
        const formData = '{ "aop_pdf_form_data": { "SampleField": "sample field!", "Checkbox": true } }';
        const ctx = ctxWith({ ...base, formData });
        await expect(execute.call(ctx, 0)).rejects.not.toThrow(/Data \(JSON\)/);
    });
});
