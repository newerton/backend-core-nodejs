export interface ExactMatchFilter<T> {
  exact_match?: Partial<T>;
}

export const whereExactMatch = <
  TModel,
  TFilter extends ExactMatchFilter<TModel>,
>(
  query: TModel,
  filter: TFilter,
): TModel => {
  if (filter.exact_match) {
    for (const key in filter.exact_match) {
      if (filter.exact_match[key]) {
        query[key] = filter.exact_match[key];
      }
    }
  }
  return query;
};
