import React, { useState } from 'react';
import Editor from './editor';
import { CSSTransition } from 'react-transition-group';
import styles from './App.module.scss';

const App = (): React.ReactElement => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const toggleSettingsWindow = () => setIsSettingsOpen(prev => !prev);

    return (
        <>
            <nav>
                <div>
                </div>
                <div className={styles.navRight}>
                    <button onClick={toggleSettingsWindow} className={styles.iconButton}>
                        <i className="las la-cog"></i>
                    </button>
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
                </div>
            </nav>
            <Editor className={`${styles.editor} ${isSettingsOpen ? styles.editorSettingsPadding : ""}`} />
        </>
    );
}

export default App;
