export const createNegatedPredicate = (
  predicate: IPredicate
): INegatedPredicate => {
  return {
    predicate: predicate,
    operator: "NOT",
    build() {
      return `${this.operator} ${this.predicate.build()}`;
    },
  };
};
