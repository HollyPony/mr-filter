const config = require('config')
const fetch = require('node-fetch')

const gitlabUrl = config.get('gitlabUrl')
const gitlabKey = config.get('gitlabKey')

module.exports = {
  callApi: function (path, params = {}) {
    params = [`?private_token=${gitlabKey}`].concat(Object.entries(params).map(([key, value]) => {
      return `${key}=${value}`
    })).join('&')
    return `${gitlabUrl}/api/v4/${path}${params}`
  },

  getProjectById: function (projectId) {
    return fetch(this.callApi(`/projects/${projectId}`))
      .then(res => res.json())
  },

  getApprovals: function (projectId, mergeRequestIid) {
    return fetch(this.callApi(`projects/${projectId}/merge_requests/${mergeRequestIid}/approvals`))
      .then(res => res.json())
      .then(res => ({left: res.approvals_left}))
  },

  fetchAllPages: function (url, page = 1) {
    return fetch(`${url}&page=${page}`)
      .then(res => {
        const nextPage = res.headers.get('x-next-page')
        return (nextPage && nextPage !== '')
          ? this.fetchAllPages(url, nextPage).then(nextRes => [res].concat(nextRes))
          : [res]
      })
  },

  listMergeRequests: function () {
    return this.fetchAllPages(this.callApi('merge_requests', {state: 'opened', scope: 'all'}))
      .then(ress => Promise.all(ress.map(res => res.json()))) // Convert page responses to json responses
      .then(mergeRequests => mergeRequests.reduce((acc, res) => acc.concat(res), [])) // Flat mergeRequests
      .then(mergeRequests => mergeRequests.reduce((accumulator, mergeRequest) => { // Group mergeRequests by project
        if (!accumulator[mergeRequest.project_id]) {
          accumulator[mergeRequest.project_id] = {id: mergeRequest.project_id, mergeRequests: []}
        }

        accumulator[mergeRequest.project_id].mergeRequests.push(Object.assign(mergeRequest, {approvalsLeft: 0}))
        return accumulator
      }, {}))
      .then(mergeRequestsByProject => Object.values(mergeRequestsByProject)) // Transform Object into grouped array by project
  }
}
