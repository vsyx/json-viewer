import { setup } from './setup';
import { EditorState, EditorStateConfig } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { foldPlugin } from "./fold";
import { linter } from '@codemirror/lint';
import {  COMPARTMENTS } from './facets';
import { json, jsonParseLinter } from './json';
import { SettingsState } from '../settings/settingsSlice';

const maxDimensionsTheme = EditorView.theme({
    "&": { height: "100%" },
    ".cm-scroller": { overflow: "auto" },
    "&.cm-editor.cm-focused": { outline: '0' }
});

//const indentOnPaste = EditorState.transactionFilter.of(tr => {
    //if (tr.annotation(Transaction.userEvent) != 'input.paste'
        //|| !tr.startState.facet(shouldIndentOnPaste)) {
        //return tr;
    //}

    //const indent = getIndentUnit(tr.startState);
    //const transactions: TransactionSpec[] = [];

    //tr.changes.iterChanges((from, to, txtFrom, txtTo, txt) => {
        //const changes = indentRangeSpec(txt.sliceString(txtFrom, txtTo), { from, to }, indent);
        //if (changes !== null) {
            //transactions.push({
                //changes
            //});
        //}
    //});

    //return !transactions.length ? tr : tr.startState.update(...transactions);
//});

interface EditorConfig {
    settings: SettingsState;
    editorStateConfig?: EditorStateConfig;
}

export function generateExtensions(config: EditorConfig) {
    const settings = Object.entries(config.settings)
        .filter(([key]) => key in COMPARTMENTS)
        .map(([key, value]) => {
            const { compartment, facet } = COMPARTMENTS[key];
            return compartment.of(facet.of(value));
        });

    return Object.assign({
        extensions: [setup, settings, json(), linter(jsonParseLinter()), maxDimensionsTheme, foldPlugin()],
    }, config.editorStateConfig);
}

export function createEditorView(parent: Element | DocumentFragment, config: EditorConfig) {
    return new EditorView({
        parent,
        state: EditorState.create(generateExtensions(config)),
    });
}
