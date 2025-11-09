export const createOrderableReference = (
  original: IReference,
  order: "ASC" | "DESC"
): IOrderableReference => {
  return {
    original: original,
    order: order,
  };
};
