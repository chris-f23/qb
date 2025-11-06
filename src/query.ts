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

const createColumnReference = <TTable, TColumn>(
  table: TTable,
  column: TColumn
): IColumnReference<TTable, TColumn> => {
  return {
    table: table,
    column: column,
    build() {
      return `${this.table}.${this.column}`;
    },
    isEqualTo(other: IReference): IComparisonPredicate {
      return createComparisonPredicate(this, "=", other);
    },
  };
};

const createLiteralReference = (value: string): ILiteralReference => {
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

const createComparisonPredicate = (
  left: IReference,
  operator: IComparisonPredicate["operator"],
  right: IReference
): IComparisonPredicate => {
  return {
    left: left,
    operator: operator,
    right: right,
    // isNegated: false,
    // isWrapped: false,
    build() {
      return `${this.left.build()} ${this.operator} ${this.right.build()}`;
    },

    and(other: IComparisonPredicate): IBooleanPredicate {
      return createBooleanPredicate(this, "AND", other);
    },

    or(other: IComparisonPredicate): IBooleanPredicate {
      return createBooleanPredicate(this, "OR", other);
    },

    not(): INegatedPredicate {
      return createNegatedPredicate(this);
    },
  };
};

const createBooleanPredicate = (
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

const createNegatedPredicate = (predicate: IPredicate): INegatedPredicate => {
  return {
    predicate: predicate,
    operator: "NOT",
    build() {
      return `${this.operator} ${this.predicate.build()}`;
    },
  };
};

// export function defineQuery<TTables extends Record<string, unknown>>() {

// }

export function createQuery<TTables extends Record<string, unknown>>() {
  type TAliasedColumnReference<TableName extends keyof TTables> = IReference & {
    readonly table: TableName;
    readonly column: keyof TTables[TableName];
    readonly alias: string;
  };

  const getColumn = <
    TTable extends keyof TTables,
    TColumn extends keyof TTables[TTable]
  >(
    table: TTable,
    column: TColumn
  ): IColumnReference<TTable, TColumn> => {
    return createColumnReference(table, column);
  };

  const selectList: IReference[] = [];
  let mainTable: keyof TTables;

  const joinedTables: { table: keyof TTables; predicate: IPredicate }[] = [];

  const context = {
    getColumn: getColumn,
    select(...columns: IReference[]) {
      selectList.push(...columns);
      return this;
    },
    from(table: keyof TTables) {
      mainTable = table;
      return this;
    },
    join(table: keyof TTables, condition: IPredicate) {
      joinedTables.push({ table: table, predicate: condition });
      return this;
    },
    // compare: createComparisonPredicate,

    wrap: (predicate: IPredicate): IPredicate => {
      return {
        ...predicate,
        isWrapped: true,
      };
    },
    literal(value: string): ILiteralReference {
      return createLiteralReference(value);
    },
  };

  type TContext = typeof context;

  return {
    as: (definitionCallback: (ctx: TContext) => void) => {
      definitionCallback(context);

      return {
        getDefinition() {
          return {
            selectList: selectList,
            mainTable: mainTable,
            joinedTables: joinedTables,
          };
        },
        build() {
          return "wip";
        },
      };
    },
  };
}
