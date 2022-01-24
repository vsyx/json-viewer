import { jsonParseLinter as defaultJsonParseLinter, json } from "@codemirror/lang-json";
import { Diagnostic } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import { showDiagnostics } from './facets';

export function jsonParseLinter() {
    const defaultLinter = defaultJsonParseLinter();
    return (view: EditorView): Diagnostic[] => {
        if (!view.state.doc.length || !view.state.facet(showDiagnostics)) {
            return [];
        }
        return defaultLinter(view);
    };
}

export { json };
