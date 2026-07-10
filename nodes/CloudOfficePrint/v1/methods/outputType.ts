import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { supportedOutputTypeBasedOnTemplate } from '../utils/file_utils';

export async function getSupportedOutputTypeBasedOnTemplate(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    const templateType = this.getNodeParameter('template.fileConfig.mimeType', 0) as string;
    if (!templateType) {
        return [
            { name: 'DOCX', value: 'docx' },
            { name: 'XLSX', value: 'xlsx' },
            { name: 'PPTX', value: 'pptx' },
            { name: 'HTML', value: 'html' },
            { name: 'MD', value: 'md' },
            { name: 'TXT', value: 'txt' },
            { name: 'CSV', value: 'csv' },
        ];
    }
    const supportedOutputTypes = supportedOutputTypeBasedOnTemplate[templateType as keyof typeof supportedOutputTypeBasedOnTemplate];
    return supportedOutputTypes?.map((outputType) => ({ name: outputType, value: outputType })) ?? [];
}
