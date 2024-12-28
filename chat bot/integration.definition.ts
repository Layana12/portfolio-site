// Import necessary modules and definitions
import { IntegrationDefinition } from '@botpress/sdk'; // This imports the IntegrationDefinition class from Botpress SDK.
import z from 'zod'; // This imports zod, a library used for building schemas.

// Note: if you have issues related to the name of the integration, try importing it from another file.
const INTEGRATION_NAME = "clickup"

// This is where we define our integration using the IntegrationDefinition class.
export default new IntegrationDefinition({
    // The name and version of the integration are defined here.
    name: INTEGRATION_NAME, 
    version: '0.2.0',
    
    // This is where we define the configuration schema for our integration.
    configuration: {
        schema: z.object({
            apiKey: z.string(), // Defines that apiKey should be a string.
            teamId: z.string(), // Defines that teamId should be a string.
        })
    },
    
    // Events that our integration can handle are defined here.
    events: {
        taskCreated: {
            schema: z.object({id: z.string()}) // Defines the schema for taskCreated event.
        },
    },
    
    // Actions that our integration can perform are defined here.
    actions: {
        createTask: {
            input: {
                schema: z.object({
                  // Defines the input schema for creating a task.
                  listId: z.string(), 
                  name: z.string(), 
                  description: z.string().optional() // Description is optional.
                })
            },
            output: {
                schema: z.object({id: z.string()}) // Defines the output schema of creating a task.
            }
        }
    },
    
    // Specifies the icon of the integration.
    icon: 'icon.svg',
    
    // This is where we define channels and their messages, tags, etc.
    channels: {
        comment: {
            messages: {
                text: {
                    schema: z.object({text: z.string()}) // Defines the schema for text messages.
                }
            },
            message: {
                tags: {
                    id: {
                        title: "Message ID", // The title of the Message ID tag.
                        description: "Message ID from ClickUp", // Describes what the Message ID tag is.
                    }
                }
            },
            conversation: {
                tags: {
                    taskId: {
                        title: "Task ID", // The title of the Task ID tag.
                        description: "Task ID from ClickUp", // Describes what the Task ID tag is.
                    }
                }
            }
        }
    },
    
    // Defines the user tags for our integration.
    user: {
        tags: {
            id: {
                title: "User ID", // The title of the User ID tag.
                description: "User ID from ClickUp", // Describes what the User ID tag is.
            }
        }
    }
});