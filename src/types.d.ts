/** Referencia a cualquier valor dentro de la consulta */
type IReference = {
  build(): string;

  isEqualTo(other: IReference): IComparisonPredicate;
  isNotEqualTo(other: IReference): IComparisonPredicate;
  isGreaterThan(other: IReference): IComparisonPredicate;
  isGreaterThanOrEqualTo(other: IReference): IComparisonPredicate;
  isLessThan(other: IReference): IComparisonPredicate;
  isLessThanOrEqualTo(other: IReference): IComparisonPredicate;
};

type IColumnReference<TTable, TColumn> = IReference & {
  table: TTable;
  column: TColumn;
};

type ILiteralReference = IReference & {
  value: ILiteralValue;
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
  operator: "=" | ">" | "<" | "<=" | ">=" | "<>";
  right: IReference;

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

type IQuery<TTables extends Record<string, unknown>> = {
  build(): string;
};

type ISelectQuery<TTables extends Record<string, unknown>> = IQuery<TTables> & {
  selectList: IReference[];
  mainTable: keyof TTables | undefined;
  joinedTables: { table: keyof TTables; predicate: IPredicate }[] | undefined;
  searchCondition: IPredicate | undefined;
  // TODO: WHERE...
};

type ILiteralValue = string | number | boolean;

type IQueryContext<TTables extends Record<string, unknown>> = {
  getColumn<
    TTable extends keyof TTables,
    TColumn extends keyof TTables[TTable]
  >(
    table: TTable,
    column: TColumn
  ): IColumnReference<TTable, TColumn>;
  literal(value: ILiteralValue): ILiteralReference;
};

type ISelectQueryContext<TTables extends Record<string, unknown>> =
  IQueryContext<TTables> & {
    select(...columns: IReference[]): ISelectQueryContext;
    from(table: string): ISelectQueryContext<TTables>;
    join(table: string, condition: IPredicate): ISelectQueryContext<TTables>;
    where(condition: IPredicate): ISelectQueryContext<TTables>;
    getQuery(): ISelectQuery<TTables>;
  };
