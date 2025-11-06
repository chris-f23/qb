import { createComparisonPredicate } from "./comparison-predicate";

export const createColumnReference = <TTable, TColumn>(
  table: TTable,
  column: TColumn
): IColumnReference<TTable, TColumn> => {
  return {
    table: table,
    column: column,
    build() {
      return `${this.table}.${this.column}`;
    },
    isEqualTo(other: IReference): IComparisonPredicate {
      return createComparisonPredicate(this, "=", other);
    },
  };
};
