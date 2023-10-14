# Welcome to your Superhero CDK TypeScript project
Node version: v16.14.0 (Tested)

NPM version: 8.3.1 (Tested)

This builds a cloud formation stack that consists of following AWS resources:
1. AWS Cognito User Pool
2. AWS Cognito Idenity Pool
3. AWS AppSyncAPI (GraphQL Schema and pipelines)
4. AWS DynamoDB(Table with Global Secondary Index) and S3 Bucket
5. AWS IAM roles

## How to Deploy using command line terminal
1. Install aws cdk cli using command `npm install -g aws-cdk`
2. Once cli is installed, configure your aws account in terminal using `aws configure`
3. Once the account is configured, cd into cdk-superhero directory.
4. Run command `cdk bootstrap` to allocate dedicated resources on AWS
5. Run command `cdk deploy` to deploy resources on AWS.

Type `y` if command line tool asks for confirmation while deploying resources to AWS. Once deployed, all secret codes will be displayed on command line. Copy these secrets and paste into `<project_root>/client/superhero/.env` file.


