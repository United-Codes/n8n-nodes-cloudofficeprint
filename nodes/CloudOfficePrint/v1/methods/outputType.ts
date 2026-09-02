import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { supportedOutputTypeBasedOnTemplate } from '../utils/file_utils';

export async function getSupportedOutputTypeBasedOnTemplate(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    const templateType = this.getNodeParameter('templateType', '') as string;
    let options: INodePropertyOptions[];
    if (!templateType) {
        options = [
            { name: 'DOCX', value: 'docx' },
            { name: 'XLSX', value: 'xlsx' },
            { name: 'PPTX', value: 'pptx' },
            { name: 'HTML', value: 'html' },
            { name: 'MD', value: 'md' },
            { name: 'TXT', value: 'txt' },
            { name: 'CSV', value: 'csv' },
        ];
    } else {
        const supportedOutputTypes = supportedOutputTypeBasedOnTemplate[templateType as keyof typeof supportedOutputTypeBasedOnTemplate];
        options = supportedOutputTypes?.map((outputType) => ({ name: outputType, value: outputType })) ?? [];
    }
    return options;
}
