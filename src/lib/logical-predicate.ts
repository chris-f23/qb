export const createParenthesizedPredicate = (
  predicate: IPredicate
): IParenthesizedPredicate => {
  return {
    predicate: predicate,
    operator: "PARENTHESIS",
    build() {
      return `(${this.predicate.build()})`;
    },
    and(other) {
      return createAndPredicate(this, other);
    },
    or(other) {
      return createOrPredicate(this, other);
    },
    not() {
      return createNegatedPredicate(this);
    },
    parenthesize() {
      return createParenthesizedPredicate(this);
    },
  };
};

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
    and(other) {
      return createAndPredicate(this, other);
    },
    or(other) {
      return createOrPredicate(this, other);
    },
    not() {
      return createNegatedPredicate(this);
    },
    parenthesize() {
      return createParenthesizedPredicate(this);
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
    and(other) {
      return createAndPredicate(this, other);
    },
    or(other) {
      return createOrPredicate(this, other);
    },
    not() {
      return createNegatedPredicate(this);
    },
    parenthesize() {
      return createParenthesizedPredicate(this);
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
    and(other) {
      return createAndPredicate(this, other);
    },
    or(other) {
      return createOrPredicate(this, other);
    },
    not() {
      return createNegatedPredicate(this);
    },
    parenthesize() {
      return createParenthesizedPredicate(this);
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
    and(other) {
      return createAndPredicate(this, other);
    },
    or(other) {
      return createOrPredicate(this, other);
    },
    not() {
      return createNegatedPredicate(this);
    },
    parenthesize() {
      return createParenthesizedPredicate(this);
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
    and(other) {
      return createAndPredicate(this, other);
    },
    or(other) {
      return createOrPredicate(this, other);
    },
    not() {
      return createNegatedPredicate(this);
    },
    parenthesize() {
      return createParenthesizedPredicate(this);
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
    and(other) {
      return createAndPredicate(this, other);
    },
    or(other) {
      return createOrPredicate(this, other);
    },
    not() {
      return createNegatedPredicate(this);
    },
    parenthesize() {
      return createParenthesizedPredicate(this);
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
    and(other) {
      return createAndPredicate(this, other);
    },
    or(other) {
      return createOrPredicate(this, other);
    },
    not() {
      return createNegatedPredicate(this);
    },
    parenthesize() {
      return createParenthesizedPredicate(this);
    },
  };
};
