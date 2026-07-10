import type { AllEntities } from 'n8n-workflow';

type NodeMap = {
    documentGeneration: 'general';
	pdfOperations: 'watermarkPDF' | 'convertFileToPDF' | 'mergeToPDF' | 'compressPDF';
    protectDocument: 'protectOfficeDocument' | 'protectPDF';
    pdfCompare: 'pdfCompare';
};

export type APEXOfficePrint = AllEntities<NodeMap>;