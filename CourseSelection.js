/*
	// @name         山东大学选课脚本
	// @version      0.1.2
	// @description  提供课程号与课序号，自动挂机选课
	// @author       德布罗煜(シエラ)
	// @match        http://bkjwxk.sdu.edu.cn/f/common/main
	// @update       加入了自动终止的功能，减少不必要的访问
*/

var kch = []; // 课程号
var kxh = []; // 课序号
var frequency = 300; // Interval频率，单位ms，默认300ms，可自行修改

var page = []; // 用来储存所需课程所在页码
var pageIndex = []; // 用来储存所需课程所在页的索引
var searchInterval, selectInterval; // 搜索循环， 选课循环
var pagenum = 0;
var num = 0;
var hasSearched = 0; // 已查找到的课程数
var hasSelected = 0; // 已选择的课程数

function search() {
	$.ajax({
		type: "POST",
		url: "/b/xk/xs/kcsearch",
		data: {
			type: "kc",
			currentPage: pagenum,
			kch: "",
			jsh: "",
			skxq: "",
			skjc: "",
			kkxsh: ""
		},
		success(msg) {
			var testlist = msg.object.resultList;
			for (var j = 0; j < msg.object.resultList.length; j++) {
				for (var k = 0; k < kch.length; k++) {
					if (testlist[j].KCH == kch[k] && testlist[j].KXH == kxh[k]) {
						page.push(msg.object.currentPage)
						pageIndex.push(j)
						console.log("您所选择的课程：" + testlist[j].KCM + " 在第 " + msg.object.currentPage + " 页的第 " + j + "项");
						hasSearched++;
					}
				}
			}
			if (msg.object.currentPage == msg.object.totalPages || hasSearched == kch.length) {
				clearInterval(searchInterval);
				console.log('查找完毕');
				selectInterval = setInterval(select, frequency);
			}
		}
	});
	pagenum++;
}
searchInterval = setInterval(search, 100);

function select() {
	$.ajax({
		type: "POST",
		url: "/b/xk/xs/kcsearch",
		data: {
			type: "kc",
			currentPage: page[num],
			kch: "",
			jsh: "",
			skxq: "",
			skjc: "",
			kkxsh: ""
		},
		success(msg) {
			var result = msg.object.resultList[pageIndex[num]];
			num++;
			if (num == page.length) {
				num = 0;
			};
			if (result.kyl > 0) {
				var url = "/b/xk/xs/add/" + result.KCH + "/" + result.KXH;
				$.ajax({
					type: "POST",
					url: url,
					success(msg) {
						if (msg.result == "success") {
							hasSelected++;
						}
						console.log(msg.msg);
					}
				});
			} else {
				console.log(result.KCM + " 目前暂无课余量")
			}
			if (hasSelected == kch.length) {
				clearInterval(selectInterval);
			}
		}
	});
}
