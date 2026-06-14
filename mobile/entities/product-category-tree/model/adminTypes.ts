export type ProductCategoryAdminRow = {
  _id: string;
  slug: string;
  labelRu: string;
  parentId: string | null;
  depth: number;
  pathSlugs: string[];
  pathLabelRu: string[];
  searchKeywords: string[];
  isLeaf: boolean;
  legacyProductCategory?: string | null;
  sortOrder: number;
};

export type ProductCategoryAdminWritePayload = {
  slug: string;
  labelRu: string;
  parentId?: string | null;
  isLeaf?: boolean;
  legacyProductCategory?: string | null;
  searchKeywords?: string[];
  sortOrder?: number;
};
