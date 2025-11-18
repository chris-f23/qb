type ITableColumnDataType = "INT" | "VARCHAR" | "DATETIME";

type IQueryableTable<
  UTableColumns extends Record<string, ITableColumnDataType>
> = {
  name: string;
  schemaName?: string;
  databaseName?: string;
  columns: UTableColumns;

  build(): string;
};

type IOrderableReference = {
  original: IReference;
  order: "ASC" | "DESC";

  build(): string;
};

type IConcatReference = {
  values: IReference[];
  separator?: IReference;
  build(): string;
};

/** Referencia a cualquier valor dentro de la consulta */
type IReference = {
  build(): string;

  isEqualTo(other: IReference): IComparisonPredicate;
  isNotEqualTo(other: IReference): IComparisonPredicate;
  isGreaterThan(other: IReference): IComparisonPredicate;
  isGreaterThanOrEqualTo(other: IReference): IComparisonPredicate;
  isLessThan(other: IReference): IComparisonPredicate;
  isLessThanOrEqualTo(other: IReference): IComparisonPredicate;

  isNull(): IComparisonPredicate;
  isNotNull(): IComparisonPredicate;

  sortAscending(): IOrderableReference;
  sortDescending(): IOrderableReference;

  isLike(pattern: IReference): ILikePredicate;
  isNotLike(pattern: IReference): ILikePredicate;

  isInSubquery(query: ISelectQuery): IInSubqueryPredicate;
  isNotInSubquery(query: ISelectQuery): IInSubqueryPredicate;

  isInExpressionList(): IInExpressionListPredicate;
  isNotInExpressionList(): IInExpressionListPredicate;

  isBetween(begin: IReference, end: IReference): IBetweenPredicate;
  isNotBetween(begin: IReference, end: IReference): IBetweenPredicate;
};

type ICountReference = {
  asDistinct: boolean;
  originalReference: IReference;
  build(): string;
};

type IColumnReference<TTable, TColumn> = IReference & {
  table: TTable;
  column: TColumn;
};

type ILiteralReference = IReference & {
  value: ILiteralValue;
};

type ISelectableReference = {
  build(): string;
};

/** Predicado que puede ser negado, o envuelto en paréntesis */
type IPredicate = {
  operator: string;
  isNegated?: boolean;
  build(): string;
  and(other: IPredicate): IAndPredicate;
  or(other: IPredicate): IOrPredicate;
  not(): INegatedPredicate;
  parenthesize(): IParenthesizedPredicate;
};

type IParenthesizedPredicate = IPredicate & {
  predicate: IPredicate;
};

type ILikePredicate = IPredicate & {
  left: IReference;
  pattern: IReference;
  operator: "LIKE";
};

type IBetweenPredicate = IPredicate & {
  left: IReference;
  begin: IReference;
  end: IReference;
  operator: "BETWEEN";
};

/** Predicado que compara 2 referencias mediante operadores de tipo "es igual a", "es menor a", "es mayor o igual a", etc */
type IComparisonPredicate = IPredicate & {
  left: IReference;
  operator: "=" | ">" | "<" | "<=" | ">=" | "<>" | "IS NULL" | "IS NOT NULL";

  right?: IReference;

  and(other: IPredicate): IAndPredicate;
  or(other: IPredicate): IOrPredicate;
  not(): INegatedPredicate;
};

type IAndPredicate = IPredicate & {
  left: IPredicate;
  operator: "AND";
  right: IPredicate;
};

type IOrPredicate = IPredicate & {
  left: IPredicate;
  operator: "OR";
  right: IPredicate;
};

type INegatedPredicate = IPredicate & {
  predicate: IPredicate;
  operator: "NOT";
};

type IInExpressionListPredicate = IPredicate & {
  left: IReference;
  operator: "IN_EXPRESSION_LIST";
  expressionList: IReference[];
};

type IInSubqueryPredicate = IPredicate & {
  left: IReference;
  operator: "IN_SUBQUERY";
  subquery: ISelectQuery;
};

type IQuery<TTables extends Record<string, IQueryableTable>> = {
  involvedTables: TTables;
  build(): string;
};

type ISelectQuery<TTables extends Record<string, IQueryableTable>> =
  IQuery<TTables> & {
    selectList: ISelectableReference[];
    selectMode?: "DISTINCT";
    mainTable: keyof TTables | undefined;
    joinedTables:
      | {
          table: keyof TTables;
          predicate: IPredicate;
          type?: "LEFT" | "RIGHT";
        }[]
      | undefined;
    searchCondition: IPredicate | undefined;
    orderByList: IOrderableReference[] | undefined;
  };

type ILiteralValue = string | number | boolean;

