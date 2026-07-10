import type { INodeProperties, INodePropertyCollection } from 'n8n-workflow';
import { fileDesc } from '../descriptions/common.description';

type File = {
    file_source: 'base64';
    file_content: string;
    name: string;
    mime_type: string;
}

export type Template = {
    filename: string;
    template_type: string;
    file: string;
}

export type FileNodeParameters = {
    /** Extension key of supportedMimeType selected in the File Type dropdown, e.g. "docx" */
    mimeType: string;
    /** Base64-encoded file content */
    fileData: string;
}

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

export const getExtensionFromMimeType = (mimeType: string) => {
    return Object.keys(supportedMimeType).find(key => supportedMimeType[key as keyof typeof supportedMimeType] === mimeType);
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

export const appendPrependFileSupportedType = ["pdf", "docx", "docm", "xlsx", "pptx", "pptm", "html", "md", "txt", "gif", "jpeg", "jpg", "png", "svg", "webp", "bmp", "msbmp", "doc", "ppt", "xls", "odt", "ods", "odp", "eml", "msg", "csv", "heic", "heif", "avif"]
export const templateSupportedType = ["docx", "docm", "xlsx", "xlsm", "pptx", "pptm", "html", "md", "txt", "csv", "pdf", "ics", "ifb", "xml"];
export const subtemplatesSupportedType = ["docx", "pptx"];

/**
 *
 * @param name - The parameter name of the file collection
 * @param displayName - The display name of the file collection
 * @param description - The description of the file collection
 * @param enableMultipleValues - Whether the collection accepts multiple files
 * @param required - Whether the file is required
 * @param allowedTypes - Extensions offered in the File Type dropdown (keys of supportedMimeType)
 * @returns The file description
 */
export function getFileDesc(
    name: 'file' | 'template' | 'subtemplate' | 'compare_file1' | 'compare_file2',
    displayName: string,
    description: string,
    enableMultipleValues = true,
    required = true,
    allowedTypes: string[] = Object.keys(supportedMimeType),
): INodeProperties {
    const desc = structuredClone(fileDesc);

    const typeOptions: { multipleValues: boolean; minValue?: number; maxValue?: number } = {
        multipleValues: enableMultipleValues,
    };
    if (!enableMultipleValues) {
        typeOptions.minValue = 1;
        typeOptions.maxValue = 1;
    }

    const collection = desc.options?.[0] as INodePropertyCollection;
    const mimeField = collection.values.find((value) => value.name === 'mimeType') as INodeProperties;
    mimeField.options = allowedTypes.map((extension) => ({ name: extension, value: extension }));

    return {
        ...desc,
        name,
        displayName,
        placeholder: `Add ${displayName}`,
        description,
        typeOptions,
        required,
    };
}

function extensionToMime(extension: string): string {
    const mime = supportedMimeType[extension as keyof typeof supportedMimeType];
    if (!mime) {
        throw new Error(`Unsupported file type: ${extension}`);
    }
    return mime;
}

/**
 * Converts fileConfig node parameters into AOP payload objects.
 * Single object -> Template (for the "template" slot of the request body).
 * Array -> File[] (base64 file entries, e.g. append/prepend/merge inputs).
 */
export function getFilesData(
    fileNodeParameters: FileNodeParameters[] | FileNodeParameters,
    ref: 'compare' | 'template' = 'template',
): File[] | Template {
    const files = ref === 'compare'
        ? [fileNodeParameters as FileNodeParameters]
        : fileNodeParameters;

    if (!Array.isArray(files)) {
        const extension = files.mimeType;
        extensionToMime(extension); // validates the extension
        return {
            filename: `template.${extension}`,
            template_type: extension,
            file: files.fileData,
        };
    }

    return files.map((fileItem, i) => ({
        name: `file_${i + 1}.${fileItem.mimeType}`,
        mime_type: extensionToMime(fileItem.mimeType),
        file_content: fileItem.fileData,
        file_source: 'base64' as const,
    }));
}
