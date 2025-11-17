import { createColumnReference } from "./column-reference";
import { createComparisonPredicate } from "./comparison-predicate";
import { createLiteralReference } from "./literal-reference";
import {
  createAndPredicate,
  createNegatedPredicate,
  createOrPredicate,
} from "./logical-predicate";
import { createSelectQuery } from "./select-query";

export const createQueryContext = <
  TInvolvedTables extends Record<string, IQueryableTable<any>>
>(
  involvedTables: TInvolvedTables
): IQueryContext<TInvolvedTables> => {
  return {
    createSelectQuery: (
      defineCallback: (ctx: ISelectQueryContext<TInvolvedTables>) => void
    ) => {
      const query = createSelectQuery(involvedTables, defineCallback);
      return query;
    },

    eq(left, right) {
      return createComparisonPredicate(left, "=", right);
    },

    neq(left, right) {
      return createComparisonPredicate(left, "<>", right);
    },

    gt(left, right) {
      return createComparisonPredicate(left, ">", right);
    },

    gte(left, right) {
      return createComparisonPredicate(left, ">=", right);
    },

    lt(left, right) {
      return createComparisonPredicate(left, "<", right);
    },

    lte(left, right) {
      return createComparisonPredicate(left, "<=", right);
    },

    and(left, right) {
      return createAndPredicate(left, right);
    },

    or(left, right) {
      return createOrPredicate(left, right);
    },

    not(predicate) {
      return createNegatedPredicate(predicate);
    },

    createColumnReference(table, column) {
      return createColumnReference(table, column);
    },

    col(table, column) {
      return createColumnReference(table, column);
    },

    createLiteralReference(value) {
      return createLiteralReference(value);
    },

    val(value) {
      return createLiteralReference(value);
    },
  };
};
