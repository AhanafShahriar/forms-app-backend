import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const jiraAxios = axios.create({
  baseURL: `https://${process.env.JIRA_DOMAIN}.atlassian.net`,
  auth: {
    username: process.env.JIRA_EMAIL!,
    password: process.env.JIRA_API_TOKEN!,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

export async function createJiraTicket(
  summary: string,
  priority: string,
  templateTitle: string,
  pageLink: string,
  userEmail: string
) {
  try {
    const response = await jiraAxios.post("/rest/api/3/issue", {
      fields: {
        project: { key: process.env.JIRA_PROJECT_KEY },
        summary,
        description: `Ticket created from page : ${pageLink} by ${userEmail}\nTemplate: ${templateTitle}`,
        issuetype: { name: "Task" },
        priority: { name: priority },
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create Jira ticket:", error);
    throw error;
  }
}

// Additional function to fetch user's tickets can be added here
