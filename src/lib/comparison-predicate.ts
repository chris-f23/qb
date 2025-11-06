import { createBooleanPredicate } from "./boolean-predicate";
import { createNegatedPredicate } from "./negated-predicate";

export const createComparisonPredicate = (
  left: IReference,
  operator: IComparisonPredicate["operator"],
  right: IReference
): IComparisonPredicate => {
  return {
    left: left,
    operator: operator,
    right: right,
    // isNegated: false,
    // isWrapped: false,
    build() {
      return `${this.left.build()} ${this.operator} ${this.right.build()}`;
    },

    and(other: IComparisonPredicate): IBooleanPredicate {
      return createBooleanPredicate(this, "AND", other);
    },

    or(other: IComparisonPredicate): IBooleanPredicate {
      return createBooleanPredicate(this, "OR", other);
    },

    not(): INegatedPredicate {
      return createNegatedPredicate(this);
    },
  };
};
