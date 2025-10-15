import {
  getQRCode,
  getQRCodes,
  getQRCodeImage,
  getDestinationUrl,
  validateQRCode,
} from "../../app/models/QRCode.server";
import db from "../../app/db.server";
import qrcode from "qrcode";
import { AdminGraphqlClient } from "@shopify/shopify-app-react-router/server";
import { QRCode } from "@prisma/client";
import type { QRCodeActionData } from "../../app/types/qrCodeData";

jest.mock("../../app/db.server", () => ({
  default: {
    qRCode: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock("qrcode", () => ({
  default: {
    toDataURL: jest.fn(),
  },
}));

jest.mock("tiny-invariant", () => ({
  default: jest.fn((condition, message) => {
    if (!condition) {
      throw new Error(message);
    }
  }),
}));

const mockDb = db as jest.Mocked<typeof db>;
const mockQrcode = qrcode as jest.Mocked<typeof qrcode>;

describe("QR Code server functions", () => {
  let mockGraphql: jest.MockedFunction<AdminGraphqlClient>;
  let mockEmptyGraphql: jest.MockedFunction<AdminGraphqlClient>;

  const sampleQRCode: QRCode = {
    id: 1,
    shop: "test-shop.myshopify.com",
    title: "Test QR",
    productId: "gid://shopify/Product/123",
    productHandle: "test-product",
    productVariantId: "gid://shopify/ProductVariant/456",
    destination: "product",
    scans: 0,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SHOPIFY_APP_URL = "https://example.com";

    // Setup mock graphql client
    mockGraphql = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: {
          product: {
            title: "Test Product",
            media: {
              nodes: [
                {
                  preview: {
                    image: {
                      url: "https://example.com/image.jpg",
                      altText: "Test Image",
                    },
                  },
                },
              ],
            },
          },
        },
      }),
    });

    mockEmptyGraphql = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: {
          product: null,
        },
      }),
    });

    // Setup qrcode mock
    (mockQrcode.toDataURL as jest.Mock).mockResolvedValue(
      "data:image/png;base64,abc123",
    );
  });

  describe("getQRCode", () => {
    it("returns null if QR code not found", async () => {
      (
        mockDb.qRCode.findFirst as jest.MockedFunction<
          typeof mockDb.qRCode.findFirst
        >
      ).mockResolvedValueOnce(null);
      const result = await getQRCode(1, mockGraphql);
      expect(result).toBeNull();
    });

    it("returns supplemented QR code if it exists", async () => {
      (
        mockDb.qRCode.findFirst as jest.MockedFunction<
          typeof mockDb.qRCode.findFirst
        >
      ).mockResolvedValueOnce(sampleQRCode);
      const result = await getQRCode(1, mockGraphql);

      expect(result).toBeDefined();
      expect(result?.productTitle).toBe("Test Product");
      expect(result?.image).toBe("data:image/png;base64,abc123");
      expect(mockGraphql).toHaveBeenCalled();
    });

    it("returns QR code exists but product is not found", async () => {
      (
        mockDb.qRCode.findFirst as jest.MockedFunction<
          typeof mockDb.qRCode.findFirst
        >
      ).mockResolvedValueOnce(sampleQRCode);
      const result = await getQRCode(1, mockEmptyGraphql);

      expect(result).toBeDefined();
      expect(result?.productDeleted).toBe(true);
      expect(result?.productTitle).toBe("");
      expect(mockEmptyGraphql).toHaveBeenCalled();
    });
  });

  describe("getQRCodes", () => {
    it("returns empty array if no QR codes", async () => {
      (
        mockDb.qRCode.findMany as jest.MockedFunction<
          typeof mockDb.qRCode.findMany
        >
      ).mockResolvedValueOnce([]);
      const result = await getQRCodes("shop", mockGraphql);
      expect(result).toEqual([]);
    });

    it("returns supplemented QR codes", async () => {
      (
        mockDb.qRCode.findMany as jest.MockedFunction<
          typeof mockDb.qRCode.findMany
        >
      ).mockResolvedValueOnce([sampleQRCode]);
      const result = await getQRCodes("shop", mockGraphql);

      expect(result).toHaveLength(1);
      expect(result[0].productTitle).toBe("Test Product");
      expect(result[0].image).toBe("data:image/png;base64,abc123");
    });

    it("handles multiple QR codes", async () => {
      const secondQRCode = { ...sampleQRCode, id: 2 };
      (
        mockDb.qRCode.findMany as jest.MockedFunction<
          typeof mockDb.qRCode.findMany
        >
      ).mockResolvedValueOnce([sampleQRCode, secondQRCode]);

      const result = await getQRCodes("shop", mockGraphql);

      expect(result).toHaveLength(2);
      expect(mockGraphql).toHaveBeenCalledTimes(2);
    });
  });

  describe("getQRCodeImage", () => {
    it("returns a QR code data URL", async () => {
      const result = await getQRCodeImage(1);
      expect(result).toBe("data:image/png;base64,abc123");
      expect(mockQrcode.toDataURL).toHaveBeenCalledWith(
        "https://example.com/qrcodes/1/scan",
      );
    });
  });

  describe("getDestinationUrl", () => {
    it("returns product URL if destination is product", async () => {
      const result = await getDestinationUrl(sampleQRCode);
      expect(result).toBe(
        `https://${sampleQRCode.shop}/products/${sampleQRCode.productHandle}`,
      );
    });

    it("returns cart URL if destination is variant", async () => {
      const variantQRCode = {
        ...sampleQRCode,
        destination: "variant",
      } as QRCode;
      const result = await getDestinationUrl(variantQRCode);
      expect(result).toBe(`https://${variantQRCode.shop}/cart/456:1`);
    });

    it("throws error for invalid product variant ID", async () => {
      const invalidQRCode = {
        ...sampleQRCode,
        destination: "variant",
        productVariantId: "invalid-id",
      } as QRCode;

      await expect(getDestinationUrl(invalidQRCode)).rejects.toThrow();
    });
  });

  describe("validateQRCode", () => {
    it("returns errors if title is missing", () => {
      const result = validateQRCode({
        productId: "123",
        destination: "product",
      } as QRCodeActionData);
      expect(result).toHaveProperty("title");
      expect(result?.title).toBe("Title is required");
    });

    it("returns errors if productId is missing", () => {
      const result = validateQRCode({
        title: "QR",
        destination: "product",
      } as QRCodeActionData);
      expect(result).toHaveProperty("productId");
      expect(result?.productId).toBe("Product is required");
    });

    it("returns errors if destination is missing", () => {
      const result = validateQRCode({
        title: "QR",
        productId: "123",
      } as QRCodeActionData);
      expect(result).toHaveProperty("destination");
      expect(result?.destination).toBe("Destination is required");
    });

    it("returns errors if all fields are missing", () => {
      const result = validateQRCode({} as QRCodeActionData);
      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("productId");
      expect(result).toHaveProperty("destination");
    });

    it("returns undefined if valid", () => {
      const validData = {
        title: "QR",
        productId: "123",
        destination: "product",
      };
      const result = validateQRCode(validData as QRCodeActionData);
      expect(result).toBeUndefined();
    });
  });
});
