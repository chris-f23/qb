import { createColumnReference } from "./lib/column-reference";
import { createLiteralReference } from "./lib/literal-reference";

export function createQuery<TTables extends Record<string, unknown>>() {
  type TAliasedColumnReference<TableName extends keyof TTables> = IReference & {
    readonly table: TableName;
    readonly column: keyof TTables[TableName];
    readonly alias: string;
  };

  const getColumn = <
    TTable extends keyof TTables,
    TColumn extends keyof TTables[TTable]
  >(
    table: TTable,
    column: TColumn
  ): IColumnReference<TTable, TColumn> => {
    return createColumnReference(table, column);
  };

  const selectList: IReference[] = [];
  let mainTable: keyof TTables;

  const joinedTables: { table: keyof TTables; predicate: IPredicate }[] = [];

  const context = {
    getColumn: getColumn,
    select(...columns: IReference[]) {
      selectList.push(...columns);
      return this;
    },
    from(table: keyof TTables) {
      mainTable = table;
      return this;
    },
    join(table: keyof TTables, condition: IPredicate) {
      joinedTables.push({ table: table, predicate: condition });
      return this;
    },
    // compare: createComparisonPredicate,

    wrap: (predicate: IPredicate): IPredicate => {
      return {
        ...predicate,
        isWrapped: true,
      };
    },
    literal(value: string): ILiteralReference {
      return createLiteralReference(value);
    },
  };

  type TContext = typeof context;

  return {
    as: (definitionCallback: (ctx: TContext) => void) => {
      definitionCallback(context);

      return {
        getDefinition() {
          return {
            selectList: selectList,
            mainTable: mainTable,
            joinedTables: joinedTables,
          };
        },
        build() {
          return "wip";
        },
      };
    },
  };
}
