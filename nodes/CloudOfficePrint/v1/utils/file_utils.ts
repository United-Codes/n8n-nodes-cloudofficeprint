import type { IDataObject, IExecuteFunctions, INodeProperties, INodePropertyCollection } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
    binaryPropertyDesc,
    fileDataDesc,
    fileSourceDesc,
    fileTypeDesc,
    fileUrlDesc,
    type FileFieldNames,
    type FileSource,
} from '../descriptions/common.description';

/** A secondary file entry: append_files, prepend_files or compare_files. */
export type ResolvedFile =
    | { file_source: 'base64'; file_content: string; mime_type: string; filename: string }
    | { file_source: 'url'; file_url: string; mime_type: string; filename: string };

/** The template object. A URL template uses `url`; `file_source` is never read here. */
export type ResolvedTemplate =
    | { template_type: string; filename: string; file: string }
    | { template_type: string; url: string };

/** Raw parameter values for one file slot, keyed by the collection's inner names. */
export type FileValues = {
    fileSource: FileSource;
    binaryProperty?: string;
    fileUrl?: string;
    fileData?: string;
    mimeType?: string;
};

export const supportedMimeType = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "docm": "application/vnd.ms-word.document.macroEnabled.12",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "pptm": "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
    "html": "text/html",
    "md": "text/markdown",
    "txt": "text/plain",
    "gif": "image/gif",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "svg": "image/svg+xml",
    "webp": "image/webp",
    "bmp": "image/bmp",
    "msbmp": "image/x-ms-bmp",
    "doc": "application/msword",
    "ppt": "application/vnd.ms-powerpoint",
    "xls": "application/vnd.ms-excel",
    "odt": "application/vnd.oasis.opendocument.text",
    "ods": "application/vnd.oasis.opendocument.spreadsheet",
    "odp": "application/vnd.oasis.opendocument.presentation",
    "eml": "message/rfc822",
    "msg": "application/vnd.ms-outlook",
    "csv": "text/csv",
    "heic": "image/heic",
    "avif": "image/avif",
    "xlsm": "application/vnd.ms-excel.sheet.macroEnabled.12",
    "ics": "text/calendar",
    "ifb": "text/calendar",
    "xml": "application/xml"
}

export const supportedOutputTypeBasedOnTemplate: { [key in keyof typeof supportedMimeType]?: string[] } = {
    "docx": ["docx", "doc", "html", "onepagepdf", "pdf", "rtf", "txt", "count_tags", "meta_data", "odt"],
    "docm": ["docx", "doc", "html", "onepagepdf", "pdf", "rtf", "txt", "count_tags", "meta_data", "odt", "docm"],
    "xlsx": ["csv", "html", "onepagepdf", "pdf", "count_tags", "meta_data", "xls", "ods", "xlsx"],
    "xlsm": ["csv", "html", "onepagepdf", "pdf", "count_tags", "meta_data", "xls", "xlsx", "ods", "xlsm"],
    "pptx": ["html", "onepagepdf", "pdf", "ppt", "count_tags", "meta_data", "odp", "pptx"],
    "pptm": ["html", "onepagepdf", "pdf", "ppt", "pptx", "count_tags", "meta_data", "odp", "pptm"],
    "html": ["onepagepdf", "pdf", "html", "count_tags"],
    "md": ["html", "onepagepdf", "pdf", "md", "count_tags"],
    "txt": ["onepagepdf", "pdf", "txt", "count_tags"],
    "csv": ["onepagepdf", "pdf", "txt", "count_tags", "meta_data", "xlsx", "csv"],
    "pdf": ["jpeg", "pdf", "form_fields", "xfa_form_fields", "get_attachments", "validate_pdf"],
    "ics": ["ics"],
    "ifb": ["ifb"],
    "xml": ["xml"]
}

export const appendPrependFileSupportedType = ["pdf", "docx", "docm", "xlsx", "pptx", "pptm", "html", "md", "txt", "gif", "jpeg", "jpg", "png", "svg", "webp", "bmp", "msbmp", "doc", "ppt", "xls", "odt", "ods", "odp", "eml", "msg", "csv", "heic", "avif"]
export const templateSupportedType = ["docx", "docm", "xlsx", "xlsm", "pptx", "pptm", "html", "md", "txt", "csv", "pdf", "ics", "ifb", "xml"];
export const subtemplatesSupportedType = ["docx", "pptx"];

/** Sources a file slot offers unless the operation narrows them. */
export const allFileSources: FileSource[] = ['binary', 'url', 'base64'];

