# n8n-nodes-cloudofficeprint

This is an n8n community node. It lets you use **Cloud Office Print** in your n8n workflows.

Cloud Office Print generates and manipulates PDF and Office documents: fill templates with data, convert files to PDF, merge, compress and watermark PDFs, password-protect documents, and compare PDFs.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Usage](#usage)  
[Compatibility](#compatibility)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

1. Document Generation
- Generate a document from a template, with data and an output type of your choice

2. PDF Operations
- Convert a file to PDF
- Compress a PDF
- Merge multiple files into a single PDF
- Add a watermark to a PDF

3. Password Protect Document
- Password protect an Office file
- Password protect a PDF

4. PDF Compare
- Compare two PDFs

All file inputs are provided as Base64-encoded content together with the file type.

## Credentials

Sign up and get an API key from [Cloud Office Print](https://www.united-codes.com/products/cloudofficeprint/), then create a **Cloud Office Print API** credential in n8n with:

- **API Key** – your Cloud Office Print API key
- **API Base URL** – the Cloud Office Print API endpoint (defaults to `https://api.cloudofficeprint.com`)
- **Mode** – `Production` or `Development`; Development marks requests with `mode: development`, useful when testing against a trial or development license

## Usage

Every operation has a **Debug Mode** toggle. Enable it to return the request payload that would otherwise be sent to Cloud Office Print instead of sending it — useful for troubleshooting or when reaching out to support.

## Compatibility

Requires n8n version 1.x and Node.js 18 or newer.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Cloud Office Print documentation](https://www.apexofficeprint.com/docs/)
