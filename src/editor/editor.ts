import { setup } from './setup';
import { EditorState, EditorStateConfig } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { json } from "@codemirror/lang-json";
import { foldPlugin } from "./fold";

const maxDimensionsTheme = EditorView.theme({
    "&": { height: "100vh" },
    ".cm-scroller": { overflow: "auto" },
    ".cm-content, .cm-gutter": {minHeight: "100vh"}
});

export function createJsonEditor(parent: Element | DocumentFragment, editorState: EditorStateConfig = {}) {
    const fullEditorStateConfig = Object.assign({
        extensions: [setup, json(), maxDimensionsTheme, foldPlugin()],
    }, editorState)

    const view = new EditorView({
        parent,
        state: EditorState.create(fullEditorStateConfig),
    });

    return view;
}
