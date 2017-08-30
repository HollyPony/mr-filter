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

  listMergeRequests: () => {
    return fetch(`${gitlabUrl}/api/v4/merge_requests?private_token=${gitlabKey}&state=opened&scope=all`)
      .then(res => res.json())
      .then(mergeRequests => Promise.all(Object.values(mergeRequests.reduce((accumulator, mergeRequest) => {
        if (!accumulator[mergeRequest.project_id]) {
          accumulator[mergeRequest.project_id] = {id: mergeRequest.project_id, mergeRequests: []}
        }

        accumulator[mergeRequest.project_id].mergeRequests.push(Object.assign(mergeRequest, {approvalsLeft: 0}))
        return accumulator
      }, {}))))
  }
}
