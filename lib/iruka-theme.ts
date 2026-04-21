import type { PrismTheme } from 'prism-react-renderer';

const sharedStyles: PrismTheme['styles'] = [
  {
    types: ['comment', 'prolog', 'doctype', 'cdata'],
    style: {
      color: '#7f8792',
      fontStyle: 'italic',
    },
  },
  {
    types: ['punctuation'],
    style: {
      color: '#8d95a0',
    },
  },
  {
    types: ['operator', 'number', 'boolean', 'constant', 'symbol'],
    style: {
      color: '#9f6a43',
    },
  },
  {
    types: ['property', 'attr-name'],
    style: {
      color: '#465a7a',
    },
  },
  {
    types: ['string', 'char', 'attr-value'],
    style: {
      color: '#687a58',
    },
  },
  {
    types: ['keyword', 'atrule'],
    style: {
      color: '#a3523d',
    },
  },
  {
    types: ['function', 'builtin', 'class-name', 'selector'],
    style: {
      color: '#496f7b',
    },
  },
  {
    types: ['tag', 'entity', 'deleted'],
    style: {
      color: '#a94f43',
    },
  },
  {
    types: ['important', 'bold'],
    style: {
      fontWeight: 'bold',
    },
  },
  {
    types: ['italic'],
    style: {
      fontStyle: 'italic',
    },
  },
];

export const irukaTheme: PrismTheme = {
  plain: {
    color: '#2d3544',
    backgroundColor: '#f7f6ef',
  },
  styles: sharedStyles,
};

export const irukaDarkTheme: PrismTheme = {
  plain: {
    color: '#f2f0e8',
    backgroundColor: '#182033',
  },
  styles: sharedStyles,
};
