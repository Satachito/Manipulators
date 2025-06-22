import OpenAI from 'openai'

const
openai = new OpenAI()

const
messages = []

const
Push = _ => ( messages.push( _ ), _ )

const
Complete = async functions => {
	try {
		return Push(
			(	await openai.chat.completions.create({
					model			: `gpt-4.1-nano`
				,	function_call	: `auto`
				,	functions
				,	messages
				})
			).choices[ 0 ].message
		)
	} catch ( e ) {
		return e.message
	}
}

export default
async ( content, functions, tools ) => {

	messages.push(
		{	role	: `user`
		,	content
		}
	)

	let
	message = await Complete( functions )

	while( message.function_call ) {

		const
		funCall = message.function_call
console.error( 'Calling:', funCall.name )
		try {
			messages.push(
				{	role	: `function`
				,	name	: funCall.name
				,	content	: JSON.stringify( await tools[ funCall.name ].func( JSON.parse( funCall.arguments ) ) )
				}
			)
		} catch ( e ) {
			messages.push(
				{	role	: `function`
				,	name	: funCall.name
				,	content	: JSON.stringify({ success: false, error: e.message })
				}
			)
		}

		message = await Complete( functions )
	}
	return message.content
}