/** Canonical inner names, or prefixed names when a node shows more than one slot. */
export function fileFieldNames(prefix = ''): FileFieldNames {
    if (!prefix) {
        return {
            source: 'fileSource',
            binaryProperty: 'binaryProperty',
            url: 'fileUrl',
            data: 'fileData',
            type: 'mimeType',
        };
    }
    return {
        source: `${prefix}Source`,
        binaryProperty: `${prefix}BinaryProperty`,
        url: `${prefix}Url`,
        data: `${prefix}Data`,
        type: `${prefix}Type`,
    };
}

/** Limits the file type select to the allowed types, hiding it when only one is allowed. */
function applyAllowedTypes(typeField: INodeProperties, allowedTypes: string[]) {
    if (allowedTypes.length === 1) {
        // single supported type: no need to show a select
        typeField.type = 'hidden';
        typeField.default = allowedTypes[0];
        delete typeField.options;
        delete typeField.hint;
    } else {
        typeField.options = allowedTypes.map((extension) => ({ name: extension, value: extension }));
    }
}

/**
 * Source select plus the three value fields and the file type select for one slot.
 * Each value field is shown only for its own source; the type select always shows.
 */
export function getFileFields(
    names: FileFieldNames,
    allowedTypes: string[],
    label = '',
    allowedSources: FileSource[] = allFileSources,
): INodeProperties[] {
    const prefixed = (displayName: string) => (label ? `${label} ${displayName}` : displayName);

    const source: INodeProperties = {
        ...fileSourceDesc,
        name: names.source,
        displayName: prefixed('Source'),
        options: fileSourceDesc.options?.filter(
            (option) => allowedSources.includes((option as { value: string }).value as FileSource),
        ),
        default: allowedSources[0],
    };
    const binary: INodeProperties = {
        ...binaryPropertyDesc,
        name: names.binaryProperty,
        displayName: prefixed('Input Binary Field'),
        displayOptions: { show: { [names.source]: ['binary'] } },
    };
    const url: INodeProperties = {
        ...fileUrlDesc,
        name: names.url,
        displayName: prefixed('URL'),
        displayOptions: { show: { [names.source]: ['url'] } },
    };
    const data: INodeProperties = {
        ...fileDataDesc,
        name: names.data,
        displayName: prefixed('Base64 Encoded File'),
        displayOptions: { show: { [names.source]: ['base64'] } },
    };
    const type: INodeProperties = { ...fileTypeDesc, name: names.type, displayName: prefixed('File Type') };
    applyAllowedTypes(type, allowedTypes);

    const valueFields: Record<FileSource, INodeProperties> = { binary, url, base64: data };

    return [source, ...allowedSources.map((s) => valueFields[s]), type];
}

/** A repeatable list of file slots, for operations that take more than one file. */
export function getFileCollectionDesc(
    name: string,
    displayName: string,
    description: string,
    allowedTypes: string[],
    allowedSources: FileSource[] = allFileSources,
): INodeProperties {
    return {
        displayName,
        name,
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        required: true,
        default: {},
        description,
        placeholder: `Add ${displayName}`,
        options: [
            {
                name: 'fileConfig',
                displayName: 'File Configuration',
                values: getFileFields(fileFieldNames(), allowedTypes, '', allowedSources),
            } as INodePropertyCollection,
        ],
    };
}

function extensionToMime(extension: string): string {
    const mime = supportedMimeType[extension as keyof typeof supportedMimeType];
    if (!mime) {
        throw new Error(`Unsupported file type: ${extension}`);
    }
    return mime;
}

/** Reads one slot's parameters into raw values, using the slot's own field names. */
export function readFileValues(
    ctx: IExecuteFunctions,
    index: number,
    names: FileFieldNames,
): FileValues {
    return {
        fileSource: ctx.getNodeParameter(names.source, index, 'base64') as FileSource,
        binaryProperty: ctx.getNodeParameter(names.binaryProperty, index, '') as string,
        fileUrl: ctx.getNodeParameter(names.url, index, '') as string,
        fileData: ctx.getNodeParameter(names.data, index, '') as string,
        mimeType: ctx.getNodeParameter(names.type, index, '') as string,
    };
}

/** Rejects a type left over from another operation, and hidden single-type slots. */
function resolveExtension(
    ctx: IExecuteFunctions,
    values: FileValues,
    allowedTypes: string[],
): string {
    const extension = allowedTypes.length === 1 ? allowedTypes[0] : (values.mimeType ?? '');
    if (!allowedTypes.includes(extension)) {
        throw new NodeOperationError(
            ctx.getNode(),
            `Unsupported file type: ${extension || 'none selected'}. Allowed types: ${allowedTypes.join(', ')}.`,
        );
    }
    return extension;
}

