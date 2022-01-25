import { indentUnit } from "@codemirror/language";
import { Compartment, Extension, Facet } from "@codemirror/state";

function createBasicFacet<Type>(defaultValue: Type) {
    return Facet.define<Type, Type>({
        combine: value => value.length ? value[0] : defaultValue
    });
}

export const shouldIndentOnPaste = createBasicFacet(true);
export const showDiagnostics = createBasicFacet(true);
export const longPressTreshold = createBasicFacet(500);

export enum FacetValueType {
    Number,
    Boolean
}

interface CompartmentItem<T, K = void> {
    compartment: Compartment;
    facet: Facet<T, T>;
    text: string;
    type: FacetValueType;
    defaultValue: T;
    createExtension: (initValue?: T) => Extension;
    computeFromValue?: (value: K) => T;
}

function createCompartment<T>({
    facet,
    text,
    type,
    defaultValue
}: {
    facet: Facet<T, T>,
    text: string,
        type: FacetValueType,
        defaultValue: T
}): CompartmentItem<T> {
    const compartment = new Compartment;

    return {
        compartment,
        facet,
        text,
        type,
        defaultValue,
        createExtension: (initValue?: T) => compartment.of(facet.of(initValue ?? defaultValue)),
    }
}

export const COMPARTMENTS = {
    indentUnit: createCompartment({
        facet: indentUnit,
        text: 'Number of spaces used for indentation',
        type: FacetValueType.Number,
        defaultValue: '    ',
    }),
    longPressTreshold: createCompartment({
        facet: longPressTreshold,
        text: 'Long press treshold for deep folds/unfolds',
        type: FacetValueType.Number,
        defaultValue: 500,
    }),
    shouldIndentOnPaste: createCompartment({ 
        facet: shouldIndentOnPaste,
        text: 'Indenting on paste',
        type: FacetValueType.Boolean,
        defaultValue: true
    }),
    showDiagnostics: createCompartment({
        facet: showDiagnostics,
        text: 'Show diagnostics',
        type: FacetValueType.Boolean,
        defaultValue: true
    })
}
