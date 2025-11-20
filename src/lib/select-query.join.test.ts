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
  test("Join two tables using a single condition", () => {
    const { createSelectQuery, col, eq } = createQueryContext({
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

  test("Join two tables using multiple conditions", () => {
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

  test("Join two tables using a complex condition", () => {
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

  test("Select columns from right joined table excluding inner join", () => {
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

  test("Select columns from left joined table excluding inner join", () => {
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
