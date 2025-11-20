import { describe, expect, test } from "@jest/globals";
import { createQueryContext } from "./query-context";
import { createQueryableTable } from "./queryable-table";

const employeeTable = createQueryableTable({
  name: "Employees",
  columns: { EmployeeID: "INT", FirstName: "VARCHAR", LastName: "VARCHAR" },
});

const orderTable = createQueryableTable({
  name: "Orders",
  columns: { EmployeeID: "INT", OrderDate: "DATETIME" },
});

describe("SUBQUERY", () => {
  test("Select using a subquery as search condition", () => {
    const { createSelectQuery, col, val } = createQueryContext({
      o: orderTable,
      e: employeeTable,
    });

    const subquery = createSelectQuery((ctx) => {
      const [employeeId, orderDate] = [
        col("o", "EmployeeID"),
        col("o", "OrderDate"),
      ];

      ctx
        .select(employeeId)
        .from("o")
        .where(orderDate.isEqualTo(val("2025-01-01")));
    });

    const outerQuery = createSelectQuery((ctx) => {
      const [employeeId, firstName, lastName] = [
        col("e", "EmployeeID"),
        col("e", "FirstName"),
        col("e", "LastName"),
      ];

      ctx
        .select(employeeId, firstName, lastName)
        .from("e")
        .where(employeeId.isInSubquery(subquery));
    });

    expect(outerQuery).toMatchObject({
      selectList: [
        { table: "e", column: "EmployeeID" },
        { table: "e", column: "FirstName" },
        { table: "e", column: "LastName" },
      ],
      mainTable: "e",
      searchCondition: {
        left: { table: "e", column: "EmployeeID" },
        operator: "IN_SUBQUERY",
        subquery: {
          selectList: [{ table: "o", column: "EmployeeID" }],
          mainTable: "o",
          searchCondition: {
            left: { table: "o", column: "OrderDate" },
            operator: "=",
            right: { value: "2025-01-01" },
          },
        },
      },
    });
    expect(outerQuery.build()).toBe(
      "SELECT [e].[EmployeeID], [e].[FirstName], [e].[LastName] " +
        "FROM [Employees] AS [e] " +
        "WHERE [e].[EmployeeID] IN " +
        "(SELECT [o].[EmployeeID] " +
        "FROM [Orders] AS [o] " +
        "WHERE [o].[OrderDate] = '2025-01-01')"
    );
  });

  test("Select using a correlated subquery as search condition", () => {
    const { createSelectQuery, col, val, and } = createQueryContext({
      o: orderTable,
      e: employeeTable,
    });

    const subquery = createSelectQuery((ctx) => {
      const isSameEmployee = col("o", "EmployeeID").isEqualTo(
        col("e", "EmployeeID")
      );
      const isOnDate = col("o", "OrderDate").isEqualTo(val("2025-01-01"));

      ctx
        .select(col("o", "EmployeeID"))
        .from("o")
        .where(and(isSameEmployee, isOnDate));
    });

    const query = createSelectQuery((ctx) => {
      ctx
        .select(
          col("e", "EmployeeID"),
          col("e", "FirstName"),
          col("e", "LastName")
        )
        .from("e")
        .where(col("e", "EmployeeID").isInSubquery(subquery));
    });

    expect(query).toMatchObject({
      selectList: [
        { table: "e", column: "EmployeeID" },
        { table: "e", column: "FirstName" },
        { table: "e", column: "LastName" },
      ],
      mainTable: "e",
      searchCondition: {
        left: { table: "e", column: "EmployeeID" },
        operator: "IN_SUBQUERY",
        subquery: {
          selectList: [{ table: "o", column: "EmployeeID" }],
          mainTable: "o",
          searchCondition: {
            left: {
              left: { table: "o", column: "EmployeeID" },
              operator: "=",
              right: { table: "e", column: "EmployeeID" },
            },
            operator: "AND",
            right: {
              left: { table: "o", column: "OrderDate" },
              operator: "=",
              right: { value: "2025-01-01" },
            },
          },
        },
      },
    });

    expect(query.build()).toBe(
      "SELECT [e].[EmployeeID], [e].[FirstName], [e].[LastName] " +
        "FROM [Employees] AS [e] " +
        "WHERE [e].[EmployeeID] IN " +
        "(SELECT [o].[EmployeeID] " +
        "FROM [Orders] AS [o] " +
        "WHERE [o].[EmployeeID] = [e].[EmployeeID] " +
        "AND [o].[OrderDate] = '2025-01-01')"
    );
  });
});
