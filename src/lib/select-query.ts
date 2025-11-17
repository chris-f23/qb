import { createColumnReference } from "./column-reference";
import { createCountReference } from "./count-reference";
import { createLiteralReference } from "./literal-reference";

export const createSelectQuery = <
  TTables extends Record<string, IQueryableTable<any>>
>(
  involvedTables: TTables,
  defineCallback: (
    ctx: ISelectQueryContext<TTables>
  ) => ISelectQueryContext<TTables> | void
): ISelectQuery<TTables> => {
  const ctx = createSelectQueryContext(involvedTables);
  defineCallback(ctx);
  return ctx.getQuery();
};

const createSelectQueryContext = <
  TTables extends Record<string, IQueryableTable<any>>
>(
  tables: TTables
): ISelectQueryContext<TTables> => {
  const selectList: ISelectableReference[] = [];
  let selectMode: ISelectQuery<TTables>["selectMode"];
  let mainTable: keyof TTables;
  const joinedTables: {
    table: keyof TTables;
    predicate: IPredicate;
    type?: "LEFT" | "RIGHT";
  }[] = [];
  let searchCondition: IPredicate;

  const orderByList: IOrderableReference[] = [];

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

    orderBy(...columns) {
      orderByList.push(...columns);
      return this;
    },

    count(reference) {
      return createCountReference(reference, false);
    },

    countDistinct(reference) {
      return createCountReference(reference, true);
    },

    getQuery(): ISelectQuery<TTables> {
      return {
        selectList: selectList,
        selectMode: selectMode,
        mainTable: mainTable,
        joinedTables: joinedTables,
        searchCondition: searchCondition,
        orderByList: orderByList,
        involvedTables: tables,
        build() {
          let selection = `SELECT ${selectMode ?? ""}`;
          if (selectList.length > 0) {
            selection += selectList.map((ref) => ref.build()).join(", ");
          }

          let source = "";
          if (this.mainTable) {
            source += `FROM ${
              this.involvedTables[this.mainTable].name
            } AS ${this.mainTable.toString()}`;
          }

          if (this.joinedTables && this.joinedTables.length > 0) {
            source += this.joinedTables
              .map(
                (jt) =>
                  `${jt.type} JOIN ${
                    this.involvedTables[jt.table]
                  } AS ${jt.table.toString()} ON ${jt.predicate.build()}`
              )
              .join(" ");
          }

          let filter = "";
          if (this.searchCondition) {
            filter += `WHERE ${this.searchCondition.build()}`;
          }

          return `${selection} ${source} ${filter}`;
        },
      };
    },
  };
};
