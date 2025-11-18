export const createOrderableReference = (
  original: IReference,
  order: "ASC" | "DESC"
): IOrderableReference => {
  return {
    original: original,
    order: order,

    build() {
      return `${this.original.build()} ${this.order}`;
    },
  };
};
