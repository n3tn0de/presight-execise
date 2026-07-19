import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_DIRECTORY_QUERY,
  MAX_DIRECTORY_LIMIT,
  MIN_DIRECTORY_LIMIT,
  parseDirectoryQuery,
  serializeDirectoryQuery,
} from './query-state';

describe('directory query URL state', () => {
  it('serializes a canonical query with repeated filters', () => {
    expect(
      serializeDirectoryQuery({
        q: '  Ada  ',
        nationality: ['Canadian', 'French', 'Canadian', ''],
        hobby: ['Skiing', 'Chess', 'Chess'],
        sortBy: 'last_name',
        sortDir: 'desc',
        limit: 50,
        cursor: 'not-in-url',
      }),
    ).toBe(
      'hobby=Chess&hobby=Skiing&nationality=Canadian&nationality=French&q=Ada&sortBy=last_name&sortDir=desc&limit=50',
    );
  });

  it('parses and normalizes URL state', () => {
    expect(
      parseDirectoryQuery(
        'q=%20Ada%20&nationality=French&nationality=French&hobby=Chess&hobby=Skiing&cursor=ignored&sortBy=invalid&sortDir=sideways&limit=999',
      ),
    ).toEqual({
      ...DEFAULT_DIRECTORY_QUERY,
      q: 'Ada',
      nationality: ['French'],
      hobby: ['Chess', 'Skiing'],
      limit: MAX_DIRECTORY_LIMIT,
    });
  });

  it('uses defaults for absent values and clamps invalid limits', () => {
    expect(parseDirectoryQuery(new URLSearchParams())).toEqual(DEFAULT_DIRECTORY_QUERY);
    expect(parseDirectoryQuery(`limit=${MIN_DIRECTORY_LIMIT - 1}`)).toEqual({
      ...DEFAULT_DIRECTORY_QUERY,
      limit: MIN_DIRECTORY_LIMIT,
    });
    expect(parseDirectoryQuery('limit=not-a-number')).toEqual(DEFAULT_DIRECTORY_QUERY);
  });

  it('normalizes invalid runtime sort values and non-finite limits', () => {
    expect(
      serializeDirectoryQuery({
        ...DEFAULT_DIRECTORY_QUERY,
        sortBy: 'invalid' as never,
        sortDir: 'sideways' as never,
        limit: Number.NaN,
      }),
    ).toBe('');
    expect(
      serializeDirectoryQuery({
        ...DEFAULT_DIRECTORY_QUERY,
        limit: Number.POSITIVE_INFINITY,
      }),
    ).toBe('');
  });

  it('sorts filter values deterministically without locale rules', () => {
    const localeCompare = vi.spyOn(String.prototype, 'localeCompare').mockImplementation(() => {
      throw new Error('locale-dependent comparison is not allowed');
    });

    try {
      expect(
        serializeDirectoryQuery({
          ...DEFAULT_DIRECTORY_QUERY,
          nationality: ['z', 'a', 'A'],
        }),
      ).toBe('nationality=A&nationality=a&nationality=z');
    } finally {
      localeCompare.mockRestore();
    }
  });

  it('does not include cursor in serialized URL state', () => {
    expect(serializeDirectoryQuery({ ...DEFAULT_DIRECTORY_QUERY, cursor: 'next-page' })).toBe('');
  });
});
