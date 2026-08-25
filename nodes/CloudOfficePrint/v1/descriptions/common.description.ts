import type { INodeProperties } from 'n8n-workflow';

/** Where the content of a file slot comes from. */
export type FileSource = 'binary' | 'url' | 'base64';

/**
 * Parameter names for one file slot. Slots that already shipped keep the names
 * they shipped with, so only the new source fields are added around them.
 */
export type FileFieldNames = {
    source: string;
    binaryProperty: string;
    url: string;
    data: string;
    type: string;
};

export const fileSourceOptions = [
    {
        name: 'Input Binary Field',
        value: 'binary',
        description: 'Use a file attached to the incoming item, e.g. from Google Drive or HTTP Request',
    },
    {
        name: 'URL',
        value: 'url',
        description: 'Let the Cloud Office Print server download the file, so it never passes through the workflow',
    },
    {
        name: 'Base64',
        value: 'base64',
        description: 'Paste the file content encoded as Base64',
    },
];

export const fileSourceDesc: INodeProperties = {
    displayName: 'Source',
    name: 'fileSource',
    type: 'options',
    default: 'binary',
    required: true,
    description: 'Where to read the file from',
    options: fileSourceOptions,
};

export const binaryPropertyDesc: INodeProperties = {
    displayName: 'Input Binary Field',
    name: 'binaryProperty',
    type: 'string',
    default: 'data',
    required: true,
    placeholder: 'e.g. data',
    description: 'Name of the binary field on the incoming item that holds the file',
};

export const fileUrlDesc: INodeProperties = {
    displayName: 'URL',
    name: 'fileUrl',
    type: 'string',
    default: '',
    required: true,
    placeholder: 'e.g. https://example.com/invoice.docx',
    description: 'URL the Cloud Office Print server downloads the file from',
};

export const fileDataDesc: INodeProperties = {
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
};

export const fileTypeDesc: INodeProperties = {
    displayName: 'File Type',
    name: 'mimeType',
    type: 'options',
    default: '',
    options: [],
    required: true,
    description: 'File type of the file. Required for every source, including URL.',
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

export const outputBinaryPropertyDesc: INodeProperties = {
    displayName: 'Put Output In Field',
    name: 'outputBinaryProperty',
    type: 'string',
    default: 'data',
    required: true,
    placeholder: 'e.g. data',
    description: 'Name of the binary field the generated file is written to',
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
        loadOptionsDependsOn: ['templateType'],
    },
};
