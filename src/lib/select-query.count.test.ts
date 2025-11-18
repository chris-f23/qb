import { describe, expect, test } from "@jest/globals";
import { createQueryContext } from "./query-context";
import { createQueryableTable } from "./queryable-table";

const personTable = createQueryableTable({
  name: "Person",
  databaseName: "MainDB",
  columns: { id: "INT", name: "VARCHAR", age: "INT" },
});

describe("SELECT COUNT", () => {
  test("SELECT COUNT(1) FROM t1", () => {
    // SELECT COUNT(1) FROM person
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

  test("SELECT COUNT(DISTINCT t1.col) FROM t1", () => {
    // SELECT COUNT(DISTINCT name) FROM person
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
