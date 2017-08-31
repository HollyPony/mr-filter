const url = require('url')
const path = require('path')
const config = require('config')
const fetch = require('node-fetch')

const gitlabUrl = config.get('gitlabUrl')
const gitlabKey = config.get('gitlabKey')

module.exports = {
  callApi: function (dir, params = {}) {
    params = [`?private_token=${gitlabKey}`].concat(Object.entries(params).map(([key, value]) => {
      return `${key}=${value}`
    })).join('&')

    return fetch(url.resolve(gitlabUrl, (path.join('api/v4', dir) + params)))
  },

  getProjectById: function (projectId) {
    return this.callApi(`/projects/${projectId}`)
      .then(res => res.json())
  },

  getApprovals: function (projectId, mergeRequestIid) {
    return this.callApi(`projects/${projectId}/merge_requests/${mergeRequestIid}/approvals`)
      .then(res => res.json())
      .then(res => ({left: res.approvals_left}))
  },

  fetchAllPages: function (url, params) {
    params.page = params.page || 1
    return this.callApi(url, params)
      .then(res => {
        params.page = res.headers.get('x-next-page')
        return (params.page !== '')
          ? this.fetchAllPages(url, params).then(nextRes => [res].concat(nextRes))
          : [res]
      })
  },

  listMergeRequests: function () {
    return this.fetchAllPages('merge_requests', {state: 'opened', scope: 'all'})
      .then(ress => Promise.all(ress.map(res => res.json()))) // Convert page responses to json responses
      .then(mergeRequests => mergeRequests.reduce((acc, res) => acc.concat(res), [])) // Flat mergeRequests
      .then(mergeRequests => mergeRequests.reduce((accumulator, mergeRequest) => { // Group mergeRequests by project
        if (!accumulator[mergeRequest.project_id]) {
          accumulator[mergeRequest.project_id] = {id: mergeRequest.project_id, mergeRequests: []}
        }

        accumulator[mergeRequest.project_id].mergeRequests.push(Object.assign(mergeRequest, {approvalsLeft: null}))
        return accumulator
      }, {}))
      .then(mergeRequestsByProject => Object.values(mergeRequestsByProject)) // Transform Object into grouped array by project
  }
}
