/* eslint-disable n8n-nodes-base/node-filename-against-convention */
import { NodeConnectionTypes, type INodeTypeDescription } from 'n8n-workflow';

import * as pdfOperations from './pdfOperations';
import * as standardCOPCall from './standardCOPCall';
import * as protectDocument from './protectDocument';
import * as pdfCompare from './pdfCompare'

export const description: INodeTypeDescription = {
	displayName: 'Cloud Office Print',
	name: 'cloudOfficePrint',
	group: ['transform'],
	subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
	description: 'Comprehensive document generation and PDF processing: create documents from templates, convert files to PDF, merge, compress, watermark, password protect and compare PDFs with the Cloud Office Print API',
	version: 1,
	defaultVersion: 1,
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
	],
};
