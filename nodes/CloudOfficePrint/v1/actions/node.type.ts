import type { AllEntities } from 'n8n-workflow';

type NodeMap = {
    documentGeneration: 'general';
	pdfOperations:
		| 'watermarkPDF'
		| 'convertFileToPDF'
		| 'mergeToPDF'
		| 'compressPDF'
		| 'splitPDF'
		| 'readPDFFormFields'
		| 'fillPDFForm'
		| 'createPDFForm'
		| 'pdfToImage'
		| 'embedPDFAttachments'
		| 'extractPDFAttachments';
    protectDocument: 'protectOfficeDocument' | 'protectPDF';
    pdfCompare: 'pdfCompare';
};

export type CloudOfficePrint = AllEntities<NodeMap>;