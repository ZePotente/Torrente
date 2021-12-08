var http = require('http');
http.request('scan',resultado);

var elements = [];

for(var i in resultado)
    elements.push([i, resultado [i]]);

let ul = document.createElement("ul");
 
    if (elements && Array.isArray(elements)) {
        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            let li = document.createElement("li");
            let liText = document.createTextNode(element);
            li.appendChild(liText);
            ul.appendChild(li);
        }
    }
 
return ul;
