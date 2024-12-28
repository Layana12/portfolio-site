// Importing necessary modules, classes, and types.
import { Integration } from ".botpress";
import { ClickUpClient } from "./client";
import { comment } from ".botpress/implementation/channels";

// Declaring and exporting the Integration instance with defined actions, register methods, handlers, and channels.
export default new Integration({
    // Declaring actions that the integration can perform.
    actions: {
        createTask: async({ ctx, input }) => { 
            // Initializing ClickUpClient with necessary configurations.
            const clickup = new ClickUpClient(ctx.configuration.apiKey, ctx.configuration.teamId)
            // Creating a task and returning its ID.
            const task = await clickup.createTask(input)
            return { id: task.id }
        }
    },
    // Declaring the register method to enable and save the integration.
    register: async ({ctx, logger, webhookUrl}) => { 
        logger.forBot().info('ClickUp integration enabled')
        const clickup = new ClickUpClient(ctx.configuration.apiKey, ctx.configuration.teamId)
        
        // Fetching the user and registering the webhook.
        await clickup.getUser()
        await setWebhook(clickup, webhookUrl)
    },
    // Declaring the unregister method to delete the integration (not disable).
    unregister: async () => { },
    // Declaring the handler to manage incoming events from ClickUp.
    handler: async ({ctx, req, client, logger}) => { 
        if (!req.body) return;
        const body = JSON.parse(req.body)

        // Processing taskCommentPosted events.
        if (body.event === "taskCommentPosted") {
            const clickup = new ClickUpClient(ctx.configuration.apiKey, ctx.configuration.teamId)
            const botUser = await clickup.getUser()

            // Processing history items from ClickUp.
            for (const historyItem of body.history_items) {
                if(botUser.id === historyItem.user.id) continue;
                
                // Creating or fetching users, conversations, and messages from Botpress.
                const { user } = await client.getOrCreateUser({ tags: {"id": historyItem.user.id.toString()} })
                const { conversation } = await client.getOrCreateConversation({ channel: "comment", tags: {"taskId": body.task_id.toString()} })
                const { message } = await client.getOrCreateMessage({
                    conversationId: conversation.id,
                    userId: user.id,
                    type: "text",
                    payload: { text: historyItem.comment.text_content },
                    tags: {"id": historyItem.comment.id.toString()}
                })

                logger.forBot().debug(`Received comment from ClickUp: ${message.payload.text}`)
            }
        }
    },
    // Declaring channels and their message handling logic.
    channels: {
        comment: {
            messages: {
                text: async ({ctx, conversation, ack, payload, logger}) => { 
                    // Sending a text message to ClickUp from Botpress.
                    const clickup = new ClickUpClient(ctx.configuration.apiKey, ctx.configuration.teamId)
                    const comment = await clickup.createComment({ text: payload.text, taskId: conversation.tags["clickupnew:taskId"]! })
                    
                    logger.forBot().debug(`Comment Logs: ${comment}`)
                    logger.forBot().debug(`Logs:${payload.text}`)
                    await ack({tags: {"clickupnew:id": comment.id.toString()}})
                }
            }
        }
    }
})

// Function to set webhook for the ClickUp events.
async function setWebhook(clickup: ClickUpClient, webhookUrl: string) {
    const webhooks = await clickup.listWebhooks()
  
    for (const webhook of webhooks) {
        if (webhook.endpoint === webhookUrl) {
            await clickup.updateWebhook({
              endpoint: webhookUrl,
              status: 'active',
              webhookId: webhook.id,
              events: ['taskCommentPosted', 'taskCreated']
            })
            return
        }
    }
    await clickup.createWebhook({ endpoint: webhookUrl, events: ['taskCommentPosted', 'taskCreated'] })
}