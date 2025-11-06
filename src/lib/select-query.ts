import { createColumnReference } from "./column-reference";
import { createLiteralReference } from "./literal-reference";

export const createSelectQuery = <TTables extends Record<string, unknown>>(
  defineCallback: (ctx: ISelectQueryContext<TTables>) => void
) => {
  const ctx = createSelectQueryContext();
  defineCallback(ctx);
  return ctx.getQuery();
};

const createSelectQueryContext = <
  TTables extends Record<string, unknown>
>(): ISelectQueryContext<TTables> => {
  const selectList: IReference[] = [];
  let mainTable: keyof TTables;
  const joinedTables: { table: keyof TTables; predicate: IPredicate }[] = [];

  const getColumn = <
    TTable extends keyof TTables,
    TColumn extends keyof TTables[TTable]
  >(
    table: TTable,
    column: TColumn
  ): IColumnReference<TTable, TColumn> => {
    return createColumnReference(table, column);
  };

  return {
    select(...columns: IReference[]) {
      selectList.push(...columns);
      return this;
    },
    from(table: string) {
      mainTable = table;
      return this;
    },
    join(table: string, condition: IPredicate) {
      joinedTables.push({ table: table, predicate: condition });
      return this;
    },

    getColumn: getColumn,

    literal(value: string) {
      return createLiteralReference(value);
    },

    getQuery(): ISelectQuery<TTables> {
      return {
        selectList: selectList,
        mainTable: mainTable,
        joinedTables: joinedTables,
        build() {
          return "wip";
        },
      };
    },
  };
};
