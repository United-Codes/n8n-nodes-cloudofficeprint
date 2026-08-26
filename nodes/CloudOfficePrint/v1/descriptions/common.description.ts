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
        description: 'A file already attached to the incoming item, e.g. from Google Drive, HTTP Request or Read/Write Files',
    },
    {
        name: 'URL',
        value: 'url',
        description: 'A public link. Cloud Office Print downloads it directly, so the file never passes through the workflow - best for large files.',
    },
    {
        name: 'Base64',
        value: 'base64',
        description: 'The file content pasted in, or taken from an expression, as a Base64 string',
    },
];

export const fileSourceDesc: INodeProperties = {
    displayName: 'Source',
    name: 'fileSource',
    type: 'options',
    default: 'binary',
    required: true,
    description: 'Where this file comes from. The rest of the fields below change to match.',
    options: fileSourceOptions,
};

export const binaryPropertyDesc: INodeProperties = {
    displayName: 'Input Binary Field',
    name: 'binaryProperty',
    type: 'string',
    default: 'data',
    required: true,
    placeholder: 'e.g. data',
    description: 'Name of the binary field on the incoming item that holds the file. n8n calls it "data" unless the node before it was told otherwise.',
    hint: 'Look at the INPUT panel: the name above the file preview is what goes here',
};

export const fileUrlDesc: INodeProperties = {
    displayName: 'URL',
    name: 'fileUrl',
    type: 'string',
    default: '',
    required: true,
    placeholder: 'e.g. https://example.com/invoice.docx',
    description: 'Public http(s) link that Cloud Office Print downloads the file from. It must be reachable from the internet, not just from your n8n instance.',
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
    description: 'File content as a Base64 string. Use the Input Binary Field source instead unless the Base64 is already sitting in your JSON.',
    hint: 'Raw Base64 only - no data:...;base64, prefix',
};

export const fileTypeDesc: INodeProperties = {
    displayName: 'File Type',
    name: 'mimeType',
    type: 'options',
    default: '',
    options: [],
    required: true,
    description: 'What kind of file this is. Required for every source, and it must match the real content - Cloud Office Print does not guess.',
    hint: 'Only the types this operation accepts are listed',
};

export const outputFileNameDesc: INodeProperties = {
    displayName: 'Output File Name',
    name: 'outputFileName',
    type: 'string',
    default: 'output',
    required: true,
    placeholder: 'e.g. invoice-2026-001',
    description: 'Name for the generated file, without the extension. The extension is added for you from the output type.',
};

export const outputBinaryPropertyDesc: INodeProperties = {
    displayName: 'Output Binary Field',
    name: 'outputBinaryProperty',
    type: 'string',
    default: 'data',
    required: true,
    placeholder: 'e.g. data',
    description: 'Name of the binary field the generated file is written to. Leave it as "data" unless a later node expects a different name.',
};

export const outputTypeDesc: INodeProperties = {
    displayName: 'Output Type Name or ID',
    name: 'outputType',
    type: 'options',
    description: 'What to turn the template into. The list is filtered by the file type of the template - a .docx can become PDF, DOCX, HTML and more. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    default: '',
    required: true,
    typeOptions: {
        loadOptionsMethod: 'getOutputType',
        loadOptionsDependsOn: ['templateType'],
    },
};
