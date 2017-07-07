'use strict'

const each = require('lodash/fp/each')
const times = require('lodash/fp/times')
const flowRight = require('lodash/fp/flowRight')
const padEnd = require('lodash/fp/padEnd')
const prompt = require('prompt-promise')
const chalk = require('chalk')

const options = [
	{
		letters: () => "asdfghjkl;'",
		description: 'Home keys',
	},
	{
		letters: () => "qwertyuiop",
		description: 'Top keys',
	},
	{
		letters: () => "zxcvbnm,./",
		description: 'Bottom keys',
	},
	{
		letters: () => "abcdefghijklmnopqrstuvwxyz,./;'",
		description: 'All keys',
	},
]

function randomChar({ listOfCandidates }) {
	return listOfCandidates[Math.floor(Math.random() * listOfCandidates.length)]
}

function lastChar({ string }) {
	return string[string.length - 1]
}

function getNextChar({ listOfCandidates, currentString }) {
	return lastChar({ string: currentString }) !== ' ' && Math.random() < .2 ?
		' ' :
		randomChar({ listOfCandidates })
}

function generateString({ length, listOfCandidates, currentString = '' }) {
	return currentString.length === length ?
		currentString :
		generateString({
			length,
			listOfCandidates,
			currentString: currentString + getNextChar({ listOfCandidates, currentString }),
		})
}

async function executeTypingSession({ length, letters }) {
	console.log(generateString({ length, listOfCandidates: letters }))

	await prompt('')
	console.log('')
}

function printOptionsMenu({ options, index = 0 }) {
	if (index === 0) {
		console.log(chalk.yellow('Choose a practice drill or enter -1 to quit'))
	} else if (index > options.length - 1) {
		return
	}

	console.log(`${padEnd(4, index, '.')}${options[index].description}`)
	printOptionsMenu({ options, index: index + 1 })
}

function getUserChoice({ options }) {
	printOptionsMenu({ options })

	return prompt('').then(choice => {
		if (!options[choice] && choice !== '-1') {
			console.log(chalk.red('\nInvalid choice - please select from the available options'))
			return getUserChoice({ options })
		}

		return parseInt(choice, 10)
	})
}

async function main() {
	const choice = await getUserChoice({ options })

	if (choice === -1) {
		console.log(chalk.cyan('\n** Goodbye **!\n'))
		return 0
	}

	await executeTypingSession({
		length: 20,
		letters: options[choice].letters(),
	}).then(main)
}

main()
	.then(process.exit)
