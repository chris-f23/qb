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

describe("SELECT DISTINCT", () => {
  test("SELECT DISTINCT ... FROM t1 WHERE t1.col <> value", () => {
    // SELECT DISTINCT city FROM personAddress WHERE country <> 'Mexico'
    const { createSelectQuery, col, val } = createQueryContext({
      personAddress: personAddressTable,
    });

    const query = createSelectQuery((ctx) =>
      ctx
        .selectDistinct(col("personAddress", "city"))
        .from("personAddress")
        .where(col("personAddress", "country").isNotEqualTo(val("Mexico")))
    );

    expect(query).toMatchObject({
      selectMode: "DISTINCT",
      selectList: [{ table: "personAddress", column: "city" }],
      mainTable: "personAddress",
      searchCondition: {
        left: { table: "personAddress", column: "country" },
        operator: "<>",
        right: { value: "Mexico" },
      },
    });
  });
});
