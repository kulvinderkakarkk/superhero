export const awsmobile = {
    "aws_project_region": process.env.NEXT_PUBLIC_AWS_STACK_REGION,
    "aws_cognito_identity_pool_id": process.env.NEXT_PUBLIC_AWS_COGNITO_IDENTITY_POOL_ID,
    "aws_cognito_region": process.env.NEXT_PUBLIC_AWS_STACK_REGION,
    "aws_user_pools_id": process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
    "aws_user_pools_web_client_id": process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
    "aws_appsync_graphqlEndpoint": process.env.NEXT_PUBLIC_AWS_APPSYNC_GRAPHQL_ENDPOINT,
    "aws_appsync_authenticationType": "API_KEY",
    "aws_appsync_apiKey": process.env.NEXT_PUBLIC_AWS_APPSYNC_API_KEY,
    "aws_appsync_region": "ap-southeast-2",
    "aws_cognito_username_attributes": [
        "EMAIL"
    ],
    "aws_cognito_social_providers": [],
    "aws_cognito_signup_attributes": [
        "EMAIL"
    ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [
        "SMS"
    ],
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": 8,
        "passwordPolicyCharacters": []
    },
    "aws_cognito_verification_mechanisms": [
        "EMAIL"
    ]
}