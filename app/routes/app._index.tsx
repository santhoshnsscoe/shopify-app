import type {
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import Setups from "../components/Setups";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {

  return (
    <s-page heading="Shopify Custom App">
      <Setups />
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
