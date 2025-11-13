export const createAndPredicate = (
  left: IPredicate,
  right: IPredicate
): IAndPredicate => {
  return {
    left: left,
    operator: "AND",
    right: right,
    build() {
      return `${this.left.build()} AND ${this.right.build()}`;
    },
  };
};

export const createOrPredicate = (
  left: IPredicate,
  right: IPredicate
): IOrPredicate => {
  return {
    left: left,
    operator: "OR",
    right: right,
    build() {
      return `${this.left.build()} OR ${this.right.build()}`;
    },
  };
};

export const createNegatedPredicate = (
  predicate: IPredicate
): INegatedPredicate => {
  return {
    predicate: predicate,
    operator: "NOT",
    build() {
      return `NOT ${this.predicate.build()}`;
    },
  };
};

export const createBetweenPredicate = (
  left: IReference,
  begin: IReference,
  end: IReference,
  isNegated: boolean
): IBetweenPredicate => {
  return {
    left: left,
    begin: begin,
    end: end,
    operator: "BETWEEN",
    isNegated: isNegated,
    build() {
      return `${this.left.build()} ${
        this.isNegated ? "NOT " : ""
      }BETWEEN ${this.begin.build()} AND ${this.end.build()}`;
    },
  };
};

export const createInExpressionListPredicate = (
  left: IReference,
  expressionList: Array<IReference>,
  isNegated: boolean
): IInExpressionListPredicate => {
  return {
    left: left,
    expressionList: expressionList,
    operator: "IN_EXPRESSION_LIST",
    isNegated: isNegated,
    build() {
      return `${this.left.build()} ${
        this.isNegated ? "NOT " : ""
      }IN (${this.expressionList.map((e) => e.build()).join(", ")})`;
    },
  };
};

export const createInSubqueryPredicate = (
  left: IReference,
  subquery: ISelectQuery<any>,
  isNegated: boolean
): IInSubqueryPredicate => {
  return {
    left: left,
    subquery: subquery,
    operator: "IN_SUBQUERY",
    isNegated: isNegated,
    build() {
      return `${this.left.build()} ${
        this.isNegated ? "NOT " : ""
      }IN (${this.subquery.build()})`;
    },
  };
};

export const createLikePredicate = (
  left: IReference,
  pattern: IReference,
  isNegated: boolean
): ILikePredicate => {
  return {
    left: left,
    pattern: pattern,
    operator: "LIKE",
    isNegated: isNegated,
    build() {
      return `${this.left.build()} ${
        this.isNegated ? "NOT " : ""
      }LIKE ${this.pattern.build()}`;
    },
  };
};
