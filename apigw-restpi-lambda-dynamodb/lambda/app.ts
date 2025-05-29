import { Handler } from "aws-lambda";
import * as dynamoose from "dynamoose";
import * as crypto from "crypto";

const User = dynamoose.model(process.env.TABLE_NAME || "Users", {
  id: {
    type: String,
    hashKey: true,
    default: () => crypto.randomUUID(),
  },
});

export const handler: Handler = async (event, context) => {
  try {
    const method = event.httpMethod;
    console.log("HTTP Method:", method);

    switch (method) {
      case "GET":
        return await handleGetRequest(event.queryStringParameters?.id);
      case "POST":
        return await handlePostRequest(event.queryStringParameters?.id);
      default:
        return {
          statusCode: 500,
        };
    }
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
    };
  }
};

async function handleGetRequest(id: string) {
  let _statusCode: number = 500;
  try {
    const results = await User.query("id").eq(id).exec();
    if (results?.count > 0) {
      _statusCode = 200;
    } else {
      _statusCode = 400;
    }
  } catch (error) {
    console.log(error);
    _statusCode = 500;
  } finally {
    return {
      statusCode: _statusCode,
    };
  }
}

async function handlePostRequest(id: string) {
  let _statusCode: number = 500;
  const newUser = new User({
    id: id,
  });

  try {
    await newUser.save();
    console.log("sucess persist data");
    _statusCode = 200;
  } catch (error) {
    console.log(error);
  } finally {
    return {
      statusCode: _statusCode,
    };
  }
}
