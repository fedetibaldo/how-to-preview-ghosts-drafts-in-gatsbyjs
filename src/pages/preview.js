import React from "react"
import PropTypes from "prop-types"
import { Router } from "@reach/router"
import GhostAdminAPI from "@tryghost/admin-api"

import Post from "../templates/post"
import Page from "../templates/page"

const api = new GhostAdminAPI({
	url: process.env.GATSBY_GHOST_ADMIN_URL,
	key: process.env.GATSBY_GHOST_ADMIN_KEY,
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
				filter: `uuid:${this.props.uuid}`,
				formats: `html`,
			}

			// retrieve a brief list of posts and pages
			const endpoints = docTypes.map(docType => docType.endpoint)
			const requests = endpoints.map(endpoint => endpoint.browse(browseParams))
			const results = (await Promise.all(requests)).map(resultsList => resultsList[0])

			const index = results.findIndex(Boolean)

			if (index != -1) {
				const document = results[index]
				const type = docTypes[index]
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
