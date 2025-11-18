import { describe, expect, test } from "@jest/globals";
import { createQueryContext } from "./query-context";
import { createQueryableTable } from "./queryable-table";

const personTable = createQueryableTable({
  name: "Person",
  columns: {
    name: "VARCHAR",
    age: "INT",
    email: "VARCHAR",
    country: "VARCHAR",
  },
});

const { col, val, or, and, parenthesize, not } = createQueryContext({
  p: personTable,
});

const isFromBrazil = col("p", "country").isEqualTo(val("Brazil"));
const isAdult = col("p", "age").isGreaterThan(val(18));
const hasEmail = col("p", "email").isNotNull();

describe("Logical Predicates", () => {
  test("x OR y", () => {
    const sqlUsingUtilFunctionsOnly = or(isFromBrazil, isAdult).build();
    const sqlUsingMethodChainingOnly = isFromBrazil.or(isAdult).build();

    expect(sqlUsingUtilFunctionsOnly).toBe(
      "[p].[country] = 'Brazil' OR [p].[age] > 18"
    );
    expect(sqlUsingMethodChainingOnly).toBe(sqlUsingUtilFunctionsOnly);
  });

  test("x AND y", () => {
    const sqlUsingUtilFunctionsOnly = and(isFromBrazil, isAdult).build();
    const sqlUsingMethodChainingOnly = isFromBrazil.and(isAdult).build();

    expect(sqlUsingUtilFunctionsOnly).toBe(
      "[p].[country] = 'Brazil' AND [p].[age] > 18"
    );
    expect(sqlUsingMethodChainingOnly).toBe(sqlUsingUtilFunctionsOnly);
  });

  test("x AND (y OR z)", () => {
    const sqlUsingUtilFunctionsOnly = and(
      isFromBrazil,
      parenthesize(or(isAdult, hasEmail))
    ).build();

    const sqlUsingMethodChainingOnly = isFromBrazil
      .and(isAdult.or(hasEmail).parenthesize())
      .build();

    expect(sqlUsingUtilFunctionsOnly).toBe(
      "[p].[country] = 'Brazil' AND ([p].[age] > 18 OR [p].[email] IS NOT NULL)"
    );
    expect(sqlUsingMethodChainingOnly).toBe(sqlUsingUtilFunctionsOnly);
  });
  test("(x OR y) AND NOT z", () => {
    const sqlUsingUtilFunctionsOnly = and(
      parenthesize(or(isFromBrazil, isAdult)),
      hasEmail
    ).build();

    const sqlUsingMethodChainingOnly = isFromBrazil
      .or(isAdult)
      .parenthesize()
      .and(hasEmail)
      .build();

    expect(sqlUsingUtilFunctionsOnly).toBe(
      "([p].[country] = 'Brazil' OR [p].[age] > 18) AND [p].[email] IS NOT NULL"
    );
    expect(sqlUsingMethodChainingOnly).toBe(sqlUsingUtilFunctionsOnly);
  });
  test("NOT (x OR y) AND z", () => {
    const sqlUsingUtilFunctionsOnly = and(
      hasEmail,
      parenthesize(or(isFromBrazil, isAdult))
    ).build();

    const sqlUsingMethodChainingOnly = hasEmail
      .and(isFromBrazil.or(isAdult).parenthesize())
      .build();

    expect(sqlUsingUtilFunctionsOnly).toBe(
      "[p].[email] IS NOT NULL AND ([p].[country] = 'Brazil' OR [p].[age] > 18)"
    );
    expect(sqlUsingMethodChainingOnly).toBe(sqlUsingUtilFunctionsOnly);
  });

  test("NOT (x OR y OR z)", () => {
    const sqlUsingUtilFunctionsOnly = not(
      parenthesize(or(or(isFromBrazil, isAdult), hasEmail))
    ).build();

    const sqlUsingMethodChainingOnly = isFromBrazil
      .or(isAdult)
      .or(hasEmail)
      .parenthesize()
      .not()
      .build();

    const sqlUsingMixedApproach = not(
      parenthesize(isFromBrazil.or(isAdult).or(hasEmail))
    ).build();

    expect(sqlUsingUtilFunctionsOnly).toBe(
      "NOT ([p].[country] = 'Brazil' OR [p].[age] > 18 OR [p].[email] IS NOT NULL)"
    );
    expect(sqlUsingMethodChainingOnly).toBe(sqlUsingUtilFunctionsOnly);
    expect(sqlUsingMixedApproach).toBe(sqlUsingUtilFunctionsOnly);
  });
});
