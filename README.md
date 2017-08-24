# Gitlab Merge Request filter

A little basic webapp to list merge requests without the WIP status.

Based on 9.5 Api

## Usage

There is 3 environment variables to set before:

```bash
export GITLAB_KEY= # Find or create one in Gitlab interface
export GITLAB_URL=https://gitlab.com/ # Override with your own integration
export GMR_SERVER_PORT=3000 # The port where the server is launch
```

_Note: Only the GITLAB_KEY is required_

Now the server can start:

- `npm install`
- `npm start`

Now the `0.0.0.0:3000` is available. Configure NGINX as you wish. 
