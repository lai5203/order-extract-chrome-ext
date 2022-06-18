
let stopRun = true;

chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
        let message = "";

        if (request.command == "stop"){
            console.log("Received stop signal");
            stopRun = true;
        }else if(request.command == "extract-order-delivery"){
            extract(request, sendResponse, true);
        }else if(request.command == "extract-order"){
            extract(request, sendResponse, false);
        }
    }
);

function extract(request, sendResponse, includeDelivery){
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
            let bodies = orderElements[index].getElementsByTagName("tbody");
            let orderId = bodies[0].getElementsByTagName("td")[0].textContent;
            let orderDate = orderId.substring(0,10);
            orderId = orderId.substring(orderId.indexOf("订单号")+4);

            let itemRows = bodies[1].getElementsByTagName("tr");
            let cells = itemRows[0].getElementsByTagName("td");
            let itemName = cells[0].innerText;
            let cutIndex = itemName.indexOf("[交易快照]");
            if (cutIndex < 0){
                cutIndex = itemName.indexOf("\n");
            }

            if (cutIndex > 0){
                itemName = itemName.substring(0, cutIndex);
            }

            let remainingItemsCount = itemRows.length - 1;

            if (remainingItemsCount > 0){
                if (itemRows[itemRows.length - 1].getElementsByTagName("td")[0].innerText == "保险服务"){
                    remainingItemsCount--;
                }

                if (remainingItemsCount > 0){
                    itemName = itemName + " --及其他" + (itemRows.length - 2)+"件物品"
                }
            }

            chrome.runtime.sendMessage({item: itemName, orderId: orderId, event: "processItem"});

            let deliveryStatus = "";
            var priceEle = cells[4].getElementsByTagName('strong');
            let paidAmount = "获取失败";
            if (priceEle != null){
                paidAmount = priceEle[0].textContent.replace("￥","");
            }

            if (includeDelivery){
                let shortTransportLink = "https://buyertrade.taobao.com/trade/json/transit_step.do?bizOrderId=" + orderId
                // let shortTransportLink = "https://detail.i56.taobao.com/call/queryTrace.do?dimension=TRADE_ID&tradeId=" + orderId;
    
                let transportResponse = getSyncUrlResponse(shortTransportLink);
    
                if (transportResponse.indexOf("签收") > 0){
                    deliveryStatus = "已签收";
                }
    
                if (request.debug){
                    console.log("transport response: ", transportResponse)
                }
    
                transportResponse = JSON.parse(transportResponse);
    
                let expressName = transportResponse["expressName"] ?? "无记录";
                let expressId = transportResponse["expressId"] ?? "无记录";
    
                result = result + orderDate + "\t" + itemName + "\t" + paidAmount + "\t" + expressName + "\t" + expressId + "\t" + deliveryStatus + "\n";
            }else{
                result = result + orderDate + "\t" + itemName + "\t" + paidAmount + "\t" + (0-paidAmount) + "\n";
            }
            
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

function getSyncUrlResponse(url){
    var xhr = new XMLHttpRequest();

    xhr.withCredentials = true;
    xhr.open("GET", url, false);
    /*xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            return xhr.responseText;
        }
    }*/

    xhr.send();
    return xhr.responseText;
}

function getTagMatchingClass(root, tag,  classRegex){
    var all_divs = root.getElementsByTagName(tag);
    for (var i = 0; i < all_divs.length; i++) {
        var div = all_divs[i];

        if (div.className.match(classRegex)){
            return div;
        }
    }

    return null;
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