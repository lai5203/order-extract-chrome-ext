
let stopRun = true;

chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
        let message = "";

        if (request.command == "stop"){
            console.log("Received stop signal");
            stopRun = true;
        }else if(request.command == "extract"){
            try{
                stopRun = false;
                let result = "";
                let orderRoot = document.getElementById("tp-bought-root");
                let orderElements = orderRoot.getElementsByClassName("js-order-container");
                // let orderElements = orderRoot.getElementsByClassName("index-mod__order-container___1ur4- js-order-container");

                if (orderElements.length == 0){
                    message = "当前页面没有找到订单";
                    sendResponse({message: message, success: false});
                    return;
                }


                let processedCount = 0;

                for (let index = 0; index < orderElements.length && !stopRun; index++ ){
                    processedCount++;
                    let orderId = orderElements[index].getElementsByTagName("tr")[0].getElementsByTagName("td")[0].textContent;
                    orderId = orderId.substring(orderId.indexOf("订单号")+4);

                    let cells = orderElements[index].getElementsByTagName("tr")[1].getElementsByTagName("td");
                    let itemName = cells[0].innerText;
                    let cutIndex = itemName.indexOf("[交易快照]");
                    itemName = itemName.substring(0, cutIndex);

                    chrome.runtime.sendMessage({item: itemName, orderId: orderId, event: "processItem"});

                    let deliveryStatus = "";
                    let paidAmount = cells[4].getElementsByClassName("price-mod__price___cYafX")[0].textContent.replace("￥","");
                    let shortTransportLink = "https://buyertrade.taobao.com/trade/json/transit_step.do?bizOrderId=" + orderId
                    let transportResponse = getSyncUrlResponse(shortTransportLink);

                    if (transportResponse.indexOf("签收人") > 0 ||  transportResponse.indexOf("已签收") > 0 || transportResponse.indexOf("代签收") > 0){
                        deliveryStatus = "已签收";
                    }

                    if (request.debug){
                        console.log("transport response: ", transportResponse)
                    }

                    transportResponse = JSON.parse(transportResponse);

                    let expressName = transportResponse["expressName"] ?? "无记录";
                    let expressId = transportResponse["expressId"] ?? "无记录";

                    result = result + itemName + "\t" + paidAmount + "\t" + expressName + "\t" + expressId + "\t" + deliveryStatus + "\n";
                }

                copyTextToClipboard(result);
                if (request.debug){
                    console.log(result)
                }
                message = "已处理" + processedCount+ "条记录，一共"+orderElements.length+"条。";
                sendResponse({message: message, success: true});
            }catch (e) {
                console.error(e);
                message = "未知错误";
                sendResponse({message: message, success: false});
            }


        }
    }
);

function getSyncUrlResponse(url){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    /*xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            return xhr.responseText;
        }
    }*/

    xhr.send();
    return xhr.responseText;
}


function copyTextToClipboard(text) {
    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = text;
    document.body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    copyFrom.blur();
    document.body.removeChild(copyFrom);
}