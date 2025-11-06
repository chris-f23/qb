import { describe, test, expect } from "@jest/globals";
import { createSelectQuery } from "./select-query";

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

describe("Select Query", () => {
  test("Debe definir una query de tipo 'select-from-join'", () => {
    const query = createSelectQuery<QueryTables>((ctx) => {
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

  test("Define una query con condicion lógica AND", () => {
    const query = createSelectQuery<QueryTables>((ctx) => {
      const isSamePerson = ctx
        .getColumn("person", "id")
        .isEqualTo(ctx.getColumn("personAddress", "personId"));

      const isFromBrazil = ctx
        .getColumn("personAddress", "country")
        .isEqualTo(ctx.literal("Brazil"));

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
        .join("personAddress", isSamePerson.and(isFromBrazil));
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

  test("Define una query con condicion lógica OR", () => {
    const query = createSelectQuery<QueryTables>((ctx) => {
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
          ctx.getColumn("person", "name"),
          ctx.getColumn("person", "age"),
          ctx.getColumn("personAddress", "country"),
          ctx.getColumn("personAddress", "city"),
          ctx.getColumn("personAddress", "street")
        )
        .from("person")
        .join("personAddress", isSamePerson.and(isFromBrazilOrSpain));
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

  test("Define una query con condicion lógica NOT", () => {
    const query = createSelectQuery<QueryTables>((ctx) => {
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
          ctx.getColumn("person", "name"),
          ctx.getColumn("person", "age"),
          ctx.getColumn("personAddress", "country"),
          ctx.getColumn("personAddress", "city"),
          ctx.getColumn("personAddress", "street")
        )
        .from("person")
        .join("personAddress", isSamePerson.and(isNotFromFrance));
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
});
