import { EditorView } from '@codemirror/basic-setup';
import React, { useRef, useEffect } from 'react';
import { createEditorView } from './editor';

import watch from 'redux-watch';
import { store } from '../../store';
import { selectSettings } from '../settings/settingsSlice';
import { getShallowObjectChanges } from '../../utils/misc';
import { CompartmentItem, COMPARTMENTS } from './facets';

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
            editorRef.current = createEditorView(parentRef.current, { settings });
        }

        const w = watch(getSettings);
        const unsubscribeFromStore = store.subscribe(w((newVal, oldVal) => {
            const diffEntries = Object.entries(getShallowObjectChanges(oldVal, newVal))

            if (!diffEntries.length || editorRef.current === null) {
                return;
            }

            const effects = [];
            const callbacks = [];

            for (const [key, value] of diffEntries.filter(([key]) => key in COMPARTMENTS)) {
                const { compartment, facet, postEffectCallback } = (COMPARTMENTS[key] as CompartmentItem<unknown>);
                effects.push(compartment.reconfigure(facet.of(value)));

                if (postEffectCallback) {
                    callbacks.push(postEffectCallback);
                }
            }

            const view = editorRef.current;
            view.dispatch({ effects });

            callbacks.forEach(callback => callback(view));
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
