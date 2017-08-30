const config = require('config')
const fetch = require('node-fetch')

const gitlabUrl = config.get('gitlabUrl')
const gitlabKey = config.get('gitlabKey')

module.exports = {
  getProjectById: (projectId) => {
    return fetch(`${gitlabUrl}/api/v4/projects/${projectId}?private_token=${gitlabKey}`)
      .then(res => res.json())
  },

  getApprovals: (projectId, mergeRequestIid) => {
    return fetch(`${gitlabUrl}/api/v4/projects/${projectId}/merge_requests/${mergeRequestIid}/approvals?private_token=${gitlabKey}`)
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
    return this.fetchAllPages(`${gitlabUrl}/api/v4/merge_requests?private_token=${gitlabKey}&state=opened&scope=all`)
      .then(ress => Promise.all(ress.reduce((acc, res) => acc.concat(res.json()), []))) // Convert page responses to json responses
      .then(mergeRequests => Promise.all(Object.values(mergeRequests
        .reduce((acc, res) => acc.concat(res), []) // Flat mergeRequests
        .reduce((accumulator, mergeRequest) => {
          if (!accumulator[mergeRequest.project_id]) {
            accumulator[mergeRequest.project_id] = {id: mergeRequest.project_id, mergeRequests: []}
          }

          accumulator[mergeRequest.project_id].mergeRequests.push(Object.assign(mergeRequest, {approvalsLeft: 0}))
          return accumulator
        }, {}))))
  }
}
