import { describe, expect, test } from "@jest/globals";
import { createQueryContext } from "./query-context";
import { createQueryableTable } from "./queryable-table";

const personTable = createQueryableTable({
  name: "Person",
  databaseName: "MainDB",
  schemaName: "dbo",
  columns: { id: "INT", name: "VARCHAR", age: "INT" },
});

const personAddressTable = createQueryableTable({
  name: "PersonAddress",
  schemaName: "dbo",
  databaseName: "db",
  columns: {
    personId: "INT",
    country: "VARCHAR",
    city: "VARCHAR",
    street: "VARCHAR",
  },
});

describe("SELECT FROM WHERE", () => {
  test("Select a literal reference", () => {
    const { createSelectQuery, val } = createQueryContext({});
    const query = createSelectQuery((ctx) => ctx.select(val(1)));
    expect(query).toMatchObject({ selectList: [{ value: 1 }] });
  });

  test("Select a column reference", () => {
    const { createSelectQuery, col } = createQueryContext({
      person: personTable,
    });

    const query = createSelectQuery((ctx) =>
      ctx.select(col("person", "id")).from("person")
    );
    expect(query).toMatchObject({
      selectList: [{ table: "person", column: "id" }],
      mainTable: "person",
    });
    expect(query.build()).toBe(
      "SELECT [person].[id] FROM [MainDB].[dbo].[Person] AS [person]"
    );
  });

  test("Select multiple column references", () => {
    const { createSelectQuery, col } = createQueryContext({
      person: personTable,
    });

    const query = createSelectQuery((ctx) => {
      const [personId, personName] = [
        col("person", "id"),
        col("person", "name"),
      ];
      ctx.select(personId, personName).from("person");
    });

    expect(query).toMatchObject({
      selectList: [
        { table: "person", column: "id" },
        { table: "person", column: "name" },
      ],
      mainTable: "person",
    });

    expect(query.build()).toBe(
      "SELECT [person].[id], [person].[name] FROM [MainDB].[dbo].[Person] AS [person]"
    );
  });

  test("Select using a search condition", () => {
    const { createSelectQuery, col, val } = createQueryContext({
      person: personTable,
    });
    const query = createSelectQuery((ctx) => {
      const [personId, personName] = [
        col("person", "id"),
        col("person", "name"),
      ];
      ctx
        .select(personName)
        .from("person")
        .where(personId.isEqualTo(val(1)));
    });

    expect(query).toMatchObject({
      selectList: [{ table: "person", column: "name" }],
      mainTable: "person",
      searchCondition: {
        left: { table: "person", column: "id" },
        operator: "=",
        right: { value: 1 },
      },
    });

    expect(query.build()).toBe(
      "SELECT [person].[name] FROM [MainDB].[dbo].[Person] AS [person] WHERE [person].[id] = 1"
    );
  });
});
