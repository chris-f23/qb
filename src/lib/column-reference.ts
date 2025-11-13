import { createComparisonPredicate } from "./comparison-predicate";
import {
  createBetweenPredicate,
  createInExpressionListPredicate,
  createInSubqueryPredicate,
  createLikePredicate,
} from "./logical-predicate";
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

    sortAscending() {
      return createOrderableReference(this, "ASC");
    },
    sortDescending() {
      return createOrderableReference(this, "DESC");
    },

    isLike(pattern) {
      return createLikePredicate(this, pattern, false);
    },
    isNotLike(pattern) {
      return createLikePredicate(this, pattern, true);
    },

    isInSubquery(subquery) {
      return createInSubqueryPredicate(this, subquery, false);
    },

    isNotInSubquery(subquery) {
      return createInSubqueryPredicate(this, subquery, true);
    },

    isInExpressionList(...expressions: IReference[]) {
      return createInExpressionListPredicate(this, expressions, false);
    },
    isNotInExpressionList(...expressions: IReference[]) {
      return createInExpressionListPredicate(this, expressions, true);
    },

    isBetween(begin: IReference, end: IReference) {
      return createBetweenPredicate(this, begin, end, false);
    },
    isNotBetween(begin: IReference, end: IReference) {
      return createBetweenPredicate(this, begin, end, true);
    },
  };
};
