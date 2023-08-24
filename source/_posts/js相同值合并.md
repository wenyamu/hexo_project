title: js相同值合并
author: ljs
abbrlink: 17c7b154
tags: []
categories:
  - js
date: 2022-01-17 15:54:00
---
数组对象相同值相加去重
<!-- more -->

```js
let arry=[
    {Code:'x',Quantity:1,ItemType:1},
    {Code:'x',Quantity:2,ItemType:2},
    {Code:'x',Quantity:5,ItemType:3},
    {Code:'y',Quantity:1,ItemType:4},
    {Code:'y',Quantity:2,ItemType:5},
    {Code:'z',Quantity:1,ItemType:6},
]

function SameObjValue(arry){
    var temp = {};
    for(var i in arry) {
        var key= arry[i].Code;
        if(temp[key]) {
            temp[key].Code = temp[key].Code;
            temp[key].Quantity = temp[key].Quantity + arry[i].Quantity;
            temp[key].ItemType = temp[key].ItemType + arry[i].ItemType;

         } else {
            temp[key] = {};
            temp[key].Code = arry[i].Code;
            temp[key].Quantity = arry[i].Quantity;
            temp[key].ItemType = arry[i].ItemType;
        }
    }
    let newfood = [];
    for(var k in temp){
       newfood.push(temp[k])
    }
    return newfood;
}
    console.log(SameObjValue(arry));
/*
[
  {Code: "x", Quantity: 8, ItemType: 6},
  {Code: "y", Quantity: 3, ItemType: 9},
  {Code: "z", Quantity: 1, ItemType: 6}
]
*/

// 更简洁的写法
var testArr = [
        { name: 'aa', num: 10, op: 10 },
        { name: 'aa', num: 20, op: 20 },
        { name: 'bb', num: 30, op: 30 },
        { name: 'cc', num: 10, op: 40 },
        { name: 'aa', num: 20, op: 50 },
        { name: 'bb', num: 10, op: 60 },
        { name: 'dd', num: 10, op: 70 }
    ];
/*
    delSameObjValue 数组对象相同值相加去重
    arr 需要处理的数组
    keyName 用于判断相同的键名
    keyValue 用于计算的键值
    */
    function delSameObjValue(arr, keyName, keyValue1, keyValue2) {
        let baseArr = [], newArr = [];
        for (let key in arr) {
            if (baseArr.includes(arr[key][keyName])) {
                newArr[baseArr.indexOf(arr[key][keyName])][keyValue1] += arr[key][keyValue1];
                newArr[baseArr.indexOf(arr[key][keyName])][keyValue2] += arr[key][keyValue2];
            } else {
                baseArr.push(arr[key][keyName]);
                newArr.push(arr[key]);
            }
        }
        return newArr;
    }
    console.log(delSameObjValue(testArr, 'name', 'num', 'op'));
/*
[
  {name: "aa", num: 50, op: 80},
  {name: "bb", num: 40, op: 90},
  {name: "cc", num: 10, op: 40},
  {name: "dd", num: 10, op: 70}
]

*/
```