require("dotenv").config();
const { App } = require("@slack/bolt");

// Initialize the Slack Bolt App with Socket Mode
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

/**
 * OBJECTIVE 1: Slash Commands
 * Handles the `/hello` command
 */
app.command("/hello", async ({ command, ack, respond }) => {
  // Acknowledge the command request within 3 seconds
  await ack();

  const userName = command.user_name;
  const channelName = command.channel_name;

  console.log(`[Command] /hello executed by @${userName} in #${channelName}`);

  // Send a response back to the user
  await respond({
    response_type: "ephemeral", // 'ephemeral' (visible only to sender) or 'in_channel'
    text: `Hello <@${command.user_id}>! 👋 Welcome to the workspace.`,
  });
});

/**
 * OBJECTIVE 2: Log Messages using the Events API
 * Subscribes to the `message` event in channels
 */
app.event("message", async ({ event, logger }) => {
  // Ignore bot messages, message updates, and deletions
  if (event.subtype || event.bot_id) {
    return;
  }

  const timestamp = new Date(Number(event.ts) * 1000).toISOString();
  console.log(
    `[Event Log] [${timestamp}] Channel ${event.channel} | User ${event.user}: "${event.text}"`,
  );
});

/**
 * OBJECTIVE 3: Respond to Messages in a Channel
 * Listens for messages matching specific keywords or patterns
 */
app.message(/^(hi|hello|hey|bonjour)\b/i, async ({ message, say }) => {
  // Say() sends a message to the channel where the event occurred
  await say({
    text: `Hey there <@${message.user}>! How can I help you today? 🚀`,
    thread_ts: message.ts, // Replies in thread
  });
});

// Global error handling
app.error(async (error) => {
  console.error("[Slack Bolt Error]:", error);
});

// Start the bot
(async () => {
  try {
    await app.start();
    console.log("⚡️ Slack Bolt bot is running in Socket Mode!");
  } catch (error) {
    console.error("Failed to start Slack bot:", error);
    process.exit(1);
  }
})();
