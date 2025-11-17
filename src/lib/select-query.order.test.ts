import { describe, expect, test } from "@jest/globals";
import { createQueryContext } from "./query-context";
import { createQueryableTable } from "./queryable-table";

const productTable = createQueryableTable({
  name: "Product",
  schemaName: "Production",
  columns: { ProductID: "INT", Name: "VARCHAR" },
});

describe("Order by clause", () => {
  test("SELECT ... FROM t1 WHERE t1.col1 LIKE pattern ORDER BY t1.col2", () => {
    // SELECT ProductID, Name FROM Production.Product WHERE Name LIKE 'Lock Washer%' ORDER BY ProductID
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
  });
});
