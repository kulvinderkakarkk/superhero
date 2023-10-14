import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Stack, StackProps, App, aws_cognito } from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Role, ServicePrincipal, PolicyStatement, Effect, FederatedPrincipal } from 'aws-cdk-lib/aws-iam';
import { FieldLogLevel, GraphqlApi, SchemaFile, AppsyncFunction, Code, FunctionRuntime, Resolver } from 'aws-cdk-lib/aws-appsync';
import { AuthorizationType } from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkSuperheroStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /* 
      Add Cognito User Pool
      Verification Type: Email
    */
    const userPool = new aws_cognito.UserPool(this, 'superhero-app-user-pool', {
      selfSignUpEnabled: true,
      accountRecovery: aws_cognito.AccountRecovery.PHONE_AND_EMAIL,
      userVerification: {
        emailStyle: aws_cognito.VerificationEmailStyle.CODE
      },
      autoVerify: {
        email: true
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        }
      }
    });
    
    // Register Client with User Pool
    const userPoolClient = new aws_cognito.UserPoolClient(this, "UserPoolClient", {
      userPool
    });

    // Create Identity Pool for authorization with AppSync
    const identityPool = new aws_cognito.CfnIdentityPool(this, 'identity-pool', {
      identityPoolName: 'my-identity-pool',
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    })

    // Creating Roles for identity Pool created
    const unauthenticatedRole = new Role(this, 'CognitoDefaultUnauthenticatedRole', {
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
          "StringEquals": { "cognito-identity.amazonaws.com:aud": identityPool.ref },
          "ForAnyValue:StringLike": { "cognito-identity.amazonaws.com:amr": "unauthenticated" },
      }, "sts:AssumeRoleWithWebIdentity"),
  });
  unauthenticatedRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
          "mobileanalytics:PutEvents",
          "cognito-sync:*"
      ],
      resources: ["*"],
  }));
  const authenticatedRole = new Role(this, 'CognitoDefaultAuthenticatedRole', {
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
          "StringEquals": { "cognito-identity.amazonaws.com:aud": identityPool.ref },
          "ForAnyValue:StringLike": { "cognito-identity.amazonaws.com:amr": "authenticated" },
      }, "sts:AssumeRoleWithWebIdentity"),
  });
  authenticatedRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
          "mobileanalytics:PutEvents",
          "cognito-sync:*",
          "cognito-identity:*"
      ],
      resources: ["*"],
  }));
  const defaultPolicy = new aws_cognito.CfnIdentityPoolRoleAttachment(this, 'DefaultValid', {
      identityPoolId: identityPool.ref,
      roles: {
          'unauthenticated': unauthenticatedRole.roleArn,
          'authenticated': authenticatedRole.roleArn
      }
  });
  
    // Print User Pool Id after deployment is finished
    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId
    });
    
    // Print User Pool Client Id after deployment is finished
    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId
    });

    // Print Identity Pool Id after deployment is finished
    new cdk.CfnOutput(this, "IdentityPoolId", {
      value: identityPool.ref,
    });

    // Create Dynamo DB table with id as partition key
    const table = new dynamodb.Table(this, 'SuperheroTable', { 
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }, 
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, 
      // sortKey: {name:'name', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Adding ID as global secondary index for faster searching
    table.addGlobalSecondaryIndex({
      indexName: 'superhero-by-id',
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      }
    });

    // Creating IAM roles for table service and adding GSI to DynamoDB table
    const tableServiceRole = new Role(this, 'tableServiceRole', {
      assumedBy: new ServicePrincipal('dynamodb.amazonaws.com')
    });

    tableServiceRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [`${table.tableArn}/index/superhero-by-id`],
        actions: [            
          'dymamodb:Query'
        ]
      })
    );

    // Configure AWS AppSync and create/edit Schema
    const api = new GraphqlApi(this, 'cdk-superhero-app-api', {
      name: 'cdk-superhero-stack',
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      schema: SchemaFile.fromAsset('graphql/schema.graphql'),   // Location of schema in repository
    });

    // Create function and resolver to add superhero data to dynamoDB
    const add_func_2 = new AppsyncFunction(this, 'func-add-superhero', {
      name: 'add_superhero_func_1',
      api,
      dataSource: api.addDynamoDbDataSource('table-for-superhero-2', table),
          code: Code.fromInline(`
              export function request(ctx) {
                return {
                  operation: 'PutItem',
                  key: util.dynamodb.toMapValues({id: util.autoId()}),
                  attributeValues: util.dynamodb.toMapValues(ctx.args.input),
                };
              }
    
              export function response(ctx) {
                return ctx.result;
              }
          `), 
      runtime: FunctionRuntime.JS_1_0_0,
    });
    
    new Resolver(this, 'pipeline-resolver-create-superhero', {
      api,
      typeName: 'Mutation',
      fieldName: 'createSuperheroDB',
          code: Code.fromInline(`
              export function request(ctx) {
                return {};
              }
    
              export function response(ctx) {
                return ctx.prev.result;
              }
          `),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [add_func_2],
    });

    // Function and Resolver to edit and update superhero in DynamoDB via Appsync
    const add_func_update = new AppsyncFunction(this, 'func-update-superhero', {
      name: 'add_superhero_func_update',
      api,
      dataSource: api.addDynamoDbDataSource('table-for-superhero-update', table),
          code: Code.fromAsset(path.join(__dirname, "../resolvers/update.js")
          ), 
      runtime: FunctionRuntime.JS_1_0_0,
    });
    
    new Resolver(this, 'pipeline-resolver-update-superhero', {
      api,
      typeName: 'Mutation',
      fieldName: 'updateSuperheroDB',
      code: Code.fromAsset(path.join(__dirname, "../resolvers/update.js")
      ),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [add_func_update],
    });

    // Function and Resolver to delete superhero in DynamoDB via AppSync
    const add_func_3 = new AppsyncFunction(this, 'func-delete-superhero', {
      name: 'add_superhero_func_2',
      api,
      dataSource: api.addDynamoDbDataSource('table-for-superhero-3', table),
          code: Code.fromAsset(path.join(__dirname, "../resolvers/delete.js")
          ), 
      runtime: FunctionRuntime.JS_1_0_0,
    });
    
    new Resolver(this, 'pipeline-resolver-delete-superhero', {
      api,
      typeName: 'Mutation',
      fieldName: 'deleteSuperheroDB',
      code: Code.fromAsset(path.join(__dirname, "../resolvers/delete.js")
      ),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [add_func_3],
    });

    // Function and resolver to fetch all superhero list from DynamoDB via Appsync
    const get_all_heros = new AppsyncFunction(this, 'func-get-superhero', {
      name: 'get_superhero_func_1',
      api,
      dataSource: api.addDynamoDbDataSource('table-for-posts', table),
      code: Code.fromAsset(path.join(__dirname, "../resolvers/get.js")
      ),
      runtime: FunctionRuntime.JS_1_0_0,
    });
    
    new Resolver(this, 'pipeline-resolver-get-heros', {
      api,
      typeName: 'Query',
      fieldName: 'getAllSuperherosDB',
      code: Code.fromAsset(path.join(__dirname, "../resolvers/get.js")
      ),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [get_all_heros],
    });
    
    // Prints out Graphql API Endpoint URL
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });

    // Prints out the stack region to the terminal
    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region
    });
  }
}
