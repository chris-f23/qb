import { describe, expect, test } from "@jest/globals";
import { createQueryContext } from "./query-context";
import { createQueryableTable } from "./queryable-table";

const personAddressTable = createQueryableTable({
  name: "PersonAddress",
  schemaName: "HR",
  databaseName: "Main",
  columns: {
    PersonId: "INT",
    Country: "VARCHAR",
    City: "VARCHAR",
    Street: "VARCHAR",
  },
});

describe("SELECT DISTINCT", () => {
  test("SELECT DISTINCT ... FROM t1 WHERE t1.col <> value", () => {
    // SELECT DISTINCT city FROM personAddress WHERE country <> 'Mexico'
    const { createSelectQuery, col, val } = createQueryContext({
      pa: personAddressTable,
    });

    const query = createSelectQuery((ctx) =>
      ctx
        .selectDistinct(col("pa", "City"))
        .from("pa")
        .where(col("pa", "Country").isNotEqualTo(val("Mexico")))
    );

    expect(query).toMatchObject({
      selectMode: "DISTINCT",
      selectList: [{ table: "pa", column: "City" }],
      mainTable: "pa",
      searchCondition: {
        left: { table: "pa", column: "Country" },
        operator: "<>",
        right: { value: "Mexico" },
      },
    });
    expect(query.build()).toBe(
      "SELECT DISTINCT [pa].[City] FROM [Main].[HR].[PersonAddress] AS [pa] WHERE [pa].[Country] <> 'Mexico'"
    );
  });
});
