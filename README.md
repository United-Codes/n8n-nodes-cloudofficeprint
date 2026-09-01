# n8n-nodes-cloudofficeprint

This is an n8n community node. It lets you use **Cloud Office Print** in your n8n workflows.

Cloud Office Print generates and manipulates PDF and Office documents: fill a Word, Excel or PowerPoint template with data and get the Office file back, convert files to PDF, merge, split, compress and watermark PDFs, read and fill PDF forms, render pages as images, handle PDF attachments, password-protect documents, and compare PDFs.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Usage](#usage)  
[Compatibility](#compatibility)  
[Example Workflows](#example-workflows)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Nodes (Recommended)
For users on n8n v0.187+, you can install this node directly from the n8n Community Nodes panel in the n8n editor:

1. Open your n8n editor
2. Go to Settings > Community Nodes
3. Search for "n8n-nodes-cloudofficeprint"
4. Click Install
5. Reload the editor

### Manual Installation
You can also install this node manually:
1. Navigate to your n8n installation directory
2. Run the following command:

```
npm install n8n-nodes-cloudofficeprint
```

3. Restart your n8n server


## Operations

**1. Document Generation**
- Generate a document from a template, with data and an output type of your choice

**2. PDF Operations**
- Convert a file to PDF
- Compress a PDF
- Merge multiple files into a single PDF
- Split a PDF, by page count or by text on the page
- Add a watermark to a PDF
- Read the fields of a PDF form, as JSON or marked onto the PDF
- Fill in an existing PDF form and optionally flatten it
- Build a fillable PDF form from a Word template
- Convert the pages of a PDF to JPEG images
- Embed attachments in a PDF
- Extract attachments from a PDF

**3. Password Protect Document**
- Password protect an Office file
- Password protect a PDF

**4. PDF Compare**
- Compare two PDFs

## Credentials

Sign up and get an API key from [Cloud Office Print](https://www.united-codes.com/products/cloudofficeprint/), then create a **Cloud Office Print API** credential in n8n with:

- **API Key** – your Cloud Office Print API key. Required for the Cloud Office Print and APEX Office Print API URLs; *optional for an on-premise APEX Office Print server that does not require a key*
- **API Base URL** – the Cloud Office Print API endpoint (defaults to `https://api.cloudofficeprint.com`)
- **Mode** – `Production` or `Development`; Development marks requests with `mode: development`, useful when testing against a trial or development license

## Usage

Files go in as n8n binary data and come back out as n8n binary data, so the node drops straight between Google Drive, HTTP Request, Gmail, S3 or anything else that produces or consumes files.

### Giving the node a file

Every file field asks where the file comes from:

- **Input Binary Field** *(default)* – the name of the binary field on the incoming item, usually `data`. Use this when the file arrives from an earlier node.
- **URL** – a http(s) file link. The Cloud Office Print server downloads the file itself, so it never passes through the workflow. Best for large files.
- **Base64** – the file content as a raw Base64 string. No `data:...;base64,` prefix.

**File Type** is always required: the extension, for example `docx` or `pdf`. It must match the actual content, and the field is hidden when the action accepts only one type.

**Merge to Single PDF File** takes two or more files; click **Add Files** once per file, as they are merged in the order listed. Each file picks its own source, so a file at a URL and an uploaded one can be merged together. **PDF Compare** takes one file in each of its two sections. Every other action takes a single file.

### Saving the result

The generated file arrives as binary data in the field named by **Output Binary Field**, `data` by default, named from **Output File Name** plus the output type's extension. The item's JSON carries the file name, MIME type, size and binary field name, so a later node — or an AI Agent tool call, which never sees binary — can tell what came back. Send it straight to Google Drive, Gmail, S3, or wherever else your workflow needs it.

The data-only output types on **Document Generation** — `count_tags` and `meta_data` — return JSON instead, since there is no file to hand back. To read a PDF form, use **Read PDF Form Fields**.


### Filling a template with data

For **Document Generation**, the keys in **Data (JSON)** must match the tag names in the template. A template containing `Dear {customer}, your total is {total}.` needs:

```json
{ "customer": "John Doe", "total": "$250.00" }
```

For the available tags and their types, see the tag overview for [Cloud Office Print](https://www.cloudofficeprint.com/docs/templates.html) or [APEX Office Print](https://www.apexofficeprint.com/docs/templates/general_tags#tag-overview).

**Output Type** lists only the formats valid for the **File Type** you chose for the template, so pick the file type first. A `docx` template can export to `pdf`, `docx`, `html`, `txt` and more; an `xlsx` template offers `xlsx`, `csv`, `pdf` and others.

### Debug Mode

Every action has a **Debug Mode** toggle. Turn it on to return the request payload the node would send instead of calling the API, with the API key redacted. Use it to check your input before spending a call, or attach the payload when contacting support ([Support Portal](https://www.united-codes.com/ords/r/uc/uc_support_portal/login) | [support@cloudofficeprint.com](mailto:support@cloudofficeprint.com)).

## Compatibility

Requires n8n version 1.x and Node.js 18 or newer.

## Example Workflows

Import these into n8n to try each resource out (**Workflows > Import from File**):

* [Document Generation](docs/example/workflow_cop_document_generation_google_drive_sheets.json)
* [PDF Operations](docs/example/workflow_cop_pdf_operations_google_drive.json)
* [Password Protect Document](docs/example/workflow_cop_password_protect_google_drive_sheets.json)
* [PDF Compare](docs/example/workflow_cop_pdf_compare_google_drive.json)
* [Basic Document Generation](docs/example/workflow_cop_document_generation_xlsx_basic.json)

## Resources

* [Full user guide](docs/README.md) – step-by-step setup with screenshots
* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Cloud Office Print documentation](https://www.cloudofficeprint.com/docs/)
* [APEX Office Print documentation](https://www.apexofficeprint.com/docs/)
