import { describe, expect, test } from "@jest/globals";
import {
  createConcatReference,
  createConcatWithSeparatorReference,
} from "./function-reference";
import { createLiteralReference } from "./literal-reference";

describe("Function Reference", () => {
  test("Concat array of literal references", () => {
    const values = [
      createLiteralReference("Name"),
      createLiteralReference("Lastname"),
      createLiteralReference("Age"),
    ];

    const concatReference = createConcatReference(values);
    expect(concatReference).toMatchObject({
      values: values,
    });
    expect(concatReference.build()).toBe("CONCAT('Name', 'Lastname', 'Age')");
  });

  test("Concat array of literal references with separator", () => {
    const values = [
      createLiteralReference("Name"),
      createLiteralReference("Lastname"),
      createLiteralReference("Age"),
    ];

    const separator = createLiteralReference(",");

    const concatReference = createConcatWithSeparatorReference(
      separator,
      values
    );

    expect(concatReference).toMatchObject({
      values: values,
      separator: {
        value: ",",
      },
    });
    expect(concatReference.build()).toBe(
      "CONCAT_WS(',', 'Name', 'Lastname', 'Age')"
    );
  });
});
