import type { INodeTypeBaseDescription, IVersionedNodeType } from 'n8n-workflow';
import { VersionedNodeType } from 'n8n-workflow';

import { CloudOfficePrintV1 } from './v1/CloudOfficePrintV1.node';

export class CloudOfficePrint extends VersionedNodeType {
    constructor() {
        const baseDescription: INodeTypeBaseDescription = {
            displayName: 'Cloud Office Print',
            name: 'cloudOfficePrint',
            group: ['transform'],
            icon: {
                light: 'file:v1/cop.svg',
                dark: 'file:v1/cop.dark.svg'
            },
			subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Comprehensive document generation and PDF processing: create documents from templates, convert files to PDF, merge, compress, watermark, password protect and compare PDFs with the Cloud Office Print API',
            defaultVersion: 1,
        };

        const nodeVersions: IVersionedNodeType['nodeVersions'] = {
            1: new CloudOfficePrintV1(baseDescription),
        };
        super(nodeVersions, baseDescription);
    }
}