type IQueryContext<TTables extends Record<string, IQueryableTable>> = {
  /**
   * Creates a select query.
   *
   * Compiles to a `SELECT` statement.
   */
  createSelectQuery: (
    defineCallback: (ctx: ISelectQueryContext<TTables>) => void
  ) => ISelectQuery<TTables>;

  /**
   * Creates a reference to a column in a table.
   *
   * Compiles to `[table].[column]`
   */
  createColumnReference<
    UTableAlias extends keyof TTables,
    UColumnName extends keyof TTables[UTableAlias]["columns"]
  >(
    table: UTableAlias,
    column: UColumnName
  ): IColumnReference<UTableAlias, UColumnName>;

  /**
   * Alias for `createColumnReference`.
   *
   * Creates a reference to a column in a table.
   *
   * Compiles to `[table].[column]`
   */
  col<
    UTableAlias extends keyof TTables,
    UColumnName extends keyof TTables[UTableAlias]["columns"]
  >(
    table: UTableAlias,
    column: UColumnName
  ): IColumnReference<UTableAlias, UColumnName>;

  /**
   * Creates a literal reference.
   *
   * Compiles to `[value]`
   */
  createLiteralReference(value: ILiteralValue): ILiteralReference;

  /**
   * Alias for `createLiteralReference`.
   *
   * Creates a literal reference.
   *
   * Compiles to `[value]`
   */
  val(value: ILiteralValue): ILiteralReference;

  /**
   * Creates a comparison predicate between 2 references using the "=" operator.
   *
   * Compiles to `[left] = [right]`
   */
  eq(left: IReference, right: IReference): IComparisonPredicate;

  /**
   * Creates a comparison predicate between 2 references using the "<>" operator.
   *
   * Compiles to `[left] <> [right]`
   */
  neq(left: IReference, right: IReference): IComparisonPredicate;

  /**
   * Creates a comparison predicate between 2 references using the ">" operator.
   *
   * Compiles to `[left] > [right]`
   */
  gt(left: IReference, right: IReference): IComparisonPredicate;

  /**
   * Creates a comparison predicate between 2 references using the ">=" operator.
   *
   * Compiles to `[left] >= [right]`
   */
  gte(left: IReference, right: IReference): IComparisonPredicate;

  /**
   * Creates a comparison predicate between 2 references using the "<" operator.
   *
   * Compiles to `[left] < [right]`
   */
  lt(left: IReference, right: IReference): IComparisonPredicate;

  /**
   * Creates a comparison predicate between 2 references using the "<=" operator.
   *
   * Compiles to `[left] <= [right]`
   */
  lte(left: IReference, right: IReference): IComparisonPredicate;

  /**
   * Evaluates to true if both the given predicates evaluate to true.
   *
   * Compiles to `[left] AND [right]`
   */
  and(left: IPredicate, right: IPredicate): IAndPredicate;

  /**
   * Evaluates to true if any of the given predicates evaluate to true.
   *
   * Compiles to `[left] OR [right]`
   */
  or(left: IPredicate, right: IPredicate): IOrPredicate;

  /**
   * Evaluates to true if the given predicate does not evaluate to true.
   *
   * Compiles to `NOT [predicate]`
   */
  not(predicate: IPredicate): INegatedPredicate;

  /**
   * Wraps the given predicate in parentheses.
   *
   * Compiles to `([predicate])`
   */
  parenthesize(predicate: IPredicate): IParenthesizedPredicate;

  fn: {
    concat(...values: IReference[]): IConcatReference;

    concat_ws(separator: IReference, ...values: IReference[]): IConcatReference;
  };
};

type ISelectQueryContext<TTables extends Record<string, IQueryableTable>> = {
  /** SELECT [ALL] */
  select(...columns: ISelectableReference[]): ISelectQueryContext<TTables>;

  /** SELECT DISTINCT */
  selectDistinct(
    ...columns: ISelectableReference[]
  ): ISelectQueryContext<TTables>;

  /** FROM ... */
  from(table: keyof TTables): ISelectQueryContext<TTables>;

  /** JOIN ... ON ... */
  join(
    table: keyof TTables,
    condition: IPredicate
  ): ISelectQueryContext<TTables>;

  /** LEFT JOIN ... ON ... */
  leftJoin(table: string, condition: IPredicate): ISelectQueryContext<TTables>;

  /** RIGHT JOIN ... ON ... */
  rightJoin(table: string, condition: IPredicate): ISelectQueryContext<TTables>;

  /** WHERE ... */
  where(condition: IPredicate): ISelectQueryContext<TTables>;
  orderBy(...columns: IOrderableReference[]): ISelectQueryContext<TTables>;

  /** COUNT (...) */
  count(reference: IReference): ICountReference;
  countDistinct(reference: IReference): ICountReference;

  getQuery(): ISelectQuery<TTables>;
};
