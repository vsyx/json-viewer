import { EditorView } from '@codemirror/basic-setup';
import React, { useRef, useEffect } from 'react';
import { createJsonEditor } from './editor';

const Editor = (): React.ReactElement => {
    const parentRef = useRef(null);
    const editorRef = useRef<EditorView | null>(null);

    useEffect(() => {
        if (editorRef.current == null && parentRef.current != null) {
            editorRef.current = createJsonEditor(parentRef.current);
        } 
    }, [])

    
    return (
        <div ref={parentRef} style={{ flex: '1' }} />
    );
}

export default Editor;
