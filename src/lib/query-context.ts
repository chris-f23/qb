import { createColumnReference } from "./column-reference";
import { createLiteralReference } from "./literal-reference";
import { createSelectQuery } from "./select-query";

export const createQueryContext = <
  TInvolvedTables extends Record<string, IQueryableTable<any>>
>(
  involvedTables: TInvolvedTables
): IQueryContext<TInvolvedTables> => {
  return {
    getColumn: (table, column) => {
      return createColumnReference(table, column);
    },
    $col: (table, column) => {
      return createColumnReference(table, column);
    },

    $val(value) {
      return createLiteralReference(value);
    },
    literal(value) {
      return createLiteralReference(value);
    },

    createSelectQuery: (
      defineCallback: (ctx: ISelectQueryContext<TInvolvedTables>) => void
    ) => {
      const query = createSelectQuery(involvedTables, defineCallback);
      return query;
    },
  };
};
