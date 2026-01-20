import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import type { APEXOfficePrint } from './node.type';

import * as pdfOperations from './pdfOperations';
import * as standardAOPCall from './standardAOPCall';

export async function router(this: IExecuteFunctions) {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const resource = this.getNodeParameter<APEXOfficePrint>('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0);

    let responseData;

    const apexOfficePrint = {
        resource,
        operation,
    } as APEXOfficePrint;

    for (let i = 0; i < items.length; i++) {
        try {
            switch (apexOfficePrint.resource) {
                case 'pdfOperations':
                    responseData = await pdfOperations[apexOfficePrint.operation].execute.call(this, i);
                    break;
                case 'standardAOPCall':
                    responseData = await standardAOPCall[apexOfficePrint.operation].execute.call(this, i);
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
            throw error;
        }
    }
    return [returnData];
}