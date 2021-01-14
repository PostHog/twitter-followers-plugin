const { getMeta, resetMeta } = require('@posthog/plugin-scaffold/test/utils.js')
const { setupPlugin, runEveryDay } = require('../index')
const defaultRes = require('./res.json')

global.fetch = jest.fn(async () => ({
    json: async () => defaultRes
}))

global.posthog = {}

global.posthog['capture'] = jest.fn(async (eventName, props) => ({
    json: async () => ({ event: eventName, ...props })
}))

beforeEach(() => {
    fetch.mockClear()

    resetMeta({
        config: {
            twitterHandle: 'posthoghq'
        }
    })
})

test('setupPlugin', async () => {
    expect(fetch).toHaveBeenCalledTimes(0)

    await setupPlugin(getMeta())
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
        'https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=posthoghq'
    )
})

test('creates an event with the updated follower count', async () => {
    await runEveryDay(getMeta())
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
        'https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=posthoghq',
        {
            method: 'GET'
        }
    )

    expect(posthog.capture).toHaveBeenCalledTimes(1)
    expect(posthog.capture).toHaveBeenCalledWith('twitter_followers', { follower_count: 1402 })
})
