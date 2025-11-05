import { describe, test, expect } from "@jest/globals";
import { createQuery } from "./query";

describe("Query", () => {
  test("Debe definir una query de tipo 'select-from-join'", () => {
    type PersonTable = { id: string; name: string; age: number };
    type PersonAddressTable = {
      personId: string;
      country: string;
      city: string;
      street: string;
    };

    type QueryTables = {
      person: PersonTable;
      personAddress: PersonAddressTable;
    };

    const query = createQuery<QueryTables>().as((ctx) => {
      ctx.select(
        ctx.getColumn("person", "id"),
        ctx.getColumn("person", "name"),
        ctx.getColumn("person", "age"),
        ctx.getColumn("personAddress", "country"),
        ctx.getColumn("personAddress", "city"),
        ctx.getColumn("personAddress", "street")
      );

      ctx.from("person");

      const isSamePerson = ctx.compare(
        ctx.getColumn("person", "id"),
        "=",
        ctx.getColumn("personAddress", "personId")
      );

      ctx.join("personAddress", isSamePerson);
    });

    expect(query.getDefinition()).toMatchObject({
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
            isNegated: false,
            isWrapped: false,
          },
        },
      ],
    });
  });
});
