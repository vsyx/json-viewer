import { EditorView } from '@codemirror/basic-setup';
import React, { useRef, useEffect } from 'react';
import { createJsonEditor } from './editor';

import watch from 'redux-watch';
import { store } from '../../store';
import { selectSettings } from '../settings/settingsSlice';

interface Props {
    className?: string;
}

const getSettings = () => selectSettings(store.getState());

function Editor(props: Props) {
    const parentRef = useRef(null);
    const editorRef = useRef<EditorView | null>(null);

    useEffect(() => {
        if (editorRef.current == null && parentRef.current != null) {
            const settings = getSettings();
            editorRef.current = createJsonEditor(parentRef.current, { settings });
        }

        const w = watch(getSettings);
        const unsubscribeFromStore = store.subscribe(w((newVal, oldVal) => {
            console.log(newVal, oldVal);
        }));

        return () => {
            //editorRef.current?.destroy();
            unsubscribeFromStore();
        }
    }, [])
    
    return (
        <div ref={parentRef} {...props}/>
    );

}

export default Editor;
