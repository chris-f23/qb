export const createBooleanPredicate = (
  left: IPredicate,
  operator: IBooleanPredicate["operator"],
  right: IPredicate
): IBooleanPredicate => {
  return {
    left: left,
    operator: operator,
    right: right,
    build() {
      return `${this.left.build()} ${this.operator} ${this.right.build()}`;
    },
  };
};
