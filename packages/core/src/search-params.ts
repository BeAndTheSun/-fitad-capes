import { ReadonlyURLSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import type { z } from 'zod';

export type SearchParamsObj = Record<string, string | string[] | undefined>;

function urlSearchParamsToObj(
  searchParams: URLSearchParams | ReadonlyURLSearchParams
): SearchParamsObj {
  const searchParamsObj: SearchParamsObj = {};
  Array.from(searchParams.keys()).forEach((key) => {
    const value = searchParams.getAll(key);
    if (value.length === 1) {
      const v = value[0];
      if (value == null) {
        throw new Error(`Unexpected value for param '${key}'`);
      }

      searchParamsObj[key] = v;
    } else if (value.length > 1) {
      searchParamsObj[key] = value;
    }
  });

  return searchParamsObj;
}

type ParsedSearchParamsValue =
  | string
  | number
  | boolean
  | Date
  | undefined
  | ParsedSearchParamsValue[]
  | { [key: string]: ParsedSearchParamsValue };

function parseSearchParamsValue(value: string): ParsedSearchParamsValue | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
}

type AllSearchParams =
  | URLSearchParams
  | ReadonlyURLSearchParams
  | SearchParamsObj
  | null
  | undefined;

type ParsedSearchParams = Record<
  string | number | symbol,
  ParsedSearchParamsValue
>;

export function parseSearchParams(
  searchParams: AllSearchParams
): ParsedSearchParams {
  if (searchParams == null) {
    return {};
  }

  let searchParamsObj: SearchParamsObj;
  if (
    searchParams instanceof URLSearchParams ||
    searchParams instanceof ReadonlyURLSearchParams
  ) {
    searchParamsObj = urlSearchParamsToObj(searchParams);
  } else {
    searchParamsObj = searchParams;
  }

  return Object.entries(searchParamsObj).reduce<ParsedSearchParams>(
    (acc, [key, value]) => {
      if (value == null) {
        return acc;
      }

      if (Array.isArray(value)) {
        acc[key] = value.reduce<ParsedSearchParamsValue[]>((parseAcc, v) => {
          const parsed = parseSearchParamsValue(v);
          if (parsed != null) {
            parseAcc.push(parsed);
          }

          return parseAcc;
        }, []);
      } else {
        const parsed = parseSearchParamsValue(value);
        if (parsed != null) {
          acc[key] = parsed;
        }
      }

      return acc;
    },
    {}
  );
}

function stringifySearchParamsValue(
  value: ParsedSearchParams[string]
): string | null {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return null;
  }
}

export function stringifySearchParams(
  searchParams: ParsedSearchParams
): string {
  const urlSearchParams = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value == null) {
      return;
    }

    const str = stringifySearchParamsValue(value);
    if (str != null && str !== '') {
      urlSearchParams.set(key, str);
    }
  });

  if (urlSearchParams.toString() === '') {
    return '';
  }

  urlSearchParams.sort();
  return `?${urlSearchParams.toString()}`;
}

export function useSearchParams(): URLSearchParams {
  const router = useRouter();
  const [, search] = router.asPath.split('?');

  return new URLSearchParams(search ?? '');
}

export function useParsedSearchParams<O, Z extends z.ZodSchema<O>>(
  schema: Z
): z.output<Z> {
  const searchParams = useSearchParams();
  const parsedSearchParams = parseSearchParams(searchParams);

  return schema.parse(parsedSearchParams);
}
