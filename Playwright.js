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

export const
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

export const
functions = Object.entries( tools ).map(
	( [ K, V ] ) => ({
		name		: K
	,	description	: V.description
	,	parameters	: V.parameters
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

