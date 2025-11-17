export const createConcatReference = (
  values: IReference[]
): IConcatReference => {
  return {
    values: values,
    build(): string {
      return `CONCAT(${this.values.map((v) => v.build()).join(", ")})`;
    },
  };
};

export const createConcatWithSeparatorReference = (
  separator: IReference,
  values: IReference[]
): IConcatReference => {
  return {
    values: values,
    separator: separator,
    build(): string {
      return `CONCAT_WS(${this.separator!.build()}, ${this.values
        .map((v) => v.build())
        .join(", ")})`;
    },
  };
};
