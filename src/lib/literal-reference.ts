import { createComparisonPredicate } from "./comparison-predicate";
import { createOrderableReference } from "./orderable-reference";

export const createLiteralReference = (
  value: ILiteralValue
): ILiteralReference => {
  return {
    value: value,
    build(): string {
      return `${this.value}`;
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
    isNull(): IComparisonPredicate {
      return createComparisonPredicate(this, "IS NULL");
    },
    isNotNull(): IComparisonPredicate {
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
