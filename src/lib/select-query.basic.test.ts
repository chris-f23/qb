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

describe("SELECT FROM WHERE", () => {
  test("SELECT literal", () => {
    // SELECT 1;
    const { createSelectQuery, val } = createQueryContext({});
    const query = createSelectQuery((ctx) => ctx.select(val(1)));
    expect(query).toMatchObject({ selectList: [{ value: 1 }] });
  });

  test("SELECT t1.col1 FROM t1", () => {
    // SELECT id FROM person
    const { createSelectQuery, col } = createQueryContext({
      person: personTable,
      personAddress: personAddressTable,
    });
    const query = createSelectQuery((ctx) =>
      ctx.select(col("person", "id")).from("person")
    );
    expect(query).toMatchObject({
      selectList: [{ table: "person", column: "id" }],
      mainTable: "person",
    });
  });

  test("SELECT t1.col1, t1.col2 FROM t1", () => {
    // SELECT name, id FROM person
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
  });

  test("SELECT ... FROM t1 WHERE t1.col = value", () => {
    //SELECT name FROM person WHERE id = 1
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
  });
});
