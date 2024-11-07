import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const salesforceLoginUrl = process.env.SALESFORCE_LOGIN_URL;

if (!salesforceLoginUrl) {
  throw new Error(
    "SALESFORCE_LOGIN_URL is not defined in the environment variables."
  );
}

interface SalesforceTokenResponse {
  access_token: string;
}

export const getSalesforceAccessToken = async (): Promise<string> => {
  const params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("client_id", process.env.SALESFORCE_CLIENT_ID || "");
  params.append("client_secret", process.env.SALESFORCE_CLIENT_SECRET || "");
  params.append("username", process.env.SALESFORCE_USERNAME || "");
  params.append("password", `${process.env.SALESFORCE_PASSWORD || ""}`);

  try {
    const response = await axios.post<SalesforceTokenResponse>(
      salesforceLoginUrl,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("Salesforce Token Response:", response.data);
    return response.data.access_token;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const errorResponse = (error as any).response;
      console.error("Error status:", errorResponse.status);
      console.error("Error data:", errorResponse.data);
    } else {
      console.error("Error obtaining Salesforce access token:", error);
    }
    throw new Error("Failed to obtain Salesforce access token");
  }
};
