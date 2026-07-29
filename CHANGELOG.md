# Changelog

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
