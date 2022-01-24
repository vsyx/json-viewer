import { Compartment, EditorState, Facet } from "@codemirror/state";

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
}) {
    const compartment = new Compartment;

    return {
        compartment,
        text,
        type,
        defaultValue,
        createExtension: () => compartment.of(facet.of(defaultValue)),
    }
}

export const COMPARTMENTS = {
    tabSize: createCompartment({
        facet: EditorState.tabSize,
        text: 'Tab size',
        type: FacetValueType.Number,
        defaultValue: 4
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
