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
import { LogGroup } from "aws-cdk-lib/aws-logs";

export class ApiGwRestApiLambdaDynamodbStack extends Cdk.Stack {
  constructor(scope: Construct, id: string, props?: Cdk.StackProps) {
    super(scope, id, props);

    const dynamoDbGlobalTable = new TableV2(this, "Users", {
      removalPolicy: Cdk.RemovalPolicy.DESTROY,
      partitionKey: { name: "id", type: AttributeType.STRING },
      replicas: [{ region: "us-west-1" }],
    });

    // esbuild compact them js modules and help optimize cold start
    const lambdaBackend = new NodejsFunction(this, "LambdaCRUD", {
      runtime: AwsLambda.Runtime.NODEJS_LATEST,
      architecture: AwsLambda.Architecture.ARM_64, //Optimize cold start
     // reservedConcurrentExecutions: 100, //evitar overhead nos serviços downstreams, porem dropa novas conexoes se o pool estiver no limite 
      handler: "handler",
      timeout: Cdk.Duration.seconds(300),
      entry: Path.join(__dirname, "../lambda/app.ts"),
      environment: { TABLE_NAME: dynamoDbGlobalTable.tableName },
      bundling: {
        commandHooks: {
          afterBundling: (inputDir: string, outputDir: string): string[] => [],
          beforeBundling: (inputDir: string, outputDir: string): string[] => [],
          beforeInstall: (inputDir: string, outputDir: string): string[] => [],
        },
      },
    });

   const prodAlias = new AwsLambda.Alias(this, 'ProdAlias', {
      aliasName: 'prod',
      version: lambdaBackend.currentVersion,
      provisionedConcurrentExecutions: 1, // optimize cold start
    });

    dynamoDbGlobalTable.grantReadWriteData(lambdaBackend);
    //Define LogGroup Name in CloudWatch
    const logGroup = new LogGroup(this, "ApiGwRestApiLambdaDynamodbStack");

    const apiGw = new ApiGw.RestApi(this, "RestAPI", {
      deployOptions: {
        dataTraceEnabled: true,
        tracingEnabled: true,
        accessLogDestination: new ApiGw.LogGroupLogDestination(logGroup)
      },
    });

    const apiGwResource = apiGw.root.addResource("users");
    apiGwResource.addMethod("GET", new ApiGw.LambdaIntegration(lambdaBackend));
    apiGwResource.addMethod("POST", new ApiGw.LambdaIntegration(lambdaBackend));
  }
}
