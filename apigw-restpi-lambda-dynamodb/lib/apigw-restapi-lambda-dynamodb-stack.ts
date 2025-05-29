import * as Cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ApiGw from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as AwsLambda from "aws-cdk-lib/aws-lambda";
import * as Path from "path";
import {
  AttributeType,
  BillingMode,
  Table,
  TableV2,
} from "aws-cdk-lib/aws-dynamodb";

export class ApiGwRestApiLambdaDynamodbStack extends Cdk.Stack {
  constructor(scope: Construct, id: string, props?: Cdk.StackProps) {
    super(scope, id, props);

    const dynamoDbTable = new TableV2(this, "Users", {
      removalPolicy: Cdk.RemovalPolicy.DESTROY,
      partitionKey: { name: "id", type: AttributeType.STRING },
      replicas: [{ region: "us-west-1" }],
    });

    const lambdaBackend = new NodejsFunction(this, "LambdaCRUD", {
      runtime: AwsLambda.Runtime.NODEJS_LATEST,
      handler: "handler",
      timeout: Cdk.Duration.seconds(300),
      entry: Path.join(__dirname, "../lambda/app.ts"),
      environment: { TABLE_NAME: dynamoDbTable.tableName },
      bundling: {
        commandHooks: {
          afterBundling: (inputDir: string, outputDir: string): string[] => [],
          beforeBundling: (inputDir: string, outputDir: string): string[] => [],
          beforeInstall: (inputDir: string, outputDir: string): string[] => [],
        },
      },
    });

    dynamoDbTable.grantReadWriteData(lambdaBackend);

    const apiGw = new ApiGw.RestApi(this, "RestAPI", {
      deployOptions: {
        dataTraceEnabled: true,
        tracingEnabled: true,
      },
    });

    const apiGwResource = apiGw.root.addResource("users");
    apiGwResource.addMethod("GET", new ApiGw.LambdaIntegration(lambdaBackend));
    apiGwResource.addMethod("POST", new ApiGw.LambdaIntegration(lambdaBackend));
    apiGwResource.addMethod(
      "DELETE",
      new ApiGw.LambdaIntegration(lambdaBackend),
    );
  }
}
