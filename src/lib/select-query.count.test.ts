import { describe, expect, test } from "@jest/globals";
import { createQueryContext } from "./query-context";
import { createQueryableTable } from "./queryable-table";

const personTable = createQueryableTable({
  name: "person",
  columns: { id: "INT", name: "VARCHAR", age: "INT" },
});

const personAddressTable = createQueryableTable({
  name: "personAddress",
  schemaName: "dbo",
  databaseName: "db",
  columns: {
    personId: "INT",
    country: "VARCHAR",
    city: "VARCHAR",
    street: "VARCHAR",
  },
});

describe("SELECT COUNT", () => {
  test("SELECT COUNT(1) FROM t1", () => {
    // SELECT COUNT(1) FROM person
    const { createSelectQuery, val } = createQueryContext({
      person: personTable,
    });

    const query = createSelectQuery((ctx) =>
      ctx.select(ctx.count(val(1))).from("person")
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
      mainTable: "person",
    });
  });

  test("SELECT COUNT(DISTINCT t1.col) FROM t1", () => {
    // SELECT COUNT(DISTINCT name) FROM person
    const { createSelectQuery, col } = createQueryContext({
      person: personTable,
    });
    const query = createSelectQuery((ctx) =>
      ctx.select(ctx.countDistinct(col("person", "name"))).from("person")
    );

    expect(query).toMatchObject({
      selectList: [
        {
          originalReference: {
            table: "person",
            column: "name",
          },
          asDistinct: true,
        },
      ],
      mainTable: "person",
    });
  });
});
