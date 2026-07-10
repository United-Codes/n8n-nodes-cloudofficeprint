import type { INodeProperties } from 'n8n-workflow';

export const fileDesc: INodeProperties = {
    displayName: 'File',
    name: 'file',
    type: 'fixedCollection',
    typeOptions: {
        multipleValues: true,
    },
    required: true,
    default: {},
    description: 'File to process',
    options: [
        {
            name: 'fileConfig',
            displayName: 'File Configuration',
            values: [
                {
                    displayName: 'Base64 Encoded File',
                    name: 'fileData',
                    type: 'string',
                    default: '',
                    required: true,
                    typeOptions: {
                        rows: 4,
                    },
                    description: 'Base64-encoded content of the file',
                },
                {
                    displayName: 'File Type',
                    name: 'mimeType',
                    type: 'options',
                    default: '',
                    options: [],
                    required: true,
                    description: 'Type of the provided file',
                },
            ],
        },
    ],
};

export const outputTypeDesc: INodeProperties = {
    displayName: 'Output Type Name or ID',
    name: 'outputType',
    type: 'options',
    description: 'Output type for the given request. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    default: '',
    required: true,
    typeOptions: {
        loadOptionsMethod: 'getOutputType',
        loadOptionsDependsOn: ['template.fileConfig.mimeType'],
    },
};
