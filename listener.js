const puppeteer = require("puppeteer"); 
const { executeCommand } = require('./engine');
const { testSuite } = require('./config');
const { wait } = require('./util');


const getTestNames = () => testSuite.map(test => test.testLabel).join(',')

const getStepNames = (name) => { 
  const { steps }  = testSuite.find(test => test.testLabel === name); 
  return steps.map(step =>  step.stepLabel).join(',')
}

const executeSteps = async (puppet, steps, length, recipientId, sendClientStatus) => {
  if (!steps.length) { 
    return true;
  }

  const { stepLabel, stepAction } = steps.shift();
  const stepNumber = length - steps.length;
  const activeStep = stepNumber - 1;
  const progress = stepNumber / length * 100

  await executeCommand (
    puppet, 
    stepLabel, 
    stepAction, 
    stepNumber,
    recipientId,
    // callback to client
    data => {
      sendClientStatus("status", {
        recipientId,  
        data: {...data, activeStep, progress}
      });
    }
  )

  console.log ('Step %d: %s', stepNumber, stepLabel)  
  return await executeSteps(puppet, steps, length, recipientId, sendClientStatus);
}

const executeTest = async (name, recipientId, sendClientStatus)  => {
  const browser = await puppeteer.launch({
      defaultViewport: {width: 1200, height: 672}
  });
  const puppet = await browser.newPage();

  // get steps from named test
  const { steps } = testSuite.find(t => t.testLabel === name);

  await executeSteps(
    puppet, 
    // NOTE: only send a COPY of the test array
    // or it will be empty on the next call
    steps.slice(0), 
    steps.length,
    recipientId, 
    sendClientStatus
  );
  
  console.log ('Test Complete');

  // since prior messages were so big we'll just
  // wait a beat before sending final message
  // to let the client machine get ready.
  wait(4999, () => {
    sendClientStatus("status", {
      recipientId,  
      data: {
        message: 'Test Complete', 
        activeStep: steps.length,
        progress: 100
      }
    });
  } )

  await puppet.close();
  await browser.close();
}

const evaluateNode = (item, recipientId, sendClientStatus) => {
  const { action, data } = item; 
  if (action === 'introduce') {
    sendClientStatus("status", {
      recipientId, 
      available : getTestNames(),
    });
  }
  if (action === 'exec') {
    const { id } = data; 
    sendClientStatus("accept", {
      acceptId: recipientId, 
      steps: getStepNames(id)
    });
    executeTest(id, recipientId, sendClientStatus)
  }
}


exports.evaluateNode = evaluateNode;
 