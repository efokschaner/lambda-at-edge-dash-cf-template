let fs = require('fs');

let regions = require('./regions.json');
let perRegionWidgets = require('./per-region-widgets.json');
let usEastWidgets = perRegionWidgets.widgets.filter((widget) => widget.properties.region === 'us-east-1');

function isString(x) {
  return Object.prototype.toString.call(x) === '[object String]'
}

let regionMaxHeight = 0;
let regionMaxWidth = 0;
for (let widget of usEastWidgets) {
  regionMaxHeight = Math.max(regionMaxHeight, widget.y + widget.height);
  regionMaxWidth = Math.max(regionMaxWidth, widget.x + widget.width);
}

function getRegionHeaderWidget(regionData) {
  return {
    type: "text",
    x: 0,
    y: 0,
    width: regionMaxWidth,
    height: 1,
    properties: {
      markdown: `# ${regionData.description} - ${regionData.name}`
    }
  };
}

let widgets = [];
let cumulativeVerticalOffset = 0;
for (let region of regions) {
  let headerWidget = getRegionHeaderWidget(region);
  headerWidget.y += cumulativeVerticalOffset;
  widgets.push(headerWidget);
  cumulativeVerticalOffset += headerWidget.height;
  for (let widget of usEastWidgets) {
    let widgetClone = JSON.parse(JSON.stringify(widget));
    widgetClone.y += cumulativeVerticalOffset;
    widgetClone.properties.region = region.name;
    for (let metric of widgetClone.properties.metrics) {
      for (let index = 0; index < metric.length; ++index) {
        if(metric[index] === 'FunctionName') {
          metric[index+1] = 'us-east-1.${FunctionName}';
        }
        if(metric[index] === 'Resource') {
          metric[index+1] = 'us-east-1.${FunctionName}:${FunctionVersion}';
        }
      }
    }
    widgets.push(widgetClone);
  }
  cumulativeVerticalOffset += regionMaxHeight;
}

let cfTemplate = {
  Description: "Creates a Dashboard to monitor a Lambda@Edge function.",
  Parameters: {
    FunctionName: {
      Description: "The name of the lambda function you wish to monitor eg. \"testLambdaPlsIgnore\"",
      Type: "String"
    },
    FunctionVersion: {
      Description: "The version of the function you wish to monitor eg. \"3\"",
      Type: "String"
    },
    DashboardName: {
      Description: "The name of the CloudWatch dashboard that will be created. It is recommended to incorporate the Lambda's name and version to avoid aliasing. eg. \"testLambdaPlsIgnore-v3\"",
      Type: "String",
      AllowedPattern : "^[0-9A-Za-z-_]+$",
      ConstraintDescription: "Valid characters in dashboard names are \"0-9A-Za-z-_\""
    }
  },
  Resources: {
    Dashboard: {
      Type: "AWS::CloudWatch::Dashboard",
      Properties: {
        DashboardName: { 'Ref' : 'DashboardName' },
        DashboardBody: { 'Fn::Sub' : JSON.stringify({ widgets }) },
      }
    }
  }
};

fs.writeFileSync('lambda-edge-dash.template.json', JSON.stringify(cfTemplate, null, 2));