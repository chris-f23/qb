export const createCountReference = (
  originalReference: IReference,
  asDistinct: boolean
): ICountReference => {
  return {
    originalReference: originalReference,
    asDistinct: asDistinct,
    build(): string {
      return `COUNT(${
        this.asDistinct ? "DISTINCT " : ""
      }${this.originalReference.build()})`;
    },
  };
};
