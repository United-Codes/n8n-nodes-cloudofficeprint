import type { AllEntities } from 'n8n-workflow';

type NodeMap = {
    documentGeneration: 'general';
	pdfOperations: 'singlePagePDF' | 'watermarkPDF' | 'pdfMetadata';
    protectDocument: 'protectOfficeDocument' | 'protectPDF';
    pdfCompare: 'pdfCompare';
};

export type APEXOfficePrint = AllEntities<NodeMap>;