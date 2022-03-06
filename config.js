exports.testSuite = [
  {
    testLabel: 'View Model Page',
    steps: [
      {
        stepLabel: 'Open Model Page',
        stepAction: async (puppet) => {
          await puppet.goto(`https://mui.sploosh.me.uk/model/1`, {
            waitUntil: "networkidle2",
            timeout: 9999,
          }); 
        },
      },  
      {
        stepLabel: 'Wait for page load',
        stepAction: async (puppet) => {
          await puppet.waitForSelector('.MuiCardMedia-root');
        }
      },
      {
        stepLabel: 'Click model card',
        stepAction: async (puppet) => {
          const txtSearch =   await puppet.waitForXPath("(//*[contains(@class, 'MuiCardMedia-root')])[5]"); 
          txtSearch.click()
          console.log('...wait a few seconds')
          await puppet.waitForTimeout(2700) 
        }
      },
    ]
  },
  {
    testLabel: "Perform Search",
    steps: [
      {
        stepLabel: 'Log on to website',
        stepAction: async (puppet) => {
          await puppet.goto(`https://mui.sploosh.me.uk/`, {
            waitUntil: "networkidle2",
            timeout: 9999,
          });
        }
      },
      {
        stepLabel: 'Wait for page load',
        stepAction: async (puppet) => {
          await puppet.waitForSelector('.MuiCardMedia-root')
        }
      },
      {
        stepLabel: 'Type search parameters',
        stepAction: async (puppet) => {
          const txtSearch = await puppet.$('.MuiOutlinedInput-input');
          txtSearch.focus()
          await puppet.waitForTimeout(700)
          await puppet.keyboard.type('sister,rape');
        }
      },
      {
        stepLabel: 'Perform search',
        stepAction: async (puppet) => {
          await puppet.keyboard.press('Enter');
          await puppet.waitForTimeout(7000)
        }
      },
    ]
  }
]