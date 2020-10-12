'use strict';

/*let stopButton = document.getElementById('stopProcessBtn');

stopButton.onclick = function(element) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"command": "stop"});
    });
};*/

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    document.getElementById('loading').style.display ='block';
    document.getElementById('done').style.display ='none';
    document.getElementById('init').style.display ='none';
    chrome.tabs.sendMessage(activeTab.id, {"command": "extract", "debug": false},function(response) {
        if (response.success){
            document.getElementById('loading').style.display ='none';
            document.getElementById('done').style.display ='block';
            document.getElementById('init').style.display ='none';

            setTimeout(function () {
                alert('订单详情已经复制到粘贴板，您可以到Excel等应用中粘贴。'+ response.message);
            }, 500);
        }else{
            alert('订单获取失败。提示信息：' + response.message);
        }
    });
});


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.event == "processItem"){
            document.getElementById('orderId').innerText = request.orderId;
            document.getElementById('item').innerText = request.item;
        }

        sendResponse({success: true});
    });