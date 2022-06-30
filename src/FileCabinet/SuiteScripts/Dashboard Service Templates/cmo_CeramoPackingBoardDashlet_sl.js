/**
 * Suitelet script used for dashlet showing both
 * picking list and KPI dial for total amounts
 * 
 * Account: Ceramo
 * Last Modified: 11/26/2021 (Justin)
 */

/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
 define(['N/file', 'N/ui/serverWidget', 'N/record', 'N/render', 'N/search', 'N/runtime', 'N/redirect', 'N/url'],
 function(file, ui, record, render, search, runtime, redirect, url) {
     var scriptObj = runtime.getCurrentScript();
     
     function handleGET(context) {
         var Request = context.request;
         log.debug({title: 'parameters: ', details: Request.parameters});
         for (parameter in Request.parameters) {
             log.debug({title: 'parameters at GET: ', details: 'parameter: '+Request.parameters[parameter]+': '+parameter});
         }
         var renderer = render.create();
         var resultObj = {};

         // currently using stock template for testing
         var templateId = '132818';
       

         // get "total amount packed this week" for dial graph via saved search result
        var totalAmountSearchId = '1816';
 		var totalAmountSearch = search.load({id: totalAmountSearchId});
        totalAmountSearch.run().each(function(result) {
         
            log.debug({title: 'thisSearchData:', details: JSON.stringify(result.getValue(result.columns[0]))});

            // only one row in this resultant
            resultObj["totalAmount"] = result.getValue(result.columns[0]);
        });

           // get "total picking/packing" KPI goal amount this week
           var totalAmountSearchId = '1815';
           var totalAmountGoalSearch = search.load({id: totalAmountSearchId});
          totalAmountGoalSearch.run().each(function(result) {
           
              // debug log.debug({title: 'thisSearchData:', details: JSON.stringify(result.getValue(result.columns[0]))});
  
              // only one row in this resultant
              resultObj["totalAmountGoal"] = result.getValue(result.columns[0]);
          });


        // get current packing list from saved search
        resultObj["pickingList"] = {};
        var thisSavedSearchId = '1819';
        var pickingSavedSearch = search.load({id: thisSavedSearchId});

        var theseResults = pickingSavedSearch.run().getRange(0,1000);

        renderer.addSearchResults({
            templateName: 'pickingListSearch', 
            searchResult: theseResults
        });


        // store the saved search as an HTML table
        var thisHtml = '<table id="pickingTable">';

        // hardcoded header row for easy re-formatting
        thisHtml += '<thead><tr><th>Document #</th><th>Name</th><th>Target Ship Date</th><th>Quantity</th><th>Amount</th></tr></thead>'
        for(var i in theseResults){
            var result = theseResults[i];
            var thisCurrentRow = {};
            thisHtml += "<tr>";
            var thisRowColor = '';
            for(var k in result.columns){
                 // skip color field, use as row html variable
                 if (k == 0) {
                     thisRowColor = result.getValue(result.columns[k]);
                     continue;
                 } 
                thisHtml += '<td style="background-color:'+thisRowColor+'">';
               var thisResultText = result.getText(result.columns[k]);
              
               if (thisResultText == null) { 
                if (k == 5) {
                    thisHtml += '$';
                } 
               thisHtml += (result.getValue(result.columns[k]));
               } else { 
                  thisHtml += (thisResultText);
               }
               thisHtml += "</td>";
            }
            thisHtml += "</tr>";
            // resultObj["pickingList"]["result_"+i] = thisCurrentRow;
        }
        thisHtml += "</table>";
        resultObj["pickingList"] = thisHtml;
           log.debug({title: 'resultObj[pickingList]:', details: resultObj["pickingList"]});

         // resultObj = JSON.stringify(resultObj);

         log.debug({title: 'Final resultObj:', details: resultObj});
         
         if (templateId) {
             var templateFile = file.load({id: templateId});
             renderer.templateContent = templateFile.getContents();
             renderer.addCustomDataSource({format: render.DataSource.OBJECT, alias: 'results', data: resultObj});

             responseContent = renderer.renderAsString();

             
         } else {
             responseContent = "Please provide a template."
         }
         
         context.response.write(responseContent);
     }
 
     /**
      * Definition of the Suitelet script trigger point.
      *
      * @param {Object} context
      * @param {ServerRequest} context.request - Encapsulation of the incoming request
      * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
      * @Since 2015.2
      */
     function onRequest(context) {
         switch (context.request.method) {
         case 'GET':
             handleGET(context);
             break;
         default:
             log.error({title:'error -- unsupported request method', details: context.request.method});
         break;
         }
     }
 
     return {
         onRequest: onRequest
     };
 
 });