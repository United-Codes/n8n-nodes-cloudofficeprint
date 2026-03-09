import type { ILoadOptionsFunctions, INodePropertyOptions, } from "n8n-workflow";
import {
    // getExtensionFromMimeType,
    supportedOutputTypeBasedOnTemplate
} from "../utils/file_utils";

export async function getSupportedOutputTypeBasedOnTemplate(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    return new Promise((resolve, reject) => {
        const options: INodePropertyOptions[] = [];
        if (!this.getNodeParameter('template.fileConfig.mimeType', 0)) {
            options.push(
                { name: 'DOCX', value: 'docx' },
                { name: 'XLSX', value: 'xlsx' },
                { name: 'PPTX', value: 'pptx' },
                { name: 'HTML', value: 'html' },
                { name: 'MD', value: 'md' },
                { name: 'TXT', value: 'txt' },
                { name: 'CSV', value: 'csv' })
        } else {
            const template_type = this.getNodeParameter('template.fileConfig.mimeType', 0) as string;
            try {
                // const mimeType = getExtensionFromMimeType(template_type);
                // const supportedOutputTypes = supportedOutputTypeBasedOnTemplate[mimeType as keyof typeof supportedOutputTypeBasedOnTemplate];
                const supportedOutputTypes = supportedOutputTypeBasedOnTemplate[template_type as keyof typeof supportedOutputTypeBasedOnTemplate];
                options.push(...(supportedOutputTypes?.map(outputType => ({ name: outputType, value: outputType })) || []));
            } catch (error) {
                reject(error);
            }
        }
        options.push({ name: 'JSON (for debug)', value: 'json' });
        resolve(options);
    });
}
