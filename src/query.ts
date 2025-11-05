/** Referencia a cualquier valor dentro de la consulta */
type IReference = {
  build(): string;
};

/** Predicado que puede ser negado, o envuelto en paréntesis */
type IPredicate = {
  isNegated: boolean;
  isWrapped: boolean;
  build(): string;
};

/** Predicado que compara 2 referencias mediante operadores de tipo "es igual a", "es menor a", "es mayor o igual a", etc */
type IComparisonPredicate = IPredicate & {
  left: IReference;
  operator: "=" | ">" | "<" | "<=" | ">=";
  right: IReference;
};

/** Predicado que compara 2 predicados mediante operadores "o" u "y" */
type ILogicalPredicate = IPredicate & {
  left: IPredicate;
  operator: "OR" | "AND";
  right: IPredicate;
};

export function createQuery<TTables extends Record<string, unknown>>() {
  type TAliasedColumnReference<TableName extends keyof TTables> = IReference & {
    readonly table: TableName;
    readonly column: keyof TTables[TableName];
    readonly alias: string;
  };

  type TColumnReference<TableName extends keyof TTables> = IReference & {
    readonly table: TableName;
    readonly column: keyof TTables[TableName];
    // as(alias: string): TAliasedColumnReference<TableName>;
  };

  const getColumn = <TTable extends keyof TTables>(
    table: TTable,
    column: keyof TTables[TTable]
  ): TColumnReference<TTable> => {
    return {
      table: table,
      column: column,
      build() {
        return `${this.table.toString()}.${this.column.toString()}`;
      },
      // as(alias: string) {
      //   return {
      //     table: this.table,
      //     column: this.column,
      //     alias: alias,
      //     build() {
      //       return `${this.table.toString()}.${this.column.toString()} AS ${
      //         this.alias
      //       }`;
      //     },
      //   };
      // },
    };
  };

  const selectList: IReference[] = [];
  const select = (...columns: IReference[]) => {
    selectList.push(...columns);
  };

  let mainTable: keyof TTables;
  const from = (table: keyof TTables) => {
    mainTable = table;
  };

  const compare = (
    left: IReference,
    operator: IComparisonPredicate["operator"],
    right: IReference
  ): IComparisonPredicate => {
    return {
      left: left,
      operator: operator,
      right: right,
      isNegated: false,
      isWrapped: false,
      build() {
        return `${this.left.build()} ${this.operator} ${this.right.build()}`;
      },
    };
  };

  const joinedTables: { table: keyof TTables; predicate: IPredicate }[] = [];
  const join = (table: keyof TTables, condition: IPredicate) => {
    joinedTables.push({ table: table, predicate: condition });
  };

  const context = {
    getColumn: getColumn,
    select: select,
    from: from,
    join: join,
    compare: compare,
    not: (predicate: IPredicate): IPredicate => {
      return {
        ...predicate,
        isNegated: true,
      };
    },
    wrap: (predicate: IPredicate): IPredicate => {
      return {
        ...predicate,
        isWrapped: true,
      };
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
