/** Referencia a cualquier valor dentro de la consulta */
type IReference = {
  build(): string;

  isEqualTo(other: IReference): IComparisonPredicate;
};

type IColumnReference<TTable, TColumn> = IReference & {
  table: TTable;
  column: TColumn;
};

type ILiteralReference = IReference & {
  value: string;
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
