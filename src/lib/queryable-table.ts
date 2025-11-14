export const createQueryableTable = <
  TColumns extends Record<string, ITableColumnDataType>
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
});
