// import type { INodeProperties } from 'n8n-workflow';
import { LoggerProxy } from 'n8n-workflow';
import { fileDesc } from '../descriptions/common.description';
type File = {
    file_source: string;
    file_url?: string;
    file_content?: string;
    filename?: string;
    name?: string;
    mime_type: string;
}

export type Template = {
    filename: string;
    template_type: string;
    file: string;
}

type FileNodeParameters = {
    fileSource: string;
    fileData: string;
    filename: string;
    mimeType: string;
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
 * @param name - The name of the file
 * @param displayName - The display name of the file
 * @param description - The description of the file
 * @param enableMultipleValues - Whether the file can have multiple values
 * @param required - Whether the file is required
 * @returns The file description
 */
export function getFileDesc(name: "file" | "template" | "subtemplate" | "compare_file1" | "compare_file2", displayName: string, description: string, enableMultipleValues: boolean = true, required: boolean = true) {
    const mimeOptions = [];
    const typeOptions : { multipleValues: boolean, minValue?: number, maxValue?: number } = {
        multipleValues: enableMultipleValues,
    }
    if (displayName.toLowerCase() === "template") {
        const tmpSupportedTypes = templateSupportedType.map(mimeType => mimeType.trim());
        LoggerProxy.info(JSON.stringify(tmpSupportedTypes));
        for (const mimeType of tmpSupportedTypes) {
            mimeOptions.push({ name: mimeType, value: mimeType });
        }
        // replace the options in fileDesc with the mimeOptions
        // @ts-expect-error - fileDesc.options is not optional
        fileDesc.options?.[0]?.values?.[1]?.options = mimeOptions as INodePropertyCollection[];
        typeOptions.minValue = 1;
        typeOptions.maxValue = 1;
    }else if(name.toLowerCase().includes("compare_file")){
        typeOptions.minValue = 1;
        typeOptions.maxValue = 1;
    }

    return {
        ...fileDesc,
        name: name,
        displayName: displayName,
        placeholder: "Add " + displayName,
        description: description,
        typeOptions: typeOptions,
        required: required,
    }
}

/**
 * 
 * @param this - The execute functions
 * @param index - The index of the node
 * @param name - The name of the file
 * @returns The files data
 */
export function getFilesData(fileNodeParameters: FileNodeParameters[] | FileNodeParameters, ref: "compare" | "template" = "template"): File[] | Template {
    let files = fileNodeParameters;
    if(ref === "compare"){
        files = [fileNodeParameters as FileNodeParameters];
    }
    // if it's not an array, then it's for a template
    if (!Array.isArray(files)) {
        const mimeExtension = files.mimeType;
        // return the mime extension from supportedMimeType
        const template_type = Object.keys(supportedMimeType).find(key => supportedMimeType[key as keyof typeof supportedMimeType] === mimeExtension);
        if (!template_type) {
            throw new Error('Invalid mime type');
        }
        return {
            filename: files.filename as string,
            template_type: template_type as string,
            file: files.fileData as string,
        } as Template;
    }
    else if (Array.isArray(files)) { // cases for the prepend and append files
        const filesData: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const fileItem = files[i];
            let filePayload: File;
            switch (fileItem.fileSource) {
                case 'url':
                    filePayload = {
                        filename: fileItem.filename,
                        mime_type: fileItem.mimeType,
                        file_url: fileItem.fileData,
                        file_source: 'url',
                    };
                    filesData.push(filePayload);
                    break;

                case 'base64':
                    filePayload = {
                        name: fileItem.filename,
                        mime_type: fileItem.mimeType,
                        file_content: fileItem.fileData,
                        file_source: 'base64',
                    };
                    filesData.push(filePayload);
                    break;

                case 'file':
                    filePayload = {
                        filename: fileItem.filename,
                        mime_type: fileItem.mimeType,
                        file_source: 'file',
                    };
                    filesData.push(filePayload);
                    break;

                default:
                    throw new Error('Invalid file source');
            }
        }
        return filesData;
    } else {
        throw new Error('Invalid file node parameters');
    }
}