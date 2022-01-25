// https://stackoverflow.com/questions/61997142/is-there-an-es6-function-that-will-return-an-object-containing-property-changes/61997363
export function getShallowObjectChanges<T>(source: T, target: T) {
  return Object.fromEntries(Object.entries({...source, ...target})
        .filter(([key, value]) => !Object.is(source[key], value))) as Partial<T>;
}
