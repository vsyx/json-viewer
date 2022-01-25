import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'

type Theme = 'light' | 'dark';

export interface SettingsState {
    indentUnit: string;
    longPressTreshold: number;
    shouldIndentOnPaste: boolean;
    showDiagnostics: boolean;
    theme: Theme;
}

const initialState = {
    indentUnit: '    ',
    longPressTreshold: 500,
    shouldIndentOnPaste: true,
    showDiagnostics: true,
    theme: 'light'
} as SettingsState;

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setState: (state, action: PayloadAction<Partial<SettingsState>>) => (
            { ...state, ...action.payload }
        )
    }
})

export const { setState } = settingsSlice.actions
export const selectSettings = (state: RootState) => state.settings;
export default settingsSlice.reducer
