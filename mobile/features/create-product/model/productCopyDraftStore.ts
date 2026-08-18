type ProductCopyDraft = Record<string, unknown>;

export type CreateProductLaunch =
  | { kind: "copy"; product: ProductCopyDraft }
  | { kind: "new" };

let launch: CreateProductLaunch | null = null;
let launchSeq = 0;

export const setCreateProductLaunch = (next: CreateProductLaunch | null) => {
  launch = next;
  launchSeq += 1;
};

export const peekCreateProductLaunch = (): CreateProductLaunch | null => launch;

export const getCreateProductLaunchSeq = (): number => launchSeq;

export const setProductCopyDraft = (product: ProductCopyDraft | null) => {
  setCreateProductLaunch(product ? { kind: "copy", product } : { kind: "new" });
};
