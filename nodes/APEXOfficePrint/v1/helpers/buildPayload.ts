import type { IExecuteFunctions } from 'n8n-workflow';

type AnyObj = Record<string, unknown>;

function cleanObject(obj: AnyObj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '' && !(typeof v === 'boolean' && v === false)),
    );
}

async function resolveTemplateFile(this: IExecuteFunctions, i: number, template: AnyObj) {
    const source = template.source;
    if (source === 'file_url') return { file_url: template.file_url };

    if (source === 'base64') return { file: template.base64 };

    if (source === 'raw') return { file: template.raw };

    if (source === 'binary') {
        const prop = template.binaryPropertyName || 'data';
        this.helpers.assertBinaryData(i, prop as string);
        const buffer = await this.helpers.getBinaryDataBuffer(i, prop as string);
        return { file: buffer.toString('base64') };
    }

    throw new Error(`Unknown template.source: ${source}`);
}

type WithValues = { values?: AnyObj };
type FileWithValues = { values?: AnyObj };

export async function buildAopPayload(this: IExecuteFunctions, i: number, apiKey: string) {
    const templateFC = this.getNodeParameter('template', i) as WithValues;
    const outputFC = this.getNodeParameter('output', i) as WithValues;
    const filesFC = (this.getNodeParameter('files', i) as FileWithValues[]) ?? [];

    const templateValues = (templateFC.values ?? ({} as AnyObj)) as AnyObj;
    const outputValues = (outputFC.values ?? ({} as AnyObj)) as AnyObj;

    const templateResolved = await resolveTemplateFile.call(this, i, templateValues as AnyObj);

    const template = cleanObject({
        filename: templateValues.filename as string,
        template_type: templateValues.template_type as string,
        ...templateResolved,
    });

    const output = cleanObject({
        output_encoding: outputValues.output_encoding as string,
        output_type: outputValues.output_type as string,
    });

    // Files
    const files = (filesFC ?? []).map((f) => {
        const values = (f.values ?? ({} as AnyObj)) as {
            filename?: string;
            data?: unknown | unknown[];
        };

        const d = values.data;

        return {
            filename: values.filename,
            data: Array.isArray(d) ? d : [d],
        };
    });

    // Operation-specific options (PDF etc.)
    const resource = this.getNodeParameter('resource', i) as string;
    const operation = this.getNodeParameter('operation', i) as string;

    if (resource === 'pdfServices') {
        const pdfOptions = (this.getNodeParameter('pdfOptions', i, {}) as AnyObj)?.values ?? {};
        Object.assign(output, cleanObject(pdfOptions as AnyObj));
    }

    return {
        api_key: apiKey,
        template,
        output,
        files,
        // optionally include "operation" / "resource" if your API route expects them
        resource,
        operation,
    };
}
