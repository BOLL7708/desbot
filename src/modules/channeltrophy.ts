class ChannelTrophy {
    static async getNumberOfStreams():Promise<number> {
        await Settings.loadSettings(Settings.CHANNEL_TROPHY_STATS, true)
        const stats:IChannelTrophyStat[] = Settings.getFullSettings(Settings.CHANNEL_TROPHY_STATS)
        let numberOfStreams = 0
        let lastIndex = Number.MAX_SAFE_INTEGER
        stats.forEach(stat => {
            const index = parseInt(stat.index)
            if(index < lastIndex) numberOfStreams++
            lastIndex = index
        })
        return numberOfStreams
    }

    static async createStatisticsEmbedsForDiscord(_twitchHelix:TwitchHelix, stopAfterIndex: number = Number.MAX_SAFE_INTEGER) {
        await Settings.loadSettings(Settings.CHANNEL_TROPHY_STATS, true)
        const stats:IChannelTrophyStat[] = Settings.getFullSettings(Settings.CHANNEL_TROPHY_STATS)

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

        for(const stat of stats) {
            const userId = parseInt(stat.userId)
            
            const index = parseInt(stat.index)
            const cost = parseInt(stat.cost)

            if(index <= lastIndex) { // New stream!
                if(totalStreamCount >= (stopAfterIndex+1)) break
                totalStreamCount++
                totalSpentPerStream.push(0)
                totalRedeemedPerStream.push(0)
                totalSpentPerUserPerStream.push({})
                totalRedeemedPerUserPerStream.push({})
                firstRedemptionLastStream = [userId, cost]
                countUp(totalFirstRedemptions, userId)
                countUp(totalLastRedemptions, lastRedemptionLastStream[0])
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
            if(!userIds.includes(userId)) userIds.push(userId)
            if(userId == lastId) {
                streakBuffer += cost
            }
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
        }
        updateIfLarger(topSpentInStreak, lastId, streakBuffer)
        updateIfLarger(topSpentInStreakLastStream, lastId, streakBuffer)
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

        const funnyNumberItems: string[] = [`⭐ First: ${await getName(firstRedemptionLastStream[0])} (**${firstRedemptionLastStream[1]}**)`]
        for(const config of funnyNumbers) {
            const name = await getName(config.userId)
            const label = Utils.template(config.label, name)
            funnyNumberItems.push(label)
        }
		funnyNumberItems.push(`🏁 Last: ${await getName(lastRedemptionLastStream[0])} (**${lastRedemptionLastStream[1]}**)`)
		funnyNumberItems.reverse()


        embeds.push({
            title: '**Stream Statistics**',
            thumbnail: {url: await getImage(topSpenderLastStream[0])},
            fields: [
                await buildFieldWithList("Top Spenders", true, " %s: **%s**", sortedTopSpendersLastStream, 5),
                await buildFieldWithList("Top Spending Streaks", true, " %s: **%s**", sortedTopSpentInStreakLastStream, 5),
				...buildFieldsOutOfList("Notable Redemptions", funnyNumberItems),
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
		
		function buildFieldsOutOfList(title: string, list: string[]):IDiscordEmbedField[] {
			let listClone = JSON.parse(JSON.stringify(list))
			let fields: IDiscordEmbedField[] = []
            let isFirst: boolean = true
			while(listClone.length > 0) {
				const groupOfItems = listClone.splice(0, 20)
                const field: IDiscordEmbedField = {
                    name: isFirst ? title : `${title} (continued)`,
					value: groupOfItems.join('\n'),
					inline: false
				}
                isFirst = false
				fields.push(field)
			}
			return fields
		}
        
        return embeds
    }

	static _funnyNumbers: Record<number, IChannelTrophyFunnyNumber> = {
		// List funny numbers here that we should give attention
	}
	
	static detectFunnyNumber(n: number, userId: number = -1): IChannelTrophyFunnyNumber|null {
        const result: IChannelTrophyFunnyNumber = {
            number: n,
            speech: '',
            label: '',
            userId: userId
        }
        // if(n < 10) return null

        const nameForDiscord = `%s (**${n}**)`
        const nameForTTS = Config.controller.channelTrophySettings.ttsName
        const nStr = n.toString()
        const trophyName = Config.controller.channelTrophySettings.ttsTrophy
        
        
		// Not sure if this actually works, but let's hope so.
		const uniqueNumbers = Config.twitch.channelTrophyUniqueNumbers
		
		// Detect patterns here, in order of awesomeness or something
		if(uniqueNumbers.hasOwnProperty(n)) { // Unique values
			result.speech = Utils.template(uniqueNumbers[n].speech, nameForTTS, n)
			result.label = Utils.template(uniqueNumbers[n].label, nameForDiscord)
		} else if(NumberPatterns.checkIfBinary(n)) { // Power of two / binary
			result.speech = `${nameForTTS} a power of two ${trophyName}, number ${n}`
            result.label = `🎣 Power of two: ${nameForDiscord}`
        } else if(NumberPatterns.checkIfFibonacci(n)) { // Fibonacci
            result.speech = `${nameForTTS} a fibonacci ${trophyName}, number ${n}`
            result.label = `🐚 Fibonacci: ${nameForDiscord}`
		} else if(n>10 && NumberPatterns.checkIfMonoDigit(n)) { // Monodigit
            result.speech = `${nameForTTS} a monodigit ${trophyName}, number ${n}`
            result.label = `🦄 Monodigit: ${nameForDiscord}`
        } else if(n>1000 && NumberPatterns.checkIfPairs(n)) {
            result.speech = `${nameForTTS} a duodigit ${trophyName}, number ${n}`
            result.label = `🐮 Pairs: ${nameForDiscord}`
        } else if(n>100 && NumberPatterns.checkIfPalindromic(n)) { // Palindromic
            result.speech = `${nameForTTS} a palindromic ${trophyName}, number ${n}`
            result.label = `🦆 Palindromic: ${nameForDiscord}`
        } else if(n%1000==0) { // Even 1000s
            result.speech = `${nameForTTS} an even one thousands ${trophyName}, number ${n}`
            result.label = `🐓 Even 1000s: ${nameForDiscord}`
        } else if(n%100==0) { // Even 100s
            result.speech = `${nameForTTS} an even one hundreds ${trophyName}, number ${n}`
            result.label = `🐤 Even 100s: ${nameForDiscord}`
        } else if(n>100 && NumberPatterns.checkIfSeries(n, 1, true)) { // Rising series
			result.speech = `${nameForTTS} a rising series ${trophyName}, number ${n}`
            result.label = `🦩 Rising series: ${nameForDiscord}`
		} else if(n>100 && NumberPatterns.checkIfSeries(n, 1, false)) { // Falling series
			result.speech = `${nameForTTS} a falling series ${trophyName}, number ${n}`
            result.label = `🐇 Falling series: ${nameForDiscord}`
		} else if(n>100 && NumberPatterns.checkIfSeries(n, 2, true)) { // Rising 2 series
			result.speech = `${nameForTTS} a rising two series ${trophyName}, number ${n}`
            result.label = `🦅 Rising 2-series: ${nameForDiscord}`
		} else if(n>100 && NumberPatterns.checkIfSeries(n, 2, false)) { // Falling 2 series
			result.speech = `${nameForTTS} a falling two series ${trophyName}, number ${n}`
            result.label = `🦡 Falling 2-series: ${nameForDiscord}`
		} else if(NumberPatterns.checkIfTriangular(n)) {
            result.speech = `${nameForTTS} a triangular ${trophyName}, number ${n}`
            result.label = `🐪 Triangular: ${nameForDiscord}`
        } else if(NumberPatterns.checkIfSquare(n)) {
            result.speech = `${nameForTTS} a square ${trophyName}, number ${n}`
            result.label = `🐳 Square: ${nameForDiscord}`
        } else if(NumberPatterns.checkIfCube(n)) {
            result.speech = `${nameForTTS} a cube ${trophyName}, number ${n}`
            result.label = `🦧 Cube: ${nameForDiscord}`
        } else if(NumberPatterns.checkIfPrime(n)) {
            result.speech = `${nameForTTS} a prime ${trophyName}, number ${n}`
            result.label = `🐈 Prime: ${nameForDiscord}`
        }
        
		// Result
        return result.speech.length > 0 ? result : null
	}
}

class NumberPatterns {
    // Functions
    static checkIfMonoDigit( num: number ): boolean {
        const numStr = num.toString()
        const filteredNum = num.toString().split('').filter(d => d == numStr[0])
        return filteredNum.length == numStr.length
    }

    static checkIfPairs( num: number ): boolean {
        const numStr = num.toString()
        const match = numStr.match(/^([0-9]{2})(\1+)$/)
        return match != null
    }

    static checkIfBinary( num: number ): boolean {
        return parseInt(
            (num).toString(2).split('').reduce(
                (p,n) => (
                    parseInt(p)+parseInt(n)
                ).toString()
            )
        ) == 1
    }

    static checkIfSeries( num: number, step: number, rising: boolean ): boolean {
        const numStr = num.toString()
        let firstDigit = parseInt(numStr[0])
        const filteredNum = num.toString().split('').filter(
            d => {
                let result = parseInt(d) == firstDigit
                if(rising) firstDigit += step 
                else firstDigit -= step
                return result
            }
        )
        return filteredNum.length == numStr.length
    }

    static checkIfPrime( num: number ): boolean {
        const sqrtnum = Math.floor(Math.sqrt(num))
        let prime = num != 1
        for(let i=2; i<sqrtnum+1; i++) {
            if(num % i == 0) {
                prime = false
                break
            }
        }
        return prime
    }

    static checkIfFibonacci( num: number ): boolean {
        let a = 0
        let b = 1
        let c = a + b
        while(c < num) {
            a = b
            b = c
            c = a + b
        }
        return c == num
    }

    static checkIfTriangular( num: number ): boolean {
        let a = 0
        let b = 0
        while(b < num) {
            a++
            b = a*(a+1)/2
            if(num == b) return true
        }
        return false
    }

    static checkIfSquare( num: number ): boolean {
        return Math.sqrt(num) % 1 == 0
    }

    static checkIfCube( num: number ): boolean {
        return Math.cbrt(num) % 1 == 0
    }

    static checkIfPalindromic( num: number ): boolean {
        const nStr = num.toString()
        const start = nStr.substring(0, Math.floor(nStr.length/2))
        const end = nStr.substring(Math.ceil(nStr.length/2)).split('').reverse().join('')       
        return start === end
    }

    static testAll( totalCount: number ) {
        const result = {
            palindromic: 0,
            binary: 0,
            even1000s: 0,
            even100s: 0,
            risingSeries: 0,
            fallingSeries: 0,
            rising2Series: 0,
            falling2Series: 0,
            prime: 0,
            fibonacci: 0,
            monoDigit: 0,
            pairs: 0,
            triangular: 0,
            square: 0,
            cube: 0
        }
        for(let i=0; i<totalCount; i++) {
            if(this.checkIfPalindromic(i)) result.palindromic++
            if(this.checkIfBinary(i)) result.binary++
            if(i%1000==0) result.even1000s++
            if(i%100==0) result.even100s++
            if(this.checkIfSeries(i, 1, true)) result.risingSeries++
            if(this.checkIfSeries(i, 1, false)) result.fallingSeries++
            if(this.checkIfSeries(i, 2, true)) result.rising2Series++
            if(this.checkIfSeries(i, 2, false)) result.falling2Series++
            if(this.checkIfPrime(i)) result.prime++
            if(this.checkIfFibonacci(i)) result.fibonacci++
            if(this.checkIfMonoDigit(i)) result.monoDigit++
            if(this.checkIfPairs(i)) result.pairs++
            if(this.checkIfTriangular(i)) result.triangular++
            if(this.checkIfSquare(i)) result.square++
            if(this.checkIfCube(i)) result.cube++
        }
        for(let key in result) {
            console.log(`\t${key}\t${result[key]}\t`)
        }
    }
}

/**
 * Channel Trophy numbers that are in addition to the pattern matched ones.
 */
interface IChannelTrophyFunnyNumberTexts {
    [key:number]: {
        /**
         * The first %s will be akin to "Grabbed by [name]" and the second %s the number of the trophy.
         */
        speech: string
        /**
         * The %s is "[name] (number)"
         */
        label: string
    }
}
	
interface IChannelTrophyFunnyNumber {
    number: number
    speech: string
    label: string
    userId: number
}
