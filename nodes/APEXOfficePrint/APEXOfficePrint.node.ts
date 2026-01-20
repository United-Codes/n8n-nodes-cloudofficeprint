/* eslint-disable n8n-nodes-base/node-filename-against-convention */
import type { INodeTypeBaseDescription, IVersionedNodeType } from 'n8n-workflow';
import { VersionedNodeType } from 'n8n-workflow';

import { APEXOfficePrintV1 } from './v1/APEXOfficePrintV1.node';

export class APEXOfficePrint extends VersionedNodeType {
    constructor() {
        const baseDescription: INodeTypeBaseDescription = {
            displayName: 'APEX Office Print',
            name: 'apexOfficePrint',
            group: ['transform'],
            icon: {
                light: 'file:icons/aop.svg',
                dark: 'file:icons/aop.dark.svg'
            },
			subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Generate/convert/edit/manage documents with AOP',
            defaultVersion: 1,
        };

        const nodeVersions: IVersionedNodeType['nodeVersions'] = {
            1: new APEXOfficePrintV1(baseDescription),
        };
        super(nodeVersions, baseDescription);
    }
}