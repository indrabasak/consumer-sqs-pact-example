# Default to the read only token - the read/write token will be present on Travis CI.
# It's set as a secure environment variable in the .travis.yml file
PACTICIPANT := "consumer-sqs-pact-example"
GITHUB_WEBHOOK_UUID := "4ee34e80-b677-11ed-afa1-0242ac120002"
PACT_CLI="docker run --rm -v ${PWD}:${PWD} -e PACT_BROKER_BASE_URL -e PACT_BROKER_TOKEN pactfoundation/pact-cli:latest"
include .env

#.EXPORT_ALL_VARIABLES:
#GIT_COMMIT?=$(shell git rev-parse HEAD)
#GIT_BRANCH?=$(shell git rev-parse --abbrev-ref HEAD)
#ENVIRONMENT?=production

# Only deploy from master
ifeq ($(GIT_BRANCH),main)
	DEPLOY_TARGET=deploy
else
	DEPLOY_TARGET=no_deploy
endif

all: test

## ====================
## CI tasks
## ====================

ci: test publish_pacts can_i_deploy $(DEPLOY_TARGET)

# Run the ci target from a developer machine with the environment variables
# set as if it was on Travis CI.
# Use this for quick feedback when playing around with your workflows.
fake_ci: .env
	CI=true \
	GIT_COMMIT=`git rev-parse --short HEAD`+`date +%s` \
	GIT_BRANCH=`git rev-parse --abbrev-ref HEAD` \
	make ci

publish_pacts: .env
	@echo "\n========== STAGE: publish pacts ==========\n"
	@echo "\n========== Branch: ${GIT_BRANCH}  ==========\n"
	@echo "\n========== Commit: ${GIT_COMMIT}  ==========\n"
	@echo "\n========== Broker: ${PACT_BROKER_BASE_URL}  ==========\n"
	@echo "\n========== Token: ${PACT_BROKER_TOKEN}  ==========\n"
	LOG_ENABLED=true \
	"${PACT_CLI}" publish ${PWD}/pacts --consumer-app-version ${GIT_COMMIT} --tag ${GIT_BRANCH}

## =====================
## Build/test tasks
## =====================

test: .env
	npm run test

## =====================
## Deploy tasks
## =====================

create_environment:
	@"${PACT_CLI}" broker create-environment --name production --production

deploy: deploy_app record_deployment

no_deploy:
	@echo "Not deploying as not on master branch"


can_i_deploy: .env
	@"${PACT_CLI}" broker can-i-deploy \
	  --pacticipant ${PACTICIPANT} \
	  --version ${GIT_COMMIT} \
	  --to-environment production \
	  --retry-while-unknown 0 \
	  --retry-interval 10

deploy_app:
	@echo "Deploying to production"

record_deployment: .env
	@"${PACT_CLI}" broker record-deployment --pacticipant ${PACTICIPANT} --version ${GIT_COMMIT} --environment production


## =====================
## PactFlow set up tasks
## =====================

# This should be called once before creating the webhook
# with the environment variable GITHUB_TOKEN set
create_github_token_secret:
	@curl -v -X POST ${PACT_BROKER_BASE_URL}/secrets \
	-H "Authorization: Bearer ${PACT_BROKER_TOKEN}" \
	-H "Content-Type: application/json" \
	-H "Accept: application/hal+json" \
	-d  "{\"name\":\"githubCommitStatusToken\",\"description\":\"Github token for updating commit statuses\",\"value\":\"${GITHUB_TOKEN}\"}"

# This webhook will update the Github commit status for this commit
# so that any PRs will get a status that shows what the status of
# the pact is.
create_or_update_github_webhook:
	@"${PACT_CLI}" \
	  broker create-or-update-webhook \
	  'https://api.github.com/repos/pactflow/example-consumer-js-sns/statuses/$${pactbroker.consumerVersionNumber}' \
	  --header 'Content-Type: application/json' 'Accept: application/vnd.github.v3+json' 'Authorization: token $${user.githubCommitStatusToken}' \
	  --request POST \
	  --data @${PWD}/pactflow/github-commit-status-webhook.json \
	  --uuid ${GITHUB_WEBHOOK_UUID} \
	  --consumer ${PACTICIPANT} \
	  --contract-published \
	  --provider-verification-published \
	  --description "Github commit status webhook for ${PACTICIPANT}"

test_github_webhook:
	@curl -v -X POST ${PACT_BROKER_BASE_URL}/webhooks/${GITHUB_WEBHOOK_UUID}/execute -H "Authorization: Bearer ${PACT_BROKER_TOKEN}"

## ======================
## Misc
## ======================

.env:
	touch .env

.PHONY: test
