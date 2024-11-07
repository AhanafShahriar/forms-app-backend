import { AuthRequest } from "../middlewares/authMiddleware"; // Adjust the import path
import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
console.log("JIRA_BASE_URL:", process.env.JIRA_BASE_URL);
console.log("JIRA_EMAIL:", process.env.JIRA_EMAIL);
console.log("JIRA_API_TOKEN:", process.env.JIRA_API_TOKEN);
console.log("JIRA_PROJECT_KEY:", process.env.JIRA_PROJECT_KEY);

// Jira configuration
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY;
const JIRA_BASE_URL = process.env.JIRA_BASE_URL;

// Allowed priority values
const ALLOWED_PRIORITIES = ["High", "Medium", "Low"];

interface JiraUser {
  emailAddress: string;
}

interface JiraResponse {
  key: string;
}

// Type guard to check if an error is an Axios error
function isAxiosError(error: any): error is { response: { data: any } } {
  return error.isAxiosError && error.response;
}

export const createJiraTicket = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { summary, priority, templateTitle } = req.body;
  const userEmail = req.user?.email; // Ensure user is authenticated and email is available
  const pageLink = req.headers.referer || "Not specified";

  if (!userEmail) {
    res.status(400).json({ message: "User  email is required" });
    return;
  }

  // Validate priority
  if (!ALLOWED_PRIORITIES.includes(priority)) {
    res.status(400).json({
      message: `Priority must be one of: ${ALLOWED_PRIORITIES.join(", ")}`,
    });
    return;
  }

  await ensureUserInJira(userEmail);

  const ticketData = {
    fields: {
      project: { key: JIRA_PROJECT_KEY },
      summary,
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `Ticket created from: ${pageLink}`,
              },
            ],
          },
        ],
      },
      issuetype: { name: "Story" },
      priority: { name: priority },
    },
  };

  try {
    const response = await axios.post<JiraResponse>(
      `${JIRA_BASE_URL}/rest/api/3/issue`,
      ticketData,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${JIRA_EMAIL}:${JIRA_API_TOKEN}`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );
    res
      .status(201)
      .json({ ticketUrl: `${JIRA_BASE_URL}/browse/${response.data.key}` });
  } catch (error) {
    if (isAxiosError(error)) {
      console.error("Error creating Jira ticket:", error.response.data);
    } else {
      console.error("Error creating Jira ticket:", error);
    }
    res.status(500).json({ error: "Failed to create ticket" });
  }
};

// Ensure user in Jira
async function ensureUserInJira(email: string): Promise<void> {
  try {
    const url = `${JIRA_BASE_URL}/rest/api/3/user/search?query=${email}`;
    console.log("JIRA API URL:", url);

    const response = await axios.get<JiraUser[]>(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${JIRA_EMAIL}:${JIRA_API_TOKEN}`
        ).toString("base64")}`,
      },
    });

    if (response.data.length === 0) {
      console.log(`User  with email ${email} does not exist in Jira.`);
      await createUserInJira(email);
    } else {
      console.log(`User  with email ${email} already exists in Jira.`);
    }
  } catch (error) {
    if (isAxiosError(error)) {
      console.error("Error checking/creating Jira user:", error.response.data);
    } else {
      console.error("Error checking/creating Jira user:", error);
    }
    throw new Error("Failed to ensure user in Jira");
  }
}

// Function to create a user in Jira
async function createUserInJira(email: string): Promise<void> {
  try {
    const url = `${JIRA_BASE_URL}/rest/api/3/user`;
    console.log("Creating user in Jira:", email);

    const userPayload = {
      emailAddress: email,
      displayName: email,
      active: true,
      products: [], // Set to an empty array if no product access is needed
    };

    const response = await axios.post(url, userPayload, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${JIRA_EMAIL}:${JIRA_API_TOKEN}`
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`User  ${email} created successfully in Jira:`, response.data);
  } catch (error) {
    if (isAxiosError(error)) {
      console.error("Error creating user in Jira:", error.response?.data);
    } else {
      console.error("Error creating user in Jira:", error);
    }
    throw new Error("Failed to create user in Jira");
  }
}
