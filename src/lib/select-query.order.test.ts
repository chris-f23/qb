import { describe, expect, test } from "@jest/globals";
import { createQueryContext } from "./query-context";
import { createQueryableTable } from "./queryable-table";

const productTable = createQueryableTable({
  name: "Product",
  schemaName: "Production",
  columns: { ProductID: "INT", Name: "VARCHAR" },
});

describe("ORDER BY", () => {
  test("Select and order by a column in ascending order", () => {
    const { createSelectQuery, col, val } = createQueryContext({
      pr: productTable,
    });

    const query = createSelectQuery((ctx) => {
      const [productId, productName] = [
        col("pr", "ProductID"),
        col("pr", "Name"),
      ];

      ctx
        .select(productId, productName)
        .from("pr")
        .where(productName.isLike(val("Lock Washer%")))
        .orderBy(productId.sortAscending());
    });

    expect(query).toMatchObject({
      selectList: [
        { table: "pr", column: "ProductID" },
        { table: "pr", column: "Name" },
      ],
      mainTable: "pr",
      searchCondition: {
        left: { table: "pr", column: "Name" },
        operator: "LIKE",
        pattern: {
          value: "Lock Washer%",
        },
      },
      orderByList: [
        { original: { table: "pr", column: "ProductID" }, order: "ASC" },
      ],
    });
    expect(query.build()).toBe(
      "SELECT [pr].[ProductID], [pr].[Name] " +
        "FROM [Production].[Product] AS [pr] " +
        "WHERE [pr].[Name] LIKE 'Lock Washer%' " +
        "ORDER BY [pr].[ProductID] ASC"
    );
  });

  test("Select and order by a column in descending order", () => {
    const { createSelectQuery, col, val } = createQueryContext({
      pr: productTable,
    });

    const query = createSelectQuery((ctx) => {
      const [productId, productName] = [
        col("pr", "ProductID"),
        col("pr", "Name"),
      ];

      ctx
        .select(productId, productName)
        .from("pr")
        .where(productName.isLike(val("Lock Washer%")))
        .orderBy(productId.sortDescending());
    });

    expect(query).toMatchObject({
      selectList: [
        { table: "pr", column: "ProductID" },
        { table: "pr", column: "Name" },
      ],
      mainTable: "pr",
      searchCondition: {
        left: { table: "pr", column: "Name" },
        operator: "LIKE",
        pattern: {
          value: "Lock Washer%",
        },
      },
      orderByList: [
        { original: { table: "pr", column: "ProductID" }, order: "DESC" },
      ],
    });
    expect(query.build()).toBe(
      "SELECT [pr].[ProductID], [pr].[Name] " +
        "FROM [Production].[Product] AS [pr] " +
        "WHERE [pr].[Name] LIKE 'Lock Washer%' " +
        "ORDER BY [pr].[ProductID] DESC"
    );
  });
});
