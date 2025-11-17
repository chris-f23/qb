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

describe("SELECT FROM JOIN", () => {
  test("SELECT ... FROM t1 JOIN t2 ON t1.colPk = t2.colFk", () => {
    // SELECT id, name, age, country, city, street FROM person JOIN personAddress ON id = personId
    const { createSelectQuery, col } = createQueryContext({
      person: personTable,
      personAddress: personAddressTable,
    });

    const query = createSelectQuery((ctx) => {
      const isSamePerson = col("person", "id").isEqualTo(
        col("personAddress", "personId")
      );

      ctx
        .select(
          col("person", "id"),
          col("person", "name"),
          col("person", "age"),
          col("personAddress", "country"),
          col("personAddress", "city"),
          col("personAddress", "street")
        )
        .from("person")
        .join("personAddress", isSamePerson);
    });

    expect(query).toMatchObject({
      selectList: [
        { table: "person", column: "id" },
        { table: "person", column: "name" },
        { table: "person", column: "age" },
        { table: "personAddress", column: "country" },
        { table: "personAddress", column: "city" },
        { table: "personAddress", column: "street" },
      ],
      mainTable: "person",
      joinedTables: [
        {
          table: "personAddress",
          predicate: {
            left: { table: "person", column: "id" },
            operator: "=",
            right: { table: "personAddress", column: "personId" },
          },
        },
      ],
    });
  });

  test("SELECT ... FROM t1 JOIN t2 ON t1.colPk = t2.colFk AND t2.col = value", () => {
    // SELECT id, street FROM person JOIN personAddress ON id = personId AND country = 'Brazil'
    const { createSelectQuery, col, val } = createQueryContext({
      person: personTable,
      personAddress: personAddressTable,
    });

    const query = createSelectQuery((ctx) => {
      const personId = col("person", "id");
      const isSamePerson = personId.isEqualTo(col("personAddress", "personId"));

      const isFromBrazil = col("personAddress", "country").isEqualTo(
        val("Brazil")
      );

      ctx
        .select(personId, col("personAddress", "street"))
        .from("person")
        .join("personAddress", isSamePerson.and(isFromBrazil));
    });

    expect(query).toMatchObject({
      selectList: [
        { table: "person", column: "id" },
        { table: "personAddress", column: "street" },
      ],
      mainTable: "person",
      joinedTables: [
        {
          table: "personAddress",
          predicate: {
            left: {
              left: { table: "person", column: "id" },
              operator: "=",
              right: { table: "personAddress", column: "personId" },
            },
            operator: "AND",
            right: {
              left: { table: "personAddress", column: "country" },
              operator: "=",
              right: { value: "Brazil" },
            },
          },
        },
      ],
    });
  });

  test("SELECT ... FROM t1 JOIN t2 ON t1.colPk = t2.colFk AND (t2.col = value1 OR t2.col = value2)", () => {
    // SELECT id, city FROM person JOIN personAddress ON id = personId AND (country = 'Brazil' OR country = 'Spain')
    const { createSelectQuery, col, val } = createQueryContext({
      person: personTable,
      personAddress: personAddressTable,
    });

    const query = createSelectQuery((ctx) => {
      const isSamePerson = col("person", "id").isEqualTo(
        col("personAddress", "personId")
      );

      const isFromSpain = col("personAddress", "country").isEqualTo(
        val("Spain")
      );

      const isFromBrazilOrSpain = col("personAddress", "country")
        .isEqualTo(val("Brazil"))
        .or(isFromSpain);

      // const joinCondition = and(
      //   eq(col("person", "id"), col("personAddress", "personId")),
      //   or(
      //     col("personAddress", "country").isEqualTo(val("Brazil")),
      //     col("personAddress", "country").isEqualTo(val("Spain"))
      //   )
      // );

      ctx
        .select(col("person", "id"), col("personAddress", "city"))
        .from("person")
        .join("personAddress", isSamePerson.and(isFromBrazilOrSpain));
    });

    expect(query).toMatchObject({
      selectList: [
        { table: "person", column: "id" },
        { table: "personAddress", column: "city" },
      ],
      mainTable: "person",
      joinedTables: [
        {
          table: "personAddress",
          predicate: {
            left: {
              left: { table: "person", column: "id" },
              operator: "=",
              right: { table: "personAddress", column: "personId" },
            },
            operator: "AND",
            right: {
              left: {
                left: { table: "personAddress", column: "country" },
                operator: "=",
                right: { value: "Brazil" },
              },
              operator: "OR",
              right: {
                left: { table: "personAddress", column: "country" },
                operator: "=",
                right: { value: "Spain" },
              },
            },
          },
        },
      ],
    });
  });

  test("SELECT ... FROM t1 JOIN t2 ON t1.colPk = t2.colFk AND NOT t2.col = value", () => {
    // SELECT id, country FROM person JOIN personAddress ON id = personId AND NOT country = 'France'
    const { createSelectQuery, col, val } = createQueryContext({
      person: personTable,
      personAddress: personAddressTable,
    });

    const query = createSelectQuery((ctx) => {
      const isSamePerson = col("person", "id").isEqualTo(
        col("personAddress", "personId")
      );

      const isNotFromFrance = col("personAddress", "country")
        .isEqualTo(val("France"))
        .not();

      ctx
        .select(col("person", "id"), col("personAddress", "country"))
        .from("person")
        .join("personAddress", isSamePerson.and(isNotFromFrance));
    });

    expect(query).toMatchObject({
      selectList: [
        { table: "person", column: "id" },
        { table: "personAddress", column: "country" },
      ],
      mainTable: "person",
      joinedTables: [
        {
          table: "personAddress",
          predicate: {
            left: {
              left: { table: "person", column: "id" },
              operator: "=",
              right: { table: "personAddress", column: "personId" },
            },
            operator: "AND",
            right: {
              predicate: {
                left: { table: "personAddress", column: "country" },
                operator: "=",
                right: { value: "France" },
              },
              operator: "NOT",
            },
          },
        },
      ],
    });
  });

  test("SELECT ... FROM t1 JOIN t2 ON t1.colPk = t2.colFk AND t2.col <> value", () => {
    // SELECT id, country FROM person JOIN personAddress ON id = personId AND country <> 'France'
    const { createSelectQuery, col, val } = createQueryContext({
      person: personTable,
      personAddress: personAddressTable,
    });
    const query = createSelectQuery((ctx) => {
      const isSamePerson = col("person", "id").isEqualTo(
        col("personAddress", "personId")
      );

      const isNotFromFrance = col("personAddress", "country").isNotEqualTo(
        val("France")
      );

      ctx
        .select(col("person", "id"), col("personAddress", "country"))
        .from("person")
        .join("personAddress", isSamePerson.and(isNotFromFrance));
    });

    expect(query).toMatchObject({
      selectList: [
        { table: "person", column: "id" },
        { table: "personAddress", column: "country" },
      ],
      mainTable: "person",
      joinedTables: [
        {
          table: "personAddress",
          predicate: {
            left: {
              left: { table: "person", column: "id" },
              operator: "=",
              right: { table: "personAddress", column: "personId" },
            },
            operator: "AND",
            right: {
              left: { table: "personAddress", column: "country" },
              operator: "<>",
              right: { value: "France" },
            },
          },
        },
      ],
    });
  });

  test("SELECT ... FROM t1 RIGHT JOIN t2 ON t1.colPk = t2.colFk WHERE t1.colPk IS NULL", () => {
    // SELECT country FROM person RIGHT JOIN personAddress ON id = personId WHERE id IS NULL
    const { createSelectQuery, col } = createQueryContext({
      person: personTable,
      personAddress: personAddressTable,
    });

    const query = createSelectQuery((ctx) => {
      const personId = col("person", "id");
      const isSamePerson = personId.isEqualTo(col("personAddress", "personId"));

      ctx
        .select(col("personAddress", "country"))
        .from("person")
        .rightJoin("personAddress", isSamePerson)
        .where(personId.isNull());
    });

    expect(query).toMatchObject({
      selectList: [{ table: "personAddress", column: "country" }],
      mainTable: "person",
      joinedTables: [
        {
          table: "personAddress",
          type: "RIGHT",
          predicate: {
            left: { table: "person", column: "id" },
            operator: "=",
            right: { table: "personAddress", column: "personId" },
          },
        },
      ],
      searchCondition: {
        left: { table: "person", column: "id" },
        operator: "IS NULL",
      },
    });
  });

  test("SELECT ... FROM t1 LEFT JOIN t2 ON t1.colPk = t2.colFk WHERE t2.colPk IS NULL", () => {
    // SELECT name FROM person LEFT JOIN personAddress ON id = personId WHERE personId IS NULL
    const { createSelectQuery, col } = createQueryContext({
      person: personTable,
      personAddress: personAddressTable,
    });

    const query = createSelectQuery((ctx) => {
      const isSamePerson = col("person", "id").isEqualTo(
        col("personAddress", "personId")
      );
      // const isSamePerson = eq(
      //   col("person", "id"),
      //   col("personAddress", "personId")
      // );

      ctx
        .select(col("person", "name"))
        .from("person")
        .leftJoin("personAddress", isSamePerson)
        .where(col("personAddress", "personId").isNull());
    });

    expect(query).toMatchObject({
      selectList: [{ table: "person", column: "name" }],
      mainTable: "person",
      joinedTables: [
        {
          table: "personAddress",
          type: "LEFT",
          predicate: {
            left: { table: "person", column: "id" },
            operator: "=",
            right: { table: "personAddress", column: "personId" },
          },
        },
      ],
      searchCondition: {
        left: { table: "personAddress", column: "personId" },
        operator: "IS NULL",
      },
    });
  });
});
