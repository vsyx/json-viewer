import { EditorView } from '@codemirror/basic-setup';
import React, { useRef, useEffect } from 'react';
import { createJsonEditor } from './editor';

interface Props {
    className?: string;
}

function Editor(props: Props) {
    const parentRef = useRef(null);
    const editorRef = useRef<EditorView | null>(null);

    useEffect(() => {
        if (editorRef.current == null && parentRef.current != null) {
            editorRef.current = createJsonEditor(parentRef.current);
        } 
    }, [])

    
    return (
        <div ref={parentRef} {...props}/>
    );

}

export default Editor;
