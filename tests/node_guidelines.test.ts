// vitest is a devDependency; tests are not shipped
import { describe, expect, it } from 'vitest';
import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { CloudOfficePrint } from '../nodes/CloudOfficePrint/CloudOfficePrint.node';
import { onlyOutputTypeFor } from '../nodes/CloudOfficePrint/v1/utils/file_utils';

const { properties } = new CloudOfficePrint().description;

/** eslint-plugin-n8n-nodes-base alphabetizes an options list only from this size up. */
const MIN_ITEMS_TO_ALPHABETIZE = 5;

/**
 * The n8n Creator Portal reviews against these rules, and an inline eslint-disable does
 * not exempt a submission, so they are asserted here rather than only in the linter.
 */
describe('n8n node guidelines', () => {
    const operationLists = properties.filter(
        (p): p is INodeProperties & { options: INodePropertyOptions[] } =>
            (p.name === 'operation' || p.name === 'resource') && Array.isArray(p.options),
    );

    it('finds the resource and operation lists', () => {
        expect(operationLists.length).toBe(5);
    });

    it('alphabetizes them once they reach the size the linter checks', () => {
        // File Type lists are generated and ordered by how common each type is; the
        // linter skips generated lists, and so does this
        for (const param of operationLists) {
            if (param.options.length < MIN_ITEMS_TO_ALPHABETIZE) continue;
            const names = param.options.map((o) => o.name);
            expect(names, `${param.name} is not alphabetized`).toEqual(
                [...names].sort((a, b) => a.localeCompare(b)),
            );
        }
    });

    it('gives every parameter a default', () => {
        const walk = (params: INodeProperties[], path: string) => {
            for (const param of params) {
                if (param.type !== 'notice') {
                    expect(param.default, `${path}${param.name} has no default`).toBeDefined();
                }
                for (const option of param.options ?? []) {
                    if ('values' in option) walk(option.values as INodeProperties[], `${path}${param.name}.`);
                }
            }
        };
        walk(properties, '');
    });
});

describe('onlyOutputTypeFor', () => {
    it('answers for a template type that allows one output', () => {
        for (const templateType of ['pdf', 'ics', 'ifb', 'xml']) {
            expect(onlyOutputTypeFor(templateType)).toBe(templateType);
        }
    });

    it('leaves the choice to the user once a type allows more than one', () => {
        for (const templateType of ['docx', 'xlsx', 'pptx', 'html', 'md', 'txt', 'csv']) {
            expect(onlyOutputTypeFor(templateType)).toBeUndefined();
        }
    });

    it('says nothing about a type it does not know', () => {
        expect(onlyOutputTypeFor('rtf')).toBeUndefined();
    });

    it('declares one Output Type parameter, so nothing has to stay in step', () => {
        expect(properties.filter((p) => p.name === 'outputType')).toHaveLength(1);
    });
});
