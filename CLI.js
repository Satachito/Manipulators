import {
	chromium
} from 'playwright'

const
context = await chromium.launchPersistentContext(
	process.env.PERSISTENT_CONTENT_PATH
,	{	headless	: false
	,	args		: [
			`--disable-extensions-except=${process.env.EXTENSION_PATH}`
		,	`--load-extension=${process.env.EXTENSION_PATH}`
		]
	}
)

const
tools = {
	navigate		: {
		func		: async ({ url, pageIndex = 0 }) => {
			const
			mainPage = context.pages()[ pageIndex ]
			await mainPage.bringToFront()
			await mainPage.goto( url )
			return `Successfully navigated to the specified URL.`
		}
	,	parameters	: {
			type		: `object`
		,	properties	: {
				url				: { type: `string` }
			,	pageIndex		: { type: `number` }
			}
		,	required	: [ `url` ]
		}
	}

,	click			: {
		func		: async ({ locator, locatorIndex = 0, pageIndex = 0 }) => (
			await context.pages()[ pageIndex ].locator( locator ).nth( locatorIndex ).click()
		,	`Clicked on element with locator: ${locator}`
		)
	,	parameters	: {
			type		: `object`
		,	properties	: {
				locator			: { type: `string` }
			,	locatorIndex	: { type: `number` }
			,	pageIndex		: { type: `number` }
			}
		,	required	: [ `locator` ]
		}
	}

,	check			: {
		func		: async ({ locator, locatorIndex = 0, pageIndex = 0 }) => (
			await context.pages()[ pageIndex ].locator( locator ).nth( locatorIndex ).check()
		,	`Clicked on element with locator: ${locator}`
		)
	,	parameters	: {
			type		: `object`
		,	properties	: {
				locator			: { type: `string` }
			,	locatorIndex	: { type: `number` }
			,	pageIndex		: { type: `number` }
			}
		,	required	: [ `locator` ]
		}
	}

,	fill			: {
		func		: async ({ text, locator, locatorIndex = 0, pageIndex = 0 }) => (
			await context.pages()[ pageIndex ].locator( locator ).nth( locatorIndex ).fill( text )
		,	`Filled '${text}' into element with locator: ${locator}`
		)
	,	parameters	: {
			type		: `object`
		,	properties	: {
				text			: { type: `string` }
			,	locator			: { type: `string` }
			,	locatorIndex	: { type: `number` }
			,	pageIndex		: { type: `number` }
			}
		,	required	: [ `text`, `locator` ]
		}
	}

,	selectValue		: {
		func		: async ({ value, locator, locatorIndex = 0, pageIndex = 0 }) => (
			await context.pages()[ pageIndex ].locator( locator ).nth( locatorIndex ).selectOption( { value } )
		,	`Selected '${value}' on element with locator: ${locator}`
		)
	,	parameters	: {
			type		: `object`
		,	properties	: {
				value			: { type: `string` }
			,	locator			: { type: `string` }
			,	locatorIndex	: { type: `number` }
			,	pageIndex		: { type: `number` }
			}
		,	required	: [ `value`, `locator` ]
		}
	}

,	selectLabel		: {
		func		: async ({ label, locator, locatorIndex = 0, pageIndex = 0 }) => (
			await context.pages()[ pageIndex ].locator( locator ).nth( locatorIndex ).selectOption( { label } )
		,	`Selected '${label}' on element with locator: ${locator}`
		)
	,	parameters	: {
			type		: `object`
		,	properties	: {
				label			: { type: `string` }
			,	locator			: { type: `string` }
			,	locatorIndex	: { type: `number` }
			,	pageIndex		: { type: `number` }
			}
		,	required	: [ `label`, `locator` ]
		}
	}

,	selectIndex		: {
		func		: async ({ index, locator, locatorIndex = 0, pageIndex = 0 }) => (
			await context.pages()[ pageIndex ].locator( locator ).nth( locatorIndex ).selectOption( { index } )
		,	`Selected '${index}' on element with locator: ${locator}`
		)
	,	parameters	: {
			type		: `object`
		,	properties	: {
				index			: { type: `number` }
			,	locator			: { type: `string` }
			,	locatorIndex	: { type: `number` }
			,	pageIndex		: { type: `number` }
			}
		,	required	: [ `index`, `locator` ]
		}
	}

,	html			: {
		func		: async ({ locator, locatorIndex = 0, pageIndex = 0 }) => {
			return await context.pages()[ pageIndex ].locator( locator ).nth( locatorIndex ).innerHTML()
		}
	,	parameters	: {
			type		: `object`
		,	properties	: {
				locator			: { type: `string` }
			,	locatorIndex	: { type: `number` }
			,	pageIndex		: { type: `number` }
			}
		,	required	: [ `locator` ]
		}
	}

,	pageIndex	: {
		func		: ({ url }) => {
			const
			$ = context.pages().findIndex( _ => _.url().startsWith( url ) )
			return $ < 0
			?	'Not found'
			:	$
		}
	,	parameters	: {
			type		: `object`
		,	properties	: {
				url				: { type: `string` }
			}
		,	required	: [ `url` ]
		}
	}

,	unlockMetamask	: {
		func		: async ({}) => {
			const
			metamask = context.pages().find(
				_ => _.url() === 'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html#unlock'
			)
			await metamask.locator( '#password' ).first().type( process.env.PASSWORD )
			await metamask.locator( '[ data-testid=unlock-submit ]' ).first().click()
			return `Metamask unlocked`
		}
	,	parameters	: {
			type		: `object`
		,	properties	: {}
		,	required	: []
		}
	}
}

const
functions = Object.entries( tools ).map(
	( [ K, V ] ) => ({
		name		: K
	,	description	: V.description
	,	parameters	: V.parameters
	})
)

import OpenAI from 'openai'

const
openai = new OpenAI()

const
messages = []

const
Push = ( _, $ ) => ( _.push( $ ), $ )

const
Message = async () => Push(
	messages
,	(	await openai.chat.completions.create({
			model			: `gpt-4.1-nano`
		,	function_call	: `auto`
		,	functions
		,	messages
		})
	)[ `choices` ][ 0 ].message
)

const
Loop = async content => {

	messages.push({
		role	: `user`
	,	content
	})

	let
	message = await Message()

	while( message.function_call ) {

		const
		funCall = message.function_call

		const
 		Call = async () => {
 			try {
 			//	console.info( '>', funCall.name, funCall.arguments )
 				const
 				$ = JSON.stringify( await tools[ funCall.name ].func( JSON.parse( funCall.arguments ) ) )
 			//	console.info( '<', $ )
 				return $
 			} catch ( e ) {
			//	console.error( e )
 				return e.message
 			}
 		}

		messages.push(
			{	role	: `function`
			,	name	: funCall.name
			,	content	: await Call()
			}
		)
		message = await Message()
	}
	console.log( ':', message.content )
}

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
			await Loop( contents.join( '\n' ) )
		,	contents.length = 0
		,	rl.prompt()
		)
	:	contents.push( _.trim() )
).on(
	`close`
,	() => process.exit( 0 )
)

process.on(
	'exit'
,	async () => (
		context.pages().forEach( async _ => await _.close() )
	,	await context.close()
	)
)

