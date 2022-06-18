'use strict';

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.event == "processItem"){
            document.getElementById('display').innerText = request.display;
        }

        sendResponse({success: true});
    });

    document.addEventListener('DOMContentLoaded', function() {
        var extractOrdersBtn = document.getElementById('extractOrders');
        extractOrdersBtn.addEventListener('click', function() {
            extractOrders();
        }, false);

        var extractOrderAndDeliveryBtn = document.getElementById('extractOrderAndDelivery');
        extractOrderAndDeliveryBtn.addEventListener('click', function() {
            extractOrderAndDelivery();
        }, false);

      }, false);
    

function extractOrders(){
    console.log("extractOrders");

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        console.log(activeTab.url);

        startProcessing();

        chrome.tabs.sendMessage(activeTab.id, {"command": "extract-order", "debug": false},function(response) {
            if (response.success){
                endProcessing();
    
                setTimeout(function () {
                    alert('订单信息（不包含物流）已经复制到粘贴板，您可以到Excel等应用中粘贴。'+ response.message);
                }, 500);
            }else{
                alert('订单获取失败。提示信息：' + response.message);
            }
        });
    });
}


function extractOrderAndDelivery(){
    console.log("extractOrderAndDelivery");

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        console.log(activeTab.url);

        startProcessing();

        chrome.tabs.sendMessage(activeTab.id, {"command": "extract-order-delivery", "debug": false},function(response) {
            if (response.success){
                endProcessing();
    
                setTimeout(function () {
                    alert('订单详情已经复制到粘贴板，您可以到Excel等应用中粘贴。由于限制，如果一个订单有多个包裹，只能自动获取到一个，请手动获取其他快递信息。'+ response.message);
                }, 500);
            }else{
                alert('订单获取失败。提示信息：' + response.message);
            }
        });
    });
}

function startProcessing(){
    document.getElementById('loading').style.display ='block';
    document.getElementById('done').style.display ='none';
    document.getElementById('init').style.display ='none';
}

function endProcessing(){
    document.getElementById('loading').style.display ='none';
    document.getElementById('done').style.display ='block';
    document.getElementById('init').style.display ='none';
}

/*let stopButton = document.getElementById('stopProcessBtn');

stopButton.onclick = function(element) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"command": "stop"});
    });
};*/



chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.event == "processItem"){
            document.getElementById('orderId').innerText = request.orderId;
            document.getElementById('item').innerText = request.item;
        }

        sendResponse({success: true});
    });