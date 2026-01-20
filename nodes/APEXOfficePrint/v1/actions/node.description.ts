/* eslint-disable n8n-nodes-base/node-filename-against-convention */
import { NodeConnectionTypes, type INodeTypeDescription } from 'n8n-workflow';

import * as pdfOperations from './pdfOperations';
import * as standardAOPCall from './standardAOPCall';

export const description: INodeTypeDescription = {
	displayName: 'APEX Office Print',
	name: 'apexOfficePrint',
	group: ['transform'],
	icon: {
		light: 'file:aop.svg',
		dark: 'file:aop.dark.svg'
	},
	subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
	description: 'Generate/convert/edit/manage documents with AOP',
	version: 1,
	defaultVersion: 1,
	defaults: {
		name: 'APEX Office Print',
	},
	inputs: [NodeConnectionTypes.Main],
	outputs: [NodeConnectionTypes.Main],
	usableAsTool: true,
	credentials: [
		{
			name: 'aopApi',
			required: true,
		},
	],
	// waitingNodeTooltip: SEND_AND_WAIT_WAITING_TOOLTIP,
	// webhooks: sendAndWaitWebhooksDescription,    
	properties: [
		{
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			default: 'pdfOperations',
			options: [
				{
					name: 'PDF Operation',
					value: 'pdfOperations',
				},
				{
					name: 'Standard AOP Call',
					value: 'standardAOPCall',
				}
			],
		},
		...pdfOperations.description,
        ...standardAOPCall.description,
	],
};
