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
                    placeholder: 'e.g. JVBERi0xLjcKJcTl8uXr...',
                    description: 'Content of the file encoded as Base64',
                    hint: 'Paste the raw Base64 string only, without a data:...;base64, prefix',
                },
                {
                    displayName: 'File Type',
                    name: 'mimeType',
                    type: 'options',
                    default: '',
                    options: [],
                    required: true,
                    description: 'File type of the provided content',
                    hint: 'Must match the actual type of the Base64 content',
                },
            ],
        },
    ],
};

export const outputFileNameDesc: INodeProperties = {
    displayName: 'Output File Name',
    name: 'outputFileName',
    type: 'string',
    default: 'output',
    required: true,
    placeholder: 'e.g. invoice',
    description: 'Name for the generated file, without extension',
};

export const outputTypeDesc: INodeProperties = {
    displayName: 'Output Type Name',
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
