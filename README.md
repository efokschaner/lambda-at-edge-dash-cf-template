# A stock Lambda@Edge CloudWatch Dashboard that works

## How to use
The file [lambda-edge-dash.template.json](./lambda-edge-dash.template.json?raw=true) contains the CloudFormation template.
You can use the template via whatever approach to CloudFormation you are comfortable with.
If you have less experience with CloudFormation perhaps [this is a good starting point](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-console-create-stack.html) for how to use a CloudFormation template.
For this template specifically, it's not creating any actual infrastructure so you probably won't need to worry about many of the CloudFormation options (eg. Rollback Triggers).

You will pass 3 parameters to the template to create a "Stack" consisting of one CloudWatch Dashboard.
- *FunctionName* - The name of the lambda function you wish to monitor eg. "testLambdaPlsIgnore",
- *FunctionVersion* - The version of the function you wish to monitor eg. "3"
- *DashboardName* - The name of the CloudWatch dashboard that will be created. It is recommended to incorporate the Lambda's name and version to avoid aliasing. eg. "testLambdaPlsIgnore-v3"

## Iterating on the Dashboard
If the stock dashboard is not quite right for you, you may wish to iterate on it by cloning this repo.
You will need Node.js to run `make.js` (I used Node.js v9.2.0 in case it matters).
To rebuild `lambda-edge-dash.template.json` run `node make.js`.
`make.js` uses any **us-east-1** widgets in `per-region-widgets.json` to define the widgets that will show for all regions.
`per-region-widgets.json` is in standard JSON format for a CloudWatch Dashboard, which means you can play around with the **us-east-1** widgets in an existing CloudWatch Dashboard and then extract the full JSON source back to `per-region-widgets.json`.

## Why?
When an AWS lambda is used at the edge, the stock "Monitoring" tab, that displays "CloudWatch metrics at a glance", does not work. This seems to be because AWS actually clones your Lambda function with a new `FunctionName` of `us-east-1.<YOUR_FUNCTION_NAME>` (this `us-east-1.` prefix seems independent of the region in which the lambda runs). Add to this the fact that the function will be able to run in a large number of AWS regions therefore you will likely need the same dashboard widgets repeated for every region.
This project solves the function naming issue as well as sharing the definition of widgets for every AWS region.