// vitest is a devDependency; tests are not shipped
import { describe, expect, it } from 'vitest';
import type { IDataObject, IExecuteFunctions, INode } from 'n8n-workflow';
import { NodeHelpers } from 'n8n-workflow';
import { CloudOfficePrint } from '../nodes/CloudOfficePrint/CloudOfficePrint.node';
import { execute } from '../nodes/CloudOfficePrint/v1/actions/standardCOPCall/general';
import { onlyOutputTypeFor } from '../nodes/CloudOfficePrint/v1/utils/file_utils';

const description = new CloudOfficePrint().description;

/** A Document Generation node as n8n stores it, before anything is executed. */
function node(templateType: string, outputType = ''): INode {
    return {
        id: 'a', name: 'Document Generation', type: 'cloudOfficePrint', typeVersion: 1, position: [0, 0],
        parameters: {
            resource: 'documentGeneration',
            operation: 'general',
            templateSource: 'base64',
            templateData: 'AAAA',
            templateType,
            data: '{}',
            outputFileName: 'out',
            outputType,
        },
    };
}

/**
 * n8n checks required parameters before it runs a workflow, and an empty Output Type is
 * legitimate for a template type that allows only one. The field is therefore not
 * required, and execute decides: it resolves the value or explains what is missing.
 */
describe('Output Type never blocks a workflow from starting', () => {
    it('lets any template type start with nothing chosen', () => {
        for (const templateType of ['xml', 'pdf', 'ics', 'ifb', 'docx', 'xlsx']) {
            const issues = NodeHelpers.getNodeParametersIssues(description.properties, node(templateType));
            expect(issues?.parameters?.outputType, `${templateType} template is blocked`).toBeUndefined();
        }
    });

    it('is still fine once a choice is made', () => {
        const issues = NodeHelpers.getNodeParametersIssues(description.properties, node('docx', 'pdf'));
        expect(issues?.parameters?.outputType).toBeUndefined();
    });

    it('declares one Output Type field, always shown', () => {
        const fields = description.properties.filter((p) => p.name === 'outputType');
        expect(fields).toHaveLength(1);
        expect(fields[0].displayOptions?.hide).toBeUndefined();
        expect(fields[0].required).toBeUndefined();
    });

    it('leaves the single-output types for execute to resolve', () => {
        for (const templateType of ['xml', 'pdf', 'ics', 'ifb']) {
            expect(onlyOutputTypeFor(templateType)).toBe(templateType);
        }
    });
});

/**
 * n8n drops a parameter that is not displayed, and getNodeParameter throws for one it
 * cannot resolve unless a fallback is given. This stub does the same, so a missing
 * fallback fails here instead of at run time.
 */
function strictCtx(parameters: Record<string, unknown>) {
    return {
        getNodeParameter: (name: string, _index: number, ...rest: unknown[]) => {
            if (name in parameters) return parameters[name];
            if (rest.length > 0) return rest[0];
            throw new Error(`Could not get parameter "${name}"`);
        },
        getNode: () => ({ name: 'Document Generation' }),
        getCredentials: async () => ({ apiBaseUrl: 'https://api.cloudofficeprint.com', apiKey: 'k', mode: 'production' }),
        helpers: {
            returnJsonArray: (json: unknown) => [{ json }],
            constructExecutionMetaData: (data: unknown[]) => data,
        },
    } as unknown as IExecuteFunctions;
}

describe('execute with the Output Type field hidden', () => {
    // n8n stores no outputType at all for these, so the key is absent entirely
    const base = {
        templateSource: 'base64',
        templateData: 'AAAA',
        data: '{}',
        outputFileName: 'out',
        debugMode: true,
    };

    it('resolves the single output instead of throwing', async () => {
        const ctx = strictCtx({ ...base, templateType: 'xml' });
        const [item] = await execute.call(ctx, 0);
        expect((item.json as IDataObject).output).toMatchObject({ output_type: 'xml' });
    });

    it('does the same for every template type the dropdown hides', async () => {
        for (const templateType of ['pdf', 'ics', 'ifb']) {
            const ctx = strictCtx({ ...base, templateType });
            const [item] = await execute.call(ctx, 0);
            expect((item.json as IDataObject).output).toMatchObject({ output_type: templateType });
        }
    });

    it('asks for a choice when the template type allows several', async () => {
        const ctx = strictCtx({ ...base, templateType: 'docx' });
        await expect(execute.call(ctx, 0)).rejects.toThrow('Choose an Output Type');
    });
});

/**
 * n8n keeps whatever Output Type was stored when the template type changes, so a choice
 * made for a DOCX template can still be there once the template is an XML one.
 */
describe('execute with an Output Type left over from another template type', () => {
    const base = {
        templateSource: 'base64',
        templateData: 'AAAA',
        data: '{}',
        outputFileName: 'out',
        debugMode: true,
    };

    it('sends the only valid output instead of the stale one', async () => {
        const ctx = strictCtx({ ...base, templateType: 'xml', outputType: 'pdf' });
        const [item] = await execute.call(ctx, 0);
        expect((item.json as IDataObject).output).toMatchObject({ output_type: 'xml' });
    });

    it('does the same for every single-output template type', async () => {
        for (const templateType of ['pdf', 'ics', 'ifb']) {
            const ctx = strictCtx({ ...base, templateType, outputType: 'docx' });
            const [item] = await execute.call(ctx, 0);
            expect((item.json as IDataObject).output).toMatchObject({ output_type: templateType });
        }
    });

    it('rejects a stale choice the new template type cannot produce', async () => {
        const ctx = strictCtx({ ...base, templateType: 'xlsx', outputType: 'rtf' });
        await expect(execute.call(ctx, 0)).rejects.toThrow('A xlsx template cannot produce rtf');
    });

    it('still sends a choice the template type does support', async () => {
        const ctx = strictCtx({ ...base, templateType: 'docx', outputType: 'pdf' });
        const [item] = await execute.call(ctx, 0);
        expect((item.json as IDataObject).output).toMatchObject({ output_type: 'pdf' });
    });
});
