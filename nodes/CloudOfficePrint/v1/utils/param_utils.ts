import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

/**
 * Reads a `json` parameter and returns it as an object, so a typo in the field
 * surfaces as the field's own name rather than a raw SyntaxError.
 */
export function getJsonObjectParameter(
    ctx: IExecuteFunctions,
    index: number,
    name: string,
    label: string,
): IDataObject {
    const raw = ctx.getNodeParameter(name, index) as string;

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new NodeOperationError(ctx.getNode(), `${label} is not valid JSON`, { itemIndex: index });
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new NodeOperationError(ctx.getNode(), `${label} must be a JSON object`, { itemIndex: index });
    }

    return parsed as IDataObject;
}
