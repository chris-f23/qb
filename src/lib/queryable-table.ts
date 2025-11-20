export const createQueryableTable = <
  const TColumns extends Record<string, ITableColumnDataType>
>({
  name,
  schemaName,
  databaseName,
  columns,
}: {
  name: string;
  schemaName?: string;
  databaseName?: string;
  columns: TColumns;
}): IQueryableTable<TColumns> => ({
  name,
  schemaName: schemaName,
  databaseName: databaseName,
  columns: columns,

  build() {
    if (schemaName && databaseName) {
      return `[${databaseName}].[${schemaName}].[${name}]`;
    } else if (schemaName) {
      return `[${schemaName}].[${name}]`;
    } else if (databaseName) {
      return `[${databaseName}]..[${name}]`;
    } else {
      return `[${name}]`;
    }
  },
});
