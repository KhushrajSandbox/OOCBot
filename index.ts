import { App } from '@slack/bolt'

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
})

const outOfContextChannelID = 'C01270P3XFV'
const outOfContextSandboxChannelID = 'C01JXGVB99U'

const neverPing = [
    'U01LBQR5Y7Q'
]

app.event('message', async ({ event, client }: any) => {
    if (
        (event.channel === outOfContextChannelID
            || event.channel === outOfContextSandboxChannelID)
        && event.attachments && event.attachments[0].is_share && event.attachments[0].is_msg_unfurl
    ) {

        const messageThreadMatch = event.attachments[0].from_url.match(/thread_ts=(.*)&/)

        const inChannel = event.attachments[0].channel_id
        const ts = messageThreadMatch ? messageThreadMatch[1].slice(0, -6) + '.' + messageThreadMatch[1].slice(-6) : event.attachments[0].ts
        const outOfContexter = event.user
        const outOfContexted = event.attachments[0].author_id

        const response = await client.chat.getPermalink({
            channel: event.channel,
            message_ts: event.ts
        })

        const dontPingOOCed = neverPing.includes(outOfContexted)
        const dontPingOOCer = neverPing.includes(outOfContexter)

        const outOfContextedName = await (async () => {
            const response = await client.users.info({
                user: outOfContexted
            })

            return response.user.real_name as string
        })()

        const outOfContexterName = await (async () => {
            const response = await client.users.info({
                user: outOfContexter
            })

            return response.user.real_name as string
        })()

        await client.chat.postMessage({
            channel: inChannel,
            text: 
                (dontPingOOCed ? `${outOfContextedName}` : `<@${outOfContexted}>`)
                + ` was OOCed by `
                + (dontPingOOCer ? `${outOfContexterName}! ` : `<@${outOfContexter}>! `)
                + `${response.permalink}`,
            thread_ts: ts,
            unfurl_links: false,
            unfurl_media: false
        })
    }
})

async function main() {
    await app.start(process.env.PORT ? parseInt(process.env.PORT) : 3000)
    console.log('⚡️ Bolt app is running!')
}

main()
