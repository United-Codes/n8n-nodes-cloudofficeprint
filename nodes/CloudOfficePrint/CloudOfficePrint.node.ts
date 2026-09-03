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
        description: 'Comprehensive document generation and PDF processing: Fill a Word, Excel or PowerPoint template with data and get the Office file or a PDF back. Convert, merge, split, compress and watermark PDFs, read and fill PDF forms, render pages as images, embed and extract attachments, password protect documents and compare PDFs.',
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
        codex: {
            categories: ['Utility'],
            alias: [
                'PDF',
                'DOCX',
                'XLSX',
                'PPTX',
                'Convert',
                'Compress',
                'Merge',
                'Split',
                'Watermark',
                'Form',
                'Fill',
                'Attachment',
                'Image',
                'JPEG',
                'Document',
                'Report',
                'Template',
                'AOP',
                'APEX Office Print',
            ],
            resources: {
                credentialDocumentation: [
                    {
                        url: 'https://www.cloudofficeprint.com/docs/n8n.html',
                    },
                ],
                primaryDocumentation: [
                    {
                        url: 'https://www.cloudofficeprint.com/docs/n8n.html',
                    },
                ],
            },
        },
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
                        description: 'Fill a template with data and render it to PDF, Office, HTML and more',
                    },
                    {
                        name: 'PDF Operation',
                        value: 'pdfOperations',
                        description: 'Convert, merge, split, compress or watermark a PDF, and work with its forms and attachments',
                    },
                    {
                        name: 'PDF Compare',
                        value: 'pdfCompare',
                        description: 'Produce a PDF that highlights what changed between two versions',
                    },
                    {
                        name: 'Password Protect Document',
                        value: 'protectDocument',
                        description: 'Encrypt a PDF or Office file so a password is needed to open or edit it',
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
