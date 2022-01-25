// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/redux-watch/index.d.ts

declare module 'redux-watch' {
    type FieldPath = string | number | Array<string | number>;
    type ChangeHandler<T> = (newValue: T, oldValue: T, pathToField: FieldPath) => void;
    type FieldWatch = () => void;
    type ChangeHandlerWrapper<T> = (changeHandler: ChangeHandler<T>) => FieldWatch;

    function watch<T>(
        getState: () => T,
        pathToField?: FieldPath,
        compare?: (a: T, b: T) => boolean,
    ): ChangeHandlerWrapper<T>;

    export = watch;
}
