# Self-Hosted GitHub Actions Runner

This repository is configured to run CI on **self-hosted** GitHub Actions runners only.

The workflow uses:
- `runs-on: self-hosted`
- Node.js 20
- `bash`, `git`, `python3`, `jq`, `npm`

Docker is optional for current workflows, but recommended if future jobs add container-based steps.

## 1) Machine Prerequisites

### Linux (Ubuntu/Debian example)
```bash
sudo apt-get update
sudo apt-get install -y git curl jq python3 python3-venv ca-certificates build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

### macOS (Homebrew example)
```bash
brew update
brew install git jq python node@20
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
node -v
npm -v
```

### Optional Docker
Install Docker Engine (Linux) or Docker Desktop (macOS) if you plan to run containerized jobs.

## 2) Register Runner In GitHub (Repo Scope)

1. Open repository: `Settings -> Actions -> Runners`.
2. Click `New self-hosted runner`.
3. Pick OS/architecture matching your machine.
4. Follow GitHub's generated commands on your runner machine:
   - Download runner package
   - Configure runner with URL + registration token
   - Start runner process

GitHub generates commands similar to:
```bash
mkdir actions-runner && cd actions-runner
curl -o actions-runner.tar.gz -L <runner-download-url>
tar xzf ./actions-runner.tar.gz
./config.sh --url https://github.com/<owner>/<repo> --token <token>
./run.sh
```

## 3) Run As A Service (Recommended)

From the `actions-runner` directory:

### Linux
```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

### macOS
```bash
./svc.sh install
./svc.sh start
./svc.sh status
```

## 4) Local Validation Before Triggering CI

Run from repository root:
```bash
bash ./scripts/check_self_hosted_runner.sh
npm ci
npm run check:oss
./bin/clone precheck
npm run web:build
npm run worker:build
```

If all commands pass, the self-hosted runner is ready for this repository's CI workflow.

## 5) Trigger And Verify End-To-End

1. Push a commit to `main` (or open a PR).
2. Go to `Actions` tab and open the `CI` workflow run.
3. Confirm each step succeeds:
   - runner prerequisite check
   - dependency install
   - OSS check
   - clone precheck
   - web build
   - worker build

If a run is stuck in queue, verify the runner is online in:
`Settings -> Actions -> Runners`.
