# n8n-nodes-cloudofficeprint

This is an n8n community node. It lets you use **Cloud Office Print** in your n8n workflows.

Cloud Office Print generates and manipulates PDF and Office documents: fill templates with data, convert files to PDF, merge, compress and watermark PDFs, password-protect documents, and compare PDFs.

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
- Add a watermark to a PDF

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

Every action takes files as Base64 and returns the result as Base64. Most of a workflow is therefore converting into and out of n8n's binary format, with the Cloud Office Print node in the middle.

### Giving the node a file

Every action asks for the same two fields:

- **Base64 Encoded File** – the file content as a raw Base64 string. No `data:...;base64,` prefix.
- **File Type** – the extension, for example `docx` or `pdf`. It must match the actual content. The field is hidden when the action accepts only one type.

**Convert to PDF**, **Compress PDF**, **PDF Watermark** and **Password Protect PDF** take a single file, so the two fields are shown directly on the node. The other actions keep them in a file section — named **Template**, **File**, **Files** or **PDF File - 1** and **PDF File - 2** — which you open with the section's **Add** button.

**Merge to Single PDF File** takes two or more files; click **Add Files** once per file, as they are merged in the order listed. **PDF Compare** takes one file in each of its two sections. Every other action takes a single file.

### Saving the result

The node returns the whole API response, with the generated file as Base64 in `body`. To turn that back into a real file, add a **Convert to File** node, operation **Move Base64 String to File**:

- **Base64 Input Field**: `body`
- **Put Output File in Field**: `data`
- Under options, set **File Name** and **MIME Type** so the file arrives correctly named

From there the binary can go to Google Drive, Gmail, S3, or wherever else your workflow needs it.


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
