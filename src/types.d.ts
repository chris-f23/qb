type IQueryTable = {
  name: string;
  schemaName: string;
  databaseName: string;
  columns: {
    [name: string]: "VARCHAR" | "INT";
  };
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
  build(): string;
};

/** Predicado que compara 2 referencias mediante operadores de tipo "es igual a", "es menor a", "es mayor o igual a", etc */
type IComparisonPredicate = IPredicate & {
  left: IReference;
  operator: "=" | ">" | "<" | "<=" | ">=" | "<>" | "IS NULL" | "IS NOT NULL";
  right?: IReference;

  and(other: IPredicate): IBooleanPredicate;
  or(other: IPredicate): IBooleanPredicate;
  not(): INegatedPredicate;
};

/** Predicado que compara 2 predicados mediante operadores "o" u "y" */
type IBooleanPredicate = IPredicate & {
  left: IPredicate;
  operator: "OR" | "AND";
  right: IPredicate;
};

type INegatedPredicate = IPredicate & {
  predicate: IPredicate;
  operator: "NOT";
};

type IQuery<TTables extends Record<string, IQueryTable>> = {
  involvedTables: TTables;
  build(): string;
};

type ISelectQuery<TTables extends Record<string, IQueryTable>> =
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
    // TODO: WHERE...
  };

type ILiteralValue = string | number | boolean;

type IQueryContext<TTables extends Record<string, IQueryTable>> = {
  getColumn<
    TTable extends keyof TTables,
    TColumn extends keyof TTables[TTable]["columns"]
  >(
    table: TTable,
    column: TColumn
  ): IColumnReference<TTable, TColumn>;
  literal(value: ILiteralValue): ILiteralReference;
};

type ISelectQueryContext<TTables extends Record<string, IQueryTable>> =
  IQueryContext<TTables> & {
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
    leftJoin(
      table: string,
      condition: IPredicate
    ): ISelectQueryContext<TTables>;

    /** RIGHT JOIN ... ON ... */
    rightJoin(
      table: string,
      condition: IPredicate
    ): ISelectQueryContext<TTables>;

    /** WHERE ... */
    where(condition: IPredicate): ISelectQueryContext<TTables>;

    count(reference: IReference): ICountReference;
    countDistinct(reference: IReference): ICountReference;

    getQuery(): ISelectQuery<TTables>;
  };