/** Last path segment of a URL, when it looks like a file name. */
function fileNameFromUrl(url: string): string | undefined {
    const withoutQuery = url.split(/[?#]/)[0];
    const candidate = withoutQuery.substring(withoutQuery.lastIndexOf('/') + 1);
    return candidate.includes('.') ? candidate : undefined;
}

type Located = {
    source: FileSource;
    extension: string;
    filename: string;
    /** Base64 content, for the binary and base64 sources */
    content?: string;
};

/** Turns one slot's raw values into a located file, reading binary data when needed. */
async function locate(
    ctx: IExecuteFunctions,
    index: number,
    values: FileValues,
    allowedTypes: string[],
    fallbackName: string,
    allowedSources: FileSource[] = allFileSources,
): Promise<Located> {
    const extension = resolveExtension(ctx, values, allowedTypes);
    const source = values.fileSource ?? 'base64';

    if (!allowedSources.includes(source)) {
        throw new NodeOperationError(
            ctx.getNode(),
            `This operation cannot take a file from ${source}. Allowed sources: ${allowedSources.join(', ')}.`,
            { itemIndex: index },
        );
    }

    switch (source) {
        case 'binary': {
            const property = values.binaryProperty?.trim() ?? '';
            if (!property) {
                throw new NodeOperationError(ctx.getNode(), 'No input binary field given. Enter the name of the binary field that holds the file, e.g. "data".', { itemIndex: index });
            }
            const metadata = ctx.helpers.assertBinaryData(index, property);
            const buffer = await ctx.helpers.getBinaryDataBuffer(index, property);
            return {
                source,
                extension,
                filename: metadata.fileName ?? `${fallbackName}.${extension}`,
                content: buffer.toString('base64'),
            };
        }
        case 'url': {
            const url = values.fileUrl?.trim() ?? '';
            if (!url) {
                throw new NodeOperationError(ctx.getNode(), 'No URL given. Enter the URL the Cloud Office Print server should download the file from.', { itemIndex: index });
            }
            return { source, extension, filename: url };
        }
        case 'base64': {
            const content = values.fileData ?? '';
            if (!content) {
                throw new NodeOperationError(ctx.getNode(), 'No file content found. Please provide the Base64 encoded file.', { itemIndex: index });
            }
            return { source, extension, filename: `${fallbackName}.${extension}`, content };
        }
        default:
            throw new NodeOperationError(ctx.getNode(), `Unknown file source: ${source as string}`, { itemIndex: index });
    }
}

/** Builds the template object for the Document Generation resource. */
export async function resolveTemplate(
    ctx: IExecuteFunctions,
    index: number,
    names: FileFieldNames,
    allowedTypes: string[],
    allowedSources: FileSource[] = allFileSources,
): Promise<ResolvedTemplate> {
    const values = readFileValues(ctx, index, names);
    const located = await locate(ctx, index, values, allowedTypes, 'template', allowedSources);

    if (located.source === 'url') {
        return {
            template_type: located.extension,
            url: located.filename,
        };
    }

    return {
        template_type: located.extension,
        filename: located.filename,
        file: located.content as string,
    };
}

function toResolvedFile(located: Located, fallbackName: string): ResolvedFile {
    const mime_type = extensionToMime(located.extension);

    if (located.source === 'url') {
        return {
            file_source: 'url',
            file_url: located.filename,
            mime_type,
            filename: fileNameFromUrl(located.filename) ?? `${fallbackName}.${located.extension}`,
        };
    }

    return {
        file_source: 'base64',
        file_content: located.content as string,
        mime_type,
        filename: located.filename,
    };
}

/** Builds one secondary file entry from a slot shown directly on the node. */
export async function resolveFile(
    ctx: IExecuteFunctions,
    index: number,
    names: FileFieldNames,
    allowedTypes: string[],
    fallbackName = 'file',
    allowedSources: FileSource[] = allFileSources,
): Promise<ResolvedFile> {
    const values = readFileValues(ctx, index, names);
    const located = await locate(ctx, index, values, allowedTypes, fallbackName, allowedSources);
    return toResolvedFile(located, fallbackName);
}

/** Builds secondary file entries from a repeatable file list. */
export async function resolveFileList(
    ctx: IExecuteFunctions,
    index: number,
    entries: IDataObject[],
    allowedTypes: string[],
    allowedSources: FileSource[] = allFileSources,
): Promise<ResolvedFile[]> {
    const resolved: ResolvedFile[] = [];
    for (let i = 0; i < entries.length; i++) {
        const fallbackName = `file_${i + 1}`;
        const located = await locate(ctx, index, entries[i] as FileValues, allowedTypes, fallbackName, allowedSources);
        resolved.push(toResolvedFile(located, fallbackName));
    }
    return resolved;
}
