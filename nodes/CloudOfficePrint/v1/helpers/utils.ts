import type {
	IDataObject,
	IExecuteFunctions,
	IExecuteSingleFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	JsonObject,
} from 'n8n-workflow';
import {
	// ApplicationError,
	jsonParse,
	NodeApiError
} from 'n8n-workflow';

export function prepareApiError(
	this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IPollFunctions,
	error: IDataObject,
	itemIndex = 0,
) {
	const [httpCode, err, message] = (error.description as string).split(' - ');
	const json = jsonParse(err);
	return new NodeApiError(this.getNode(), json as JsonObject, {
		itemIndex,
		httpCode,
		//In UI we are replacing some of the field names to make them more user friendly, updating error message to reflect that
		message: message
			.replace(/toRecipients/g, 'toRecipients (To)')
			.replace(/bodyContent/g, 'bodyContent (Message)')
			.replace(/bodyContentType/g, 'bodyContentType (Message Type)'),
	});
}

export const encodeOutlookId = (id: string) => {
	return id.replace(/-/g, '%2F').replace(/=/g, '%3D').replace(/\+/g, '%2B');
};

export const decodeOutlookId = (id: string) => {
	return id.replace(/%2F/g, '-').replace(/%3D/g, '=').replace(/%2B/g, '+');
};
