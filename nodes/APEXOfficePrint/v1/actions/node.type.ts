import type { AllEntities } from 'n8n-workflow';

type NodeMap = {
	pdfOperations: 'singlePagePDF' | 'pdfACompliance' | 'pdfUACompliance' | 'protectPDF' | 'removeLastPage' | 'watermarkPDF';
    standardAOPCall: 'general';
};

export type APEXOfficePrint = AllEntities<NodeMap>;