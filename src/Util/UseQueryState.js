import { useCallback } from "react";

export const useQueryState = (query) => {
  const setQuery = useCallback(
    (value) => {
      const existingQueries = new URLSearchParams(window.location);

      const hash = existingQueries.get("hash");

      console.log(hash);

      const queryString = new URLSearchParams({ ...existingQueries, [query]: value });

      window.history.pushState(null, "", `${window.location.pathname}?${queryString}${hash}`);
    },
    [query]
  );

  return [new URLSearchParams(window.location.search).get(query), setQuery];
};
