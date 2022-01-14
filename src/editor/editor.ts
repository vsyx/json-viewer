import { setup } from './setup';
import { EditorState, EditorStateConfig } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { json } from "@codemirror/lang-json";

const maxDimensionsTheme = EditorView.theme({
    ".cm-content": { height: "100vh" },
});

export function createJsonEditor(parent: Element | DocumentFragment, editorState: EditorStateConfig = {}) {
    const fullEditorStateConfig = Object.assign({
        extensions: [setup, json(), maxDimensionsTheme],
    }, editorState)

    const view = new EditorView({
        parent,
        state: EditorState.create(fullEditorStateConfig),
    });

    return view;
}
