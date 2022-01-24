import { setup } from './setup';
import { EditorState, EditorStateConfig, Transaction, TransactionSpec } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { foldPlugin } from "./fold";
import { getIndentUnit } from '@codemirror/language';
import { indentRangeSpec } from './editorUtils';
import { linter } from '@codemirror/lint';
import { shouldIndentOnPaste, COMPARTMENTS } from './facets';
import { json, jsonParseLinter } from './json';

const maxDimensionsTheme = EditorView.theme({
    "&": {height: "100%"},
    ".cm-scroller": { overflow: "auto" }
});

const indentOnPaste = EditorState.transactionFilter.of(tr => {
    if (tr.annotation(Transaction.userEvent) != 'input.paste'
        || !tr.startState.facet(shouldIndentOnPaste)) {
        return tr;
    }

    const indent = getIndentUnit(tr.startState);
    const transactions: TransactionSpec[] = [];

    tr.changes.iterChanges((from, to, txtFrom, txtTo, txt) => {
        const changes = indentRangeSpec(txt.sliceString(txtFrom, txtTo), { from, to }, indent);
        if (changes !== null) {
            transactions.push({
                changes
            });
        }
    });

    return !transactions.length ? tr : tr.startState.update(...transactions);
});


export function createJsonEditor(parent: Element | DocumentFragment, editorState: EditorStateConfig = {}) {
    const settings = Object.values(COMPARTMENTS).map(({ createExtension }) => createExtension());
    const fullEditorStateConfig = Object.assign({
        extensions: [settings, setup, json(), linter(jsonParseLinter()), maxDimensionsTheme, foldPlugin(), indentOnPaste],
    }, editorState)

    const view = new EditorView({
        parent,
        state: EditorState.create(fullEditorStateConfig),
    });

    return view;
}
