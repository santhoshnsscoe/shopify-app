import qrcode from "qrcode";
import invariant from "tiny-invariant";
import db from "../db.server";
import { QRCode } from "@prisma/client";
import { AdminGraphqlClient } from "@shopify/shopify-app-react-router/server";
import type { QRCodeActionData } from "../types/qrCodeData";

/**
 * Get a QR code by id
 * @param id - The id of the QR code
 * @param graphql - The graphql client
 * @returns QR code
 */
export const getQRCode = async (id: number, graphql: AdminGraphqlClient) => {
  const qrCode = await db.qRCode.findFirst({ where: { id } });

  if (!qrCode) {
    return null;
  }

  return supplementQRCode(qrCode, graphql);
}

/**
 * Get all QR codes for a shop
 * @param shop - The shop to get the QR codes for
 * @param graphql - The graphql client
 * @returns QR codes
 */
export const getQRCodes = async (shop: string, graphql: AdminGraphqlClient) => {
  const qrCodes = await db.qRCode.findMany({
    where: { shop },
    orderBy: { id: "desc" },
  });

  if (qrCodes.length === 0) return [];

  return Promise.all(
    qrCodes.map((qrCode) => supplementQRCode(qrCode, graphql))
  );
}

/**
 * Get the image for a QR code
 * @param id - The id of the QR code
 * @returns Image for the QR code
 */
export const getQRCodeImage = async (id: number) => {
  const url = new URL(`/qrcodes/${id}/scan`, process.env.SHOPIFY_APP_URL);
  return qrcode.toDataURL(url.href);
}

/**
 * Get the destination url for a QR code
 * @param qrCode - The QR code to supplement
 * @returns Destination url for the QR code
 */
export const getDestinationUrl = async (qrCode: QRCode) => {
  if (qrCode.destination === "product") {
    return `https://${qrCode.shop}/products/${qrCode.productHandle}`;
  }

  const match = /gid:\/\/shopify\/ProductVariant\/([0-9]+)/.exec(qrCode.productVariantId);
  invariant(match, "Unrecognized product variant ID");

  return `https://${qrCode.shop}/cart/${match[1]}:1`;
}

/**
 * Supplement a QR code with product information
 * @param qrCode - The QR code to supplement
 * @param graphql - The graphql client
 * @returns Supplemented QR code
 */
const supplementQRCode = async (qrCode: QRCode, graphql: AdminGraphqlClient) => {

  const response = await graphql(
    `
      query supplementQRCode($id: ID!) {
        product(id: $id) {
          title
          media(first: 1) {
            nodes {
              preview {
                image {
                  altText
                  url
                }
              }
            }
          }
        }
      }
    `,
    {
      variables: {
        id: qrCode.productId,
      },
    }
  );

  const {
    data: { product },
  } = await response.json();

  return {
    ...qrCode,
    productDeleted: !product?.title,
    productTitle: product?.title || "",
    productImage: product?.media?.nodes[0]?.preview?.image?.url || "",
    productAlt: product?.media?.nodes[0]?.preview?.image?.altText || "",
    destinationUrl: await getDestinationUrl(qrCode),
    image: await getQRCodeImage(qrCode.id),
  };
}

/**
 * Validate a QR code
 * @param data - The data to validate
 * @returns Validation errors
 */
export const validateQRCode = (data: QRCodeActionData) => {
  const errors: Record<string, string> = {};

  if (!data.title) {
    errors.title = "Title is required";
  }

  if (!data.productId) {
    errors.productId = "Product is required";
  }

  if (!data.destination) {
    errors.destination = "Destination is required";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}