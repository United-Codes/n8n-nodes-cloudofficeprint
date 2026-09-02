import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

/**
 * Reads a `json` parameter as an object. An expression or an AI Agent can hand the
 * value over already parsed, so only a string is run through JSON.parse, and a typo
 * surfaces as the field's own name rather than a raw SyntaxError.
 */
export function getJsonObjectParameter(
    ctx: IExecuteFunctions,
    index: number,
    name: string,
    label: string,
): IDataObject {
    const raw = ctx.getNodeParameter(name, index) as unknown;

    if (raw !== null && typeof raw === 'object') {
        return assertObject(ctx, index, raw, label);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(String(raw));
    } catch {
        throw new NodeOperationError(ctx.getNode(), `${label} is not valid JSON`, { itemIndex: index });
    }

    return assertObject(ctx, index, parsed, label);
}

function assertObject(ctx: IExecuteFunctions, index: number, value: unknown, label: string): IDataObject {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new NodeOperationError(ctx.getNode(), `${label} must be a JSON object`, { itemIndex: index });
    }
    return value as IDataObject;
}
