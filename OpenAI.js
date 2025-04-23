import {
	tools
,	functions
} from './Playwright.js'

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

export default
async content => {

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
	return message.content
}

