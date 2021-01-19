const { App } = require('@slack/bolt')

const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
})

const outOfContextChannelID = 'C01270P3XFV'
const outOfContextSandboxChannelID = 'C01JXGVB99U'

app.event('message', async ({ event, client }) => {
    console.log(event)
    if (
        (event.channel === outOfContextChannelID
            || event.channel === outOfContextSandboxChannelID)
        && event.attachments && event.attachments[0].is_share && event.attachments[0].is_msg_unfurl
    ) {
        let inChannel = event.attachments[0].channel_id
        let ts = event.attachments[0].ts
        let outOfContexter = event.user

        const response = await client.chat.getPermalink({
            channel: event.channel,
            message_ts: event.ts
        })

        // console.log("OOC in channel: " + inChannel)
        // console.log("OOC ts: " + ts)
        // console.log("OOCer: " + outOfContexter)
        // console.log("OOCer Message Permalink: " + response.permalink)

        await client.chat.postMessage({
            channel: inChannel,
            text: `You were OOCed by <@${outOfContexter}>! ${response.permalink}`,
            thread_ts: ts,
            unfurl_links: false,
            unfurl_media: false
        })
    }
})

async function main() {
    await app.start(process.env.PORT || 3000)
    console.log('⚡️ Bolt app is running!')
}

main()