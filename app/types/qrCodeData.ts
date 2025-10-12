export type QRCodeActionData = {
  title: string;
  shop: string;
  productId: string;
  productHandle: string;
  productVariantId: string;
  destination: string;
  action?: string;
};

export type QRCodeData = {
  id?: number;
  title: string;
  destination: string;
  productId?: string;
  productHandle?: string;
  productVariantId?: string;
  productTitle?: string;
  productAlt?: string;
  productImage?: string;
  destinationUrl?: string;
  image?: string;
  productDeleted?: boolean;
  createdAt?: Date;
  scans?: number;
};