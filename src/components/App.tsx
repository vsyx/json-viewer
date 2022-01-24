import React, { useState } from 'react';
import styles from './App.module.scss';

import Editor from './editor';
import Settings from './settings';

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
                    <Settings isSettingsOpen={isSettingsOpen} toggleSettingsWindow={toggleSettingsWindow} />
                </div>
            </nav>
            <Editor className={`${styles.editor} ${isSettingsOpen ? styles.editorSettingsPadding : ""}`} />
        </>
    );
}

export default App;
