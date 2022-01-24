import React from 'react';
import { CSSTransition } from 'react-transition-group';
import styles from './Settings.module.scss';

interface Props {
    toggleSettingsWindow: () => void;
    isSettingsOpen: boolean;
}

function Settings({ isSettingsOpen, toggleSettingsWindow }: Props) {
    return (
        <CSSTransition in={isSettingsOpen} timeout={200} unmountOnExit classNames={{
            enterActive: styles.settingsWindowEnterActive,
            exitActive: styles.settingsWindowExitActive
        }}> 
            <div className={styles.settingsWindow}>
                <button onClick={toggleSettingsWindow} className={styles.iconButton}>
                    <i className="las la-times"></i>
                </button>
            </div>
        </CSSTransition>
    )
}

export default Settings;
