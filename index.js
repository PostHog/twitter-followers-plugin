async function setupPlugin({ config }) {
    const validationRes = await fetch(
        `https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=${config.twitterHandle}`
    )
    const validationResponseJson = await validationRes.json()

    if (!validationResponseJson) {
        throw new Error('Invalid Twitter handle.')
    }
}

async function runEveryDay({ config }) {
    config.twitterHandle =
        config.twitterHandle[0] === '@'
            ? config.twitterHandle.slice(1, config.twitterHandle.length)
            : config.twitterHandle

    const followersResponse = await fetchWithRetry(
        `https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=${config.twitterHandle}`
    )
    const followersResponseJson = await followersResponse.json()
    posthog.capture('twitter_followers', { follower_count: followersResponseJson[0].followers_count })
}

async function fetchWithRetry(url, options = {}, method = 'GET', isRetry = false) {
    try {
        const res = await fetch(url, { method: method, ...options })
        return res
    } catch {
        if (isRetry) {
            throw new Error(`${method} request to ${url} failed.`)
        }
        const res = await fetchWithRetry(url, options, (method = method), (isRetry = true))
        return res
    }
}

module.exports = {
    setupPlugin,
    runEveryDay
}
