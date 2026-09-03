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
    fileName: string;
};

export const fileSourceOptions = [
    {
        name: 'Input Binary Field',
        value: 'binary',
        description: 'A file attached to the incoming item, as produced by Google Drive, HTTP Request or Read/Write Files',
    },
    {
        name: 'URL',
        value: 'url',
        description: 'A link Cloud Office Print downloads itself. The file never passes through n8n, which suits large files.',
    },
    {
        name: 'Base64',
        value: 'base64',
        description: 'The file content as a Base64 string, pasted in or taken from an expression',
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
    placeholder: 'e.g. https://example.com/invoice.pdf',
    description: 'Link Cloud Office Print downloads the file from, over http(s), ftp or sftp. It must be reachable from the public internet, not only from your n8n instance.',
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
    description: 'File content as a Base64 string. Prefer the Input Binary Field source unless the Base64 is already present in your JSON.',
    hint: 'Raw Base64 only, with no data:...;base64 prefix',
};

export const fileNameDesc: INodeProperties = {
    displayName: 'File Name',
    name: 'fileName',
    type: 'string',
    default: '',
    placeholder: 'e.g. factur-x.xml',
    description: 'Name to store the file under, including its extension. Leave empty to keep the name of the incoming binary file, or to have one generated for a Base64 source.',
    hint: 'The extension is not added for you - give the full name, e.g. factur-x.xml',
};

export const fileTypeDesc: INodeProperties = {
    displayName: 'File Type',
    name: 'mimeType',
    type: 'options',
    default: '',
    options: [],
    required: true,
    description: 'The format of the file. It must match the actual content: Cloud Office Print trusts this value instead of inspecting the file.',
    hint: 'Only the formats this operation accepts are listed',
};

export const outputFileNameDesc: INodeProperties = {
    displayName: 'Output File Name',
    name: 'outputFileName',
    type: 'string',
    default: 'output',
    required: true,
    placeholder: 'e.g. invoice-2026-001',
    description: 'Name for the generated file, without an extension. The correct extension is appended for you.',
};

export const outputBinaryPropertyDesc: INodeProperties = {
    displayName: 'Output Binary Field',
    name: 'outputBinaryProperty',
    type: 'string',
    default: 'data',
    required: true,
    placeholder: 'e.g. data',
    description: 'Name of the binary field the generated file is written to. Leave it as "data" unless a later node expects a different field.',
};

export const outputTypeDesc: INodeProperties = {
    displayName: 'Output Type Name or ID',
    name: 'outputType',
    type: 'options',
    description: 'The format the template is rendered to. The list is filtered by the template file type: a DOCX can produce PDF, DOCX, HTML and more. Leave empty for a template type with only one possible output, such as PDF or XML, and the node supplies it. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    default: '',
    typeOptions: {
        loadOptionsMethod: 'getOutputType',
        loadOptionsDependsOn: ['templateType'],
    },
};
