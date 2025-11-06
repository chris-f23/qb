import { describe, expect, test } from "@jest/globals";
import { createColumnReference } from "./column-reference";

describe("Comparison Predicates", () => {
  const leftReference = createColumnReference("person", "id");
  const rightReference = createColumnReference("personAddress", "id");

  const cases: Array<[keyof IReference, string]> = [
    ["isEqualTo", "="],
    ["isNotEqualTo", "<>"],
    ["isGreaterThan", ">"],
    ["isGreaterThanOrEqualTo", ">="],
    ["isLessThan", "<"],
    ["isLessThanOrEqualTo", "<="],
  ];

  test.each(cases)("%s", (method, operator) => {
    const predicate = leftReference[method](rightReference);

    expect(predicate).toMatchObject({
      left: {
        table: "person",
        column: "id",
      },
      operator: operator,
      right: {
        table: "personAddress",
        column: "id",
      },
    });
  });
});
