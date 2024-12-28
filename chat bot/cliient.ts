// Importing necessary modules and defining the baseURL of the ClickUp API.
import axios, { AxiosInstance } from 'axios'
const baseURL = 'https://api.clickup.com/api/v2'

// Declaring the ClickUpClient class.
export class ClickUpClient {
  private axios: AxiosInstance  // Instance of Axios to make HTTP requests.

  // Constructor to initialize the ClickUpClient with token and teamId.
  constructor(private token: string, private teamId: string) {
    this.axios = axios.create({
      baseURL,  // Setting the base URL for the API.
      headers: { Authorization: this.token },  // Setting the Authorization header with the token.
    })
  }

  // Method to get user information.
  async getUser() {
    const { data } = await this.axios.get('/user')
    return data.user
  }

  // Method to list all the webhooks.
  async listWebhooks() {
    const { data } = await this.axios.get(`/team/${this.teamId}/webhook`)
    return data.webhooks
  }

  // Method to create a new webhook.
  async createWebhook(body: { endpoint: string, events: string[] }) {
    const { data } = await this.axios.post(`/team/${this.teamId}/webhook`, body)
    return data
  }

  // Method to update an existing webhook.
  async updateWebhook({ webhookId, ...body }: { webhookId: string, endpoint: string, events: string[]; status: 'active' }) {
    const { data } = await this.axios.put(`/webhook/${webhookId}`, body)
    return data
  }

  // Method to create a new comment on a task.
  async createComment({ taskId, text }: { taskId: string, text: string }) {
    const user = await this.getUser()
    const { data } = await this.axios.post(`/task/${taskId}/comment`, { comment_text: text, notify_all: false, assignee: user.id })
    return data
  }

  // Method to create a new task in a list.
  async createTask({ name, description, listId }: { listId: string; name: string, description?: string }) {
    const { data } = await this.axios.post(`/list/${listId}/task`, { name, description })
    return data
  }

  // Method to get information about a task.
  async getTask(taskId: string) {
    const { data } = await this.axios.get(`/task/${taskId}`)
    return data
  }
}