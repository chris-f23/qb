import { createComparisonPredicate } from "./comparison-predicate";
import { createOrderableReference } from "./orderable-reference";

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
    isNotEqualTo(other: IReference): IComparisonPredicate {
      return createComparisonPredicate(this, "<>", other);
    },
    isGreaterThan(other: IReference): IComparisonPredicate {
      return createComparisonPredicate(this, ">", other);
    },
    isGreaterThanOrEqualTo(other: IReference): IComparisonPredicate {
      return createComparisonPredicate(this, ">=", other);
    },
    isLessThan(other: IReference): IComparisonPredicate {
      return createComparisonPredicate(this, "<", other);
    },
    isLessThanOrEqualTo(other: IReference): IComparisonPredicate {
      return createComparisonPredicate(this, "<=", other);
    },
    isNull() {
      return createComparisonPredicate(this, "IS NULL");
    },
    isNotNull() {
      return createComparisonPredicate(this, "IS NOT NULL");
    },
    isLike(pattern) {
      return createComparisonPredicate(this, "LIKE", pattern);
    },
    sortAscending() {
      return createOrderableReference(this, "ASC");
    },
    sortDescending() {
      return createOrderableReference(this, "DESC");
    },
  };
};
