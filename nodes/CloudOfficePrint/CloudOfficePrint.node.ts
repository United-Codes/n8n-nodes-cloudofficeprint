import type { IExecuteFunctions, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import * as pdfOperations from './v1/actions/pdfOperations';
import * as standardCOPCall from './v1/actions/standardCOPCall';
import * as protectDocument from './v1/actions/protectDocument';
import * as pdfCompare from './v1/actions/pdfCompare';
import { router } from './v1/actions/router';
import { outputType } from './v1/methods';

export class CloudOfficePrint implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Cloud Office Print',
        name: 'cloudOfficePrint',
        group: ['transform'],
        icon: {
            light: 'file:v1/cop.svg',
            dark: 'file:v1/cop.dark.svg',
        },
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Comprehensive document generation and PDF processing: create documents from templates, convert files to PDF, merge, compress, watermark, password protect and compare PDFs with the Cloud Office Print API',
        version: 1,
        defaults: {
            name: 'Cloud Office Print',
        },
        inputs: [NodeConnectionTypes.Main],
        outputs: [NodeConnectionTypes.Main],
        usableAsTool: true,
        credentials: [
            {
                name: 'copApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                default: 'pdfOperations',
                options: [
                    {
                        name: 'Document Generation',
                        value: 'documentGeneration',
                    },
                    {
                        name: 'PDF Operation',
                        value: 'pdfOperations',
                    },
                    {
                        name: 'Password Protect Document',
                        value: 'protectDocument',
                    },
                    {
                        name: 'PDF Compare',
                        value: 'pdfCompare',
                    },
                ],
            },
            ...standardCOPCall.description,
            ...pdfOperations.description,
            ...protectDocument.description,
            ...pdfCompare.description,
            {
                displayName: 'Debug Mode',
                name: 'debugMode',
                type: 'boolean',
                default: false,
                description: 'Whether to return the request payload as JSON instead of sending it to Cloud Office Print. Attach this payload when contacting support.',
            },
        ],
    };

    methods = { loadOptions: { getOutputType: outputType.getSupportedOutputTypeBasedOnTemplate } };

    async execute(this: IExecuteFunctions) {
        return await router.call(this);
    }
}
