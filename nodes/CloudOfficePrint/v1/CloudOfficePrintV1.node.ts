/* eslint-disable @n8n/community-nodes/icon-validation */
import type {
    IExecuteFunctions,
    INodeType,
    INodeTypeBaseDescription,
    INodeTypeDescription,
} from 'n8n-workflow';

import { description } from './actions/node.description';
import { router } from './actions/router';
import { outputType } from './methods';
// import { sendAndWaitWebhook } from '../../../../utils/sendAndWait/utils';

export class CloudOfficePrintV1 implements INodeType {
    description: INodeTypeDescription;

    constructor(baseDescription: INodeTypeBaseDescription) {
        this.description = {
            ...baseDescription,
            ...description,
        };
    }

    methods = { loadOptions: { getOutputType: outputType.getSupportedOutputTypeBasedOnTemplate }} ;
    // webhook = sendAndWaitWebhook;
    async execute(this: IExecuteFunctions) {
        return await router.call(this);
    }
}