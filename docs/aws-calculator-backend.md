# AWS Calculator Backend Deployment Guide

This guide covers the two assignment parts:

1. Deploy the calculator backend as an AWS Lambda function
2. Expose it through API Gateway and connect the React frontend

It is written for this repo as it exists today.

## Architecture

- `shared/calculate.mjs`
  The calculator logic used by both local Express and Lambda
- `server/index.js`
  Local development backend at `POST /api/calculate`
- `lambda/index.mjs`
  AWS Lambda handler for API Gateway
- `lambda/package.sh`
  Builds the `.zip` artifact you upload to Lambda
- `client/src/App.jsx`
  Frontend that calls either local Express or a deployed API Gateway URL

## Prerequisites

- Node.js and npm installed
- AWS account access in the AWS Console
- Lambda function already created or permission to create one
- API Gateway permission to create and deploy a REST API
- Amplify app already hosting the frontend, or a plan to redeploy it after wiring the API URL

## Current Official Docs

- AWS CDK getting started:
  [https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)
- Lambda Node.js zip packaging:
  [https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html)
- Lambda with API Gateway tutorial:
  [https://docs.aws.amazon.com/lambda/latest/dg/services-apigateway-tutorial.html](https://docs.aws.amazon.com/lambda/latest/dg/services-apigateway-tutorial.html)

## Part One, Deploy Lambda

### 1. Install CDK

The assignment says to install the AWS CDK globally.

```bash
npm install -g aws-cdk
cdk --version
```

On this machine, `cdk --version` reports `2.1117.0`.

### 2. Create or Open the Lambda Function

In the AWS Console:

1. Open **Lambda**
2. Choose **Create function**
3. Choose **Author from scratch**
4. Function name: `Calculate` (or your existing calculator Lambda)
5. Runtime: a current Node.js runtime supported by Lambda
6. Choose **Create function**

If your function already exists, open it instead.

### 3. Connect the Handler to the Calculator Logic

This repo now includes a Lambda handler at `lambda/index.mjs`.

What it does:

- Accepts HTTP POST payloads with `{ "expression": "2+3x4" }`
- Calls the shared `calculate()` function
- Returns JSON like `{ "result": "14" }`
- Adds CORS headers so a browser frontend can call it

Important Lambda settings:

- File name inside the uploaded zip must be `index.mjs`
- Handler should be `index.handler`

### 4. Build the Lambda Zip Archive

From the repo root:

```bash
sh lambda/package.sh
```

That creates:

```text
lambda/calculate-lambda.zip
```

The zip contains exactly:

- `index.mjs`
- `calculate.mjs`

This matches AWS Lambda's zip-based Node.js packaging model.

### 5. Upload the Zip to Lambda

In the Lambda console:

1. Open your function
2. In **Code source**, choose **Upload from**
3. Choose **.zip file**
4. Upload `lambda/calculate-lambda.zip`
5. Confirm the handler is still `index.handler`
6. Choose **Deploy**

### 6. Test the Lambda Function Directly

In Lambda:

1. Open the **Test** tab
2. Create a new test event
3. Use a payload like:

```json
{
  "body": "{\"expression\":\"2+3x4\"}"
}
```

4. Run the test

Expected response body:

```json
{"result":"14"}
```

If you test with an API Gateway style event later, the same handler will still work.

## Part Two, Connect Lambda Through API Gateway

### 1. Create the REST API

In the AWS Console:

1. Open **API Gateway**
2. Choose **Create API**
3. In **REST API**, choose **Build**
4. API name: `Calculator`

### 2. Create the Resource

In the API's **Resources** page:

1. Choose **Create Resource**
2. Resource name: `CalculatorManager`

This creates a resource path similar to:

```text
/CalculatorManager
```

### 3. Create the POST Method

With `CalculatorManager` selected:

1. Choose **Create Method**
2. Method type: `POST`
3. Integration type: `Lambda`
4. Lambda function: choose your `Calculate` function
5. Save and allow API Gateway to invoke Lambda if prompted

Use Lambda proxy integration if the console offers it. This repo's handler is written for proxy-style request and response objects.

### 4. Enable Browser Access

Because your frontend is hosted on Amplify and your backend is on API Gateway, the browser is making a cross-origin request.

You need both:

- CORS headers in the Lambda response
- API deployment after method changes

This repo's Lambda handler already returns:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: Content-Type`
- `Access-Control-Allow-Methods: OPTIONS,POST`

If your API Gateway setup still blocks requests, in the API Gateway console:

1. Select the `CalculatorManager` resource
2. Use **Enable CORS** if needed
3. Redeploy the API after making changes

### 5. Deploy the API

In API Gateway:

1. Choose **Deploy API**
2. Stage: **New stage**
3. Stage name: `test`

After deployment, copy the invoke URL.

It will look like:

```text
https://abc123.execute-api.us-east-1.amazonaws.com/test
```

Your calculator POST endpoint becomes:

```text
https://abc123.execute-api.us-east-1.amazonaws.com/test/CalculatorManager
```

## Wire the Frontend to API Gateway

The frontend in this repo now supports a configurable backend URL.

### Local development

Local development still uses the Express backend through the Vite proxy:

```text
/api/calculate
```

### Deployed frontend

For Amplify, set an environment variable named `VITE_CALCULATE_URL` to the full API Gateway endpoint:

```text
https://abc123.execute-api.us-east-1.amazonaws.com/test/CalculatorManager
```

You can set this in Amplify:

1. Open your Amplify app
2. Go to **Hosting** or **App settings**, depending on the console layout
3. Add environment variable `VITE_CALCULATE_URL`
4. Redeploy the frontend

You can also test locally by creating `client/.env.local`:

```bash
VITE_CALCULATE_URL=https://abc123.execute-api.us-east-1.amazonaws.com/test/CalculatorManager
```

Then restart Vite:

```bash
cd client
npm run dev
```

## Local Verification Workflow

### Verify the local backend

```bash
cd server
npm start
```

In another terminal:

```bash
curl -s -X POST http://localhost:3001/api/calculate \
  -H 'Content-Type: application/json' \
  -d '{"expression":"2+3x4"}'
```

Expected:

```json
{"result":"14"}
```

### Verify the Lambda package exists

```bash
sh lambda/package.sh
unzip -l lambda/calculate-lambda.zip
```

### Verify the deployed API directly

After API Gateway deployment:

```bash
curl -s -X POST https://abc123.execute-api.us-east-1.amazonaws.com/test/CalculatorManager \
  -H 'Content-Type: application/json' \
  -d '{"expression":"2+3x4"}'
```

Expected:

```json
{"result":"14"}
```

## Common Failure Modes

### 1. `403` or `500` from API Gateway

Usually one of these:

- API Gateway was not redeployed after changes
- API Gateway does not have permission to invoke Lambda
- The integration is pointed at the wrong Lambda function

### 2. Browser CORS errors

Usually one of these:

- Missing `Access-Control-Allow-Origin` header
- API was changed but not redeployed
- Frontend is calling the wrong URL

### 3. Lambda says handler not found

Check both:

- The uploaded zip contains `index.mjs` at the root of the zip
- Lambda handler is set to `index.handler`

### 4. Frontend still calls localhost after deployment

You likely did not set `VITE_CALCULATE_URL` in Amplify, or the frontend was not rebuilt after setting it.

## Optional IaC Direction

If you want to push this further with infrastructure as code, the next step is to define:

- a Lambda function
- a REST API resource and POST method
- the Lambda invoke permission

with AWS CDK and deploy it with `cdk deploy`.

That is optional for the assignment as written, because your class instructions are console-first.
