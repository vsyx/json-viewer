import React, { useEffect } from 'react';
import watch from 'redux-watch';
import { EditorView } from '@codemirror/view';
import { store } from '../../store';
import { selectSettings } from '../settings/settingsSlice';
import { getShallowObjectChanges } from '../../utils/misc';
import { CompartmentItem, COMPARTMENTS } from './facets';

export default function useReduxEditorBridge(editorRef: React.MutableRefObject<EditorView | null>) {
    useEffect(() => {
        const w = watch(() => selectSettings(store.getState()));

        const unsubscribeFromStore = store.subscribe(w((newVal, oldVal) => {
            const diffEntries = Object.entries(getShallowObjectChanges(oldVal, newVal))

            if (!diffEntries.length || editorRef.current === null) {
                return;
            }

            const effects = [];
            const callbacks = [];

            for (const [key, value] of diffEntries.filter(([key]) => key in COMPARTMENTS)) {
                const {
                    compartment,
                    facet,
                    postEffectCallback
                }: CompartmentItem<unknown> = COMPARTMENTS[key];

                effects.push(compartment.reconfigure(facet.of(value)));

                if (postEffectCallback) {
                    callbacks.push(postEffectCallback);
                }
            }

            const view = editorRef.current;
            view.dispatch({ effects });

            callbacks.forEach(callback => callback(view));
        }));

        return () => unsubscribeFromStore();
    }, [editorRef]);
}
