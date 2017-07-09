'use strict'

const every = require('lodash/fp/every')
const each = require('lodash/fp/each')
const times = require('lodash/fp/times')
const flowRight = require('lodash/fp/flowRight')
const padEnd = require('lodash/fp/padEnd')
const prompt = require('prompt-promise')
const chalk = require('chalk')

const options = [
	{
		letters: () => "asdfghjkl;'",
		description: () => 'Home keys',
	},
	{
		letters: () => "qwertyuiop",
		description: () => 'Top keys',
	},
	{
		letters: () => "zxcvbnm,./",
		description: () => 'Bottom keys',
	},
	{
		letters: () => "abcdefghijklmnopqrstuvwxyz,./;'",
		description: () => 'All keys',
	},
]

function randomChar({ letters }) {
	return letters[Math.floor(Math.random() * letters.length)]
}

function lastChar(string) {
	return string[string.length - 1]
}

function isSpace(string) {
	return string === ' '
}

const not = x => !x

const isLastCharNotSpace = flowRight(not, isSpace, lastChar)

const isRandomNumberLessThan = decimal => Math.random() < decimal

const nextCharShouldBeSpace = currentString => (
	currentString !== '' &&
	isLastCharNotSpace(currentString) &&
	isRandomNumberLessThan(.2)
)

function getNextChar({ letters, currentString }) {
	return nextCharShouldBeSpace(currentString) ? ' ' : randomChar({ letters })
}

function generateString({ length, letters, letterModifier, currentString = '' }) {
	return currentString.length === length ?
		currentString :
		generateString({
			length,
			letters,
			letterModifier,
			currentString: currentString + letterModifier(
				getNextChar({ letters, currentString }),
			),
		})
}

const printRandomLetters = (...args) => console.log(generateString(...args))

const waitOnUserInput = async () => prompt('').then(() => console.log(''))

function printOptionsMenu({ options, index = 0 }) {
	if (index === 0) {
		console.log(chalk.yellow('Choose a practice drill or enter -1 to quit'))
	} else if (index > options.length - 1) {
		return
	}

	console.log(`${padEnd(4, index, '.')}${options[index].description()}`)
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

const getLetterModifier = mixCapsChoice => char => {
	if (mixCapsChoice === '1') {
		return char.toLowerCase()
	} else if (mixCapsChoice === '2') {
		return char.toUpperCase()
	} else if (mixCapsChoice === '3') {
		return Math.random() > .5 ? char.toUpperCase() : char.toLowerCase()
	}
}

async function executeTypingSession() {
	const choice = await getUserChoice({ options })

	if (choice === -1) {
		console.log(chalk.cyan('\n** Goodbye :( **!\n'))
		return 0
	}

	const mixCapsChoice = await prompt(
		'1 for lowercase only, 2 for uppercase only, 3 for mixed\n'
	)

	await printRandomLetters({
		length: 20,
		letters: options[choice].letters(),
		letterModifier: getLetterModifier(mixCapsChoice),
	})

	await waitOnUserInput().then(executeTypingSession)
}

const run = () => executeTypingSession()
	.then(process.exit)
	.catch(error => {
		console.log(error.stack)
		return run()
	})

run()
