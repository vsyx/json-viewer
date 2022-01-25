import { EditorView } from '@codemirror/basic-setup';
import React, { useRef, useEffect } from 'react';
import { createEditorView } from './editor';

import { store } from '../../store';
import { selectSettings, setSettings } from '../settings/settingsSlice';
import useReduxEditorBridge from './useReduxEditorBridge';

interface Props {
    className?: string;
}

function Editor(props: Props) {
    const parentRef = useRef(null);
    const editorRef = useRef<EditorView | null>(null);

    useEffect(() => {
        if (editorRef.current == null && parentRef.current != null) {
            const settings = selectSettings(store.getState());
            editorRef.current = createEditorView(parentRef.current, { settings });
        }
        //return () => editorRef.current?.destroy(); 
    }, [])

    useReduxEditorBridge(editorRef);
    
    return (
        <div ref={parentRef} {...props}/>
    );

}

export default Editor;
