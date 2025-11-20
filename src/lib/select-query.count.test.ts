import { describe, expect, test } from "@jest/globals";
import { createQueryContext } from "./query-context";
import { createQueryableTable } from "./queryable-table";

const personTable = createQueryableTable({
  name: "Person",
  databaseName: "MainDB",
  columns: { id: "INT", name: "VARCHAR", age: "INT" },
});

describe("SELECT COUNT", () => {
  test("Select total number of rows in table", () => {
    const { createSelectQuery, val } = createQueryContext({
      p: personTable,
    });

    const query = createSelectQuery((ctx) =>
      ctx.select(ctx.count(val(1))).from("p")
    );

    expect(query).toMatchObject({
      selectList: [
        {
          originalReference: {
            value: 1,
          },
          asDistinct: false,
        },
      ],
      mainTable: "p",
    });
    expect(query.build()).toBe(
      "SELECT COUNT(1) FROM [MainDB]..[Person] AS [p]"
    );
  });

  test("Select total number of distinct values of a column", () => {
    const { createSelectQuery, col } = createQueryContext({
      per: personTable,
    });
    const query = createSelectQuery((ctx) =>
      ctx.select(ctx.countDistinct(col("per", "name"))).from("per")
    );

    expect(query).toMatchObject({
      selectList: [
        {
          originalReference: {
            table: "per",
            column: "name",
          },
          asDistinct: true,
        },
      ],
      mainTable: "per",
    });
    expect(query.build()).toBe(
      "SELECT COUNT(DISTINCT [per].[name]) FROM [MainDB]..[Person] AS [per]"
    );
  });
});
