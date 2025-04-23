import REPL from './OpenAI.js'

import readline from 'readline'

const
rl = readline.createInterface(
	{	input	: process.stdin
	,	output	: process.stdout
	,	prompt	: `-------- vvvvvvvv (blank line to submit)\n`
	}
)
rl.prompt()

const
contents = []

rl.on(
	`line`
,	async _ => _ === ''
	?	contents.length && (
			console.log( ':', await REPL( contents.join( '\n' ) ) )
		,	contents.length = 0
		,	rl.prompt()
		)
	:	contents.push( _.trim() )
).on(
	`close`
,	() => process.exit( 0 )
)

