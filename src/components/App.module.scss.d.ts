declare namespace AppModuleScssNamespace {
  export interface IAppModuleScss {
    editor: string;
    editorSettingsPadding: string;
    iconButton: string;
    navRight: string;
  }
}

declare const AppModuleScssModule: AppModuleScssNamespace.IAppModuleScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AppModuleScssNamespace.IAppModuleScss;
};

export = AppModuleScssModule;
