import {
  createAndPredicate,
  createNegatedPredicate,
  createOrPredicate,
  createParenthesizedPredicate,
} from "./logical-predicate";

export const createComparisonPredicate = (
  left: IReference,
  operator: IComparisonPredicate["operator"],
  right?: IReference
): IComparisonPredicate => {
  return {
    left: left,
    operator: operator,
    right: right,
    // isNegated: false,
    // isWrapped: false,
    build() {
      if (this.right) {
        return `${this.left.build()} ${this.operator} ${this.right.build()}`;
      }
      return `${this.left.build()} ${this.operator}`;
    },

    and(other: IComparisonPredicate): IAndPredicate {
      return createAndPredicate(this, other);
    },

    or(other: IComparisonPredicate): IOrPredicate {
      return createOrPredicate(this, other);
    },

    not(): INegatedPredicate {
      return createNegatedPredicate(this);
    },
    parenthesize() {
      return createParenthesizedPredicate(this);
    },
  };
};
