export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type Replace<T, R> = Omit<T, keyof R> & R;

/**
 * Wrapper type used to circumvent ESM modules circular dependency issue
 * caused by reflection metadata saving the type of the property.
 */
export type WrapperType<T> = T; // WrapperType === Relation
