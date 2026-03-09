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
                // {
                //     displayName: 'File Source',
                //     name: 'fileSource',
                //     type: 'options',
                //     default: 'url',
                //     options: [
                //         { name: 'URL', value: 'url' },
                //         { name: 'Base64', value: 'base64' },
                //         // { name: 'File Path', value: 'file' },
                //     ],
                // },

                {
                    // displayName: 'File Data',
                    displayName: 'Base64 Encoded File',
                    name: 'fileData',
                    type: 'string',
                    default: '',
                    required: true,
                    typeOptions: {
                        rows: 4,
                    },
                    // displayOptions: {
                    //     show: {
                    //         fileSource: [
                    //             // 'url',
                    //             'base64',
                    //             // 'file'
                    //         ],
                    //     },
                    // },
                    description:
                        'URL, Base64 content, or file path depending on File Source',
                },

                // {
                //     displayName: 'Filename',
                //     name: 'filename',
                //     type: 'string',
                //     placeholder: 'file.docx',
                //     default: '',
                //     required: true,
                //     description: 'Name of the file including extension',
                // },

                {
                    displayName: 'Mime Type',
                    name: 'mimeType',
                    type: 'options',
                    default: '',
                    options: [],
                    required: true,
                },
            ],
        },
    ],
};

export const outputTypeDesc: INodeProperties = {
    displayName: 'Output Type',
    name: 'outputType',
    type: 'options',
    description: 'Output type for the given request',
    default: '',
    required: true,
    typeOptions: {
        loadOptionsMethod: 'getOutputType',
        loadOptionsDependsOn: ['template.fileConfig.mimeType'],
    },
};
