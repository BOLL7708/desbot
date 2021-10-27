class ChannelTrophy {
    static async createStatisticsEmbedsForDiscord(_twitchHelix:TwitchHelix) {
        const stats:IChannelTrophyStat[] = Settings.getFullSettings(Settings.STATS_CHANNEL_TROPHY)

        /* GENERATE DATA */

        // Misc
        let totalStreamCount: number = 0

        // Spending
        const totalSpentPerUser: Record<number, number> = {}
        const totalSpentPerUserPerStream: Record<number, number>[] = []
        const totalSpentPerStream: number[] = []
        const topSpentInStreak: Record<number, number> = {}
        let topSpentInStreakLastStream: Record<number, number> = {}
        let totalSpent: number = 0

        // Redemptions
        const totalRedeemedPerUser: Record<number, number> = {}
        const totalRedeemedPerUserPerStream: Record<number, number>[] = []
        const totalRedeemedPerStream: number[] = []
        let totalRedeemed: number = 0

        const totalFirstRedemptions: Record<number, number> = {}
        const totalLastRedemptions: Record<number, number> = {}
        let firstRedemptionLastStream: [number, number] = [-1, -1]
        let lastRedemptionLastStream: [number, number] = [-1, -1]

        // For working with the data
        const userIds: number[] = []
        let lastIndex: number = Number.MAX_SAFE_INTEGER;
        let lastId: number = -1
        let streakBuffer: number = 0

        // Random garbage
        let funnyNumbers: IChannelTrophyFunnyNumber[] = []

        stats.forEach(stat => {
            const userId = parseInt(stat.userId)
            if(!userIds.includes(userId)) userIds.push(userId)
            const index = parseInt(stat.index)
            const cost = parseInt(stat.cost)

            if(index <= lastIndex) { // New stream!
                totalStreamCount++
                totalSpentPerStream.push(0)
                totalRedeemedPerStream.push(0)
                totalSpentPerUserPerStream.push({})
                totalRedeemedPerUserPerStream.push({})
                firstRedemptionLastStream = [userId, cost]
                countUp(totalFirstRedemptions, userId)
                countUp(totalLastRedemptions, lastRedemptionLastStream[0])
                console.log(`First redeemer: ${userId}, last redeemer: ${lastRedemptionLastStream[0]}`)
                lastId = -1 // Break streaks across streams    
                topSpentInStreakLastStream = {}
                funnyNumbers = []
            }
            incrementPerStream(totalSpentPerStream, cost)
            incrementPerStream(totalRedeemedPerStream)
            totalSpent += cost
            totalRedeemed++
            countUp(totalSpentPerUser, userId, cost)
            countUpPerStream(totalSpentPerUserPerStream, userId, cost)
            countUp(totalRedeemedPerUser, userId)
            countUpPerStream(totalRedeemedPerUserPerStream, userId)
            if(userId == lastId) streakBuffer += cost
            else {
                if(lastId > -1) {
                    updateIfLarger(topSpentInStreak, lastId, streakBuffer)
                    updateIfLarger(topSpentInStreakLastStream, lastId, streakBuffer)
                }
                streakBuffer = cost
            }
            lastRedemptionLastStream = [userId, cost]
            lastIndex = index
            lastId = userId

            const funnyNumberConfig = this.detectFunnyNumber(cost, userId)
            if(funnyNumberConfig != null) funnyNumbers.push(funnyNumberConfig)
        });
        countUp(totalLastRedemptions, lastRedemptionLastStream[0]) // Without this we lose the last stream 🤣

        const embeds: IDiscordEmbed[] = []

        /* BUILD EMBEDS */

        const totalSpentPerUserInSingleStream: Record<number, number> = {}
        totalSpentPerUserPerStream.forEach(users => {
            Object.entries(users).forEach(user => {
                updateIfLarger(totalSpentPerUserInSingleStream, parseInt(user[0]), user[1])
            })
        })
        const sortedTotalSpentPerUserInSingleStream = sortObject(totalSpentPerUserInSingleStream)
        const sortedTopSpendersLastStream = sortObject(totalSpentPerUserPerStream.pop())
        const totalParticipantsLastStream = sortedTopSpendersLastStream.length
        const sortedTopSpentInStreakLastStream = sortObject(topSpentInStreakLastStream)
        const topSpenderLastStream = sortedTopSpendersLastStream[sortedTopSpendersLastStream.length-1]

        const funnyNumberItems: string[] = []
        for(const config of funnyNumbers) {
            const name = await getName(config.userId)
            const label = Utils.template(config.statLabel, name)
            funnyNumberItems.push(label)
        }

        console.log(funnyNumberItems)

        embeds.push({
            title: '**Stream Statistics**',
            thumbnail: {url: await getImage(topSpenderLastStream[0])},
            fields: [
                await buildFieldWithList("Top Spenders", true, " %s: **%s**", sortedTopSpendersLastStream, 5),
                await buildFieldWithList("Top Spending Streaks", true, " %s: **%s**", sortedTopSpentInStreakLastStream, 5),
                {
                    name: "Notable Redemptions",
                    value: [
                        `⭐ First: ${await getName(firstRedemptionLastStream[0])} (**${firstRedemptionLastStream[1]}**)`,
                        ...funnyNumberItems,
                        `🏁 Last: ${await getName(lastRedemptionLastStream[0])} (**${lastRedemptionLastStream[1]}**)`
                    ].reverse().join('\n'),
                    inline: false
                },
                {
                    name: "Event Totals",
                    value: [
                        `💰 Spent: **${totalSpentPerStream[totalSpentPerStream.length-1]}**`,
                        `🏆 Redeemed: **${totalRedeemedPerStream[totalRedeemedPerStream.length-1]}**`,
                        `🚍 Participants: **${totalParticipantsLastStream}**`
                    ].join('\n'),
                    inline: false
                }
            ]
        })

        const sortedTotalSpent = sortObject(totalSpentPerUser)
        const sortedTopStreaks = sortObject(topSpentInStreak)
        embeds.push({
            title: '**Total Spending**',
            thumbnail: {url: await getImage(sortedTotalSpent[sortedTotalSpent.length-1][0])},
            fields: [
                await buildFieldWithList("Top Spenders", false, " %s: **%s**", sortedTotalSpent, 5),
                await buildFieldWithList("Top Spent in Single Stream", true, " %s: **%s**", sortedTotalSpentPerUserInSingleStream, 5),
                await buildFieldWithList("Top Spending Streaks", true, " %s: **%s**", sortedTopStreaks, 5)
            ]
        })

        const sortedTotalFirstRedemptions = sortObject(totalFirstRedemptions)
        const sortedTotalLastRedemptions = sortObject(totalLastRedemptions)
        embeds.push({
            title: '**Redemptions**',
            fields: [
                await buildFieldWithList("Top First Redemptions", true, " %s: **%s**", sortedTotalFirstRedemptions, 5),
                await buildFieldWithList("Top Last Redemptions", true, " %s: **%s**", sortedTotalLastRedemptions, 5)
            ]
        })

        embeds.push({
            title: '**Historical Data**',
            description: [
                `🐳 Total spent: **${totalSpent}**`,
                `🤖 Total redeemed: **${totalRedeemed}**`,
                `🐑 Total participants: **${Object.keys(userIds).length}**`,
                `🦑 Total streams with trophies: **${totalStreamCount}**`
            ].join('\n')
        })

        /* FUNCTIONS  */

        // Get helix stuff
        async function getName(userId: number):Promise<string> {
            const user = await _twitchHelix.getUserById(userId)
            return user.display_name
        }
        async function getImage(userId: number):Promise<string> {
            const user = await _twitchHelix.getUserById(userId)
            return user.profile_image_url
        }

        // Handle data
        function incrementPerStream(a: number[], value: number = 1) {
            a[a.length-1] += value
        }
        function countUpPerStream(a: Record<number, number>[], key: number, value: number = 1) {
            const o = a[a.length-1]
            if(o[key] == undefined) o[key] = 0
            o[key] += value
        }
        function countUp(o: Record<number, number>, key: number, value: number = 1) {
            if(key == -1) return
            if(o[key] == undefined) o[key] = 0
            o[key] += value
        }
        function updateIfLarger(o: Record<number, number>, key: number, value: number) {
            if(o[key] == undefined) o[key] = 0
            if(value > o[key]) o[key] = value
        }

        function sortObject(o: Record<number, number>, ascending=true):[number, number][] {
            const sortedResult = Object.entries(o).sort(([,a],[,b]) => ascending ? a-b : b-a)
            const convertedResult: [number, number][] = sortedResult.map(arr => [parseInt(arr[0]), arr[1]])
            return convertedResult
        }

        // Build output data
        async function buildFieldWithList(name: string, inline: boolean, template: string, values: [number, number][], amount: number):Promise<IDiscordEmbedField> {
            const emotes = ['🥇', '🥈', '🥉'];
            let valueArr: string[] = []
            for(let i=0; i<Math.min(amount, values.length); i++) {
                const pair = values[values.length-(i+1)]
                const displayName = await getName(pair[0])
                const value = pair[1]
                const emote = emotes[i] ?? '🥔';
                valueArr.push(emote+Utils.template(template, displayName, value))
            }
            const field: IDiscordEmbedField = {
                name: name,
                value: valueArr.join('\n'),
                inline: inline
            }
            return field
        }
        
        return embeds
    }

	static _funnyNumbers: Record<number, IChannelTrophyFunnyNumber> = {
		// List funny numbers here that we should give attention
	}
	
	static detectFunnyNumber(n: number, userId: number = -1):IChannelTrophyFunnyNumber|null {
        const result:IChannelTrophyFunnyNumber = {
            number: n,
            speech: '',
            statLabel: '',
            userId: userId
        }
        if(n < 10) return null

        const nameForDiscord = `%s (**${n}**)`
        const nameForTTS = '@%s grabbed'
        const nStr = n.toString()
        
        let isRepDigit = checkRepDigit(n)
        const start = nStr.substr(0, Math.floor(nStr.length/2))
        const end = nStr.substr(Math.ceil(nStr.length/2)).split('').reverse().join('')       
        
		// Detect patterns here, in order of awesomeness
        // TODO: Also detect unique numbers like 7708 and maybe other things... uh.
        if(isRepDigit) {
            result.speech = `${nameForTTS} a monodigit trophy, number ${n}`
            result.statLabel = `🦄 Monodigit: ${nameForDiscord}`
        } else if(start == end) {
            result.speech = `${nameForTTS} a palindromic trophy, number ${n}`
            result.statLabel = `🦆 Palindromic: ${nameForDiscord}`
        } else if(n%1000==0) {
            result.speech = `${nameForTTS} an even 1000's trophy, number ${n}`
            result.statLabel = `🐓 Even 1000: ${nameForDiscord}`
        } else if(n%100==0) {
            result.speech = `${nameForTTS} an even 100's trophy, number ${n}`
            result.statLabel = `🐤 Even 100: ${nameForDiscord}`
        }

        // Functions
        function checkRepDigit( num: number, base: number = 10) {
            let prev = -1
            while (num != 0) {
                let digit = num % base
                num = Math.floor(num / base)
                if (prev != -1 && digit != prev) return false
                prev = digit
            }
            return true
        }

        return result.speech.length > 0 ? result : null
	}
}

	
interface IChannelTrophyFunnyNumber {
    number: number
    speech: string
    statLabel: string
    userId: number
}
