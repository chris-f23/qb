import { describe, test, expect } from "@jest/globals";
import { createSelectQuery } from "./select-query";
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

const productTable = createQueryableTable({
  name: "Product",
  schemaName: "Production",
  columns: { ProductID: "INT", Name: "VARCHAR" },
});

const employeeTable = createQueryableTable({
  name: "Employees",
  columns: { EmployeeID: "INT", FirstName: "VARCHAR", LastName: "VARCHAR" },
});

const orderTable = createQueryableTable({
  name: "Orders",
  columns: { EmployeeID: "INT", OrderDate: "DATETIME" },
});

describe("Select Query", () => {
  describe("Select clause", () => {
    test("SELECT literal", () => {
      // SELECT 1;
      const query = createSelectQuery({}, (ctx) => ctx.select(ctx.literal(1)));
      expect(query).toMatchObject({ selectList: [{ value: 1 }] });
    });
  });

  describe("From clause", () => {
    test("SELECT t1.col1 FROM t1", () => {
      // SELECT id FROM person
      const query = createSelectQuery(
        {
          person: personTable,
          personAddress: personAddressTable,
        },
        (ctx) => ctx.select(ctx.getColumn("person", "id")).from("person")
      );
      expect(query).toMatchObject({
        selectList: [{ table: "person", column: "id" }],
        mainTable: "person",
      });
    });

    test("SELECT t1.col1, t1.col2 FROM t1", () => {
      // SELECT name, id FROM person
      const query = createSelectQuery(
        {
          person: personTable,
        },
        (ctx) => {
          const [personId, personName] = [
            ctx.getColumn("person", "id"),
            ctx.getColumn("person", "name"),
          ];
          ctx.select(personId, personName).from("person");
        }
      );

      expect(query).toMatchObject({
        selectList: [
          { table: "person", column: "id" },
          { table: "person", column: "name" },
        ],
        mainTable: "person",
      });
    });
  });

  describe("Where clause", () => {
    test("SELECT ... FROM t1 WHERE t1.col = value", () => {
      //SELECT name FROM person WHERE id = 1
      const query = createSelectQuery(
        {
          person: personTable,
        },
        (ctx) => {
          const [personId, personName] = [
            ctx.getColumn("person", "id"),
            ctx.getColumn("person", "name"),
          ];
          ctx
            .select(personName)
            .from("person")
            .where(personId.isEqualTo(ctx.literal(1)));
        }
      );

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

  describe("Join clause", () => {
    test("SELECT ... FROM t1 JOIN t2 ON t1.colPk = t2.colFk", () => {
      // SELECT id, name, age, country, city, street FROM person JOIN personAddress ON id = personId
      const query = createSelectQuery(
        {
          person: personTable,
          personAddress: personAddressTable,
        },
        (ctx) => {
          const isSamePerson = ctx
            .getColumn("person", "id")
            .isEqualTo(ctx.getColumn("personAddress", "personId"));

          ctx
            .select(
              ctx.getColumn("person", "id"),
              ctx.getColumn("person", "name"),
              ctx.getColumn("person", "age"),
              ctx.getColumn("personAddress", "country"),
              ctx.getColumn("personAddress", "city"),
              ctx.getColumn("personAddress", "street")
            )
            .from("person")
            .join("personAddress", isSamePerson);
        }
      );

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
      const query = createSelectQuery(
        {
          person: personTable,
          personAddress: personAddressTable,
        },
        (ctx) => {
          const personId = ctx.getColumn("person", "id");
          const isSamePerson = personId.isEqualTo(
            ctx.getColumn("personAddress", "personId")
          );

          const isFromBrazil = ctx
            .getColumn("personAddress", "country")
            .isEqualTo(ctx.literal("Brazil"));

          ctx
            .select(personId, ctx.getColumn("personAddress", "street"))
            .from("person")
            .join("personAddress", isSamePerson.and(isFromBrazil));
        }
      );

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
      const query = createSelectQuery(
        {
          person: personTable,
          personAddress: personAddressTable,
        },
        (ctx) => {
          const isSamePerson = ctx
            .getColumn("person", "id")
            .isEqualTo(ctx.getColumn("personAddress", "personId"));

          const isFromSpain = ctx
            .getColumn("personAddress", "country")
            .isEqualTo(ctx.literal("Spain"));

          const isFromBrazilOrSpain = ctx
            .getColumn("personAddress", "country")
            .isEqualTo(ctx.literal("Brazil"))
            .or(isFromSpain);

          ctx
            .select(
              ctx.getColumn("person", "id"),
              ctx.getColumn("personAddress", "city")
            )
            .from("person")
            .join("personAddress", isSamePerson.and(isFromBrazilOrSpain));
        }
      );

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
      const query = createSelectQuery(
        {
          person: personTable,
          personAddress: personAddressTable,
        },
        (ctx) => {
          const isSamePerson = ctx
            .getColumn("person", "id")
            .isEqualTo(ctx.getColumn("personAddress", "personId"));

          const isNotFromFrance = ctx
            .getColumn("personAddress", "country")
            .isEqualTo(ctx.literal("France"))
            .not();

          ctx
            .select(
              ctx.getColumn("person", "id"),
              ctx.getColumn("personAddress", "country")
            )
            .from("person")
            .join("personAddress", isSamePerson.and(isNotFromFrance));
        }
      );

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
      const query = createSelectQuery(
        {
          person: personTable,
          personAddress: personAddressTable,
        },
        (ctx) => {
          const isSamePerson = ctx
            .getColumn("person", "id")
            .isEqualTo(ctx.getColumn("personAddress", "personId"));

          const isNotFromFrance = ctx
            .getColumn("personAddress", "country")
            .isNotEqualTo(ctx.literal("France"));

          ctx
            .select(
              ctx.getColumn("person", "id"),
              ctx.getColumn("personAddress", "country")
            )
            .from("person")
            .join("personAddress", isSamePerson.and(isNotFromFrance));
        }
      );

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
      const query = createSelectQuery(
        {
          person: personTable,
          personAddress: personAddressTable,
        },
        (ctx) => {
          const personId = ctx.getColumn("person", "id");
          const isSamePerson = personId.isEqualTo(
            ctx.getColumn("personAddress", "personId")
          );

          ctx
            .select(ctx.getColumn("personAddress", "country"))
            .from("person")
            .rightJoin("personAddress", isSamePerson)
            .where(personId.isNull());
        }
      );

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
      const query = createSelectQuery(
        {
          person: personTable,
          personAddress: personAddressTable,
        },
        (ctx) => {
          const [personPersonId, personAddressPersonId] = [
            ctx.getColumn("person", "id"),
            ctx.getColumn("personAddress", "personId"),
          ];
          const isSamePerson = personPersonId.isEqualTo(personAddressPersonId);

          ctx
            .select(ctx.getColumn("person", "name"))
            .from("person")
            .leftJoin("personAddress", isSamePerson)
            .where(personAddressPersonId.isNull());
        }
      );

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

  describe("Count function", () => {
    test("SELECT COUNT(1) FROM t1", () => {
      // SELECT COUNT(1) FROM person
      const query = createSelectQuery({ person: personTable }, (ctx) =>
        ctx.select(ctx.count(ctx.literal(1))).from("person")
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
      const query = createSelectQuery({ person: personTable }, (ctx) =>
        ctx
          .select(ctx.countDistinct(ctx.getColumn("person", "name")))
          .from("person")
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

  describe("Distinct select mode", () => {
    test("SELECT DISTINCT ... FROM t1 WHERE t1.col <> value", () => {
      // SELECT DISTINCT city FROM personAddress WHERE country <> 'Mexico'
      const query = createSelectQuery(
        { personAddress: personAddressTable },
        (ctx) =>
          ctx
            .selectDistinct(ctx.getColumn("personAddress", "city"))
            .from("personAddress")
            .where(
              ctx
                .getColumn("personAddress", "country")
                .isNotEqualTo(ctx.literal("Mexico"))
            )
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

  describe("Order by clause", () => {
    test("SELECT ... FROM t1 WHERE t1.col1 LIKE pattern ORDER BY t1.col2", () => {
      // SELECT ProductID, Name FROM Production.Product WHERE Name LIKE 'Lock Washer%' ORDER BY ProductID
      const query = createSelectQuery({ pr: productTable }, (ctx) => {
        const [productId, productName] = [
          ctx.getColumn("pr", "ProductID"),
          ctx.getColumn("pr", "Name"),
        ];

        ctx
          .select(productId, productName)
          .from("pr")
          .where(productName.isLike(ctx.literal("Lock Washer%")))
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

  describe("Subquery", () => {
    test("SELECT ... FROM t1 WHERE t1.col1 IN (SELECT t2.col1 FROM t2 WHERE t2.col2 = value)", () => {
      // SELECT e.EmployeeID, e.FirstName, e.LastName
      // FROM Employees e
      // WHERE e.EmployeeID IN (
      //  SELECT o.EmployeeID
      //  FROM Orders o
      //  WHERE o.OrderDate = '2025-01-01'
      //);

      const subquery = createSelectQuery({ o: orderTable }, (ctx) => {
        const [employeeId, orderDate] = [
          ctx.getColumn("o", "EmployeeID"),
          ctx.getColumn("o", "OrderDate"),
        ];

        ctx
          .select(employeeId)
          .from("o")
          .where(orderDate.isEqualTo(ctx.literal("2025-01-01")));
      });

      const outerQuery = createSelectQuery({ e: employeeTable }, (ctx) => {
        const [employeeId, firstName, lastName] = [
          ctx.getColumn("e", "EmployeeID"),
          ctx.getColumn("e", "FirstName"),
          ctx.getColumn("e", "LastName"),
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
    });
  });
});
