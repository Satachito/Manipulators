import {
	chromium
} from 'playwright'

const
context = process.env.EXTENSION_PATH
?	await chromium.launchPersistentContext(
		process.env.PERSISTENT_CONTENT_PATH
	,	{	headless	: false
		,	args		: [
				`--load-extension=${process.env.EXTENSION_PATH}`
			,	`--disable-extensions-except=${process.env.EXTENSION_PATH}`
			]
		}
	)
:	await chromium.launchPersistentContext(
		process.env.PERSISTENT_CONTENT_PATH
	,	{	headless	: false
		}
	)

export const
tools = {
	navigate		: {
		description	: 'Navigate the browser to the specified URL.'
	,	func		: async ({ url, pageIndex = 0 }) => {
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
		description	: 'Click on an element located by the selector.'
	,	func		: async ({ locator, locatorIndex = 0, pageIndex = 0 }) => (
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
		description	: 'Check a checkbox or similar element.'
	,	func		: async ({ locator, locatorIndex = 0, pageIndex = 0 }) => (
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
		description	: 'Fill text into an input field.'
	,	func		: async ({ text, locator, locatorIndex = 0, pageIndex = 0 }) => (
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
		description	: 'Select an option by value attribute.'
	,	func		: async ({ value, locator, locatorIndex = 0, pageIndex = 0 }) => (
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
		description	: 'Select an option by visible label.'
	,	func		: async ({ label, locator, locatorIndex = 0, pageIndex = 0 }) => (
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
		description	: 'Select an option by index.'
	,	func		: async ({ index, locator, locatorIndex = 0, pageIndex = 0 }) => (
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
		description	: 'Get inner HTML of the specified element.'
	,	func		: async ({ locator, locatorIndex = 0, pageIndex = 0 }) => {
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

,	pageIndex		: {
		description	: 'Find the index of a page that starts with the given URL.'
	,	func		: ({ url }) => {
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
		description	: 'Unlock the MetaMask extension using the preset password.'
	,	func		: async ({}) => {
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

export const
functions = Object.entries( tools ).map(
	( [ name, { description, parameters } ] ) => ({
		name
	,	description
	,	parameters
	})
)

process.on(
	'exit'
,	async () => {
		try {
			await Promise.all( context.pages().map( _ => _.close() ) )
			await context.close()
		} catch ( e ) {
			console.error( e )
		}
	}
)

