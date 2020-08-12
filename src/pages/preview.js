import React from "react"
import PropTypes from "prop-types"
import { Router } from "@reach/router"
import GhostAdminAPI from "@tryghost/admin-api"

import Post from "../templates/post"
import Page from "../templates/page"

const api = new GhostAdminAPI({
	url: `http://localhost:3001`,
	key: `5e976db086825d0001f4f741:415f5ffdbe05917f4ae01a77079bb2a96381ff5439968c82d5118db0ca2a5716`,
	version: `v3`,
})

const docTypes = [
	{
		endpoint: api.posts,
		component: Post,
	},
	{
		endpoint: api.pages,
		component: Page,
	},
]

class PreviewPage extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			document: null,
			type: null,
		}
	}
	async componentDidMount() {
		if (this.props.uuid) {
			// endpoints params
			const browseParams = {
				fields: `id,uuid`,
			}
			const readParams = {
				formats: `html`,
			}

			// retrieve a brief list of posts and pages
			const endpoints = docTypes.map(docType => docType.endpoint)
			const requests = endpoints.map(endpoint => endpoint.browse(browseParams))
			const responses = await Promise.all(requests)

			// find the document whose uuid matches the path parameter
			let type = null, id = null

			for (let i = 0; i < responses.length; i++) {
				let document = responses[i].find(document => document.uuid === this.props.uuid)
				if (document) {
					type = docTypes[i]
					id = document.id
					break
				}
			}

			if (id) {
				// get the full document
				const document = await type.endpoint.read({ id }, readParams)
				// store state
				this.setState({ document, type })
			}
		}
	}
	render() {
		// when ghost answers back
		if (this.state.document !== null) {
			const data = {
				// match the expected structure
				ghostPost: {
					...this.state.document,
					published_at: (new Date()).toISOString(),
				},
				ghostPage: this.state.document,
			}
			const location = this.props.location
			const DocElement = this.state.type.component
			return <DocElement data={data} location={location} />
		}
		return null
	}
}

PreviewPage.propTypes = {
	uuid: PropTypes.string,
	location: PropTypes.object, // passed down by @reach/router
}

const Preview = () => (
	<Router>
		<PreviewPage path="/preview/:uuid" />
	</Router>
)

export default Preview
