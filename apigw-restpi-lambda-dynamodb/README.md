# API Gateway (REST API) + Lambda + DynamoDB Global Table (High Availability)

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npm run format`   format code using Lint
* `cdk deploy`  deploy this stack to your default AWS account/region
* `cdk diff`    compare deployed stack with current state
* `cdk synth`   emits the synthesized CloudFormation template

## How it works

This will create an API Gateway REST API, a Lambda function, and a DynamoDB Global/Multi-Region Table (High Availability). 
{Arch-diagram}

### Security
The Lambda function is granted access to the DynamoDB through a security group. The security group only allows traffic from the Lambda function to the DynamoDB.
# Requirements

# Deployment Instructions

# Cold Start optimization annotations

## Testing

To use the API Gateway REST API, send a GET request to the ...
The Lambda function will be invoked and will return the contents of the DynamoDB Table.

In the stack output, you can see `ApiGwRestApiLambdaDynamodbStack.RestAPIEndpoint`. This URL can be used with the curl commands below to interact with the DynamoDB.

### Example
1. **GET** - Retrieve data from the DynamoDB Users Table:
```bash
curl -X -I GET "YOUR_API_ENDPOINT?id={value}" -H "CONTENT-TYPE: application/json"
```
2. **POST**  - Insert data into the DynamoDB Users Table:
```bash
curl -X -I POST "YOUR_API_ENDPOINT?id={value}"-H "CONTENT-TYPE: application/json"
```

## Cleanup
 
Delete the stack

```bash
cdk destroy
```
----

# ...