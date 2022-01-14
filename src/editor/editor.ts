import { basicSetup, EditorState, EditorView } from "@codemirror/basic-setup";
import { EditorStateConfig } from "@codemirror/state";
import { json } from "@codemirror/lang-json";

const maxDimensionsTheme = EditorView.theme({
    ".cm-content": { height: "100vh" },
});

export function createJsonEditor(parent: Element | DocumentFragment, editorState: EditorStateConfig = {}) {
    const fullEditorStateConfig = Object.assign({
        extensions: [basicSetup, json(), maxDimensionsTheme],
    }, editorState)

    const view = new EditorView({
        parent,
        state: EditorState.create(fullEditorStateConfig),
    });

    return view;
}
