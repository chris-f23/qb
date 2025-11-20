import { describe, expect, test } from "@jest/globals";
import { createQueryContext } from "./query-context";
import { createQueryableTable } from "./queryable-table";

const { col, val } = createQueryContext({
  person: createQueryableTable({
    name: "Person",
    columns: { id: "INT", name: "VARCHAR", age: "INT" },
  }),
});

type Operator =
  | "isEqualTo"
  | "isNotEqualTo"
  | "isGreaterThan"
  | "isGreaterThanOrEqualTo"
  | "isLessThan"
  | "isLessThanOrEqualTo";

const testCases: Array<[string, Operator]> = [
  ["=", "isEqualTo"],
  ["<>", "isNotEqualTo"],
  [">", "isGreaterThan"],
  [">=", "isGreaterThanOrEqualTo"],
  ["<", "isLessThan"],
  ["<=", "isLessThanOrEqualTo"],
];

describe("Comparison predicates", () => {
  test.each(testCases)("a %s b", (operator, method) => {
    const colToColPredicate = col("person", "id")[method](
      col("person", "name")
    );
    const colToValPredicate = col("person", "age")[method](val(18));
    const valToColPredicate = val(26)[method](col("person", "age"));
    const valToValPredicate = val(100 * 10)[method](val("1000"));

    expect(colToColPredicate).toMatchObject({
      left: { table: "person", column: "id" },
      operator: operator,
      right: { table: "person", column: "name" },
    });

    expect(colToValPredicate).toMatchObject({
      left: { table: "person", column: "age" },
      operator: operator,
      right: { value: 18 },
    });

    expect(valToColPredicate).toMatchObject({
      left: { value: 26 },
      operator: operator,
      right: { table: "person", column: "age" },
    });

    expect(valToValPredicate).toMatchObject({
      left: { value: 1000 },
      operator: operator,
      right: { value: "1000" },
    });
  });
});
