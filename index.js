'use strict'

const each = require('lodash/fp/each')
const times = require('lodash/fp/times')
const flowRight = require('lodash/fp/flowRight')
const padEnd = require('lodash/fp/padEnd')
const prompt = require('prompt-promise')
const chalk = require('chalk')

function randomChar({ listOfCandidates }) {
	return listOfCandidates[Math.floor(Math.random() * listOfCandidates.length)]
}

function getStringToType({ length, listOfCandidates }) {
	let lastChar = ' '

	return times(
		() => {
			lastChar = (lastChar !== ' ' && Math.random() < .2) ?
			  ' ' :
				randomChar({ listOfCandidates })

			return lastChar
		},
		length
	).join('')
}

async function runner(length, listOfCandidates) {
	console.log(getStringToType({ length, listOfCandidates }))

	await prompt('')
}

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

function printOptionsMenu() {
	console.log(chalk.yellow('Choose a practice drill or enter -1 to quit'))

	let index = 0

	each(option => {
		console.log(`${padEnd(4, index, '.')}${option.description}`)
		index++
	}, options)
}

function getUserChoice({ options }) {
	printOptionsMenu()

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
		console.log(chalk.cyan('\nGoodbye!\n'))
		return 0
	}

	await runner(20, options[choice].letters()).then(main)
}

main()
	.then(process.exit)
