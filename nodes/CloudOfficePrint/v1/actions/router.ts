import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import type { CloudOfficePrint } from './node.type';

import * as pdfOperations from './pdfOperations';
import * as standardCOPCall from './standardCOPCall';
import * as protectDocument from './protectDocument';
import * as pdfCompare from './pdfCompare';

export async function router(this: IExecuteFunctions) {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const resource = this.getNodeParameter<CloudOfficePrint>('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0);

    let responseData;

    const cloudOfficePrint = {
        resource,
        operation,
    } as CloudOfficePrint;

    for (let i = 0; i < items.length; i++) {
        try {
            switch (cloudOfficePrint.resource) {
                case 'pdfOperations':
                    responseData = await pdfOperations[cloudOfficePrint.operation].execute.call(this, i);
                    break;
                case 'documentGeneration':
                    responseData = await standardCOPCall[cloudOfficePrint.operation].execute.call(this, i);
                    break;
                case 'protectDocument':
                    responseData = await protectDocument[cloudOfficePrint.operation].execute.call(this, i);
                    break;
                case 'pdfCompare':
                    responseData = await pdfCompare[cloudOfficePrint.operation].execute.call(this, i);
                    break;
                default:
                    throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not known`);
            }

            returnData.push(...responseData);
        } catch (error) {
            if (this.continueOnFail()) {
                const executionErrorData = this.helpers.constructExecutionMetaData(
                    this.helpers.returnJsonArray({ error: error.message }),
                    { itemData: { item: i } },
                );
                returnData.push(...executionErrorData);
                continue;
            }
            //NodeApiError will be missing the itemIndex, add it
            if (error instanceof NodeApiError && error?.context?.itemIndex === undefined) {
                if (error.context === undefined) {
                    error.context = {};
                }
                error.context.itemIndex = i;
            }
            // eslint-disable-next-line @n8n/community-nodes/require-node-api-error -- re-wrapping would drop the HTTP context set by the transport layer
            throw error;
        }
    }
    return [returnData];
}