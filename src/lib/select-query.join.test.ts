import { describe, expect, test } from "@jest/globals";
import { createQueryContext } from "./query-context";
import { createQueryableTable } from "./queryable-table";

const personTable = createQueryableTable({
  name: "Person",
  schemaName: "HumanResources",
  columns: { Id: "INT", Name: "VARCHAR", Age: "INT" },
});

const personAddressTable = createQueryableTable({
  name: "PersonAddress",
  schemaName: "HumanResources",
  databaseName: "Main",
  columns: {
    PersonId: "INT",
    Country: "VARCHAR",
    City: "VARCHAR",
    Street: "VARCHAR",
  },
});

describe("SELECT FROM JOIN", () => {
  test("SELECT ... FROM t1 JOIN t2 ON t1.colPk = t2.colFk", () => {
    // SELECT id, name, age, country, city, street FROM person JOIN personAddress ON id = personId
    const { createSelectQuery, col } = createQueryContext({
      p: personTable,
      pa: personAddressTable,
    });

    const query = createSelectQuery((ctx) => {
      const isSamePerson = col("p", "Id").isEqualTo(col("pa", "PersonId"));

      ctx
        .select(
          col("p", "Id"),
          col("p", "Name"),
          col("p", "Age"),
          col("pa", "Country"),
          col("pa", "City"),
          col("pa", "Street")
        )
        .from("p")
        .join("pa", isSamePerson);
    });

    expect(query).toMatchObject({
      selectList: [
        { table: "p", column: "Id" },
        { table: "p", column: "Name" },
        { table: "p", column: "Age" },
        { table: "pa", column: "Country" },
        { table: "pa", column: "City" },
        { table: "pa", column: "Street" },
      ],
      mainTable: "p",
      joinedTables: [
        {
          table: "pa",
          predicate: {
            left: { table: "p", column: "Id" },
            operator: "=",
            right: { table: "pa", column: "PersonId" },
          },
        },
      ],
    });
    expect(query.build()).toBe(
      "SELECT [p].[Id], [p].[Name], [p].[Age], [pa].[Country], [pa].[City], [pa].[Street] " +
        "FROM [HumanResources].[Person] AS [p] " +
        "JOIN [Main].[HumanResources].[PersonAddress] AS [pa] " +
        "ON [p].[Id] = [pa].[PersonId]"
    );
  });

  test("SELECT ... FROM t1 JOIN t2 ON t1.colPk = t2.colFk AND t2.col = value", () => {
    // SELECT id, street FROM person JOIN personAddress ON id = personId AND country = 'Brazil'
    const { createSelectQuery, col, val } = createQueryContext({
      person: personTable,
      personAddress: personAddressTable,
    });

    const query = createSelectQuery((ctx) => {
      const personId = col("person", "Id");
      const isSamePerson = personId.isEqualTo(col("personAddress", "PersonId"));

      const isFromBrazil = col("personAddress", "Country").isEqualTo(
        val("Brazil")
      );

      ctx
        .select(personId, col("personAddress", "Street"))
        .from("person")
        .join("personAddress", isSamePerson.and(isFromBrazil));
    });

    expect(query).toMatchObject({
      selectList: [
        { table: "person", column: "Id" },
        { table: "personAddress", column: "Street" },
      ],
      mainTable: "person",
      joinedTables: [
        {
          table: "personAddress",
          predicate: {
            left: {
              left: { table: "person", column: "Id" },
              operator: "=",
              right: { table: "personAddress", column: "PersonId" },
            },
            operator: "AND",
            right: {
              left: { table: "personAddress", column: "Country" },
              operator: "=",
              right: { value: "Brazil" },
            },
          },
        },
      ],
    });

    expect(query.build()).toBe(
      "SELECT [person].[Id], [personAddress].[Street] " +
        "FROM [HumanResources].[Person] AS [person] " +
        "JOIN [Main].[HumanResources].[PersonAddress] AS [personAddress] " +
        "ON [person].[Id] = [personAddress].[PersonId] " +
        "AND [personAddress].[Country] = 'Brazil'"
    );
  });

  test("SELECT ... FROM t1 JOIN t2 ON t1.colPk = t2.colFk AND (t2.col = value1 OR t2.col = value2)", () => {
    // SELECT id, city FROM person JOIN personAddress ON id = personId AND (country = 'Brazil' OR country = 'Spain')
    const { createSelectQuery, col, val } = createQueryContext({
      person: personTable,
      personAddress: personAddressTable,
    });

    const query = createSelectQuery((ctx) => {
      const isSamePerson = col("person", "Id").isEqualTo(
        col("personAddress", "PersonId")
      );

      const isFromSpain = col("personAddress", "Country").isEqualTo(
        val("Spain")
      );

      const isFromBrazilOrSpain = col("personAddress", "Country")
        .isEqualTo(val("Brazil"))
        .or(isFromSpain)
        .parenthesize();

      ctx
        .select(col("person", "Id"), col("personAddress", "City"))
        .from("person")
        .join("personAddress", isSamePerson.and(isFromBrazilOrSpain));
    });

    expect(query).toMatchObject({
      selectList: [
        { table: "person", column: "Id" },
        { table: "personAddress", column: "City" },
      ],
      mainTable: "person",
      joinedTables: [
        {
          table: "personAddress",
          predicate: {
            left: {
              left: { table: "person", column: "Id" },
              operator: "=",
              right: { table: "personAddress", column: "PersonId" },
            },
            operator: "AND",
            right: {
              predicate: {
                left: {
                  left: { table: "personAddress", column: "Country" },
                  operator: "=",
                  right: { value: "Brazil" },
                },
                operator: "OR",
                right: {
                  left: { table: "personAddress", column: "Country" },
                  operator: "=",
                  right: { value: "Spain" },
                },
              },
              operator: "PARENTHESIS",
            },
          },
        },
      ],
    });
    expect(query.build()).toBe(
      "SELECT [person].[Id], [personAddress].[City] " +
        "FROM [HumanResources].[Person] AS [person] " +
        "JOIN [Main].[HumanResources].[PersonAddress] AS [personAddress] " +
        "ON [person].[Id] = [personAddress].[PersonId] " +
        "AND ([personAddress].[Country] = 'Brazil' OR [personAddress].[Country] = 'Spain')"
    );
  });

  test("SELECT ... FROM t1 JOIN t2 ON t1.colPk = t2.colFk AND NOT t2.col = value", () => {
    // SELECT id, country FROM person JOIN personAddress ON id = personId AND NOT country = 'France'
    const { createSelectQuery, col, val } = createQueryContext({
      person: personTable,
      personAddress: personAddressTable,
    });

    const query = createSelectQuery((ctx) => {
      const isSamePerson = col("person", "Id").isEqualTo(
        col("personAddress", "PersonId")
      );

      const isNotFromFrance = col("personAddress", "Country")
        .isEqualTo(val("France"))
        .not();

      ctx
        .select(col("person", "Id"), col("personAddress", "Country"))
        .from("person")
        .join("personAddress", isSamePerson.and(isNotFromFrance));
    });

    expect(query).toMatchObject({
      selectList: [
        { table: "person", column: "Id" },
        { table: "personAddress", column: "Country" },
      ],
      mainTable: "person",
      joinedTables: [
        {
          table: "personAddress",
          predicate: {
            left: {
              left: { table: "person", column: "Id" },
              operator: "=",
              right: { table: "personAddress", column: "PersonId" },
            },
            operator: "AND",
            right: {
              predicate: {
                left: { table: "personAddress", column: "Country" },
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
      const isSamePerson = col("person", "Id").isEqualTo(
        col("personAddress", "PersonId")
      );

      const isNotFromFrance = col("personAddress", "Country").isNotEqualTo(
        val("France")
      );

      ctx
        .select(col("person", "Id"), col("personAddress", "Country"))
        .from("person")
        .join("personAddress", isSamePerson.and(isNotFromFrance));
    });

    expect(query).toMatchObject({
      selectList: [
        { table: "person", column: "Id" },
        { table: "personAddress", column: "Country" },
      ],
      mainTable: "person",
      joinedTables: [
        {
          table: "personAddress",
          predicate: {
            left: {
              left: { table: "person", column: "Id" },
              operator: "=",
              right: { table: "personAddress", column: "PersonId" },
            },
            operator: "AND",
            right: {
              left: { table: "personAddress", column: "Country" },
              operator: "<>",
              right: { value: "France" },
            },
          },
        },
      ],
    });
    expect(query.build()).toBe(
      "SELECT [person].[Id], [personAddress].[Country] " +
        "FROM [HumanResources].[Person] AS [person] " +
        "JOIN [Main].[HumanResources].[PersonAddress] AS [personAddress] " +
        "ON [person].[Id] = [personAddress].[PersonId] " +
        "AND [personAddress].[Country] <> 'France'"
    );
  });

  test("SELECT ... FROM t1 RIGHT JOIN t2 ON t1.colPk = t2.colFk WHERE t1.colPk IS NULL", () => {
    // SELECT country FROM person RIGHT JOIN personAddress ON id = personId WHERE id IS NULL
    const { createSelectQuery, col } = createQueryContext({
      person: personTable,
      personAddress: personAddressTable,
    });

    const query = createSelectQuery((ctx) => {
      const personId = col("person", "Id");
      const isSamePerson = personId.isEqualTo(col("personAddress", "PersonId"));

      ctx
        .select(col("personAddress", "Country"))
        .from("person")
        .rightJoin("personAddress", isSamePerson)
        .where(personId.isNull());
    });

    expect(query).toMatchObject({
      selectList: [{ table: "personAddress", column: "Country" }],
      mainTable: "person",
      joinedTables: [
        {
          table: "personAddress",
          type: "RIGHT",
          predicate: {
            left: { table: "person", column: "Id" },
            operator: "=",
            right: { table: "personAddress", column: "PersonId" },
          },
        },
      ],
      searchCondition: {
        left: { table: "person", column: "Id" },
        operator: "IS NULL",
      },
    });

    expect(query.build()).toBe(
      "SELECT [personAddress].[Country] " +
        "FROM [HumanResources].[Person] AS [person] " +
        "RIGHT JOIN [Main].[HumanResources].[PersonAddress] AS [personAddress] " +
        "ON [person].[Id] = [personAddress].[PersonId] " +
        "WHERE [person].[Id] IS NULL"
    );
  });

  test("SELECT ... FROM t1 LEFT JOIN t2 ON t1.colPk = t2.colFk WHERE t2.colPk IS NULL", () => {
    // SELECT name FROM person LEFT JOIN personAddress ON id = personId WHERE personId IS NULL
    const { createSelectQuery, col } = createQueryContext({
      person: personTable,
      personAddress: personAddressTable,
    });

    const query = createSelectQuery((ctx) => {
      const isSamePerson = col("person", "Id").isEqualTo(
        col("personAddress", "PersonId")
      );

      ctx
        .select(col("person", "Name"))
        .from("person")
        .leftJoin("personAddress", isSamePerson)
        .where(col("personAddress", "PersonId").isNull());
    });

    expect(query).toMatchObject({
      selectList: [{ table: "person", column: "Name" }],
      mainTable: "person",
      joinedTables: [
        {
          table: "personAddress",
          type: "LEFT",
          predicate: {
            left: { table: "person", column: "Id" },
            operator: "=",
            right: { table: "personAddress", column: "PersonId" },
          },
        },
      ],
      searchCondition: {
        left: { table: "personAddress", column: "PersonId" },
        operator: "IS NULL",
      },
    });

    expect(query.build()).toBe(
      "SELECT [person].[Name] " +
        "FROM [HumanResources].[Person] AS [person] " +
        "LEFT JOIN [Main].[HumanResources].[PersonAddress] AS [personAddress] " +
        "ON [person].[Id] = [personAddress].[PersonId] " +
        "WHERE [personAddress].[PersonId] IS NULL"
    );
  });
});
