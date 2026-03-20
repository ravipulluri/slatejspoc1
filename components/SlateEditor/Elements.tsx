import React from 'react';
import { RenderElementProps, RenderLeafProps } from 'slate-react';
import { CustomElement, CustomText } from '../../types';

export const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props;
  const customElement = element as CustomElement;

  switch (customElement.type) {
    case 'heading-one':
      return (
        <h1 {...attributes} className="text-3xl font-bold mb-4 mt-6 text-slate-800">
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 {...attributes} className="text-2xl font-semibold mb-3 mt-6 text-slate-700">
          {children}
        </h2>
      );
    case 'table':
      return (
        <div className="overflow-x-auto my-4 border rounded-lg border-slate-200 shadow-sm">
          <table {...attributes} className="w-full text-sm text-left text-slate-600 bg-white">
            <tbody className="divide-y divide-slate-200">
                {children}
            </tbody>
          </table>
        </div>
      );
    case 'table-row':
      return (
        <tr {...attributes} className="hover:bg-slate-50 transition-colors">
          {children}
        </tr>
      );
    case 'table-cell':
      const isHeader = (customElement as any).header;
      if (isHeader) {
        return (
            <th {...attributes} className="px-6 py-3 font-semibold text-slate-800 bg-slate-100 border-b border-slate-200 select-none">
                {children}
            </th>
        );
      }
      return (
        <td {...attributes} className="px-6 py-4 border-slate-100 border-r last:border-r-0 align-top">
          {children}
        </td>
      );
    case 'paragraph':
    default:
      return (
        <p {...attributes} className="mb-2 text-slate-700 leading-relaxed">
          {children}
        </p>
      );
  }
};

export const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  const customLeaf = leaf as CustomText;

  if (customLeaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (customLeaf.italic) {
    children = <em>{children}</em>;
  }

  if (customLeaf.comment) {
    children = (
      <span 
        className="bg-yellow-200/50 border-b-2 border-yellow-400 cursor-help transition-colors hover:bg-yellow-300/60"
        title={`Comment: ${customLeaf.comment}`}
      >
        {children}
      </span>
    );
  }

  return <span {...attributes}>{children}</span>;
};