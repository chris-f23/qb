import { createComparisonPredicate } from "./comparison-predicate";

export const createLiteralReference = (value: string): ILiteralReference => {
  return {
    value: value,
    build() {
      return this.value;
    },
    isEqualTo(other: IReference): IComparisonPredicate {
      return createComparisonPredicate(this, "=", other);
    },
  };
};
