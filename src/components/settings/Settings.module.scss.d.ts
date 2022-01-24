declare namespace SettingsModuleScssNamespace {
  export interface ISettingsModuleScss {
    iconButton: string;
    in: string;
    out: string;
    settingsWindow: string;
    settingsWindowEnterActive: string;
    settingsWindowExitActive: string;
  }
}

declare const SettingsModuleScssModule: SettingsModuleScssNamespace.ISettingsModuleScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SettingsModuleScssNamespace.ISettingsModuleScss;
};

export = SettingsModuleScssModule;
