type ITableColumnDataType = "INT" | "VARCHAR" | "DATETIME";

type IQueryableTable<
  UTableColumns extends Record<string, ITableColumnDataType>
> = {
  name: string;
  schemaName?: string;
  databaseName?: string;
  columns: UTableColumns;
};

type IOrderableReference = {
  original: IReference;
  order: "ASC" | "DESC";
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
  isWrapped?: boolean;
  isNegated?: boolean;
  build(): string;
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
  getColumn<
    UTableAlias extends keyof TTables,
    UColumnName extends keyof TTables[UTableAlias]["columns"]
  >(
    table: UTableAlias,
    column: UColumnName
  ): IColumnReference<UTableAlias, UColumnName>;
  $col<
    UTableAlias extends keyof TTables,
    UColumnName extends keyof TTables[UTableAlias]["columns"]
  >(
    table: UTableAlias,
    column: UColumnName
  ): IColumnReference<UTableAlias, UColumnName>;

  literal(value: ILiteralValue): ILiteralReference;
  $val(value: ILiteralValue): ILiteralReference;

  createSelectQuery: (
    defineCallback: (ctx: ISelectQueryContext<TTables>) => void
  ) => ISelectQuery<TTables>;
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
  join(table: string, condition: IPredicate): ISelectQueryContext<TTables>;

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
