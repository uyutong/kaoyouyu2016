var audioRecord = "audio.wav";
var iosFileURL = "";
angular.module('dachutimes', ['ionic', 'ionic-pullup', 'jrCrop', 'ionic.closePopup', 'dachutimes.controllers'])

	.run(function($ionicPlatform, $http, $state, $rootScope, $ionicModal, $ionicPopup, $ionicLoading, $ionicActionSheet, $ionicHistory) {

		$rootScope.WEIXIN = {
			AppID: "wx63489880614d923b",
			AppSecret: "32ef6430ca95d2b706e6596cbe75a138"
		};
		//		$rootScope.rootUrl = "http://222.128.6.94:8090/";
		$rootScope.rootUrl = "http://api.kaouyu.com";
		$rootScope.headerUrl = "http://img.kaouyu.com/header/";
		$rootScope.wordRootUrl = "http://cet.kaouyu.com/index.php/api/";
		$rootScope.wordAudioUrl = "http://cet.kaouyu.com/upload/word/mp3/";
		$rootScope.speakSubmitUrl = "http://xx.kaouyu.com/index.php/api";
		$rootScope.exerciseAudioUrl = "http://source.efenji.com/item/audio/";
		$rootScope.bizUrl = "http://api.kaouyu.com/bizProd.php";
		$rootScope.sMp3 = "http://source.efenji.com/source/audio/";
		$rootScope.iMp3 = "http://source.efenji.com/item/audio/";
		$rootScope.img = "http://source.efenji.com/item/image/";
		$rootScope.exam = "http://download.kaouyu.com/examination";
		$ionicPlatform.ready(function() {
			initCordova();
			if($rootScope.isIOS) {
				document.addEventListener('deviceready', function() {
					iniFileSystem();
				}, false);
			}

		});

		InitIonic($rootScope, $ionicModal, $ionicPopup, $ionicLoading, $http, $state);

		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, error) {
			var v = document.getElementById("audio");
			v.pause();
			v.src = "";
		});

		//#region 初始化数据
		$rootScope.userinfo = getStorage("userinfo");
		//		$rootScope.userinfo = {
		//			"userId": "22781",
		//			"mobile": "13263266381",
		//			"point": "1910",
		//			"email": null,
		//			"nickName": "\u6d77\u9614\u5929\u7a7a",
		//			"fullName": null,
		//			"number": "110",
		//			"photo": "22781.png",
		//			"phone": null,
		//			"major": null,
		//			"classes": "",
		//			"descr": null,
		//			"regIp": "192.168.1.110",
		//			"clientId": "\u6682\u65e0\u4fe1\u606f",
		//			"token": null,
		//			"tokenTime": "0000-00-00 00:00:00",
		//			"tokenStatus": "0",
		//			"model": "\u6682\u65e0\u4fe1\u606f",
		//			"status": "0",
		//			"userName": null,
		//			"password": null,
		//			"gender": "Female",
		//			"schoolId": "191",
		//			"level": "1",
		//			"unionid": "ocffVt6ZE2o_Ybzs1_NbVTVsn5v4",
		//			"comeFrom": "0",
		//			"isConversion": "0",
		//			"regTime": "2016-04-18 12:03:38",
		//			"modifTime": "2017-06-07 11:06:39",
		//			"tiyanTime": "0000-00-00 00:00:00",
		//			"mobiletype": "1",
		//			"openid": "",
		//			"schoolName": "\u6ca7\u5dde\u5e08\u8303\u5b66\u9662",
		//			"level4": 1,
		//			"level6": 0
		//		}

		if(!$rootScope.userinfo) {
			$rootScope.userinfo = {};
		};

		//		$rootScope.KB = getStorage("KB");
		//		if(!$rootScope.KB || !$rootScope.KB.type) {
		//			$rootScope.KB = {
		//				"type": 0,
		//				"level": "0",
		//				tl: false,
		//				yd: false,
		//				fy: false,
		//				xz: false,
		//				date: formatDate(new Date())
		//			};
		//		};
		//		//#endregion

		//#region 通用方法

		//#region 返回
		$rootScope.back = function() {
			//			$ionicHistory.goBack();
			history.go(-1);
		}
		//#endregion

		//#region 获取听力习题
		$rootScope.tl = function() {

			var url = $rootScope.rootUrl + "/listening.php";
			var data = {
				"func": "getList",
				"unionid": $rootScope.userinfo.unionid,
				"fr": 1
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response && response.data.result) {
					$rootScope.TL = response.data;

					$rootScope.ResultCount = $rootScope.TL.result.length;
					$rootScope.ResultCurrent = 1;

					angular.forEach($rootScope.TL.result[0], function(data) {
						if(!isNaN(data.item_name.substr(0, 8))) {
							data.item_name = data.item_name.substr(0, 4) + '年' + data.item_name.substr(4, 2) + '月 第' + data.item_name.substr(6, 2) + '套 ' + data.item_name.substring(8);
						} else if(!isNaN(data.item_name.substr(0, 6))) {
							data.item_name = data.item_name.substr(0, 4) + '年' + data.item_name.substr(4, 2) + '月 ' + data.item_name.substring(6);
						}
					});

					$state.go("tf_tl", {
						id: 0
					});

					$rootScope.beginTestTime = new Date().getTime();
				} else {
					//#region 做完了所有习题
					$rootScope.Confirm("恭喜您已完成练习部分，是否要重新练习", "开始练习", "放弃练习", function() {
						var url = $rootScope.rootUrl + "/baseData.php";
						var data = {
							"func": "setLoopStart",
							"unionid": $rootScope.userinfo.unionid,
							"item_type": 1,
							"fr": 1
						};
						encode(data);

						$rootScope.LoadingShow();

						$http.post(url, data).success(function(response) {
							$rootScope.LoadingHide();

							$rootScope.tl();

						}).error(function(response, status) {
							$rootScope.LoadingHide();
							$rootScope.Alert('连接失败！[' + response + status + ']');
							return;
						});

					}, function() {});
					//#endregion
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		}
		//#endregion

		//#region 获取听力报告
		$rootScope.tl_report = function() {
			var url = $rootScope.rootUrl + "/listening.php";
			var data = {
				"func": "getReport",
				"unionid": $rootScope.userinfo.unionid,
				"fr": 1
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {

				$rootScope.LoadingHide();

				if(response && response.data.id) {
					$rootScope.TL_Report = response.data;

					$state.go("tf_report", {
						id: 'listening'
					});
				} else {
					$rootScope.Alert("获取数据失败，请稍后再试。");
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		}
		//#endregion

		//#region 获取阅读习题
		$rootScope.yd = function() {
			var url = $rootScope.rootUrl + "/read.php";
			var data = {
				"func": "getReadList",
				"unionid": $rootScope.userinfo.unionid,
				"fr": 1
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response && response.data.result) {
					$rootScope.YD = response.data;

					$rootScope.ResultCount = $rootScope.YD.result.length;
					$rootScope.ResultCurrent = 1;

					for(k = 0; k < $rootScope.YD.result.length; k++) {
						for(m = 0; m < $rootScope.YD.result[k].length; m++) {
							var yd = $rootScope.YD.result[k][m];

							//alert(JSON.stringify(yd));
							angular.forEach(yd.son, function(data) {
								var option_arr = [];

								if(data.option_list.substr(data.option_list.length - 2, 2) == "||") {
									data.option_list = data.option_list.substring(0, data.option_list.length - 2);
								}

								angular.forEach(data.option_list.split('||'), function(str) {
									//if ($rootScope.ResultCurrent == 3)
									{
										if(str.length < 2) {
											option_arr.push({
												"k": str,
												"v": ""
											});
										} else if(str.indexOf('(') == 0) {
											option_arr.push({
												"k": str.substring(1, 2),
												"v": str.substring(3)
											});
										} else {
											option_arr.push({
												"k": str.substring(0, 1),
												"v": str.substring(2)
											});
										}
									}
									//else
									//{
									//    option_arr.push({ "k": str.substring(0, 1), "v": str.substring(2) });
									//}
								});

								data.option_arr = option_arr;
							});

							if(yd.item_format == "8") {
								//alert(JSON.stringify(yd.son));

								var temp = yd.text.split("___");

								var s = "";

								for(i = 0; i < temp.length; i++) {
									if(s != "") {
										s += '<input type="text" class="dc-input" onclick="inputClick(' + i + ',this)" readonly="readonly" value="' + i + '" id="dc-input-' + i + '" />';
									}
									s += temp[i];
								}

								yd.text = s;
							}
						}
					}

					$state.go("tf_yd", {
						id: 0
					});

					$rootScope.beginTestTime = new Date().getTime();
				} else {
					//#region 做完了所有习题
					$rootScope.Confirm("恭喜您已完成练习部分，是否要重新练习", "开始练习", "放弃练习", function() {
						var url = $rootScope.rootUrl + "/baseData.php";
						var data = {
							"func": "setLoopStart",
							"unionid": $rootScope.userinfo.unionid,
							"item_type": 2,
							"fr": 1
						};
						encode(data);

						$rootScope.LoadingShow();

						$http.post(url, data).success(function(response) {
							$rootScope.LoadingHide();
							$rootScope.yd();

						}).error(function(response, status) {
							$rootScope.LoadingHide();
							$rootScope.Alert('连接失败！[' + response + status + ']');
							return;
						});

					}, function() {});
					//#endregion
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		}
		//#endregion

		//#region 获取阅读报告
		$rootScope.yd_report = function() {
			var url = $rootScope.rootUrl + "/read.php";
			var data = {
				"func": "getReport",
				"unionid": $rootScope.userinfo.unionid,
				"fr": 1
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response && response.data.id) {
					$rootScope.YD_Report = response.data;

					$state.go("tf_report", {
						id: 'reading'
					});
				} else {
					$rootScope.Alert("获取数据失败，请稍后再试。");
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		}
		//#endregion

		//#region 获取翻译习题
		$rootScope.fy = function() {
			var url = $rootScope.rootUrl + "/translation.php";
			var data = {
				"func": "getList",
				"unionid": $rootScope.userinfo.unionid,
				"fr": 1
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response && response.data.result) {
					$rootScope.FY = response.data;

					$rootScope.ResultCount = $rootScope.FY.result.length;
					$rootScope.ResultCurrent = 1;

					angular.forEach($rootScope.FY.result[0], function(data, index) {
						data.index = index;

						var option_arr = [];

						if(data.option_list.substr(data.option_list.length - 2, 2) == "||") {
							data.option_list = data.option_list.substring(0, data.option_list.length - 2);
						}

						angular.forEach(data.option_list.split('||'), function(str) {
							option_arr.push({
								"k": str.substring(0, 1),
								"v": str.substring(2)
							});
						});

						data.option_arr = option_arr;

						data.feedback = data.feedback.replace(/\n/g, "<br>");
					});

					$state.go("tf_fy", {
						id: 0
					});

					$rootScope.beginTestTime = new Date().getTime();
				} else {
					//#region 做完了所有习题
					$rootScope.Confirm("恭喜您已完成练习部分，是否要重新练习", "开始练习", "放弃练习", function() {
						var url = $rootScope.rootUrl + "/baseData.php";
						var data = {
							"func": "setLoopStart",
							"unionid": $rootScope.userinfo.unionid,
							"item_type": 4,
							"fr": 1
						};
						encode(data);

						$rootScope.LoadingShow();

						$http.post(url, data).success(function(response) {
							$rootScope.LoadingHide();

							$rootScope.fy();

						}).error(function(response, status) {
							$rootScope.LoadingHide();
							$rootScope.Alert('连接失败！[' + response + status + ']');
							return;
						});

					}, function() {});
					//#endregion
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		}
		//#endregion

		//#region 获取翻译报告
		$rootScope.fy_report = function() {
			var url = $rootScope.rootUrl + "/translation.php";
			var data = {
				"func": "getReport",
				"unionid": $rootScope.userinfo.unionid,
				"fr": 1
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response && response.data.id) {
					$rootScope.FY_Report = response.data;

					$state.go("tf_report", {
						id: 'translation'
					});
				} else {
					$rootScope.Alert("获取数据失败，请稍后再试。");
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		}
		//#endregion

		//#region 获取写作习题
		$rootScope.xz = function() {
			var url = $rootScope.rootUrl + "/write.php";
			var data = {
				"func": "getList",
				"unionid": $rootScope.userinfo.unionid,
				"fr": 1
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response && response.data.result) {
					$rootScope.XZ = response.data;

					$rootScope.ResultCount = $rootScope.XZ.result.length;
					$rootScope.ResultCurrent = 1;

					angular.forEach($rootScope.XZ.result[0], function(data, index) {
						data.index = index;

						var option_arr = [];

						if(data.option_list.substr(data.option_list.length - 2, 2) == "||") {
							data.option_list = data.option_list.substring(0, data.option_list.length - 2);
						}

						angular.forEach(data.option_list.split('||'), function(str) {
							option_arr.push({
								"k": str.substring(0, 1),
								"v": str.substring(2)
							});
						});

						data.option_arr = option_arr;

						data.stem_text = data.stem_text.replace(/\n/g, "<br>");
						data.feedback = data.feedback.replace(/\n/g, "<br>");
					});

					$state.go("tf_xz", {
						id: 0
					});

					$rootScope.beginTestTime = new Date().getTime();
				} else {
					//#region 做完了所有习题
					$rootScope.Confirm("恭喜您已完成练习部分，是否要重新练习", "开始练习", "放弃练习", function() {
						var url = $rootScope.rootUrl + "/baseData.php";
						var data = {
							"func": "setLoopStart",
							"unionid": $rootScope.userinfo.unionid,
							"item_type": 3,
							"fr": 1
						};
						encode(data);

						$rootScope.LoadingShow();

						$http.post(url, data).success(function(response) {
							$rootScope.LoadingHide();

							$rootScope.xz();

						}).error(function(response, status) {
							$rootScope.LoadingHide();
							$rootScope.Alert('连接失败！[' + response + status + ']');
							return;
						});

					}, function() {});
					//#endregion
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		}
		//#endregion

		//#region 获取写作报告
		$rootScope.xz_report = function() {
			var url = $rootScope.rootUrl + "/write.php";
			var data = {
				"func": "getReport",
				"unionid": $rootScope.userinfo.unionid,
				"fr": 1
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response && response.data.id) {
					$rootScope.XZ_Report = response.data;

					$state.go("tf_report", {
						id: 'writing'
					});
				} else {
					$rootScope.Alert("获取数据失败，请稍后再试。");
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		}
		//#endregion

		//#region 商城+订单
		$rootScope.productList = function(showOrder) {
			var url = $rootScope.rootUrl + "/bizProd.php";
			var data = {
				"func": "getBizProd",
				"unionid": $rootScope.userinfo.unionid
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response.flag == 1) {
					$rootScope.products = response.data;

					$rootScope.showOrder = showOrder;

					$state.go("me_products");
				} else {
					$rootScope.Alert("获取神器失败！");
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});

			//Get Orders
			var url = $rootScope.rootUrl + "/bizProd.php";
			var data = {
				"func": "getOrder",
				"unionid": $rootScope.userinfo.unionid
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response.flag == 1 && response.data && response.data.length > 0) {
					$rootScope.orders = response.data;
				} else {}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		};
		//#endregion

		//#region 查询订单
		$rootScope.orderquery = function(product, out_trade_no) {
			$http.get("http://api.myechinese.com/wxpay.php?func=orderquery&out_trade_no=" + out_trade_no).success(function(response) {
				if(response.return_code == "SUCCESS" && response.transaction_id) {
					var url = $rootScope.rootUrl + "/bizProd.php";
					var data = {
						"func": "orderPay",
						"prodid": product.prodid,
						"orderid": out_trade_no,
						"pay_orderid": response.transaction_id,
						"validity": 180,
						"payway": 3,
						"unionid": $rootScope.userinfo.unionid
					};
					encode(data);

					$rootScope.LoadingShow();

					time_end = response.time_end;

					$http.post(url, data).success(function(response) {
						$rootScope.LoadingHide();

						$rootScope.returnOrder = {
							product_name: product.product_name,
							out_trade_no: out_trade_no,
							price: product.price,
							time_end: time_end.substr(0, 4) + "-" + time_end.substr(4, 2) + "-" + time_end.substr(6, 2) + " " + time_end.substr(8, 2) + ":" + time_end.substr(10, 2) + ":" + time_end.substr(12, 2)
						};

						$state.go("success");

					}).error(function(response, status) {
						$rootScope.LoadingHide();
						$rootScope.Alert('连接失败！[' + response + status + ']');
						return;
					});
				} else {
					//$rootScope.Alert('支付未完成！');
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		}
		//#endregion

		//#region 获取模考结果
		$rootScope.mk_report = function(paperid, i) {
			var url = $rootScope.rootUrl + "/examination.php";
			var data = {
				"func": "getReport",
				"level": $rootScope.userinfo.level,
				"unionid": $rootScope.userinfo.unionid,
				"paperid": paperid,
				"fr": 1
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response && response.data && response.data.id) {
					$rootScope.MK_Report = response.data;

					$state.go("mk_report", {
						id: i
					});
				} else {
					$rootScope.Alert("获取数据失败");
				}
			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});

		}
		//#endregion

		//#region 更新用户状态
		$rootScope.updateUserInfo = function() {
			var url = $rootScope.rootUrl + "/userinfo.php";
			var data = {
				"func": "getUserInfo",
				"unionid": $rootScope.userinfo.unionid
			};
			encode(data);

			$http.post(url, data).success(function(response) {
				if(response.data && response.data.userId) {
					$rootScope.userinfo = response.data;

					if($rootScope.unionid) {
						$rootScope.userinfo.unionid = $rootScope.unionid;
					}

					setStorage("userinfo", angular.copy($rootScope.userinfo));
				}

			});
		}
		//#endregion

		//#region 获取要学习的单词
		$rootScope.wordGet = function() {

			//暂定为非激活用户扔烤箱数大于3个提示去购买验证码 
			if($rootScope.word_plan.throw_away && parseInt($rootScope.word_plan.throw_away) > 3) {
				if($rootScope.userinfo.level == 1 && $rootScope.userinfo.level4 == 0) {
					$state.go("me_qrcode");
					return;
				}
				if($rootScope.userinfo.level == 2 && $rootScope.userinfo.level6 == 0) {
					$state.go("me_qrcode");
					return;
				}
			}

			$rootScope.LoadingShow();
			var url = $rootScope.wordRootUrl + "word_get";
			var data = {
				"unionid": $rootScope.userinfo.unionid,
				"level": $rootScope.userinfo.level
			};
			$.post(url, data, function(response) {
				$rootScope.LoadingHide();
				if(response) {
					$rootScope.vocabularys = response;
					$state.go("kc_main", {
						id: 0
					});
				} else {
					$rootScope.Alert("获取词汇失败");
				}
			}, "json")

		}
		//		//#region 获取十个要学习的词汇
		//		$rootScope.getVocabulary = function() {
		//			$rootScope.LoadingShow();
		//			var url = $rootScope.rootUrl + "learn/getvocabulary";
		//			var data = {
		//				"uid": $rootScope.userinfo.uid
		//			};
		//			$.post(url, data, function(response) {
		//				$rootScope.LoadingHide();
		//				if(response && response.status == 200) {
		//
		//					//保存刚开始获取的八个词汇 后面的操作在此变量上进行
		//					$rootScope.vocabularys = response.data;
		//
		//					//保存刚开始获取的八个词汇 后面的操作不在此变量上进行 目的是 获取八个真题的时候使用
		//					$rootScope.original_vocabularys = angular.copy($rootScope.vocabularys);
		//
		//					$state.go("kc_main", {
		//						id: 0
		//					});
		//				} else {
		//					$rootScope.Alert("获取词汇失败");
		//				}
		//			}, "json")
		//
		//		}
		//		//#endregion

		$rootScope.favorite = function(word_id, category_id, callback) {
			$rootScope.LoadingShow();
			var url = $rootScope.wordRootUrl + "word_operate";
			var data = {
				"action": "favorite",
				"unionid": $rootScope.userinfo.unionid,
				"word_id": word_id,
				"category_id": category_id,
			}
			$.post(url, data, function(response) {
				$rootScope.LoadingHide();
				callback(response);
			}, "json")
		}

		$rootScope.remove_favorite = function(word_id, category_id, callback) {
			$rootScope.LoadingShow();
			var url = $rootScope.wordRootUrl + "word_operate";
			var data = {
				"action": "remove_favorite",
				"unionid": $rootScope.userinfo.unionid,
				"word_id": word_id,
				"category_id": category_id,
			}
			$.post(url, data, function(response) {
				$rootScope.LoadingHide();
				callback(response);
			}, "json")
		}

		$rootScope.root_throw = function(word_id, category_id, callback) {
			$rootScope.LoadingShow();
			var url = $rootScope.wordRootUrl + "word_operate";
			var data = {
				"action": "throw",
				"unionid": $rootScope.userinfo.unionid,
				"word_id": word_id,
				"category_id": category_id,
			}
			$.post(url, data, function(response) {
				$rootScope.LoadingHide();
				//记录每天扔烤箱单词多少个
				if(response.error == 0) {
					var date = new Date();
					if(getStorage("" + formatDate2(date), true) == "") {
						setStorage("" + formatDate2(date), 1, false);
					} else {
						setStorage("" + formatDate2(date), parseInt(getStorage("" + formatDate2(date), true)) + 1, false);
					}
					$rootScope.throwed_num = parseInt(getStorage("" + formatDate2(date), true));
				}
				callback(response);
			}, "json")
		}

		$rootScope.wordSearch = function(word_spell) {
			$rootScope.LoadingShow();
			var url = $rootScope.wordRootUrl + "word_item";
			var data = {
				"unionid": $rootScope.userinfo.unionid,
				"level": $rootScope.userinfo.level,
				"word": word_spell
			}
			$.post(url, data, function(response) {
				$rootScope.LoadingHide();
				//记录每天扔烤箱单词多少个
				if(response.error) {
					return;
				} else {
					$rootScope.rootvoc = response;
					$state.go("kc_word_detail");
				}
			}, "json")
		}

		$rootScope.goDcKcHome = function() {
			$state.go("dc_tab.kc_home");
		}

		$rootScope.playAudio = function(src, obj) {

			var my_media = new Media(src, function() {
					console.log("playAudio():Audio Success");
					obj.attr("src", "img/dc/icon-play-false.png");
				},
				// error callback
				function(err) {
					alert('code:' + error.code + '\n' + 'message:' + error.message + '\n');
				});
			my_media.play();
			obj.attr("src", "img/dc/playing.gif");

			//			if(mediaTimer == null) {
			//				mediaTimer = setInterval(function() {
			//					my_media.getCurrentPosition(
			//						//成功回调  
			//						function(position) {
			//							if(position > -1) {
			//								setAudioPosition((position / 1000) + "sec");
			//							}
			//						},
			//						//错误回调  
			//						function(e) {
			//							console.log("Error getting pos=" + e);
			//							setAudioPosition("Error: " + e);
			//						}
			//					);
			//				}, 1000);
			//			}
		}

		document.addEventListener("resume", function() {
			$rootScope.updateUserInfo();

			$http.get("http://xx.kaouyu.com/index.php/api/version?platform=ios&book_id=48").success(function(response) {
				if(response == "1" && $rootScope.userinfo.userId == "22781") {
					setStorage("userinfo", null);
					setStorage("KB", null);
					$state.go("login");
				}
			});

		}, false);

		$http.get("http://xx.kaouyu.com/index.php/api/version?platform=ios&book_id=48").success(function(response) {
			if(response.status == "0") {
				
				$rootScope.userinfo = {
					"userId": "22781",
					"mobile": "13263266381",
					"point": "1910",
					"email": null,
					"nickName": "\u6d77\u9614\u5929\u7a7a",
					"fullName": null,
					"number": "110",
					"photo": "22781.png",
					"phone": null,
					"major": null,
					"classes": "",
					"descr": null,
					"regIp": "192.168.1.110",
					"clientId": "\u6682\u65e0\u4fe1\u606f",
					"token": null,
					"tokenTime": "0000-00-00 00:00:00",
					"tokenStatus": "0",
					"model": "\u6682\u65e0\u4fe1\u606f",
					"status": "0",
					"userName": null,
					"password": null,
					"gender": "Female",
					"schoolId": "191",
					"level": "2",
					"unionid": "ocffVt6ZE2o_Ybzs1_NbVTVsn5v4",
					"comeFrom": "0",
					"isConversion": "0",
					"regTime": "2016-04-18 12:03:38",
					"modifTime": "2017-06-07 11:06:39",
					"tiyanTime": "0000-00-00 00:00:00",
					"mobiletype": "1",
					"openid": "",
					"schoolName": "\u6ca7\u5dde\u5e08\u8303\u5b66\u9662",
					"level4": 1,
					"level6": 1
				}

				$state.go("tab.tf_home");
			}

		})

		var ua = navigator.userAgent;
		$rootScope.isIOS = ua.match(/(iPhone|iPod|iPad)/);
		$rootScope.isAndroid = ua.match(/Android/);

		//#region 创建临时文件
		function iniFileSystem() {
			window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, gotFS, fail);
		}

		function gotFS(fileSystem) {
			fileSystem.root.getFile(audioRecord, {
				create: true,
				exclusive: false
			}, gotFileEntry, fail);
		}

		function gotFileEntry(fileEntry) {
			iosFileURL = fileEntry.toURL();

			console.log(iosFileURL);
		}

		function fail() {
			console.log("------error-------");
		}
		//#endregion

		//#endregion
	})

	.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
		$ionicConfigProvider.views.swipeBackEnabled(false);

		$stateProvider

			//#region 基本

			//#region tab
			.state('tab', {
				url: "/tab",
				abstract: true,
				templateUrl: "templates/tab.html",
				controller: 'tabCtrl'
			})
			//#endregion

			//#region tab
			.state('dc_tab', {
				url: "/dc_tab",
				abstract: true,
				templateUrl: "templates/dc_tab.html",
				controller: 'dc_tabCtrl'
			})
			//#endregion

			//#region school
			.state('school_abc', {
				url: '/school_abc',
				templateUrl: 'templates/school_abc.html',
				controller: 'school_abcCtrl'
			})

			.state('school', {
				url: '/school',
				templateUrl: 'templates/school.html',
				controller: 'schoolCtrl'
			})
			//#endregion

			//#endregion

			//#region 登陆
			.state('login', {
				url: '/login',
				templateUrl: 'templates/login.html',
				controller: 'loginCtrl'
			})

			.state('bind_mobile', {
				cache: false,
				url: '/bind_mobile',
				templateUrl: 'templates/bind_mobile.html',
				controller: 'bind_mobileCtrl'
			})
			//#endregion

			//#region 我的
			.state('tab.me_home', {
				cache: false,
				url: '/me_home',
				views: {
					'tab-me': {
						templateUrl: 'templates/me_home.html',
						controller: 'me_homeCtrl'
					}
				}
			})

			.state('me_point', {
				url: '/me_point',
				templateUrl: 'templates/me_point.html'
			})

			.state('me_info', {
				url: '/me_info',
				templateUrl: 'templates/me_info.html',
				controller: 'me_infoCtrl'
			})

			.state('me_about', {
				url: '/me_about',
				templateUrl: 'templates/me_about.html'
			})

			.state('me_setting', {
				url: '/me_setting',
				templateUrl: 'templates/me_setting.html',
				controller: 'me_settingCtrl'
			})

			.state('me_products', {
				url: '/me_products',
				templateUrl: 'templates/me_products.html',
				controller: 'me_productsCtrl'
			})

			.state('me_product', {
				url: '/me_product',
				templateUrl: 'templates/me_product.html',
				controller: 'me_productCtrl'
			})

			.state('me_cart', {
				url: '/me_cart',
				templateUrl: 'templates/me_cart.html',
				controller: 'me_cartCtrl'
			})

			.state('me_address', {
				url: '/me_address',
				templateUrl: 'templates/me_address.html',
				controller: 'me_addressCtrl'
			})

			.state('me_kb_intro', {
				url: '/me_kb_intro',
				templateUrl: 'templates/me_kb_intro.html',
				controller: 'me_kb_introCtrl'
			})

			.state('me_kb_status', {
				url: '/me_kb_status',
				templateUrl: 'templates/me_kb_status.html',
				controller: 'me_kb_statusCtrl'
			})

			.state('me_list_main', {
				url: '/me_list_main',
				templateUrl: 'templates/me_list_main.html',
				controller: 'me_list_mainCtrl'
			})

			.state('me_list_sub', {
				url: '/me_list_sub',
				templateUrl: 'templates/me_list_sub.html',
				controller: 'me_list_subCtrl'
			})

			//#region 听力
			.state('me_list_tl', {
				cache: false,
				url: '/me_list_tl/:id',
				params: {
					sonIndex: 0
				},
				templateUrl: 'templates/me_list_tl.html',
				controller: 'me_list_tlCtrl'
			})
			//#endregion

			//#region 阅读
			.state('me_list_yd', {
				cache: false,
				url: '/me_list_yd/:id',
				params: {
					sonIndex: 0
				},
				templateUrl: 'templates/me_list_yd.html',
				controller: 'me_list_ydCtrl'
			})
			//#endregion

			//#region 写作
			.state('me_list_xz', {
				cache: false,
				url: '/me_list_xz/:id',
				templateUrl: 'templates/me_list_xz.html',
				controller: 'me_list_xzCtrl'
			})
			//#endregion

			//#region 翻译
			.state('me_list_fy', {
				cache: false,
				url: '/me_list_fy/:id',
				templateUrl: 'templates/me_list_fy.html',
				controller: 'me_list_fyCtrl'
			})
			//#endregion

			.state('me_qrcode', {
				url: '/me_qrcode',
				templateUrl: 'templates/me_qrcode.html',
				controller: 'me_qrcodeCtrl'
			})

			//#endregion

			//#region 提分

			//#region 公用
			.state('tab.tf_home', {
				cache: false,
				url: '/tf_home',
				views: {
					'tab-tf': {
						templateUrl: 'templates/tf_home.html',
						controller: 'tf_homeCtrl'
					}
				}
			})

			.state('tf_first', {
				cache: false,
				url: '/tf_first/:id',
				templateUrl: 'templates/tf_first.html',
				controller: 'tf_firstCtrl'
			})

			.state('tf_submit', {
				cache: false,
				url: '/tf_submit/:id',
				templateUrl: 'templates/tf_submit.html',
				controller: 'tf_submitCtrl'
			})

			.state('tf_report', {
				cache: false,
				url: '/tf_report/:id',
				templateUrl: 'templates/tf_report.html',
				controller: 'tf_reportCtrl'
			})
			//#endregion

			//#region 听力
			.state('tf_tl', {
				cache: false,
				url: '/tf_tl/:id',
				params: {
					sonIndex: 0
				},
				templateUrl: 'templates/tf_tl.html',
				controller: 'tf_tlCtrl'
			})
			//#endregion

			//#region 阅读
			.state('tf_yd', {
				cache: false,
				url: '/tf_yd/:id',
				params: {
					sonIndex: 0
				},
				templateUrl: 'templates/tf_yd.html',
				controller: 'tf_ydCtrl'
			})
			//#endregion

			//#region 翻译
			.state('tf_fy', {
				cache: false,
				url: '/tf_fy/:id',
				templateUrl: 'templates/tf_fy.html',
				controller: 'tf_fyCtrl'
			})
			//#endregion

			//#region 写作
			.state('tf_xz', {
				cache: false,
				url: '/tf_xz/:id',
				templateUrl: 'templates/tf_xz.html',
				controller: 'tf_xzCtrl'
			})
			//#endregion

			//#region 微课
			.state('tab.wk_home', {
				cache: false,
				url: '/wk_home',
				views: {
					'tab-wk': {
						templateUrl: 'templates/wk_home.html',
						controller: 'wk_homeCtrl'
					}
				}
			})
			//#endregion

			//#region 订阅
			.state('tab.dy_home', {
				cache: false,
				url: '/dy_home',
				views: {
					'tab-dy': {
						templateUrl: 'templates/dy_home.html',
						controller: 'dy_homeCtrl'
					}
				}
			})
			//#endregion

			//#region 模考
			.state('tab.mk_home', {
				cache: false,
				url: '/mk_home',
				views: {
					'tab-mk': {
						templateUrl: 'templates/mk_home.html',
						controller: 'mk_homeCtrl'
					}
				}
			})

			.state('mk_detail', {
				cache: false,
				url: '/mk_detail/:id',
				templateUrl: 'templates/mk_detail.html',
				controller: 'mk_detailCtrl'
			})

			.state('mk_report', {
				cache: false,
				url: '/mk_report/:id',
				templateUrl: 'templates/mk_report.html',
				controller: 'mk_reportCtrl'
			})

			.state('mk_tl', {
				cache: false,
				url: '/mk_tl/:id',
				params: {
					sonIndex: 0
				},
				templateUrl: 'templates/mk_tl.html',
				controller: 'mk_tlCtrl'
			})

			.state('mk_yd', {
				cache: false,
				url: '/mk_yd/:id',
				params: {
					sonIndex: 0
				},
				templateUrl: 'templates/mk_yd.html',
				controller: 'mk_ydCtrl'
			})
			//#endregion

			//#region 烤词
			.state('dc_tab.kc_home', {
				cache: false,
				url: '/kc_home',
				views: {
					'dc-tab-kc': {
						templateUrl: 'templates/kc_home.html',
						controller: 'kc_homeCtrl'
					}
				}
			})
			//#endregion

			//#region 烤词根
			.state('dc_tab.kcg_home', {
				cache: false,
				url: '/kcg_home',
				views: {
					'dc-tab-kcg': {
						templateUrl: 'templates/kcg_home.html',
						controller: 'kcg_homeCtrl'
					}
				}
			})
			//#endregion

			//#region 计划
			.state('jh_setting', {
				cache: false,
				url: '/jh_setting',
				templateUrl: 'templates/jh_setting.html',
				controller: 'jh_settingCtrl'
			})

			.state('jh_result', {
				cache: false,
				url: '/jh_result',
				templateUrl: 'templates/jh_result.html',
				controller: 'jh_resultCtrl'
			})
			//#endregion

			.state('kc_quote', {
				url: '/kc_quote',
				templateUrl: 'templates/kc_quote.html',
				controller: 'kc_quoteCtrl'
			})

			.state('kc_main', {
				cache: false,
				url: '/kc_main/:id',
				templateUrl: 'templates/kc_main.html',
				controller: 'kc_mainCtrl'
			})
			//小测
			.state('kc_stest', {
				cache: false,
				url: '/kc_stest/:id',
				templateUrl: 'templates/kc_stest.html',
				controller: 'kc_stestCtrl'
			})
			//拼写
			.state('kc_word', {
				cache: false,
				url: '/kc_word/:audio/:letters/:word',
				templateUrl: 'templates/kc_word.html',
				controller: 'kc_wordCtrl'
			})

			//炼句
			.state('kc_sentence', {
				cache: false,
				url: '/kc_sentence/:word/:sentence_en/:sentence_zh',
				templateUrl: 'templates/kc_sentence.html',
				controller: 'kc_sentenceCtrl'
			})

			//炼句
			.state('kc_speak', {
				cache: false,
				url: '/kc_speak/:word/:audio/:yb',
				templateUrl: 'templates/kc_speak.html',
				controller: 'kc_speakCtrl'
			})

			//烤词记录id 3 错题本id 1 收藏夹id 0
			.state('kc_record', {
				cache: false,
				url: '/kc_record/:id',
				templateUrl: 'templates/kc_record.html',
				controller: 'kc_recordCtrl'
			})

			.state('kc_phrase', {
				cache: false,
				url: '/kc_phrase',
				templateUrl: 'templates/kc_phrase.html',
				controller: 'kc_phraseCtrl'
			})

			.state('kc_tip', {
				url: '/kc_tip',
				templateUrl: 'templates/kc_tip.html',
				controller: 'kc_tipCtrl'
			})

			.state('kc_challenge', {
				cache: false,
				url: '/kc_challenge/:id/:type',
				templateUrl: 'templates/kc_challenge.html',
				controller: 'kc_challengeCtrl'
			})

			.state('kc_word_detail', {
				cache: false,
				url: '/kc_word_detail',
				templateUrl: 'templates/kc_word_detail.html',
				controller: 'kc_word_detailCtrl'
			})

			.state('kc_voctest', {
				cache: false,
				url: '/kc_voctest/:id',
				templateUrl: 'templates/kc_voctest.html',
				controller: 'kc_voctestCtrl'
			})

			.state('kcg_list', {
				cache: false,
				url: '/kcg_list/:id',
				templateUrl: 'templates/kcg_list.html',
				controller: 'kcg_listCtrl'
			})

			.state('kcg_exercise', {
				cache: false,
				url: '/kcg_exercise/:id',
				templateUrl: 'templates/kcg_exercise.html',
				controller: 'kcg_exerciseCtrl'
			})

		var userinfo = getStorage("userinfo");

		//		var userinfo = {
		//			"userId": "22781",
		//			"mobile": "13263266381",
		//			"point": "1910",
		//			"email": null,
		//			"nickName": "\u6d77\u9614\u5929\u7a7a",
		//			"fullName": null,
		//			"number": "110",
		//			"photo": "22781.png",
		//			"phone": null,
		//			"major": null,
		//			"classes": "",
		//			"descr": null,
		//			"regIp": "192.168.1.110",
		//			"clientId": "\u6682\u65e0\u4fe1\u606f",
		//			"token": null,
		//			"tokenTime": "0000-00-00 00:00:00",
		//			"tokenStatus": "0",
		//			"model": "\u6682\u65e0\u4fe1\u606f",
		//			"status": "0",
		//			"userName": null,
		//			"password": null,
		//			"gender": "Female",
		//			"schoolId": "191",
		//			"level": "2",
		//			"unionid": "ocffVt6ZE2o_Ybzs1_NbVTVsn5v4",
		//			"comeFrom": "0",
		//			"isConversion": "0",
		//			"regTime": "2016-04-18 12:03:38",
		//			"modifTime": "2017-06-07 11:06:39",
		//			"tiyanTime": "0000-00-00 00:00:00",
		//			"mobiletype": "1",
		//			"openid": "",
		//			"schoolName": "\u6ca7\u5dde\u5e08\u8303\u5b66\u9662",
		//			"level4": 1,
		//			"level6": 0
		//		}

		if(userinfo && userinfo.userId) {
			$urlRouterProvider.otherwise('/tab/tf_home');
		} else {
			$urlRouterProvider.otherwise('/login');
		}
	});

//#region Init Cordova 
function initCordova() {
	if(window.cordova && window.cordova.plugins.Keyboard) {
		cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
		cordova.plugins.Keyboard.disableScroll(true);
	};
	if(window.StatusBar) {
		StatusBar.styleDefault();
	};
};
//#endregion

//#region Init Ionic
function InitIonic($rootScope, $ionicModal, $ionicPopup, $ionicLoading, $http, $state, IonicClosePopupService) {
	$rootScope.LoadingShow = function(t) {
		$ionicLoading.show({
			template: '<ion-spinner icon="spiral"></ion-spinner>'
		});
	};

	$rootScope.LoadingHide = function() {
		$ionicLoading.hide();
	};

	$rootScope.Alert = function(msg, okFunc) {
		var alertPopup = $ionicPopup.alert({
			template: msg,
			okText: '确定',
			okType: 'button-clear button-calm',
			cssClass: 'dc-popup'
		});

		if(okFunc) {
			alertPopup.then(function(res) {
				okFunc();
			});
		}
	};

	$rootScope.Confirm = function(msg, okText, cancelText, okFunc, cancelFunc) {
		var confirmPopup = $ionicPopup.confirm({
			template: msg,
			okText: (cancelText ? cancelText : '取消'),
			okType: 'button-clear button-calm',
			cancelText: (okText ? okText : '确定'),
			cancelType: 'button-clear button-calm',
			cssClass: 'dc-popup'
		});
		confirmPopup.then(function(res) {
			if(res) {
				cancelFunc();
			} else {
				okFunc();
			}
		});
	};

	$rootScope.Tip = function(title, body) {
		var alertPopup = $ionicPopup.alert({
			title: title,
			template: body,
			cssClass: 'dc-tip'
		});

		IonicClosePopupService.register(alertPopup);
	};

	$rootScope.playWord = function(audio_url, obj) {
		var v = document.getElementById("audio");
		v.src = audio_url;
		v.loop = false;
		v.addEventListener('ended', function() {
			obj.attr("src", "img/dc/icon-play-false.png");
		}, false);
		v.addEventListener('error', function(e) {}, false)
		v.play();
		obj.attr("src", "img/dc/playing.gif");
	}

};
//#endregion

//#region localStorage
function setStorage(key, value, isString) {
	if(isString) {
		window.localStorage[key] = value;
	} else {
		window.localStorage[key] = JSON.stringify(value);
	}
};

function getStorage(key, isString) {
	if(isString) {
		return window.localStorage[key] || '';
	} else {
		return JSON.parse(window.localStorage[key] || '{}');
	}
};
//#endregion

//#region img => base64
function convertImgToBase64(url, callback, outputFormat) {
	var canvas = document.createElement('CANVAS'),
		ctx = canvas.getContext('2d'),
		img = new Image;
	img.crossOrigin = 'Anonymous';
	img.onload = function() {
		canvas.height = img.height;
		canvas.width = img.width;
		ctx.drawImage(img, 0, 0);
		var dataURL = canvas.toDataURL(outputFormat || 'image/png');
		callback.call(this, dataURL);
		canvas = null;
	};
	img.src = url;
};

function dataURLtoBlob(dataurl) {
	var arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while(n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], {
		type: mime
	});
}
//#endregion

//#region Common
function formatTime(second) {
	//HH:mm:ss
	//return [parseInt(second / 60 / 60), second / 60 % 60, second % 60].join(":").replace(/\b(\d)\b/g, "0$1");

	//mm:ss
	return [parseInt(second / 60), (second % 60).toFixed(0)].join(":").replace(/\b(\d)\b/g, "0$1");
}

function formatDate(strTime) {
	var date = new Date(strTime);
	return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

function formatDate2(date) {
	return date.getFullYear() + "" + (date.getMonth() + 1) + "" + date.getDate();
}

function returnDay(s) {
	s = s * 1000 - new Date().getTime();
	return parseInt(s / 1000 / 60 / 60 / 24);
}

function encode(data) {
	var d = (new Date()).getTime();
	//var r = /\d{3}$/.exec(+new Date() + '');
	var r = "123"
	data["r"] = r;
	data["date"] = d;
	data["passwordCode"] = hex_md5(r + SHA1("YouYuTong2015") + d);

}

function versionId(v) {
	if(!v) {
		return 0;
	} else {
		v = v.replace(/\./g, '');

		return parseFloat(v);
	}
}

var slideIndex = 0;

function inputClick(i, el) {
	slideIndex = i - 1;

	$(".dc-input").removeClass("activated");
	$(el).addClass("activated");

	$("#btnSlide").click();
}

function getAvg(arr) {
	var s = 0;
	for(i = 0; i < arr.length; i++) {
		s += arr[i];
	}
	return s / arr.length;
}

/**
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * 例子：
 * (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 * (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
 * @param fmt string
 * @return string
 * */
Date.prototype.format = function(fmt) { //author: meizz
	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"h+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		"S": this.getMilliseconds() //毫秒
	};
	if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

function getDate(tm) {
	var tt = new Date(parseInt(tm)).format('yyyy-MM-dd');
	return tt;
}

//JS判断数组中是否包含某一项
Array.prototype.contains = function(obj) {
	var i = this.length;
	while(i--) {
		if(this[i] === obj) {
			return true;
		}
	}
	return false;
}

//去左右空格;
function trim(s) {
	return s.replace(/(^\s*)|(\s*$)/g, "");
}

//获取文本宽度
function textWidth(text) {
	var sensor = $('<pre>' + text + '</pre>').css({
		display: 'none'
	});
	$('body').append(sensor);
	var width = sensor.width();
	sensor.remove();
	return width;
};
//生成长度为10的随机字符串 to string 2-36
function random() {
	return Math.random().toString(36).substring(2, 12);
}
//#endregion