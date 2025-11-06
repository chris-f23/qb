import { createColumnReference } from "./column-reference";
import { createCountReference } from "./count-reference";
import { createLiteralReference } from "./literal-reference";

export const createSelectQuery = <TTables extends Record<string, unknown>>(
  defineCallback: (ctx: ISelectQueryContext<TTables>) => void
): ISelectQuery<TTables> => {
  const ctx = createSelectQueryContext();
  defineCallback(ctx);
  return ctx.getQuery();
};

const createSelectQueryContext = <
  TTables extends Record<string, unknown>
>(): ISelectQueryContext<TTables> => {
  const selectList: ISelectableReference[] = [];
  let selectMode: ISelectQuery<TTables>["selectMode"];
  let mainTable: keyof TTables;
  const joinedTables: {
    table: keyof TTables;
    predicate: IPredicate;
    type?: "LEFT" | "RIGHT";
  }[] = [];
  let searchCondition: IPredicate;

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
    select(...columns: ISelectableReference[]) {
      selectList.push(...columns);
      return this;
    },

    selectDistinct(...columns: ISelectableReference[]) {
      selectList.push(...columns);
      selectMode = "DISTINCT";
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

    leftJoin(table: string, condition: IPredicate) {
      joinedTables.push({ table: table, predicate: condition, type: "LEFT" });
      return this;
    },

    rightJoin(table: string, condition: IPredicate) {
      joinedTables.push({ table: table, predicate: condition, type: "RIGHT" });
      return this;
    },

    where(condition) {
      searchCondition = condition;
      return this;
    },

    getColumn: getColumn,

    count(reference) {
      return createCountReference(reference, false);
    },

    countDistinct(reference) {
      return createCountReference(reference, true);
    },

    literal(value) {
      return createLiteralReference(value);
    },

    getQuery(): ISelectQuery<TTables> {
      return {
        selectList: selectList,
        selectMode: selectMode,
        mainTable: mainTable,
        joinedTables: joinedTables,
        searchCondition: searchCondition,
        build() {
          return "wip";
        },
      };
    },
  };
};
