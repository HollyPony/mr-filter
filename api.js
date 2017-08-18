const config = require('config')
const fetch = require('node-fetch')

const gitlabUrl = config.get('gitlabUrl')
const gitlabKey = config.get('gitlabKey')

module.exports = {
  listMergeRequests: () => {
    const projectList = () => {
      return fetch(`${gitlabUrl}/api/v4/projects?private_token=${gitlabKey}`)
        .then(res => res.json())
    }

    const getMRbyProject = (projectId, params) => {
      return fetch(`${gitlabUrl}/api/v4/projects/${projectId}/merge_requests?private_token=${gitlabKey}&state=opened`)
        .then(res => res.json())
        .then(mergeRequests => mergeRequests.filter(mergeRequest => !mergeRequest.work_in_progress))
    }

    const loopOnProjects = (projects) => {
      return Promise
        .all(projects
          .map(project => getMRbyProject(project.id)
            .then((mergeRequests) => {
              project.mergeRequests = mergeRequests
              return project
            })))
        .then((projects) => projects.filter((project) => project.mergeRequests.length > 0))
    }

    return projectList()
      .then(loopOnProjects)
  }
}
