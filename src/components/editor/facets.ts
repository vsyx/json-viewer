import { indentUnit } from "@codemirror/language";
import { Compartment, Extension, Facet } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { indentAll } from "./editorUtils";

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

export interface CompartmentItem<T> {
    compartment: Compartment;
    facet: Facet<T, T>;
    text: string;
    type: FacetValueType;
    defaultValue: T;
    createExtension: (initValue?: T) => Extension;
    postEffectCallback?: (view: EditorView) => void;
}

function createCompartment<T>({
    facet,
    defaultValue,
    ...rest
}: Omit<CompartmentItem<T>, "compartment" | "createExtension">): CompartmentItem<T> {
    const compartment = new Compartment;
    return {
        ...rest,
        compartment,
        facet,
        defaultValue,
        createExtension: (initValue?: T) => compartment.of(facet.of(initValue ?? defaultValue)),
    }
}

export const COMPARTMENTS: { [key: string]: CompartmentItem<unknown> } = {
    indentUnit: createCompartment({
        facet: indentUnit,
        text: 'Number of spaces used for indentation',
        type: FacetValueType.Number,
        defaultValue: '    ',
        postEffectCallback: (view) => indentAll(view)
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
