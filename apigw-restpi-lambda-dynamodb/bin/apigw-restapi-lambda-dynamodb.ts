#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ApiGwRestApiLambdaDynamodbStack } from "../lib/apigw-restapi-lambda-dynamodb-stack";

const app = new cdk.App();
new ApiGwRestApiLambdaDynamodbStack(app, "ApiGwRestApiLambdaDynamodbStack", {
  env: { region: "us-west-2" },
});
