# Changelog
## 0.2.1 - 2026-09-03
Corrects the two n8n node guideline violations that held up verification of 0.2.0, and revises the help text across every resource and operation.

### Changed
- Output Type on Document Generation is no longer a required field. For a template type with only one possible output - PDF, XML, ICS or IFB - the node supplies the value itself rather than showing a disabled field. Should Cloud Office Print add a second output for one of those types, the dropdown returns on its own.
- PDF Operations are listed alphabetically, as the node guidelines require.
- Password Protect Office Document described its input as DOCX/PPTX/XLSX, though the operation also accepts DOCM, XLSM and PPTM.


## 0.2.0 - 2026-09-02

**Breaking.** Files now go in and out as binary data, and the file parameters were renamed. In workflows saved with 0.1.x, re-enter the file on every action.

### Added
- New PDF Operations
    + Split PDF, by page count or by a phrase on the page.
    + PDF to Image, rendering pages as JPEG at a chosen resolution.
    + Read PDF Form Fields, as JSON, as an XFA structure, or marked onto the PDF.
    + Fill PDF Form, for a PDF that already has a form.
    + Create PDF Form, building a fillable PDF from a Word template's `{?form ...}` tags.
    + Embed Attachments in PDF, from a binary field or Base64.
    + Extract Attachments From PDF, one named attachment or all of them as a zip.
- Source on every file field: Input Binary Field, URL or Base64. Binary is the default.
- Output Binary Field on every action.
- Output File Name on PDF Compare, which previously always returned `output.pdf`.

### Changed
- Actions return the generated file as binary data, so no Convert to File node is needed before or after this node.
- File parameters moved to the top level: the template from `template.fileConfig` to the Template fields, PDF Compare from `compare_file1`/`compare_file2` to Original PDF and Changed PDF.
- Reordered PDF Operations.
- Field labels, placeholders and help text rewritten throughout, with links to the Cloud Office Print documentation.
- Search aliases added so the node is easier to find in the nodes panel.

### Fixed
- The result is no longer a JSON-wrapped byte array. 0.1.x returned `{"body":{"type":"Buffer","data":[...]}}`.
- Output File Name no longer doubles an extension the name already carries.

## 0.1.2 - 2026-07-29

### Added
- Output File Name on every PDF Operation and both Password Protect actions, so the result is no longer always named `output.pdf`.

### Changed
- Actions that take a single file show Base64 Encoded File and File Type directly on the node, without the Add File button: Convert to PDF, Compress PDF, PDF Watermark, and both Password Protect actions. Re-enter the file on these actions in workflows saved with an earlier version.
- Convert to PDF converts through `prepend_files` key.

## 0.1.1 - 2026-07-29

### Fixed
- Password fields on Protect Office File and Protect PDF are now masked in the UI.
- API errors are always raised as NodeApiError, so the failing item index is reported on every error.

## 0.1.0 - 2026-07-28

### Added
- Initial Cloud Office Print node, with credentials for API key, API base URL, and Production/Development mode.
- Document Generation action: generate a document from a template, with data and a chosen output type.
- PDF Operations actions: Convert to PDF, Compress PDF, Merge to Single PDF File, Watermark PDF.
- Password Protect Document actions: Protect Office File, Protect PDF.
- PDF Compare action.
- Debug Mode toggle on every action, returning the request payload instead of sending it to Cloud Office Print.
