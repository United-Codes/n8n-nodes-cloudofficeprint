# Changelog

## 0.1.2 - 2026-07-29

### Added
- Output File Name on Convert to PDF, Compress PDF, Merge to Single PDF File, PDF Watermark, and Password Protect PDF. Defaults to `output`, without extension.

### Changed
- Convert to PDF sends the file in `prepend_files` instead of using it as the template.
- Convert to PDF, Compress PDF, PDF Watermark, and Password Protect PDF always take one file, so their Base64 Encoded File and File Type fields are shown directly on the node, without an Add File button. Workflows saved with an earlier version need the file re-entered on these four operations.

### Fixed
- The file type of a single-file operation is checked against the types that operation accepts, instead of silently reusing the value left over from another operation.

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
