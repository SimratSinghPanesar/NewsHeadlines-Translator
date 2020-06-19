let fs = require ( "fs" ) ;
let puppeteer = require ( "puppeteer" ) ;
let credentialsFile = process.argv [ 2 ] ;
let NOL = process.argv [ 3 ] ;
let url , input , lang , email , pwd ;

( async function () 
{
    try 
    {
        let data = await fs.promises.readFile ( credentialsFile , "utf-8" ) ;
        let cred = JSON.parse ( data ) ;
        url = cred.url ;
        input = cred.input ;
        lang = cred.lang ; 
        email = cred.email ;
        pwd = cred.pwd ;

        let browser = await puppeteer.launch (
            {
                headless : false ,
                defaultViewport : null , 
                args : [ "--start-maximized" , "--disable-notifications" ] ,
                slowMo : 30
            }
        ) ;

        let numberOfPages = await browser.pages () ;
        let tab = numberOfPages [ 0 ] ;

        await tab.goto ( url , {
            waitUntil : "networkidle2"
        }) ;

        for  ( let i = 0 ; i < 8 ; i++ )
        {
            await tab.keyboard.press("ArrowDown") ;
        }

        await tab.waitForSelector ( ".storyArea h1" ) ;
        let headlines = await tab.$eval ( ".storyArea h1" , ( el => el.textContent ) ) ;
        console.log () ;
        console.log ( "*******************************************************************************************************************************************************************" ) ;
        console.log ( "Recent Covid Update :- " + headlines ) ;
        console.log ( "*******************************************************************************************************************************************************************" ) ;

        await tab.goto ( "https://translate.google.com/" , {
            waitUntil : "networkidle2"
        }) ;

        await tab.waitForSelector ( ".gb_4.gb_5.gb_pe.gb_5c" ) ;
        await tab.click ( ".gb_4.gb_5.gb_pe.gb_5c" , { delay : 100 } ) ;
        
        await tab.waitForNavigation ( "https://accounts.google.com/signin/v2/identifier?hl=en&passive=true&continue=https%3A%2F%2Ftranslate.google.com%2F&flowName=GlifWebSignIn&flowEntry=ServiceLogin" ) ;
        await tab.goto ( "https://accounts.google.com/signin/v2/identifier?hl=en&passive=true&continue=https%3A%2F%2Ftranslate.google.com%2F&flowName=GlifWebSignIn&flowEntry=ServiceLogin" ) ;

        await tab.waitForSelector ( "#identifierId" ) ;
        await tab.type ( "#identifierId" , email , { delay : 100 } ) ;

        await tab.waitForSelector ( "#identifierNext" ) ; 
        await tab.click ( "#identifierNext" , { delay : 100 } ) ;

        await tab.waitForSelector ( "#password" ) ;
        await tab.type ( "#password" , pwd , { delay : 100 } ) ; 
        await tab.waitFor ( 200 ) ; 

        await tab.waitForSelector ( "#passwordNext" ) ;
        await tab.click ( "#passwordNext" , { delay : 100 } ) ;

        //console.log ( "User Logged IN!!" ) ;

        await tab.waitForSelector ( ".tlid-dismiss-button.dismiss-button.button" ) ;
        await tab.click ( ".tlid-dismiss-button.dismiss-button.button" , { delay : 100 } ) ;

        await tab.waitForSelector ( ".sl-wrap #sugg-item-en" ) ;
        await tab.click ( ".sl-wrap #sugg-item-en" , { delay : 100 } ) ;
        //console.log ( "Source language selected " ) ;

        await tab.waitForSelector ( ".source-input #source" ) ;
        await tab.type ( ".source-input #source" , headlines , { delay : 100 } ) ;

        let i = 0 ;
        do
        {
            await tab.waitForSelector ( ".tl-more.tlid-open-target-language-list" ) ;
            await tab.click ( ".tl-more.tlid-open-target-language-list" , { delay : 100 } ) ;
            await tab.waitForSelector ( "#tl_list-search-box" ) ;
            let language = lang [ i ] ;
            
            await tab.type ( "#tl_list-search-box" , language , { delay : 100 } ) ;
            await tab.keyboard.press( "Enter" ) ; 

            console.log ( "Headlines translated to " + language ) ;
                                      
            await tab.waitForSelector ( ".res-tts.ttsbutton-res.left-positioned.ttsbutton.jfk-button-flat.source-or-target-footer-button.jfk-button" ) ;
            await tab.click ( ".res-tts.ttsbutton-res.left-positioned.ttsbutton.jfk-button-flat.source-or-target-footer-button.jfk-button" , { delay : 100 } ) ;
            await tab.waitFor ( 6600 ) ;

            await tab.waitForSelector ( ".result-shield-container.tlid-copy-target" ) ;
            let translatedtext = await tab.$eval ( ".result-shield-container.tlid-copy-target" , ( el => el.textContent ) ) ;
            console.log ( translatedtext ) ;
            console.log ( "*******************************************************************************************************************************************************************" ) ;

            i++ ;
        } while ( i < NOL )
    }
    catch ( err ) 
    {
        console.log ( err.message ) ;
    }
}) () ;