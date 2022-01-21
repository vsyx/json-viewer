import { setup } from './setup';
import { EditorState, EditorStateConfig, Transaction, TransactionSpec } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { foldPlugin } from "./fold";
import { getIndentUnit } from '@codemirror/language';
import { indentRangeSpec } from './editorUtils';
import { linter } from '@codemirror/lint';

const maxDimensionsTheme = EditorView.theme({
    "&": { height: "100vh" },
    ".cm-scroller": { overflow: "auto" },
    ".cm-content, .cm-gutter": { minHeight: "100vh" }
});

const indentOnPaste = EditorState.transactionFilter.of(tr => {
    if (tr.annotation(Transaction.userEvent) != 'input.paste') {
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
    const fullEditorStateConfig = Object.assign({
        extensions: [setup, json(), linter(jsonParseLinter()), maxDimensionsTheme, foldPlugin(), indentOnPaste],
    }, editorState)

    const view = new EditorView({
        parent,
        state: EditorState.create(fullEditorStateConfig),
    });

    return view;
}
