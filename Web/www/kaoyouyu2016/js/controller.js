angular.module('dachutimes.controllers', [])

	//#region tab
	.controller('tabCtrl', function($rootScope, $scope, $state, $http, $ionicActionSheet) {

	})
	//#endregion

	//#region tab
	.controller('dc_tabCtrl', function($rootScope, $scope, $state, $http, $ionicActionSheet) {

	})
	//#endregion

	//#region school

	.controller('school_abcCtrl', function($rootScope, $scope, $state, $http) {
		$scope.getSchool = function(w) {
			var url = $rootScope.rootUrl + "/baseData.php";
			var data = {
				"func": "getSchoolList",
				"letter": w
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response.data) {
					$rootScope.schools = response.data;
					$state.go("school");
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		}
	})

	.controller('schoolCtrl', function($rootScope, $scope, $state) {
		$scope.chooseSchool = function(school) {
			$rootScope.userinfo.schoolId = school.schoolId;
			$rootScope.userinfo.schoolName = school.schoolName;
			$state.go("me_info");
		}
	})

	//#endregion

	//#region 登陆
	.controller('loginCtrl', function($rootScope, $scope, $state, $http, $interval) {
		$scope.userinfo = {
			"mobile": "",
			"code": "",
			"buttonText": "获取验证码"
		};

		$scope.getCode = function() {
			if($scope.userinfo.buttonText == "获取验证码") {
				if($scope.userinfo.mobile == "" || $scope.userinfo.mobile.length != 11) {
					$rootScope.Alert("手机号错误！");
				} else {
					//#region 按钮倒计时
					var second = 60;

					var timer = $interval(function() {
						second--;

						if(second <= -1) {
							$interval.cancel(timer);
							second = 60;
							$scope.userinfo.buttonText = "获取验证码";
						} else {
							$scope.userinfo.buttonText = second + "s";
						}

					}, 1000, 100);
					//#endregion

					//#region 发送短信
					var url = $rootScope.rootUrl + "/userinfo.php";
					var data = {
						"func": "sendCode",
						"mobile": $scope.userinfo.mobile,
						"fr": 1
					};
					encode(data);

					$rootScope.LoadingShow();

					$http.post(url, data).success(function(response) {
						$rootScope.LoadingHide();

						//alert(JSON.stringify(response));

					}).error(function(response, status) {
						$rootScope.LoadingHide();
						$rootScope.Alert('连接失败！[' + response + status + ']');
						return;
					});
					//#endregion
				}
			}
		}

		$scope.login = function() {
			if($scope.userinfo.mobile == "" || $scope.userinfo.mobile.length != 11) {
				$rootScope.Alert("手机号错误！");
			} else if($scope.userinfo.code == "") {
				$rootScope.Alert("验证码错误！");
			} else {
				$rootScope.LoadingShow();

				//#region  66666666666/6666 预留给苹果审核人员用
				if($scope.userinfo.mobile == "66666666666" && $scope.userinfo.code == "6666") {
					$rootScope.userinfo.unionid = "#" + $scope.userinfo.mobile;
					$rootScope.userinfo.photo = "img/logo.png";
					$rootScope.userinfo.nickName = $scope.userinfo.mobile;
					//#region 获取用户信息
					var url = $rootScope.rootUrl + "/userinfo.php";
					var data = {
						"func": "getUserInfo",
						"unionid": $rootScope.userinfo.unionid
					};
					encode(data);

					$http.post(url, data).success(function(response) {
						$rootScope.LoadingHide();

						if(response.data && response.data.userId) {
							$rootScope.userinfo = response.data;

							if(!$rootScope.userinfo.unionid) {
								$rootScope.userinfo.unionid = "#" + $scope.userinfo.mobile;
							}

							if(!$rootScope.userinfo.photo) {
								if($rootScope.wechatUser && $rootScope.wechatUser.headimgurl) {
									$rootScope.userinfo.photo = $rootScope.wechatUser.headimgurl;
								} else {
									$rootScope.userinfo.photo = "img/logo.png";
								}
							}

							if(!$rootScope.userinfo.nickName) {
								$rootScope.userinfo.nickName = $scope.userinfo.mobile;
							}

							setStorage("userinfo", angular.copy($rootScope.userinfo));

							$rootScope.redirect = "tab.tf_home";

							$state.go("me_info");
						} else {
							$rootScope.Alert('用户不存在');
						}

					}).error(function(response, status) {
						$rootScope.LoadingHide();
						$rootScope.Alert('连接失败！[' + response + status + ']');
						return;
					});

					//#endregion

					return;
				}

				//#endregion

				//#region 验证短信
				var url = $rootScope.rootUrl + "/userinfo.php";
				var data = {
					"func": "login",
					"mobile": $scope.userinfo.mobile,
					"code": $scope.userinfo.code,
					"fr": 1
				};
				encode(data);

				$http.post(url, data).success(function(response) {
					$rootScope.LoadingHide();

					if(response && response.flag == 0 && response.data) {
						$rootScope.userinfo = response.data;

						if(!$rootScope.userinfo.unionid) {
							$rootScope.userinfo.unionid = "#" + $scope.userinfo.mobile;
						}

						if(!$rootScope.userinfo.photo) {
							$rootScope.userinfo.photo = "img/logo.png";
						}

						if(!$rootScope.userinfo.nickName) {
							$rootScope.userinfo.nickName = $scope.userinfo.mobile;
						}

						//#region 获取用户信息
						var url = $rootScope.rootUrl + "/userinfo.php";
						var data = {
							"func": "getUserInfo",
							"unionid": $rootScope.userinfo.unionid
						};
						encode(data);

						$http.post(url, data).success(function(response) {
							$rootScope.LoadingHide();

							if(response.data && response.data.userId) {
								$rootScope.userinfo = response.data;

								if(!$rootScope.userinfo.unionid) {
									$rootScope.userinfo.unionid = "#" + $scope.userinfo.mobile;
								}

								if(!$rootScope.userinfo.photo) {
									if($rootScope.wechatUser && $rootScope.wechatUser.headimgurl) {
										$rootScope.userinfo.photo = $rootScope.wechatUser.headimgurl;
									} else {
										$rootScope.userinfo.photo = "img/logo.png";
									}
								}

								if(!$rootScope.userinfo.nickName) {
									$rootScope.userinfo.nickName = $scope.userinfo.mobile;
								}

								setStorage("userinfo", angular.copy($rootScope.userinfo));

								$rootScope.redirect = "tab.tf_home";

								$state.go("me_info");
							} else {
								$rootScope.Alert('用户不存在');
							}

						}).error(function(response, status) {
							$rootScope.LoadingHide();
							$rootScope.Alert('连接失败！[' + response + status + ']');
							return;
						});

						//#endregion

						setStorage("userinfo", angular.copy($rootScope.userinfo));

					} else {
						$rootScope.Alert("验证码错误!");
					}

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});
				//#endregion
			}
		}

		$scope.wechatLogin = function() {
			if(location.href.indexOf('localhost:1588') != -1) {
				//#region 判断用户是否存在
				var url = $rootScope.rootUrl + "/userinfo.php";
				var data = {
					"func": "getUserInfo",
					"unionid": 'ocffVt08HworeoxlzULVlOFdkYY4'
				};
				encode(data);

				$http.post(url, data).success(function(response) {
					$rootScope.LoadingHide();

					//用户存在
					if(response.data) {
						$rootScope.userinfo = response.data;

						setStorage("userinfo", angular.copy($rootScope.userinfo));

						$state.go("tab.tf_home");

					} else //用户不存在
					{
						//#region 绑定微信信息
						$rootScope.userinfo.unionid = $rootScope.wechatUser.unionid;
						$rootScope.userinfo.nickName = $rootScope.wechatUser.nickname;
						$rootScope.userinfo.password = '123456789iOS';
						$rootScope.userinfo.photo = $rootScope.wechatUser.headimgurl;
						$rootScope.userinfo.gender = ($rootScope.wechatUser.sex == 1 ? "Male" : "Female");
						$rootScope.userinfo.isRegister = true;
						//#endregion

						//$state.go('bind_mobile');

						$rootScope.redirect = "tab.tf_home";

						$state.go("me_info");

					}

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});

				//#endregion

				return;
			}

			$rootScope.LoadingShow();

			Wechat.isInstalled(function(installed) {
				if(installed) {
					Wechat.auth("snsapi_userinfo", function(response) {
						//#region 通过code获取access_token
						var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + $rootScope.WEIXIN.AppID + "&secret=" + $rootScope.WEIXIN.AppSecret + "&code=" + response.code + "&grant_type=authorization_code";

						$http.get(url).success(function(response) {
							//#region 获取用户个人信息（UnionID机制）
							var url = "https://api.weixin.qq.com/sns/userinfo?access_token=" + response.access_token + "&openid=" + response.openid;

							$http.get(url).success(function(response) {
								var headimgurl = response.headimgurl;

								convertImgToBase64(headimgurl, function(base64Img) {
									response.headimgurl = base64Img;

								}, "image/jpeg");

								$rootScope.wechatUser = response;

								//#region 判断用户是否存在
								var url = $rootScope.rootUrl + "/userinfo.php";
								var data = {
									"func": "getUserInfo",
									"unionid": $rootScope.wechatUser.unionid
								};
								encode(data);

								$http.post(url, data).success(function(response) {
									$rootScope.LoadingHide();

									//用户存在
									if(response.data) {
										$rootScope.userinfo = response.data;

										//之前绑定过手机
										if($rootScope.userinfo.mobile) {
											if(!$rootScope.userinfo.photo) {
												if($rootScope.wechatUser.headimgurl) {
													$rootScope.userinfo.photo = $rootScope.wechatUser.headimgurl;
												} else {
													$rootScope.userinfo.photo = "img/logo.png";
												}
											}

											setStorage("userinfo", angular.copy($rootScope.userinfo));

											$state.go("tab.tf_home");
										} else //之前没绑定过手机
										{
											//#region 绑定微信信息
											$rootScope.userinfo.unionid = $rootScope.wechatUser.unionid;
											$rootScope.userinfo.nickName = $rootScope.wechatUser.nickname;
											$rootScope.userinfo.password = '123456789iOS';
											$rootScope.userinfo.photo = $rootScope.wechatUser.headimgurl;
											$rootScope.userinfo.gender = ($rootScope.wechatUser.sex == 1 ? "Male" : "Female");
											$rootScope.userinfo.isRegister = false;
											//#endregion

											//$state.go('bind_mobile');

											$rootScope.redirect = "tab.tf_home";

											$state.go("me_info");
										}
									} else //用户不存在
									{
										//#region 绑定微信信息
										$rootScope.userinfo.unionid = $rootScope.wechatUser.unionid;
										$rootScope.userinfo.nickName = $rootScope.wechatUser.nickname;
										$rootScope.userinfo.password = '123456789iOS';
										$rootScope.userinfo.photo = $rootScope.wechatUser.headimgurl;
										$rootScope.userinfo.gender = ($rootScope.wechatUser.sex == 1 ? "Male" : "Female");
										$rootScope.userinfo.isRegister = true;
										//#endregion

										//$state.go('bind_mobile');

										$rootScope.redirect = "tab.tf_home";

										$state.go("me_info");

									}

								}).error(function(response, status) {
									$rootScope.LoadingHide();
									$rootScope.Alert('连接失败！[' + response + status + ']');
									return;
								});

								//#endregion

							}).error(function(response, status) {
								$rootScope.LoadingHide();
								return;
							});
							//#endregion

						}).error(function(response, status) {
							$rootScope.LoadingHide();
							return;
						});
						//#endregion

					}, function(reason) {
						$rootScope.LoadingHide();
						$rootScope.Alert("Failed: " + reason);
					});
				} else {
					$rootScope.LoadingHide();
					$rootScope.Confirm("微信没有安装，请先安装微信.", "去安装微信?", "", function() {
						window.open('https://itunes.apple.com/cn/app/wechat/id414478124', '_system', 'location=yes');
					}, function() {});
				}

			}, function(reason) {
				$rootScope.Alert("Failed: " + reason);
			});
		};

		setTimeout(function() {
			Wechat.isInstalled(function(installed) {
				if(!installed) {
					$(".ichatLogin").hide();
				}
			});
		}, 1000);
	})

	.controller('bind_mobileCtrl', function($rootScope, $scope, $state, $http, $interval) {
		$scope.userinfo = {
			"mobile": "",
			"code": "",
			"buttonText": "获取验证码"
		};

		$scope.getCode = function() {
			if($scope.userinfo.buttonText == "获取验证码") {
				if($scope.userinfo.mobile == "" || $scope.userinfo.mobile.length != 11) {
					$rootScope.Alert("手机号错误！");
				} else {
					//#region 按钮倒计时
					var second = 60;

					var timer = $interval(function() {
						second--;

						if(second <= -1) {
							$interval.cancel(timer);
							second = 60;
							$scope.userinfo.buttonText = "获取验证码";
						} else {
							$scope.userinfo.buttonText = second + "s";
						}

					}, 1000, 100);
					//#endregion

					//#region 发送短信
					var url = $rootScope.rootUrl + "/userinfo.php";
					var data = {
						"func": "sendCodeByWei",
						"mobile": $scope.userinfo.mobile,
						"fr": 1
					};
					encode(data);

					$rootScope.LoadingShow();

					$http.post(url, data).success(function(response) {
						$rootScope.LoadingHide();

						//alert(JSON.stringify(response));

					}).error(function(response, status) {
						$rootScope.LoadingHide();
						$rootScope.Alert('连接失败！[' + response + status + ']');
						return;
					});
					//#endregion
				}
			}
		}

		$scope.login = function() {
			if($scope.userinfo.mobile == "" || $scope.userinfo.mobile.length != 11) {
				$rootScope.Alert("手机号错误！");
			} else if($scope.userinfo.code == "") {
				$rootScope.Alert("验证码错误！");
			} else {
				//#region 验证短信
				var url = $rootScope.rootUrl + "/userinfo.php";
				var data = {
					"func": "bindMobile",
					"unionid": "unionid",
					"mobile": $scope.userinfo.mobile,
					"code": $scope.userinfo.code,
					"fr": 1
				};
				encode(data);

				$rootScope.LoadingShow();

				$http.post(url, data).success(function(response) {
					$rootScope.LoadingHide();

					if(response && response.flag == 0) {
						$rootScope.userinfo.mobile = $scope.userinfo.mobile;

						$rootScope.redirect = "tab.tf_home";

						$state.go("me_info");
					} else {
						$rootScope.Alert("验证码错误!");
					}

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});
				//#endregion
			}
		}

	})
	//#endregion

	//#region 我的
	.controller('me_homeCtrl', function($rootScope, $scope, $state, $http) {
		$rootScope.KB = getStorage("KB");
		if(!$rootScope.KB || !$rootScope.KB.type) {
			$rootScope.KB = {
				"type": 0,
				"level": "0",
				tl: false,
				yd: false,
				fy: false,
				xz: false,
				date: formatDate(new Date())
			};
		}

		//如果存储的日期不是当天，所有状态数据清零
		if($rootScope.KB.date != formatDate(new Date())) {
			$rootScope.KB.tl = false;
			$rootScope.KB.yd = false;
			$rootScope.KB.fy = false;
			$rootScope.KB.xz = false;
		}

		//#region 获取考保信息
		var transform = function(data) {
			return $.param(data);
		}
		//测试 ocffVt6ZE2o_Ybzs1_NbVTVsn5v4
		$http.post("http://wx.kaouyu.com/wxadmin/index.php?g=Home&m=BaseApi&a=index", {
			"unionid": $rootScope.userinfo.unionid
		}, {
			// $http.post("http://wx.kaouyu.com/wxadmin/index.php?g=Home&m=BaseApi&a=index", { "unionid": "ocffVt6ZE2o_Ybzs1_NbVTVsn5v4" }, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			transformRequest: transform
		}).success(function(response) {
			if(response && response.flag && response.flag == 1) {
				$rootScope.KB.type = response.data.type;
				$rootScope.KB.level = response.data.level;
			} else {
				$rootScope.KB.type = 0
				$rootScope.KB.level = "0";
			}
			setStorage("KB", angular.copy($rootScope.KB));
		});

		//#endregion

		$scope.meUpdate = function() {
			$rootScope.redirect = "tab.me_home";
			$state.go("me_info");
		}

		$scope.getErrHistoryFavoriteList = function(iserr) {
			var url = $rootScope.rootUrl + "/itemErrHistoryFavorite.php";
			var data = {
				"func": "getErrHistoryFavoriteList",
				"unionid": $rootScope.userinfo.unionid,
				//"unionid":"ocffVt3BQrW6p2Z7f82PKFBDeREI",
				"iserr": iserr,
				"fr": 1
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response && response.data.length > 0) {
					$rootScope.me_list = {};
					$rootScope.me_list.data = response.data;
					$rootScope.me_list.mainId = iserr;
					$rootScope.me_list.title = (iserr + '').replace('0', '历史任务').replace('1', '错题本').replace('2', '收藏夹');
					//alert(JSON.stringify(response.data));

					if(iserr == "2") {
						$rootScope.FromFav = true;
					} else {
						$rootScope.FromFav = false;
					}

					$state.go("me_list_main");
				} else {
					$rootScope.Alert("获取数据失败，请稍后再试。");
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		}

		$rootScope.updateUserInfo();
	})

	.controller('me_infoCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicActionSheet) {
		var redirect = $stateParams.redirect;

		$scope.M_C = {
			"所属专业": ["班级名称"],
			"工商管理": ["班级名称", "14工商本1", "14工商本2", "14工商本3", "14工商本4", "14工商本5", "13工商（城市物流）本", "13工商（国际连锁经营）本", "13工商（行销与策划）本", "14工商（楼宇资产管理）本", "13工商（商务助理）本", "13工商（涉外物业管理）本", "15工商专升本", "13工商（网络商务运营）本1", "13工商（网络商务运营）本2", "13工商（珠宝鉴定与经营）本"],
			"国际经济与贸易": ["班级名称", "14国贸（商务师）本", "13国贸（国际商务师）本1", "13国贸（国际商务师）本2", "14国贸（国际物流）本2", "14国贸（国际物流）本1", "13国贸（国际物流）本1", "13国贸（国际物流）本2", "14国贸（跨境电子商务）本"],
			"金融学": ["班级名称", "14金融（财富管理）本1", "14金融（财富管理）本2", "14金融（国际金融）本1", "14金融（国际金融）本2", "13金融（国际金融）本1", "13金融（国际金融）本2", "14金融（互联网金融）本", "13金融（理财规划师）本1", "13金融（理财规划师）本2", "15金融专升本", "14金融（银行）本1（二本）", "14金融（银行）本2（二本）", "13金融（银行业务）本1(二本)", "13金融（银行业务）本2(二本)", "14金融（证券与投资）本1", "14金融（证券与投资）本2", "13金融（证券与投资）本1", "14金融（银行）专", "13金融（证券与投资）本2"],
			"人力资源管理": ["班级名称", "14人资本（二本）", "13人资本（二本）"]
		};

		setTimeout(function() {
			$("#ddlClasses").val($rootScope.userinfo.classes);
		}, 500);

		$scope.changeHeadImg = function() {
			$ionicActionSheet.show({
				buttons: [{
						text: '拍照'
					},
					{
						text: '从手机相册选择'
					}
				],
				titleText: '重新设置头像',
				cancelText: '取消',
				cancel: function() {
					return true;
				},
				buttonClicked: function(index) {
					navigator.camera.getPicture(function(imageURI) {
						$rootScope.userinfo.photo = "data:image/jpeg;base64," + imageURI;
						$scope.$apply();

					}, function(message) {
						log('Failed because: ' + message);
					}, {
						quality: 50, //ios为了避免部分设备上出现内存错误，quality的设定值要低于50。
						destinationType: Camera.DestinationType.DATA_URL, //FILE_URI,DATA_URL
						sourceType: (index == 0 ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY), //CAMERA,SAVEDPHOTOALBUM
						allowEdit: true,
						encodingType: Camera.EncodingType.JPEG, //JPEG,PNG
						targetWidth: 666,
						targetHeight: 666
					});

					return true;
				}
			});
		};

		$scope.openSchoolABC = function() {
			$state.go("school_abc");
		};

		$scope.complete = function() {
			if($rootScope.userinfo.nickName == "demo") {
				$state.go("tab.tf_home");
				return;
			}

			//if ($rootScope.InsertOrUpdate == 1)
			{
				//if ($rootScope.userinfo.gender != "Female" && $rootScope.userinfo.gender != "Male")
				//{
				//    $rootScope.Alert("请选择性别！");
				//    return;
				//}

				//if (!$rootScope.userinfo.nickName || $rootScope.userinfo.nickName == "")
				//{
				//    $rootScope.Alert("请输入您的名号！");
				//    return;
				//}

				//if (!$rootScope.userinfo.schoolId || $rootScope.userinfo.schoolId == "")
				//{
				//    $rootScope.Alert("请选择学校！");
				//    return;
				//}

				if(!$rootScope.userinfo.level || $rootScope.userinfo.level == "") {
					$rootScope.Alert("请选择需要考四级还是六级！");
					return;
				}

				//if ($rootScope.userinfo.schoolName == "北京城市学院")
				//{
				//    if (!$rootScope.userinfo.major || $rootScope.userinfo.major == "所属专业")
				//    {
				//        $rootScope.Alert("请选择专业！");
				//        return;
				//    }

				//    if (!$rootScope.userinfo.classes || $rootScope.userinfo.classes == "班级名称")
				//    {
				//        $rootScope.Alert("请选择班级！");
				//        return;
				//    }
				//}

				//if (!$rootScope.userinfo.number || $rootScope.userinfo.number == "")
				//{
				//    $rootScope.Alert("请填写学号！");
				//    return;
				//}

				var url = $rootScope.rootUrl + "/userinfo.php";
				var data = {
					"func": ($rootScope.userinfo.isRegister ? "register" : "modifUserinfo"),
					"nickName": $rootScope.userinfo.nickName,
					"password": "123456789iOS",
					"gender": $rootScope.userinfo.gender,
					"schoolId": $rootScope.userinfo.schoolId,
					"unionid": $rootScope.userinfo.unionid,
					"level": $rootScope.userinfo.level,
					"major": $rootScope.userinfo.major,
					"classes": $rootScope.userinfo.classes,
					"number": $rootScope.userinfo.number,
					"mobile": $rootScope.userinfo.mobile
				};

				if($rootScope.userinfo.isRegister) {
					data.file = $rootScope.userinfo.photo;
				} else {
					data.photo = $rootScope.userinfo.photo;
				}

				encode(data);

				$rootScope.LoadingShow();

				$http.post(url, data).success(function(response) {
					//#region 获取用户信息
					var url = $rootScope.rootUrl + "/userinfo.php";
					var data = {
						"func": "getUserInfo",
						"unionid": $rootScope.userinfo.unionid
					};
					encode(data);

					$http.post(url, data).success(function(response) {
						$rootScope.LoadingHide();

						if(response.data && response.data.userId) {
							$rootScope.userinfo = response.data;

							if(!$rootScope.userinfo.photo) {
								if($rootScope.wechatUser && $rootScope.wechatUser.headimgurl) {
									$rootScope.userinfo.photo = $rootScope.wechatUser.headimgurl;
								} else {
									$rootScope.userinfo.photo = "img/logo.png";
								}
							}

							if(!$rootScope.userinfo.unionid) {
								$rootScope.userinfo.unionid = "#" + $scope.userinfo.mobile;
							}

							setStorage("userinfo", angular.copy($rootScope.userinfo));

							$state.go($rootScope.redirect);
						} else {
							$rootScope.Alert('用户不存在');
						}

					}).error(function(response, status) {
						$rootScope.LoadingHide();
						$rootScope.Alert('连接失败！[' + response + status + ']');
						return;
					});

					//#endregion

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});
			}
		}

		$scope.cancel = function() {
			if($rootScope.redirect == 'tab.tf_home') {
				//$state.go('login');
				$state.go($rootScope.redirect);
			} else {
				$state.go($rootScope.redirect);
			}
		};

		if($rootScope.userinfo.userId == "20849") {
			$rootScope.userinfo.nickName = "demo";
			$rootScope.userinfo.mobile = "demo";
			$rootScope.userinfo.number = "";
			$rootScope.userinfo.schoolName = "";
		}

	})

	.controller('me_settingCtrl', function($rootScope, $scope, $state, $http) {
		$scope.logout = function() {
			setStorage("userinfo", null);
			setStorage("KB", null);
			$state.go("login");
		}
	})

	.controller('me_productsCtrl', function($rootScope, $scope, $state, $http, $ionicModal) {
		$scope.productItem = function(i) {
			$rootScope.product = $rootScope.products[i];

			$state.go("me_product");
		}

		$ionicModal.fromTemplateUrl('templates/order.html', {
			scope: $scope,
			animation: 'slide-in-up',
			hardwareBackButtonClose: false
		}).then(function(modal) {
			$scope.modal = modal;
		});

		$scope.openOrder = function(order) {
			$scope.order = order;

			$scope.modal.show();
		};

		$scope.closeOrder = function() {
			$scope.modal.hide();
		};

		$scope.$on('$destory', function() {
			$scope.modal.hide();
		});
	})

	.controller('me_productCtrl', function($rootScope, $scope, $state, $http) {
		$scope.cart = function() {
			var url = $rootScope.rootUrl + "/baseData.php";
			var data = {
				"func": "getUserAddress",
				"unionid": $rootScope.userinfo.unionid
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response.data.addrid) {
					$rootScope.myAddress = response.data;

				} else {
					$rootScope.myAddress = {};
				}

				$state.go("me_cart");

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});

		}

		setTimeout(function() {
			var h = document.documentElement.clientHeight - document.getElementById("product-top").offsetHeight - 20;
			document.getElementById("product-bottom").style.height = h + "px";
		}, 1000);
	})

	.controller('me_cartCtrl', function($rootScope, $scope, $state, $http) {
		$scope.address = function() {
			$state.go("me_address");
		};

		$scope.checkout = function() {

			if(!$rootScope.myAddress.user_name || $rootScope.myAddress.user_name == "") {
				$rootScope.Alert("请完善收货地址 - 收货人！");
				return;
			}

			if(!$rootScope.myAddress.mobile || $rootScope.myAddress.mobile == "") {
				$rootScope.Alert("请完善收货地址 - 手机号码！");
				return;
			}

			if(!$rootScope.myAddress.count_region_name || $rootScope.myAddress.count_region_name == "") {
				$rootScope.Alert("请完善收货地址 - 选择地区！");
				return;
			}

			if(!$rootScope.myAddress.address || $rootScope.myAddress.address == "") {
				$rootScope.Alert("请完善收货地址 - 详细地址！");
				return;
			}

			//#region 检测用户是否购买过该产品
			var url = $rootScope.rootUrl + "/bizProd.php";
			var data = {
				"func": "checkUserBizProd",
				"unionid": $rootScope.userinfo.unionid
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				//if (response.flag == 1)
				//{
				//    $rootScope.Alert("您已经购买过该产品，无需重复购买！");
				//}
				//else
				{
					//#region 添加订单
					var url = $rootScope.rootUrl + "/bizProd.php";
					var data = {
						"func": "addOrder",
						"unionid": $rootScope.userinfo.unionid,
						"openid": $rootScope.userinfo.openid,
						"prodid": $rootScope.product.prodid,
						"money": $rootScope.product.price,
						"addrid": $rootScope.myAddress.addrid,
						"payway": "3"
					};
					encode(data);

					$rootScope.LoadingShow();

					$http.post(url, data).success(function(response) {
						$rootScope.LoadingHide();

						if(response.data) {
							var orderId = response.data;

							//$rootScope.Alert(orderId);

							//统一下单接口
							$http.get("http://api.myechinese.com/wxpay.php?func=unifiedorder&product_name=" + $rootScope.product.product_name + "&total_fee=" + $rootScope.product.price * 100 + "&out_trade_no=" + orderId).success(function(response)
								//$http.get("http://api.myechinese.com/wxpay.php?func=unifiedorder&product_name=" + $rootScope.product.product_name + "&total_fee=" + 1 + "&out_trade_no=" + orderId).success(function (response)
								{
									if(response.prepayid) {
										//#region 微信支付接口
										var params = {
											mch_id: '1275523601', // merchant id
											prepay_id: response.prepayid, // prepay id
											nonce: response.noncestr, // nonce
											timestamp: response.timestamp, // timestamp
											sign: response.sign, // signed string
										};

										Wechat.sendPaymentRequest(params, function(reninfo) {
											$rootScope.orderquery($rootScope.product, orderId);
										}, function(reason) {
											$rootScope.Alert("支付失败: " + reason);
										});
										//#endregion
									}

								}).error(function(response, status) {
								$rootScope.LoadingHide();
								$rootScope.Alert('连接失败！[' + response + status + ']');
								return;
							});
						}

					}).error(function(response, status) {
						$rootScope.LoadingHide();
						$rootScope.Alert('连接失败！[' + response + status + ']');
						return;
					});
					//#endregion
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
			//#endregion
		};
	})

	.controller('me_addressCtrl', function($rootScope, $scope, $state, $http) {

		$scope.open = function() {
			$state.go("address", {
				type: 1,
				province: 0,
				city: 0
			});
		};

		$scope.complete = function() {
			if(!$rootScope.myAddress.user_name || $rootScope.myAddress.user_name == "") {
				$rootScope.Alert("请完善收货地址 - 收货人！");
				return;
			}

			if(!$rootScope.myAddress.mobile || $rootScope.myAddress.mobile == "") {
				$rootScope.Alert("请完善收货地址 - 手机号码！");
				return;
			}

			if(!$rootScope.myAddress.count_region_name || $rootScope.myAddress.count_region_name == "") {
				$rootScope.Alert("请完善收货地址 - 选择地区！");
				return;
			}

			if(!$rootScope.myAddress.address || $rootScope.myAddress.address == "") {
				$rootScope.Alert("请完善收货地址 - 详细地址！");
				return;
			}
			//else
			//{
			//    $rootScope.myAddress.address = escape($rootScope.myAddress.address).replace(/%/g, "/\/");

			//    alert($rootScope.myAddress.address);
			//}

			var url = $rootScope.rootUrl + "/baseData.php";
			var data = {
				"unionid": $rootScope.userinfo.unionid,
				"data": JSON.stringify($rootScope.myAddress)
			};

			if($rootScope.myAddress.addrid) {
				data.func = "modifUserAddress";
			} else {
				data.func = "addUserAddress";
			}

			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				//#region 重新获取地址
				var url = $rootScope.rootUrl + "/baseData.php";
				var data = {
					"func": "getUserAddress",
					"unionid": $rootScope.userinfo.unionid
				};
				encode(data);

				$rootScope.LoadingShow();

				$http.post(url, data).success(function(response) {
					$rootScope.LoadingHide();

					if(response.data.addrid) {
						$rootScope.myAddress = response.data;

					}

					$state.go("tab.me_cart");

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});
				//#endregion

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});

		};
	})

	.controller('me_kb_introCtrl', function($rootScope, $scope, $state, $http) {

		if($rootScope.userinfo.unionid.indexOf("#") == 0) {
			$rootScope.Alert("您如果在微信中购买过考保，请用您的微信账号登陆，查看您的考保状态");
		}

		$scope.saveImg = function() {
			var canvas = document.getElementById('myCanvas');
			ctx = canvas.getContext('2d'),
				img = new Image;
			img.crossOrigin = 'Anonymous';
			img.onload = function() {
				canvas.height = img.height;
				canvas.width = img.width;
				ctx.drawImage(img, 0, 0);

				window.canvas2ImagePlugin.saveImageDataToLibrary(function(msg) {
					$rootScope.Alert("图片已经保存");
				}, function(err) {
					$rootScope.Alert(err);
				}, document.getElementById('myCanvas'));
			};
			img.src = "img/kaouyu_wx.jpg";

		}
	})

	.controller('me_kb_statusCtrl', function($rootScope, $scope, $state, $http) {
		//#region 报告
		$scope.report = function(id) {
			if(id == "listening") {
				$rootScope.tl();
			} else if(id == "reading") {
				$rootScope.yd();
			} else if(id == "translation") {
				$rootScope.fy();
			} else {
				$rootScope.xz();
			}
		}
		//#endregion
	})

	.controller('me_list_mainCtrl', function($rootScope, $scope, $state, $http) {
		$scope.mainList = function(mainIndex) {
			if(!$rootScope.me_list.data[mainIndex].son) {
				$rootScope.Alert("记录为空.");
			} else {
				$rootScope.me_list.mainIndex = mainIndex;
				$rootScope.me_list.currentData = $rootScope.me_list.data[mainIndex];

				$state.go("me_list_sub");
			}
		}
	})

	.controller('me_list_subCtrl', function($rootScope, $scope, $state, $http) {
		$scope.getErrHistoryFavoriteItems = function(subIndex) {
			var url = $rootScope.rootUrl + "/itemErrHistoryFavorite.php";
			var data = {
				"func": "getErrHistoryFavoriteItems",
				"unionid": $rootScope.userinfo.unionid,
				//"unionid": "ocffVt3BQrW6p2Z7f82PKFBDeREI",
				"iserr": $rootScope.me_list.mainId,
				"item_type": $rootScope.me_list.currentData.item_type,

				"fr": 1
			};

			if($rootScope.me_list.currentData.son[subIndex].topskill) {
				data.topskill = $rootScope.me_list.currentData.son[subIndex].topskill;
			}

			if($rootScope.me_list.currentData.son[subIndex].dt) {
				data.exe_time = $rootScope.me_list.currentData.son[subIndex].dt;
			}

			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response && response.data.length > 0) {
					//#region 听力
					if($rootScope.me_list.mainIndex == 0) {
						$rootScope.TL = response.data;

						angular.forEach($rootScope.TL, function(data) {
							if(!isNaN(data.item_name.substr(0, 8))) {
								data.item_name = data.item_name.substr(0, 4) + '年' + data.item_name.substr(4, 2) + '月 第' + data.item_name.substr(6, 2) + '套 ' + data.item_name.substring(8);
							} else if(!isNaN(data.item_name.substr(0, 6))) {
								data.item_name = data.item_name.substr(0, 4) + '年' + data.item_name.substr(4, 2) + '月 ' + data.item_name.substring(6);
							}
						});

						$state.go("me_list_tl", {
							id: 0
						});
					}
					//#endregion

					//#region 阅读
					if($rootScope.me_list.mainIndex == 1) {
						$rootScope.YD = response.data;

						for(m = 0; m < $rootScope.YD.length; m++) {
							var yd = $rootScope.YD[m];

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

						$state.go("me_list_yd", {
							id: 0
						});
					}
					//#endregion

					//#region 写作
					if($rootScope.me_list.mainIndex == 2) {
						$rootScope.XZ = response.data;

						angular.forEach($rootScope.XZ, function(data, index) {
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

						$state.go("me_list_xz", {
							id: 0
						});
					}
					//#endregion

					//#region 翻译
					if($rootScope.me_list.mainIndex == 3) {
						$rootScope.FY = response.data;

						angular.forEach($rootScope.FY, function(data, index) {
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

						$state.go("me_list_fy", {
							id: 0
						});
					}
					//#endregion

				} else {
					$rootScope.Alert("获取数据失败，请稍后再试。");
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		}
	})

	.controller('me_qrcodeCtrl', function($rootScope, $scope, $state, $http) {
		$scope.scanCode = function() {

			cordova.plugins.barcodeScanner.scan(
				function(result) {
					if(!result.cancelled) {
						var code = result.text;
						if(code) {
							//#region 激活
							var url = $rootScope.rootUrl + "/vcode.php";
							var data = {
								"func": "activateCode",
								"unionid": $rootScope.userinfo.unionid,
								"level": $rootScope.userinfo.level,
								"code": code,
								"fr": 1
							};
							encode(data);

							$rootScope.LoadingShow();

							$http.post(url, data).success(function(response) {
								$rootScope.LoadingHide();

								if(response.flag == 0) {
									$rootScope.Alert(response.err, function() {
										//#region 获取用户信息
										var url = $rootScope.rootUrl + "/userinfo.php";
										var data = {
											"func": "getUserInfo",
											"unionid": $rootScope.userinfo.unionid
										};
										encode(data);

										$http.post(url, data).success(function(response) {
											$rootScope.LoadingHide();

											if(response.data && response.data.userId) {
												$rootScope.userinfo = response.data;

												setStorage("userinfo", angular.copy($rootScope.userinfo));

												$state.go("tab.me_home");
											}

										}).error(function(response, status) {
											$rootScope.LoadingHide();
											$rootScope.Alert('连接失败！[' + response + status + ']');
											return;
										});

										//#endregion

									});
								} else if(response.flag == -1) {
									$rootScope.Alert(response.err);
								} else {
									$rootScope.Alert("错误，请稍后再试。");
								}
							}).error(function(response, status) {
								$rootScope.LoadingHide();
								$rootScope.Alert('连接失败！[' + response + status + ']');
								return;
							});
							//#endregion
						} else {
							$rootScope.Alert("无效二维码。");
						}
					}
				},
				function(error) {
					//$rootScope.Alert("扫描失败：" + error);
				}, {
					"preferFrontCamera": false, // iOS and Android
					"showFlipCameraButton": false, // iOS and Android
					"prompt": "Place a barcode inside the scan area", // supported on Android only
					"formats": "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
					"orientation": "landscape" // Android only (portrait|landscape), default unset so it rotates with the device
				}
			);
			return;

		}

		$scope.markOpen = function(url) {
			window.open(url, "_system");
		}
	})

	//#region 听力
	.controller('me_list_tlCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicSlideBoxDelegate, $interval, $timeout) {
		//#region 初始化数据
		var id = parseInt($stateParams.id);
		var sonIndex = parseInt($stateParams.sonIndex);

		//$rootScope.TL.sutmitted = true;

		$scope.tl = $rootScope.TL[id];
		$scope.id = id;
		$scope.tl.isFav = 1;

		angular.forEach($scope.tl.son, function(data) {
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
		});
		//#endregion

		$timeout(function() {
			$ionicSlideBoxDelegate.enableSlide(false);

			if(sonIndex > 0) {
				$ionicSlideBoxDelegate.slide(sonIndex);
			}

			$(".popWord").html($scope.tl.text);

			var huaci = new UyuHuaCi();
			huaci.Init('.popWord');

		}, 0);

		//#region 音频

		//#region 初始化音频
		$scope.media = {
			duration: "0",
			current: "0",
			playing: false
		};

		var v = document.getElementById("audio");
		v.pause();
		v.src = $rootScope.sMp3 + $scope.tl.source_id + ".mp3";

		var v2 = document.getElementById("audioSon");
		v2.pause();
		//#endregion

		$scope.mainPlay = function() {
			$scope.subStop();

			$scope.media.playing = true;

			v.addEventListener("timeupdate", function() {
				$scope.media.duration = v.duration;
				$scope.media.current = v.currentTime;

				$scope.$apply();
			});

			v.addEventListener("ended", function() {
				$scope.media.playing = false;
			});

			v.play();
		}

		$scope.mainPause = function() {
			$scope.media.playing = false;

			v.pause();
		}

		$scope.mainDrag = function() {
			$scope.subStop();

			if($scope.media.duration == 0) {
				return;
			} else {
				v.pause();

				v.currentTime = $scope.media.current;

				$scope.media.playing = true;

				v.play();
			}
		}

		$scope.subPlay = function(sonIndex) {
			var son = $scope.tl.son[sonIndex];

			$scope.mainPause();
			$scope.subStop();

			son.playing = true;

			v2.pause();
			v2.src = $rootScope.iMp3 + son.item_id + ".mp3";
			v2.addEventListener("ended", function() {
				son.playing = false;
			});
			v2.play();

			$ionicSlideBoxDelegate.slide(sonIndex);
		}

		$scope.subStop = function() {
			v2.pause();

			for(i = 0; i < $scope.tl.son.length; i++) {
				$scope.tl.son[i].playing = false;
			}
		}

		//#endregion

		//#region 选择答案
		$scope.chooseAnswer = function(sonIndex, answer) {

			setTimeout(function() {
				if(sonIndex + 1 < $scope.tl.son.length) {
					$ionicSlideBoxDelegate.slide(sonIndex + 1);
				} else if(id + 1 < $rootScope.TL.length) {
					$state.go("me_list_tl", {
						id: id + 1
					});
				} else {
					$scope.submit();
				}
			}, 360);
		}
		//#endregion

		//#region 左右滑动
		$scope.slideLeft = function() {
			var i = $ionicSlideBoxDelegate.currentIndex();
			var c = $ionicSlideBoxDelegate.slidesCount();

			if(i + 1 < c) {
				$ionicSlideBoxDelegate.next();
			} else if(id + 1 < $rootScope.TL.length) {
				$state.go("me_list_tl", {
					id: id + 1
				});
			} else {
				$scope.submit();
			}
		}

		$scope.slideRight = function() {

			var i = $ionicSlideBoxDelegate.currentIndex();
			var c = $ionicSlideBoxDelegate.slidesCount();

			if(i - 1 > -1) {
				$ionicSlideBoxDelegate.previous();
			} else if(id > 0) {
				$state.go("me_list_tl", {
					id: id - 1
				});
			}
		}

		$scope.pageLeft = function() {
			if(id + 1 < $rootScope.TL.length) {
				$state.go("me_list_tl", {
					id: id + 1
				});
			} else {
				$scope.submit();
			}

		}

		$scope.pageRight = function() {
			if(id > 0) {
				$state.go("me_list_tl", {
					id: id - 1
				});
			}
		}
		//#endregion

		$scope.submit = function() {
			$rootScope.Alert("没有更多了");
		}

		//#region 收藏
		$scope.fav = function(isfav) {

			if(isfav) {
				$scope.tl.isFav = 0;

				//#region 取消收藏
				var url = $rootScope.rootUrl + "/itemErrHistoryFavorite.php";
				var data = {
					"func": "rmFromFavorite",
					"item_id": $scope.tl.parentid,
					"item_order": 0,
					"item_type": $scope.tl.son[id].item_type,
					"item_subtype": $scope.tl.son[id].item_subtype,
					"unionid": $rootScope.userinfo.unionid,
					"fr": 1
				};
				encode(data);

				$rootScope.LoadingShow();

				$http.post(url, data).success(function(response) {
					$rootScope.LoadingHide();

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});
				//#endregion
			} else {
				$scope.tl.isFav = 1;

				//#region 添加收藏
				var url = $rootScope.rootUrl + "/itemErrHistoryFavorite.php";
				var data = {
					"func": "addToFavorite",
					"item_id": $scope.tl.parentid,
					"item_order": 0,
					"item_type": $scope.tl.son[id].item_type,
					"item_subtype": $scope.tl.son[id].item_subtype,
					"topskill": $scope.tl.son[id].new_test_point_id[0],
					"skill": $scope.tl.son[id].test_point,
					"unionid": $rootScope.userinfo.unionid,
					"fr": 1
				};
				encode(data);

				$rootScope.LoadingShow();

				$http.post(url, data).success(function(response) {
					$rootScope.LoadingHide();

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});
				//#endregion
			}
		}
		//#endregion

	})
	//#endregion

	//#region 阅读
	.controller('me_list_ydCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicSlideBoxDelegate, $interval, $timeout, $sce) {

		//#region 初始化数据
		var id = parseInt($stateParams.id);
		var sonIndex = parseInt($stateParams.sonIndex);

		$scope.yd = $rootScope.YD[id];
		$scope.id = id;
		$scope.yd.isFav = 1;
		//#endregion

		$(".yd_text").html($scope.yd.text);

		$timeout(function() {
			$ionicSlideBoxDelegate.enableSlide(false);

			if(sonIndex > 0) {
				$ionicSlideBoxDelegate.slide(sonIndex);
			}

			$("#dc-input-" + (sonIndex + 1)).addClass("activated");

		}, 500);

		//#region 选择答案
		$scope.chooseAnswer = function(sonIndex, answer, detail) {
			setTimeout(function() {
				if(sonIndex + 1 < $scope.yd.son.length) {
					$ionicSlideBoxDelegate.slide(sonIndex + 1);

					if($scope.yd.item_format == "8") {
						$(".dc-input").removeClass("activated");
						$("#dc-input-" + (sonIndex + 2)).addClass("activated");
					}
				} else if(id + 1 < $rootScope.YD.length) {
					$state.go("me_list_yd", {
						id: id + 1
					});
				} else {
					$scope.submit();
				}
			}, 360);
		}
		//#endregion

		//#region 左右滑动
		$scope.slideLeft = function() {
			var i = $ionicSlideBoxDelegate.currentIndex();
			var c = $ionicSlideBoxDelegate.slidesCount();

			if(i + 1 < c) {
				$ionicSlideBoxDelegate.next();

				if($scope.yd.item_format == "8") {
					$(".dc-input").removeClass("activated");
					$("#dc-input-" + (i + 1)).addClass("activated");
				}
			} else if(id + 1 < $rootScope.YD.length) {
				$state.go("me_list_yd", {
					id: id + 1
				});
			} else {
				$scope.submit();
			}
		}

		$scope.slideRight = function() {

			var i = $ionicSlideBoxDelegate.currentIndex();
			var c = $ionicSlideBoxDelegate.slidesCount();

			if(i - 1 > -1) {
				$ionicSlideBoxDelegate.previous();

				if($scope.yd.item_format == "8") {
					$(".dc-input").removeClass("activated");
					$("#dc-input-" + (i - 1)).addClass("activated");
				}
			} else if(id > 0) {
				$state.go("me_list_yd", {
					id: id - 1
				});
			}
		}

		$scope.pageLeft = function() {
			if(id + 1 < $rootScope.YD.length) {
				$state.go("me_list_yd", {
					id: id + 1
				});
			} else {
				$scope.submit();
			}

		}

		$scope.pageRight = function() {
			if(id > 0) {
				$state.go("me_list_yd", {
					id: id - 1
				});
			}
		}
		//#endregion

		$scope.submit = function() {
			$rootScope.Alert("没有更多了");
		}

		$scope.slide = function() {
			$ionicSlideBoxDelegate.slide(slideIndex);
		}

		//#region 收藏
		$scope.fav = function(isfav) {

			if(isfav) {
				$scope.yd.isFav = 0;

				//#region 取消收藏
				var url = $rootScope.rootUrl + "/itemErrHistoryFavorite.php";
				var data = {
					"func": "rmFromFavorite",
					"item_id": $scope.yd.parentid,
					"item_order": 0,
					"item_type": $scope.yd.son[id].item_type,
					"item_subtype": $scope.yd.son[id].item_subtype,
					"unionid": $rootScope.userinfo.unionid,
					"fr": 1
				};
				encode(data);

				$rootScope.LoadingShow();

				$http.post(url, data).success(function(response) {
					$rootScope.LoadingHide();

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});
				//#endregion
			} else {
				$scope.yd.isFav = 1;

				//#region 添加收藏
				var url = $rootScope.rootUrl + "/itemErrHistoryFavorite.php";
				var data = {
					"func": "addToFavorite",
					"item_id": $scope.yd.parentid,
					"item_order": 0,
					"item_type": $scope.yd.son[id].item_type,
					"item_subtype": $scope.yd.son[id].item_subtype,
					"topskill": $scope.yd.son[id].new_test_point_id[0],
					"skill": $scope.yd.son[id].test_point,
					"unionid": $rootScope.userinfo.unionid,
					"fr": 1
				};
				encode(data);

				$rootScope.LoadingShow();

				$http.post(url, data).success(function(response) {
					$rootScope.LoadingHide();

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});
				//#endregion
			}
		}
		//#endregion
	})
	//#endregion

	//#region 写作
	.controller('me_list_xzCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicSlideBoxDelegate, $interval, $timeout, $sce) {
		//#region 初始化数据
		var id = parseInt($stateParams.id);

		$scope.xz = $rootScope.XZ[id];
		$scope.id = id;

		//#endregion

		//#region 选择答案
		$scope.chooseAnswer = function(answer) {
			setTimeout(function() {
				if(id + 1 < $rootScope.XZ.length) {
					$state.go("me_list_xz", {
						id: id + 1
					});
				} else {
					$scope.submit();
				}
			}, 360);
		}
		//#endregion

		//#region 左右滑动
		$scope.pageLeft = function() {
			if(id + 1 < $rootScope.XZ.length) {
				$state.go("me_list_xz", {
					id: id + 1
				});
			} else {
				$scope.submit();
			}

		}

		$scope.pageRight = function() {
			if(id > 0) {
				$state.go("me_list_xz", {
					id: id - 1
				});
			}
		}
		//#endregion

		$scope.submit = function() {
			$rootScope.Alert("没有更多了");
		}

		$scope.to_trusted = function(html_code) {
			return $sce.trustAsHtml(html_code);
		}
	})
	//#endregion

	//#region 翻译
	.controller('me_list_fyCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicSlideBoxDelegate, $interval, $timeout, $sce) {
		//#region 初始化数据
		var id = parseInt($stateParams.id);

		$scope.fy = $rootScope.FY[id];
		$scope.id = id;

		//#endregion

		//#region 选择答案
		$scope.chooseAnswer = function(answer) {

			setTimeout(function() {
				if(id + 1 < $rootScope.FY.length) {
					$state.go("me_list_fy", {
						id: id + 1
					});
				} else {
					$scope.submit();
				}
			}, 360);
		}
		//#endregion

		//#region 左右滑动
		$scope.pageLeft = function() {
			if(id + 1 < $rootScope.FY.length) {
				$state.go("me_list_fy", {
					id: id + 1
				});
			} else {
				$scope.submit();
			}

		}

		$scope.pageRight = function() {
			if(id > 0) {
				$state.go("me_list_fy", {
					id: id - 1
				});
			}
		}
		//#endregion

		$scope.submit = function() {
			$rootScope.Alert("没有更多了");
		}

		$scope.to_trusted = function(html_code) {
			return $sce.trustAsHtml(html_code);
		}
	})
	//#endregion
	//#endregion

	//#region 提分

	//#region 公用
	.controller('tf_homeCtrl', function($rootScope, $scope, $state, $http) {
		//#region 用户签到
		var url = $rootScope.rootUrl + "/baseData.php";
		var data = {
			"func": "everydaySign",
			"unionid": $rootScope.userinfo.unionid,
			"fr": 1
		};
		encode(data);

		$rootScope.LoadingShow();

		$http.post(url, data).success(function(response) {
			$rootScope.LoadingHide();

			if(response.flag == true) {
				$rootScope.Alert("签到成功");
			}
		}).error(function(response, status) {
			$rootScope.LoadingHide();
			$rootScope.Alert('连接失败！[' + response + status + ']');
			return;
		});
		//#endregion

		//#region 用户状态
		var url = $rootScope.rootUrl + "/baseData.php";
		var data = {
			"func": "getStat",
			"unionid": $rootScope.userinfo.unionid,
			"fr": 1
		};
		encode(data);

		$rootScope.LoadingShow();

		$http.post(url, data).success(function(response) {
			$rootScope.LoadingHide();

			if(response && response.data) {
				$scope.stat = response.data;
			}

		}).error(function(response, status) {
			$rootScope.LoadingHide();
			$rootScope.Alert('连接失败！[' + response + status + ']');
			return;
		});
		//#endregion

		//#region 诊断
		$scope.first = function(id) {
			$state.go("tf_first", {
				id: id
			});
		};
		//#endregion

		//#region 报告
		$scope.report = function(id) {
			if(id == "listening") {
				$rootScope.tl_report();
			} else if(id == "reading") {
				$rootScope.yd_report();
			} else if(id == "translation") {
				$rootScope.fy_report();
			} else {
				$rootScope.xz_report();
			}
		}
		//#endregion

		$scope.word = function() {
			$state.go("dc_tab.kc_home");
		}

		$rootScope.updateUserInfo();

	})

	.controller('tf_firstCtrl', function($rootScope, $scope, $state, $http, $stateParams) {
		var id = $stateParams.id;

		if(id == "listening") {
			$scope.name = "听力";
		} else if(id == "reading") {
			$scope.name = "阅读";
		} else if(id == "translation") {
			$scope.name = "翻译";
		} else {
			$scope.name = "写作";
		}
		
		$scope.beginTest = function() {
			if(id == "listening") {
				$rootScope.tl();
			} else if(id == "reading") {
				$rootScope.yd();
			} else if(id == "translation") {
				$rootScope.fy();
			} else {
				$rootScope.xz();
			}
		}

	})

	.controller('tf_submitCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicHistory) {
		var id = $stateParams.id;

		$scope.id = id;
		$scope.sutmitted = false;

		if(id == "listening") {
			if($rootScope.TL.sutmitted) {
				$scope.sutmitted = true;
			}
		}

		if(id == "reading") {
			if($rootScope.YD.sutmitted) {
				$scope.sutmitted = true;
			} else {
				$scope.sutmitted = false;
			}

			$scope.iYD = $rootScope.YD.result[$rootScope.ResultCurrent - 1];

			if($rootScope.ResultCurrent == $rootScope.ResultCount) {
				$scope.iYD.isLast = true;
			}
		}

		if(id == "translation") {
			if($rootScope.FY.sutmitted) {
				$scope.sutmitted = true;
			}

			var temp = [];
			var flag = [];

			angular.forEach($rootScope.FY.result[0], function(item) {
				var i = $.inArray(item.item_subtype_name, flag);

				if(i != -1) {
					temp[i].son.push({
						myanswer: item.myanswer,
						keys: item.keys,
						index: item.index
					});
				} else {
					flag.push(item.item_subtype_name);
					temp.push({
						item_subtype_name: item.item_subtype_name,
						son: [{
							myanswer: item.myanswer,
							keys: item.keys,
							index: item.index
						}]
					});
				}
			});

			$scope.FYGroup = temp;
		}

		if(id == "writing") {
			if($rootScope.XZ.sutmitted) {
				$scope.sutmitted = true;
			}

			var temp = [];
			var flag = [];

			angular.forEach($rootScope.XZ.result[0], function(item) {
				var i = $.inArray(item.item_subtype_name, flag);

				if(i != -1) {
					temp[i].son.push({
						myanswer: item.myanswer,
						keys: item.keys,
						index: item.index
					});
				} else {
					flag.push(item.item_subtype_name);
					temp.push({
						item_subtype_name: item.item_subtype_name,
						son: [{
							myanswer: item.myanswer,
							keys: item.keys,
							index: item.index
						}]
					});
				}
			});

			$scope.XZGroup = temp;
		}

		$scope.back = function() {
			if($scope.sutmitted) {
				$state.go("tab.tf_home");
			} else {
				$ionicHistory.goBack();
			}
		}

		$scope.goBack = function(index, sonIndex) {
			if(id == "listening") {
				//$state.go("tf_tl", { id: index, sonIndex: sonIndex });
				$state.go("tf_tl", {
					id: $rootScope.TL.CurrentIndex,
					sonIndex: sonIndex
				});
			}

			if(id == "reading") {
				$state.go("tf_yd", {
					id: index,
					sonIndex: sonIndex
				});
			}

			if(id == "translation") {
				$state.go("tf_fy", {
					id: index
				});
			}

			if(id == "writing") {
				$state.go("tf_xz", {
					id: index
				});
			}
		}

		$scope.submit = function() {

			if(id == "listening") {
				if($rootScope.TL.sutmitted) {
					if($rootScope.TL.task_no == 1) {
						$rootScope.tl_report();
					} else {
						if($rootScope.TL.CurrentIndex + 1 >= $rootScope.TL.result.length) {
							$rootScope.tl_report();
						} else {
							$state.go("tf_tl", {
								id: $rootScope.TL.CurrentIndex + 1
							});

							$rootScope.TL.sutmitted = false;
						}
					}
				} else {

					var isDone = true;
					var myCorect = 0;

					//#region 准备提交答案
					var s = {};
					s.time_exp = Math.floor((new Date().getTime() - $rootScope.beginTestTime) / 1000);
					s.task_no = $rootScope.TL.task_no;
					s.result = [];

					angular.forEach($rootScope.TL.result[0], function(item) {
						var a = {};
						a.parentid = item.parentid;
						a.son = [];

						angular.forEach(item.son, function(son) {
							a.son.push({
								"answer": son.myanswer,
								"item_format": son.item_format,
								"item_id": son.item_id,
								"itemanswer": son.keys,
								"itemsubtype": son.item_subtype,
								"pointid": son.new_test_point_id[0],
								"right": (son.myanswer == son.keys ? 1 : 0),
								"subpointid": son.test_point
							})

							if(!son.myanswer) {
								isDone = false;
							}

							if(son.myanswer == son.keys) {
								myCorect++;
							};
						});

						s.result.push(a);
					});
					//#endregion

					if(isDone) {
						//#region 提交答案
						var url = $rootScope.rootUrl + "/listening.php";
						var data = {
							"func": "submitAnswer",
							"unionid": $rootScope.userinfo.unionid,
							"fr": 1,
							"data": JSON.stringify(s)
						};
						encode(data);

						$rootScope.LoadingShow();

						$http.post(url, data).success(function(response) {
							$rootScope.LoadingHide();

							if(response && response.flag == 0) {
								$rootScope.TL.sutmitted = true;
								$scope.sutmitted = true;

								if(($rootScope.KB.type == 60 && myCorect >= 1) || ($rootScope.KB.type == 100 && myCorect >= 2)) {
									$rootScope.KB.tl = true;
									setStorage("KB", angular.copy($rootScope.KB));
								}
							} else {
								$rootScope.Alert("提交答案失败，请稍后再试。");
							}
						}).error(function(response, status) {
							$rootScope.LoadingHide();
							$rootScope.Alert('连接失败！[' + response + status + ']');
							return;
						});
						//#endregion
					} else {
						$rootScope.Alert("加油，您还未完成哦！");
					}
				}
			}

			if(id == "reading") {
				if($rootScope.YD.sutmitted) {
					if($rootScope.ResultCount == $rootScope.ResultCurrent) {
						$rootScope.yd_report();
					} else {

						$rootScope.ResultCurrent = parseInt($rootScope.ResultCurrent) + 1;

						$state.go("tf_yd", {
							id: 0
						});

						$rootScope.YD.sutmitted = false;

					}
				} else {

					var isDone = true;
					var myCorect = 0;

					//#region 准备提交答案
					var s = {};
					s.time_exp = Math.floor((new Date().getTime() - $rootScope.beginTestTime) / 1000);
					s.task_no = $rootScope.YD.task_no;
					s.result = [];

					angular.forEach($rootScope.YD.result[parseInt($rootScope.ResultCurrent) - 1], function(item) {
						var a = {};
						a.parentid = item.parentid;
						a.son = [];

						angular.forEach(item.son, function(son) {
							a.son.push({
								"answer": son.myanswer,
								"item_format": son.item_format,
								"item_id": son.item_id,
								"itemanswer": son.keys,
								"itemsubtype": son.item_subtype,
								"pointid": son.new_test_point_id[0],
								"right": (son.myanswer == son.keys ? 1 : 0),
								"subpointid": son.test_point
							})

							if(!son.myanswer) {
								isDone = false;
							}

							if(son.myanswer == son.keys) {
								myCorect++;
							};
						});

						s.result.push(a);
					});
					//#endregion

					if(isDone) {

						//#region 提交答案
						var url = $rootScope.rootUrl + "/read.php";
						var data = {
							"func": "submitRead",
							"unionid": $rootScope.userinfo.unionid,
							"fr": 1,
							"data": JSON.stringify(s)
						};
						encode(data);

						$rootScope.LoadingShow();

						$http.post(url, data).success(function(response) {
							$rootScope.LoadingHide();

							if(response && response.flag == 0) {
								$rootScope.YD.sutmitted = true;
								$scope.sutmitted = true;

								if(($rootScope.KB.type == 60 && myCorect >= 1) || ($rootScope.KB.type == 100 && myCorect >= 2)) {
									$rootScope.KB.yd = true;
									setStorage("KB", angular.copy($rootScope.KB));
								}
							} else {
								$rootScope.Alert("提交答案失败，请稍后再试。");
							}
						}).error(function(response, status) {
							$rootScope.LoadingHide();
							$rootScope.Alert('连接失败！[' + response + status + ']');
							return;
						});
						//#endregion
					} else {
						$rootScope.Alert("加油，您还未完成哦！");
					}
				}
			}

			if(id == "translation") {
				if($rootScope.FY.sutmitted) {
					$rootScope.fy_report();
				} else {
					var isDone = true;
					var myCorect = 0;

					//#region 准备提交答案
					var s = {};
					s.time_exp = Math.floor((new Date().getTime() - $rootScope.beginTestTime) / 1000);
					s.task_no = $rootScope.FY.task_no;
					s.result = [];

					angular.forEach($rootScope.FY.result[0], function(item) {
						var a = {};

						a.answer = item.myanswer;
						a.item_format = item.item_format;
						a.item_id = item.item_id;
						a.item_subtype_name = item.item_subtype_name;
						a.itemanswer = item.keys;
						a.itemsubtype = item.item_subtype;
						a.pointid = item.new_test_point_id;
						a.right = (item.myanswer == item.keys ? 1 : 0);
						a.subpointid = item.test_point;

						if(!item.myanswer) {
							isDone = false;
						}

						if(item.myanswer == item.keys) {
							myCorect++;
						};

						s.result.push(a);
					});
					//#endregion

					if(isDone) {
						//#region 提交答案
						var url = $rootScope.rootUrl + "/translation.php";
						var data = {
							"func": "submitAnswer",
							"unionid": $rootScope.userinfo.unionid,
							"fr": 1,
							"data": JSON.stringify(s)
						};
						encode(data);

						$rootScope.LoadingShow();

						$http.post(url, data).success(function(response) {
							$rootScope.LoadingHide();

							if(response && response.flag == 0) {
								$rootScope.FY.sutmitted = true;
								$scope.sutmitted = true;

								if(($rootScope.KB.type == 60 && myCorect >= 1) || ($rootScope.KB.type == 100 && myCorect >= 2)) {
									$rootScope.KB.fy = true;
									setStorage("KB", angular.copy($rootScope.KB));
								}
							} else {
								$rootScope.Alert("提交答案失败，请稍后再试。");
							}
						}).error(function(response, status) {
							$rootScope.LoadingHide();
							$rootScope.Alert('连接失败！[' + response + status + ']');
							return;
						});
						//#endregion
					} else {
						$rootScope.Alert("加油，您还未完成哦！");
					}
				}
			}

			if(id == "writing") {
				if($rootScope.XZ.sutmitted) {
					$rootScope.xz_report();
				} else {
					var isDone = true;
					var myCorect = 0;

					//#region 准备提交答案
					var s = {};
					s.time_exp = Math.floor((new Date().getTime() - $rootScope.beginTestTime) / 1000);
					s.task_no = $rootScope.XZ.task_no;
					s.result = [];

					angular.forEach($rootScope.XZ.result[0], function(item) {
						var _i = 0;
						var a = {};

						a.answer = item.myanswer;
						a.id = _i + 1;
						a.item_format = item.item_format;
						a.item_id = item.item_id;
						a.item_subtype_name = item.item_subtype_name;
						a.itemanswer = item.keys;
						a.itemsubtype = item.item_subtype;
						a.passage_id = _i;
						a.pointid = item.new_test_point_id;
						a.right = (item.myanswer == item.keys ? 1 : 0);
						a.subpointid = item.test_point;

						if(!item.myanswer) {
							isDone = false;
						}

						if(item.myanswer == item.keys) {
							myCorect++;
						};

						s.result.push(a);
						_i++;
					});
					//#endregion

					if(isDone) {
						//#region 提交答案
						var url = $rootScope.rootUrl + "/write.php";
						var data = {
							"func": "submitAnswer",
							"unionid": $rootScope.userinfo.unionid,
							"fr": 1,
							"data": JSON.stringify(s)
						};
						encode(data);

						$rootScope.LoadingShow();

						$http.post(url, data).success(function(response) {
							$rootScope.LoadingHide();

							if(response && response.flag == 0) {
								$rootScope.XZ.sutmitted = true;
								$scope.sutmitted = true;

								if(($rootScope.KB.type == 60 && myCorect >= 1) || ($rootScope.KB.type == 100 && myCorect >= 2)) {
									$rootScope.KB.xz = true;
									setStorage("KB", angular.copy($rootScope.KB));
								}
							} else {
								$rootScope.Alert("提交答案失败，请稍后再试。");
							}
						}).error(function(response, status) {
							$rootScope.LoadingHide();
							$rootScope.Alert('连接失败！[' + response + status + ']');
							return;
						});
						//#endregion
					} else {
						$rootScope.Alert("加油，您还未完成哦！");
					}
				}
			}
		}

	})

	.controller('tf_reportCtrl', function($rootScope, $scope, $state, $http, $stateParams) {
		var id = $stateParams.id;
		$scope.id = id;

		if(id == "listening") {
			$scope.name = "听力";

			var url = $rootScope.rootUrl + "/listening.php";
			var data = {
				"func": "getScoreHistory",
				"level": $rootScope.userinfo.level,
				"unionid": $rootScope.userinfo.unionid,
				"fr": 1
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response && response.data.length) {
					//var x = [];
					//var y = [];

					//for (i = response.data.length - 1; i >= 0; i--)
					//{
					//    x.push('第' + response.data[i].taskNoStr + '次');
					//    y.push(parseInt(response.data[i].score));
					//}

					var x = [];
					var y = [];
					var x1 = [];
					var y1 = [];

					for(i = response.data.length - 1; i >= 0; i--) {
						var k = $.inArray(response.data[i].taskNoStr, x);

						if(k != -1) {
							y[k].push(parseInt(response.data[i].score));
						} else {
							x.push(response.data[i].taskNoStr);
							y.push([parseInt(response.data[i].score)]);
						}

						//x.push('第' + response.data[i].taskNoStr + '次');
						//y.push(parseInt(response.data[i].score));
					}

					for(k = 0; k < y.length; k++) {
						x1.push('第' + x[k] + '次');
						y1.push(getAvg(y[k]));
					}

					if(x1.length && y1.length) {
						var ichart = new Highcharts.Chart({
							chart: {
								renderTo: 'report_chart',
								type: 'line'
							},
							title: {
								text: '',
								x: 0 //center
							},
							subtitle: {
								text: '预测得分曲线：总分' + $rootScope.TL_Report.sectionFull,
								x: 0
							},
							xAxis: {
								categories: x1,
								tickWidth: 0,
								gridLineWidth: 1
							},
							yAxis: {
								title: {
									text: ''
								},
								tickPositions: [0, 50, 100, 150, 200, 250]
							},
							tooltip: {
								valueSuffix: ''
							},
							legend: {
								enabled: false
							},
							colors: ['#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1'],
							series: [{
								name: '得分',
								data: y1
							}]
						});
					}
				} else {
					$rootScope.Alert("获取数据失败，请稍后再试。");
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		}

		if(id == "reading") {
			$scope.name = "阅读";

			var url = $rootScope.rootUrl + "/read.php";
			var data = {
				"func": "getScoreHistory",
				"level": $rootScope.userinfo.level,
				"unionid": $rootScope.userinfo.unionid,
				"fr": 1
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response && response.data.length) {
					var x = [];
					var y = [];
					var x1 = [];
					var y1 = [];

					for(i = response.data.length - 1; i >= 0; i--) {
						var k = $.inArray(response.data[i].taskNoStr, x);

						if(k != -1) {
							y[k].push(parseInt(response.data[i].score));
						} else {
							x.push(response.data[i].taskNoStr);
							y.push([parseInt(response.data[i].score)]);
						}
						//x.push('第' + response.data[i].taskNoStr + '次');
						//y.push(parseInt(response.data[i].score));
					}

					for(k = 0; k < y.length; k++) {
						x1.push('第' + x[k] + '次');
						y1.push(getAvg(y[k]));
					}

					if(x1.length && y1.length) {
						var ichart = new Highcharts.Chart({
							chart: {
								renderTo: 'report_chart',
								type: 'line'
							},
							title: {
								text: '',
								x: 0 //center
							},
							subtitle: {
								text: '预测得分曲线：总分' + $rootScope.YD_Report.sectionFull,
								x: 0
							},
							xAxis: {
								categories: x1,
								tickWidth: 0,
								gridLineWidth: 1
							},
							yAxis: {
								title: {
									text: ''
								},
								tickPositions: [0, 50, 100, 150, 200, 250]
							},
							tooltip: {
								valueSuffix: ''
							},
							legend: {
								enabled: false
							},
							colors: ['#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1'],
							series: [{
								name: '得分',
								data: y1
							}]
						});
					}
				} else {
					$rootScope.Alert("获取数据失败，请稍后再试。");
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		}

		if(id == "translation") {
			$scope.name = "翻译";

			var url = $rootScope.rootUrl + "/translation.php";
			var data = {
				"func": "getScoreHistory",
				"level": $rootScope.userinfo.level,
				"unionid": $rootScope.userinfo.unionid,
				"fr": 1
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response && response.data.length) {
					var x = [];
					var y = [];

					for(i = response.data.length - 1; i >= 0; i--) {
						x.push('第' + response.data[i].taskNoStr + '次');
						y.push(parseInt(response.data[i].score));
					}

					if(x.length && y.length) {
						var ichart = new Highcharts.Chart({
							chart: {
								renderTo: 'report_chart',
								type: 'line'
							},
							title: {
								text: '',
								x: 0 //center
							},
							subtitle: {
								text: '预测得分曲线：总分' + $rootScope.FY_Report.sectionFull,
								x: 0
							},
							xAxis: {
								categories: x,
								tickWidth: 0,
								gridLineWidth: 1
							},
							yAxis: {
								title: {
									text: ''
								},
								tickPositions: [0, 20, 40, 60, 80, 100, 120]
							},
							tooltip: {
								valueSuffix: ''
							},
							legend: {
								enabled: false
							},
							colors: ['#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1'],
							series: [{
								name: '得分',
								data: y
							}]
						});
					}
				} else {
					$rootScope.Alert("获取数据失败，请稍后再试。");
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		}

		if(id == "writing") {
			$scope.name = "写作";

			var url = $rootScope.rootUrl + "/write.php";
			var data = {
				"func": "getScoreHistory",
				"level": $rootScope.userinfo.level,
				"unionid": $rootScope.userinfo.unionid,
				"fr": 1
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response && response.data.length) {
					var x = [];
					var y = [];

					for(i = response.data.length - 1; i >= 0; i--) {
						x.push('第' + response.data[i].taskNoStr + '次');
						y.push(parseInt(response.data[i].score));
					}

					if(x.length && y.length) {
						var ichart = new Highcharts.Chart({
							chart: {
								renderTo: 'report_chart',
								type: 'line'
							},
							title: {
								text: '',
								x: 0 //center
							},
							subtitle: {
								text: '预测得分曲线：总分' + $rootScope.XZ_Report.sectionFull,
								x: 0
							},
							xAxis: {
								categories: x,
								tickWidth: 0,
								gridLineWidth: 1
							},
							yAxis: {
								title: {
									text: ''
								},
								tickPositions: [0, 20, 40, 60, 80, 100, 120]
							},
							tooltip: {
								valueSuffix: ''
							},
							legend: {
								enabled: false
							},
							colors: ['#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1', '#0FC0A1'],
							series: [{
								name: '得分',
								data: y
							}]
						});
					}
				} else {
					$rootScope.Alert("获取数据失败，请稍后再试。");
				}

			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
		}

		$scope.continue = function() {

			if(id == "listening") {
				if(($rootScope.userinfo.level == 1 && $rootScope.userinfo.level4 == 1) || ($rootScope.userinfo.level == 2 && $rootScope.userinfo.level6 == 1) || $rootScope.TL_Report.canTaskNum - $rootScope.TL_Report.task_no > 0) {
					$rootScope.tl();
				} else {
					$state.go("me_qrcode");
				}
			} else if(id == "reading") {
				if(($rootScope.userinfo.level == 1 && $rootScope.userinfo.level4 == 1) || ($rootScope.userinfo.level == 2 && $rootScope.userinfo.level6 == 1) || $rootScope.YD_Report.canTaskNum - $rootScope.YD_Report.task_no > 0) {
					$rootScope.yd();
				} else {
					$state.go("me_qrcode");
				}

			} else if(id == "translation") {
				if(($rootScope.userinfo.level == 1 && $rootScope.userinfo.level4 == 1) || ($rootScope.userinfo.level == 2 && $rootScope.userinfo.level6 == 1) || $rootScope.FY_Report.canTaskNum - $rootScope.FY_Report.task_no > 0) {
					$rootScope.fy();
				} else {
					$state.go("me_qrcode");
				}
			} else {
				if(($rootScope.userinfo.level == 1 && $rootScope.userinfo.level4 == 1) || ($rootScope.userinfo.level == 2 && $rootScope.userinfo.level6 == 1) || $rootScope.XZ_Report.canTaskNum - $rootScope.XZ_Report.task_no > 0) {
					$rootScope.xz();
				} else {
					$state.go("me_qrcode");
				}
			}
		}
	})

	//#endregion

	//#region 听力
	.controller('tf_tlCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicSlideBoxDelegate, $interval, $timeout) {
		//#region 初始化数据
		var id = parseInt($stateParams.id);
		var sonIndex = parseInt($stateParams.sonIndex);

		//$rootScope.TL.sutmitted = true;

		if($rootScope.TL.task_no == 1) {
			$scope.tl = $rootScope.TL.result[0][id];

			$rootScope.TL.CurrentIndex = 0;
		} else {
			$scope.tl = $rootScope.TL.result[id][0];

			$rootScope.TL.CurrentIndex = id;
		}

		$scope.id = id;

		angular.forEach($scope.tl.son, function(data) {
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
		});
		//#endregion

		$timeout(function() {
			$ionicSlideBoxDelegate.enableSlide(false);

			if(sonIndex > 0) {
				$ionicSlideBoxDelegate.slide(sonIndex);
			}

		}, 0);

		//#region 答题时间
		var tick = function() {
			$scope.timediff = new Date(new Date().getTime() - $rootScope.beginTestTime);
		}
		tick();
		$interval(tick, 1000);
		//#endregion

		//#region 音频

		//#region 初始化音频
		$scope.media = {
			duration: "0",
			current: "0",
			playing: false
		};

		var v = document.getElementById("audio");
		v.pause();
		v.src = $rootScope.sMp3 + $scope.tl.source_id + ".mp3";

		var v2 = document.getElementById("audioSon");
		v2.pause();
		//#endregion

		$scope.mainPlay = function() {
			$scope.subStop();

			$scope.media.playing = true;

			v.addEventListener("timeupdate", function() {
				$scope.media.duration = v.duration;
				$scope.media.current = v.currentTime;

				$scope.$apply();
			});

			v.addEventListener("ended", function() {
				$scope.media.playing = false;
			});

			v.play();
		}

		$scope.mainPause = function() {
			$scope.media.playing = false;

			v.pause();
		}

		$scope.mainDrag = function() {
			$scope.subStop();

			if($scope.media.duration == 0) {
				return;
			} else {
				v.pause();

				v.currentTime = $scope.media.current;

				$scope.media.playing = true;

				v.play();
			}
		}

		$scope.subPlay = function(sonIndex) {
			var son = $scope.tl.son[sonIndex];

			$scope.mainPause();
			$scope.subStop();

			son.playing = true;

			v2.pause();
			v2.src = $rootScope.iMp3 + son.item_id + ".mp3";
			v2.addEventListener("ended", function() {
				son.playing = false;
			});
			v2.play();

			$ionicSlideBoxDelegate.slide(sonIndex);
		}

		$scope.subStop = function() {
			v2.pause();

			for(i = 0; i < $scope.tl.son.length; i++) {
				$scope.tl.son[i].playing = false;
			}
		}

		//#endregion

		//#region 选择答案
		$scope.chooseAnswer = function(sonIndex, answer) {
			if(!$rootScope.TL.sutmitted) {
				$scope.tl.son[sonIndex].myanswer = answer;
			}

			setTimeout(function() {
				if(sonIndex + 1 < $scope.tl.son.length) {
					$ionicSlideBoxDelegate.slide(sonIndex + 1);
				} else if(id + 1 < $rootScope.TL.result[0].length) {
					$state.go("tf_tl", {
						id: id + 1
					});
				} else {
					$scope.submit();
				}
			}, 360);
		}
		//#endregion

		//#region 左右滑动
		$scope.slideLeft = function() {
			var i = $ionicSlideBoxDelegate.currentIndex();
			var c = $ionicSlideBoxDelegate.slidesCount();

			if(i + 1 < c) {
				$ionicSlideBoxDelegate.next();
			} else if(id + 1 < $rootScope.TL.result[0].length) {
				$state.go("tf_tl", {
					id: id + 1
				});
			} else {
				$scope.submit();
			}
		}

		$scope.slideRight = function() {

			var i = $ionicSlideBoxDelegate.currentIndex();
			var c = $ionicSlideBoxDelegate.slidesCount();

			if(i - 1 > -1) {
				$ionicSlideBoxDelegate.previous();
			} else if(id > 0) {
				$state.go("tf_tl", {
					id: id - 1
				});
			}
		}

		$scope.pageLeft = function() {
			if(id + 1 < $rootScope.TL.result[0].length) {
				$state.go("tf_tl", {
					id: id + 1
				});
			} else {
				$scope.submit();
			}

		}

		$scope.pageRight = function() {
			if(id > 0) {
				$state.go("tf_tl", {
					id: id - 1
				});
			}
		}
		//#endregion

		$scope.submit = function() {
			$state.go("tf_submit", {
				id: "listening"
			});
		}

		//#region 收藏
		$scope.fav = function(isfav) {

			if(isfav) {
				$scope.tl.isFav = 0;

				//#region 取消收藏
				var url = $rootScope.rootUrl + "/itemErrHistoryFavorite.php";
				var data = {
					"func": "rmFromFavorite",
					"item_id": $scope.tl.parentid,
					"item_order": 0,
					"item_type": $scope.tl.son[id].item_type,
					"item_subtype": $scope.tl.son[id].item_subtype,
					"unionid": $rootScope.userinfo.unionid,
					"fr": 1
				};
				encode(data);

				$rootScope.LoadingShow();

				$http.post(url, data).success(function(response) {
					$rootScope.LoadingHide();

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});
				//#endregion
			} else {
				$scope.tl.isFav = 1;

				//#region 添加收藏
				var url = $rootScope.rootUrl + "/itemErrHistoryFavorite.php";
				var data = {
					"func": "addToFavorite",
					"item_id": $scope.tl.parentid,
					"item_order": 0,
					"item_type": $scope.tl.son[id].item_type,
					"item_subtype": $scope.tl.son[id].item_subtype,
					"topskill": $scope.tl.son[id].new_test_point_id[0],
					"skill": $scope.tl.son[id].test_point,
					"unionid": $rootScope.userinfo.unionid,
					"fr": 1
				};
				encode(data);

				$rootScope.LoadingShow();

				$http.post(url, data).success(function(response) {
					$rootScope.LoadingHide();

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});
				//#endregion
			}
		}
		//#endregion
	})
	//#endregion

	//#region 阅读
	.controller('tf_ydCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicSlideBoxDelegate, $interval, $timeout, $sce) {
		//#region huaci
		stop_browser_behavior: false

		self.touchStart = function(e) {
			self.startCoordinates = getPointerCoordinates(e);

			if(ionic.tap.ignoreScrollStart(e)) {
				return;
			}

			if(ionic.tap.containsOrIsTextInput(e.target)) {
				// do not start if the target is a text input
				// if there is a touchmove on this input, then we can start the scroll
				self.__hasStarted = false;
				return;
			}

			self.__isSelectable = true;
			self.__enableScrollY = true;
			self.__hasStarted = true;
			self.doTouchStart(e.touches, e.timeStamp);
			// e.preventDefault();
		}
		//#endregion

		//#region 初始化数据
		var id = parseInt($stateParams.id);
		var sonIndex = parseInt($stateParams.sonIndex);

		$scope.yd = $rootScope.YD.result[parseInt($rootScope.ResultCurrent) - 1][id];
		$scope.id = id;
		//#endregion

		$(".yd_text").html($scope.yd.text);

		var huaci = new UyuHuaCi();
		huaci.Init('.yd_text');

		$timeout(function() {
			$ionicSlideBoxDelegate.enableSlide(false);

			if(sonIndex > 0) {
				$ionicSlideBoxDelegate.slide(sonIndex);
			}

			$("#dc-input-" + (sonIndex + 1)).addClass("activated");

		}, 500);

		//#region 答题时间
		var tick = function() {
			$scope.timediff = new Date(new Date().getTime() - $rootScope.beginTestTime);
		}
		tick();
		$interval(tick, 1000);
		//#endregion

		//#region 选择答案
		$scope.chooseAnswer = function(sonIndex, answer, detail) {
			if(!$rootScope.YD.sutmitted) {
				$scope.yd.son[sonIndex].myanswer = answer;

				if($scope.yd.item_format == "8") {
					$scope.yd.son[sonIndex].detail = detail;

					$("#dc-input-" + (sonIndex + 1)).val((sonIndex + 1) + ' ' + detail);
				}
			}

			setTimeout(function() {
				if(sonIndex + 1 < $scope.yd.son.length) {
					$ionicSlideBoxDelegate.slide(sonIndex + 1);

					if($scope.yd.item_format == "8") {
						$(".dc-input").removeClass("activated");
						$("#dc-input-" + (sonIndex + 2)).addClass("activated");
					}
				} else if(id + 1 < $rootScope.YD.result[0].length) {
					$state.go("tf_yd", {
						id: id + 1
					});
				} else {
					$scope.submit();
				}
			}, 360);
		}
		//#endregion

		//#region 左右滑动
		$scope.slideLeft = function() {
			var i = $ionicSlideBoxDelegate.currentIndex();
			var c = $ionicSlideBoxDelegate.slidesCount();

			if(i + 1 < c) {
				$ionicSlideBoxDelegate.next();

				if($scope.yd.item_format == "8") {
					$(".dc-input").removeClass("activated");
					$("#dc-input-" + (i + 1)).addClass("activated");
				}
			} else if(id + 1 < $rootScope.YD.result[0].length) {
				$state.go("tf_yd", {
					id: id + 1
				});
			} else {
				$scope.submit();
			}
		}

		$scope.slideRight = function() {

			var i = $ionicSlideBoxDelegate.currentIndex();
			var c = $ionicSlideBoxDelegate.slidesCount();

			if(i - 1 > -1) {
				$ionicSlideBoxDelegate.previous();

				if($scope.yd.item_format == "8") {
					$(".dc-input").removeClass("activated");
					$("#dc-input-" + (i - 1)).addClass("activated");
				}
			} else if(id > 0) {
				$state.go("tf_yd", {
					id: id - 1
				});
			}
		}

		$scope.pageLeft = function() {
			if(id + 1 < $rootScope.YD.result[0].length) {
				$state.go("tf_yd", {
					id: id + 1
				});
			} else {
				$scope.submit();
			}

		}

		$scope.pageRight = function() {
			if(id > 0) {
				$state.go("tf_yd", {
					id: id - 1
				});
			}
		}
		//#endregion

		$scope.submit = function() {
			$state.go("tf_submit", {
				id: "reading"
			});
		}

		//$scope.to_trusted = function (html_code)
		//{
		//return html_code;
		//return $sce.trustAsHtml(html_code);
		//}

		$scope.slide = function() {
			$ionicSlideBoxDelegate.slide(slideIndex);
		}

		//#region 收藏
		$scope.fav = function(isfav) {

			if(isfav) {
				$scope.yd.isFav = 0;

				//#region 取消收藏
				var url = $rootScope.rootUrl + "/itemErrHistoryFavorite.php";
				var data = {
					"func": "rmFromFavorite",
					"item_id": $scope.yd.parentid,
					"item_order": 0,
					"item_type": $scope.yd.son[id].item_type,
					"item_subtype": $scope.yd.son[id].item_subtype,
					"unionid": $rootScope.userinfo.unionid,
					"fr": 1
				};
				encode(data);

				$rootScope.LoadingShow();

				$http.post(url, data).success(function(response) {
					$rootScope.LoadingHide();

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});
				//#endregion
			} else {
				$scope.yd.isFav = 1;

				//#region 添加收藏
				var url = $rootScope.rootUrl + "/itemErrHistoryFavorite.php";
				var data = {
					"func": "addToFavorite",
					"item_id": $scope.yd.parentid,
					"item_order": 0,
					"item_type": $scope.yd.son[id].item_type,
					"item_subtype": $scope.yd.son[id].item_subtype,
					"topskill": $scope.yd.son[id].new_test_point_id[0],
					"skill": $scope.yd.son[id].test_point,
					"unionid": $rootScope.userinfo.unionid,
					"fr": 1
				};
				encode(data);

				$rootScope.LoadingShow();

				$http.post(url, data).success(function(response) {
					$rootScope.LoadingHide();

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});
				//#endregion
			}
		}
		//#endregion
	})
	//#endregion

	//#region 翻译
	.controller('tf_fyCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicSlideBoxDelegate, $interval, $timeout, $sce) {
		//#region 初始化数据
		var id = parseInt($stateParams.id);

		$scope.fy = $rootScope.FY.result[0][id];
		$scope.id = id;

		//#endregion

		//#region 答题时间
		var tick = function() {
			$scope.timediff = new Date(new Date().getTime() - $rootScope.beginTestTime);
		}
		tick();
		$interval(tick, 1000);
		//#endregion

		//#region 选择答案
		$scope.chooseAnswer = function(answer) {
			if(!$rootScope.FY.sutmitted) {
				$scope.fy.myanswer = answer;
			}

			setTimeout(function() {
				if(id + 1 < $rootScope.FY.result[0].length) {
					$state.go("tf_fy", {
						id: id + 1
					});
				} else {
					$scope.submit();
				}
			}, 360);
		}
		//#endregion

		//#region 左右滑动
		$scope.pageLeft = function() {
			if(id + 1 < $rootScope.FY.result[0].length) {
				$state.go("tf_fy", {
					id: id + 1
				});
			} else {
				$scope.submit();
			}

		}

		$scope.pageRight = function() {
			if(id > 0) {
				$state.go("tf_fy", {
					id: id - 1
				});
			}
		}
		//#endregion

		$scope.submit = function() {
			$state.go("tf_submit", {
				id: "translation"
			});
		}

		$scope.to_trusted = function(html_code) {
			return $sce.trustAsHtml(html_code);
		}

		//#region 收藏
		$scope.fav = function(isfav) {

			if(isfav) {
				$scope.fy.isFav = 0;

				//#region 取消收藏
				var url = $rootScope.rootUrl + "/itemErrHistoryFavorite.php";
				var data = {
					"func": "rmFromFavorite",
					"item_id": $scope.fy.item_id,
					"item_order": 0,
					"item_type": $scope.fy.item_type,
					"item_subtype": $scope.fy.item_subtype,
					"unionid": $rootScope.userinfo.unionid,
					"fr": 1
				};
				encode(data);

				$rootScope.LoadingShow();

				$http.post(url, data).success(function(response) {
					$rootScope.LoadingHide();

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});
				//#endregion
			} else {
				$scope.fy.isFav = 1;

				//#region 添加收藏
				var url = $rootScope.rootUrl + "/itemErrHistoryFavorite.php";
				var data = {
					"func": "addToFavorite",
					"item_id": $scope.fy.item_id,
					"item_order": 0,
					"item_type": $scope.fy.item_type,
					"item_subtype": $scope.fy.item_subtype,
					"topskill": $scope.fy.new_test_point_id[0],
					"skill": $scope.fy.test_point,
					"unionid": $rootScope.userinfo.unionid,
					"fr": 1
				};
				encode(data);

				$rootScope.LoadingShow();

				$http.post(url, data).success(function(response) {
					$rootScope.LoadingHide();

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});
				//#endregion
			}
		}
		//#endregion
	})
	//#endregion

	//#region 写作
	.controller('tf_xzCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicSlideBoxDelegate, $interval, $timeout, $sce) {
		//#region 初始化数据
		var id = parseInt($stateParams.id);

		$scope.xz = $rootScope.XZ.result[0][id];
		$scope.id = id;

		//#endregion

		//#region 答题时间
		var tick = function() {
			$scope.timediff = new Date(new Date().getTime() - $rootScope.beginTestTime);
		}
		tick();
		$interval(tick, 1000);
		//#endregion

		//#region 选择答案
		$scope.chooseAnswer = function(answer) {
			if(!$rootScope.XZ.sutmitted) {
				$scope.xz.myanswer = answer;
			}

			setTimeout(function() {
				if(id + 1 < $rootScope.XZ.result[0].length) {
					$state.go("tf_xz", {
						id: id + 1
					});
				} else {
					$state.go("tf_submit", {
						id: "writing"
					});
				}
			}, 360);
		}
		//#endregion

		//#region 左右滑动
		$scope.pageLeft = function() {
			if(id + 1 < $rootScope.XZ.result[0].length) {
				$state.go("tf_xz", {
					id: id + 1
				});
			} else {
				$scope.submit();
			}

		}

		$scope.pageRight = function() {
			if(id > 0) {
				$state.go("tf_xz", {
					id: id - 1
				});
			}
		}
		//#endregion

		$scope.submit = function() {
			$state.go("tf_submit", {
				id: "writing"
			});
		}

		$scope.to_trusted = function(html_code) {
			return $sce.trustAsHtml(html_code);
		}

		//#region 收藏
		$scope.fav = function(isfav) {

			if(isfav) {
				$scope.xz.isFav = 0;

				//#region 取消收藏
				var url = $rootScope.rootUrl + "/itemErrHistoryFavorite.php";
				var data = {
					"func": "rmFromFavorite",
					"item_id": $scope.xz.item_id,
					"item_order": 0,
					"item_type": $scope.xz.item_type,
					"item_subtype": $scope.xz.item_subtype,
					"unionid": $rootScope.userinfo.unionid,
					"fr": 1
				};
				encode(data);

				$rootScope.LoadingShow();

				$http.post(url, data).success(function(response) {
					$rootScope.LoadingHide();

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});
				//#endregion
			} else {
				$scope.xz.isFav = 1;

				//#region 添加收藏
				var url = $rootScope.rootUrl + "/itemErrHistoryFavorite.php";
				var data = {
					"func": "addToFavorite",
					"item_id": $scope.xz.item_id,
					"item_order": 0,
					"item_type": $scope.xz.item_type,
					"item_subtype": $scope.xz.item_subtype,
					"topskill": $scope.xz.new_test_point_id[0],
					"skill": $scope.xz.test_point,
					"unionid": $rootScope.userinfo.unionid,
					"fr": 1
				};
				encode(data);

				$rootScope.LoadingShow();

				$http.post(url, data).success(function(response) {
					$rootScope.LoadingHide();

				}).error(function(response, status) {
					$rootScope.LoadingHide();
					$rootScope.Alert('连接失败！[' + response + status + ']');
					return;
				});
				//#endregion
			}
		}
		//#endregion
	})
	//#endregion

	//#endregion

	//#region 微课
	.controller('wk_homeCtrl', function($rootScope, $scope, $state, $http) {
		$rootScope.LoadingShow();

		$http.get("http://download.kaouyu.com/weike/weike.json").success(function(response) {
			$rootScope.LoadingHide();

			if(response && response.data) {
				$scope.wk = response.data;
			} else {
				$rootScope.Alert("获取数据失败，请稍后再试。");
			}

		}).error(function(response, status) {
			$rootScope.LoadingHide();
			//$rootScope.Alert('连接失败！[' + response + status + ']');
			$scope.wk = {
				"cet4list": [{
					"vid": 1,
					"title": "四级考试题型解析",
					"source": "烤鱿鱼四六级命题研究中心",
					"time": "09分30秒",
					"logo": "http://download.kaouyu.com/weike/image/1.jpg",
					"url": "http://download.kaouyu.com/weike/cet4/cet4test.mp4",
					"level": "cet4"
				}, {
					"vid": 2,
					"title": "四级新闻听力－考前一定要看",
					"source": "烤鱿鱼四六级命题研究中心",
					"time": "16分02",
					"logo": "http://download.kaouyu.com/weike/image/2.jpg",
					"url": "http://download.kaouyu.com/weike/cet4/cet4news.mp4",
					"level": "cet4"
				}, {
					"vid": 3,
					"title": "四级考试题型解析",
					"source": "烤鱿鱼四六级命题研究中心",
					"time": "07分37秒",
					"logo": "http://download.kaouyu.com/weike/image/3.jpg",
					"url": "http://download.kaouyu.com/weike/cet4/cet4long.mp4",
					"level": "cet4"
				}, {
					"vid": 4,
					"title": "四级考试题型解析",
					"source": "烤鱿鱼四六级命题研究中心",
					"time": "07分15秒",
					"logo": "http://download.kaouyu.com/weike/image/4.jpg",
					"url": "http://download.kaouyu.com/weike/cet4/cet4match.mp4",
					"level": "cet4"
				}, {
					"vid": 5,
					"title": "四级选词填空提分技巧",
					"source": "烤鱿鱼四六级命题研究中心",
					"time": "06分59秒",
					"logo": "http://download.kaouyu.com/weike/image/5.jpg",
					"url": "http://download.kaouyu.com/weike/cet4/cet4choose.mp4",
					"level": "cet4"
				}, {
					"vid": 6,
					"title": "四级阅读理解又狠又准的解题方法",
					"source": "烤鱿鱼四六级命题研究中心",
					"time": "16分02秒",
					"logo": "http://download.kaouyu.com/weike/image/6.jpg",
					"url": "http://download.kaouyu.com/weike/cet4/cet4reading.mp4",
					"level": "cet4"
				}, {
					"vid": 7,
					"title": "四级写作－高分审题关键",
					"source": "烤鱿鱼四六级命题研究中心",
					"time": "09分34秒",
					"logo": "http://download.kaouyu.com/weike/image/7.jpg",
					"url": "http://download.kaouyu.com/weike/cet4/cet4writing.mp4",
					"level": "cet4"
				}, {
					"vid": 8,
					"title": "四级翻译必备秘籍",
					"source": "烤鱿鱼四六级命题研究中心",
					"time": "08分12秒",
					"logo": "http://download.kaouyu.com/weike/image/8.jpg",
					"url": "http://download.kaouyu.com/weike/cet4/cet4translating.mp4",
					"level": "cet4"
				}],
				"cet6list": [{
					"vid": 9,
					"title": "六级听力技巧",
					"source": "烤鱿鱼四六级命题研究中心",
					"time": "14分19秒",
					"logo": "http://download.kaouyu.com/weike/image/9.jpg",
					"url": "http://download.kaouyu.com/weike/cet6/cet6listening.mp4",
					"level": "cet6"
				}, {
					"vid": 10,
					"title": "解析六级新增题型－讲座讲话",
					"source": "烤鱿鱼四六级命题研究中心",
					"time": "06分39秒",
					"logo": "http://download.kaouyu.com/weike/image/10.jpg",
					"url": "http://download.kaouyu.com/weike/cet6/cet6lecture.mp4",
					"level": "cet6"
				}, {
					"vid": 11,
					"title": "六级段落匹配题,这样做",
					"source": "烤鱿鱼四六级命题研究中心",
					"time": "11分46秒",
					"logo": "http://download.kaouyu.com/weike/image/11.jpg",
					"url": "http://download.kaouyu.com/weike/cet6/cet6match.mp4",
					"level": "cet6"
				}, {
					"vid": 12,
					"title": "如何搞定六级选词填空题",
					"source": "烤鱿鱼四六级命题研究中心",
					"time": "16分10秒",
					"logo": "http://download.kaouyu.com/weike/image/12.jpg",
					"url": "http://download.kaouyu.com/weike/cet6/cet6choose.mp4",
					"level": "cet6"
				}, {
					"vid": 13,
					"title": "六级仔细阅读怎样快速提分",
					"source": "烤鱿鱼四六级命题研究中心",
					"time": "09分18秒",
					"logo": "http://download.kaouyu.com/weike/image/13.jpg",
					"url": "http://download.kaouyu.com/weike/cet6/cet6reading.mp4",
					"level": "cet6"
				}, {
					"vid": 14,
					"title": "六级翻译秘诀",
					"source": "烤鱿鱼四六级命题研究中心",
					"time": "07分59秒",
					"logo": "http://download.kaouyu.com/weike/image/14.jpg",
					"url": "http://download.kaouyu.com/weike/cet6/cet6translating.mp4",
					"level": "cet6"
				}, {
					"vid": 15,
					"title": "解读六级真题新题型结构",
					"source": "烤鱿鱼四六级命题研究中心",
					"time": "07分24秒",
					"logo": "http://download.kaouyu.com/weike/image/15.jpg",
					"url": "http://download.kaouyu.com/weike/cet6/cet6test.mp4",
					"level": "cet6"
				}]
			};
			return;
		});

		$scope.goLink = function(url) {
			//window.open(url, '_blank', 'location=no,enableViewportScale=yes,closebuttoncaption=返回,toolbarposition=top,toolbar=no');
			var v = document.getElementById("video");
			v.src = url;
			v.play();
		}
	})
	//#endregion

	//#region 订阅
	.controller('dy_homeCtrl', function($rootScope, $scope, $state, $http) {
		$scope.wx = {};

		$scope.saveImg = function() {
			var canvas = document.getElementById('myCanvas1');
			ctx = canvas.getContext('2d'),
				img = new Image;
			img.crossOrigin = 'Anonymous';
			img.onload = function() {
				canvas.height = img.height;
				canvas.width = img.width;
				ctx.drawImage(img, 0, 0);

				window.canvas2ImagePlugin.saveImageDataToLibrary(function(msg) {
					$rootScope.Alert("图片已经保存");
				}, function(err) {
					$rootScope.Alert(err);
				}, document.getElementById('myCanvas'));
			};
			img.src = "img/kaouyu_wx.jpg";

		}

		var url = $rootScope.rootUrl + "/baseData.php";
		var data = {
			"func": "getWXNumber",
			"fr": 1
		};
		encode(data);

		$rootScope.LoadingShow();

		$http.post(url, data).success(function(response) {
			$rootScope.LoadingHide();

			if(response && response.data) {
				$scope.wx = response.data;
			} else {
				$rootScope.Alert("获取数据失败，请稍后再试。");
			}

		}).error(function(response, status) {
			$rootScope.LoadingHide();
			$rootScope.Alert('连接失败！[' + response + status + ']');
			return;
		});
	})
	//#endregion

	//#region 模考
	.controller('mk_homeCtrl', function($rootScope, $scope, $state, $http, $ionicModal, $ionicActionSheet) {
		var goCode = false;
		var mk = {};
		var canTaskNum = 0;

		$scope.init = function() {
			//#region 获取模考列表
			var url = $rootScope.rootUrl + "/examination.php";
			var data = {
				"func": "getList",
				"level": $rootScope.userinfo.level,
				"unionid": $rootScope.userinfo.unionid,
				"fr": 1
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response && response.data && response.data.length > 0) {
					$rootScope.MK = response.data;

					var task_no = 0;
					angular.forEach($rootScope.MK, function(item) {
						if(item.isExit) {
							task_no++;
						}
					});

					if(($rootScope.userinfo.level == 1 && $rootScope.userinfo.level4 == 1) || ($rootScope.userinfo.level == 2 && $rootScope.userinfo.level6 == 1) || response.canTaskNum - task_no > 0) {
						goCode = false;
					} else {
						goCode = true;

					}

					canTaskNum = response.canTaskNum;
				}
			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
			//#endregion
		}

		$scope.beginMK = function(i) {
			if(goCode) {
				$state.go("me_qrcode");
				return;
			}

			if($rootScope.userinfo.level == 1 && $rootScope.userinfo.level4 == 0 && i >= canTaskNum) {
				$rootScope.Confirm('非激活用户,只能试用前' + canTaskNum + '套试题！', "去激活", "取消", function() {
					$state.go("me_qrcode");
				}, function() {});
				return;
			}

			if($rootScope.userinfo.level == 2 && $rootScope.userinfo.level6 == 0 && i >= canTaskNum) {
				$rootScope.Confirm('非激活用户,只能试用前' + canTaskNum + '套试题！', "去激活", "取消", function() {
					$state.go("me_qrcode");
				}, function() {});
				return;
			}

			var mk = $rootScope.MK[i];

			if(mk.isExit == 0) {
				$rootScope.Confirm("是否已经准备好了纸质试卷和答题卡！", "确定", "去下载", function() {
					$state.go("mk_detail", {
						"id": i
					});
				}, function() {
					$rootScope.LoadingShow();

					var ref = window.open($rootScope.exam + mk.epaper_path, '_blank', 'location=no,enableViewportScale=yes,closebuttoncaption=返回,toolbarposition=top,hidden=yes');

					ref.addEventListener('loadstop', function(event) {
						$rootScope.LoadingHide();

						ref.show();
					});
				})
			} else {
				$rootScope.mk_report(mk.paperid, i);
			}
		}

		$ionicModal.fromTemplateUrl('templates/mk_submit_xz_fy.html', {
			scope: $scope,
			animation: 'slide-in-up',
			hardwareBackButtonClose: false
		}).then(function(modal) {
			$scope.modalSubmit = modal;
		});

		$ionicModal.fromTemplateUrl('templates/mk_imgs.html', {
			scope: $scope,
			animation: 'slide-in-up',
			hardwareBackButtonClose: false
		}).then(function(modal) {
			$scope.modalImg = modal;
		});

		$scope.openSlide = function(t) {
			if(t == 1) {
				$rootScope.imgs = mk.writing_file;
			}
			if(t == 2) {
				$rootScope.imgs = mk.translate_file;
			}
			$scope.modalImg.show();
		}

		$scope.endMK = function(i, t) {
			mk = $rootScope.MK[i];

			if($rootScope.userinfo.level == 1 && $rootScope.userinfo.level4 == 0 && i >= canTaskNum) {
				$rootScope.Confirm('非激活用户,只能试用前' + canTaskNum + '套试题！', "去激活", "取消", function() {
					$state.go("me_qrcode");
				}, function() {});
				return;
			}

			if($rootScope.userinfo.level == 2 && $rootScope.userinfo.level6 == 0 && i >= canTaskNum) {
				$rootScope.Confirm('非激活用户,只能试用前' + canTaskNum + '套试题！', "去激活", "取消", function() {
					$state.go("me_qrcode");
				}, function() {});
				return;
			}

			if(t == "xz") {
				if(mk.writing_file) {
					$scope.openSlide(1);
				} else if(mk.stu_file_writing || (!mk.stu_file_writing && mk.isExit == 1)) {
					$rootScope.Alert('正在为您批改！');
				} else {

					$scope.mk = mk;
					$scope.submit_type = t;

					$scope.modalSubmit.show();
				}
			}

			if(t == "fy") {
				if(mk.translate_file) {
					$scope.openSlide(2);
				} else if(mk.stu_file_translate || (!mk.stu_file_translate && mk.isExit == 1)) {
					$rootScope.Alert('正在为您批改！');
				} else {

					$scope.mk = mk;
					$scope.submit_type = t;

					$scope.modalSubmit.show();
				}
			}

		}

		$scope.takePhoto = function(t) {
			var _title = "";

			if(t == "xz0") {
				_title = "写作第一页";
			}
			if(t == "xz1") {
				_title = "写作第二页";
			}
			if(t == "fy3") {
				_title = "翻译";
			}

			$ionicActionSheet.show({
				buttons: [{
						text: '拍照'
					},
					{
						text: '从手机相册选择'
					}
				],
				titleText: _title,
				cancelText: '取消',
				cancel: function() {
					return true;
				},
				buttonClicked: function(index) {
					navigator.camera.getPicture(function(imageURI) {

						//var image = "data:image/jpeg;base64," + imageURI;
						var image = imageURI;

						$("." + t + "_pic").css("backgroundImage", "url(" + image + ")");

						if(t == "xz0") {
							mk.file0 = image;
						}
						if(t == "xz1") {
							mk.file1 = image;
						}
						if(t == "fy3") {
							mk.file3 = image;
						}

					}, function(message) {
						log('Failed because: ' + message);
					}, {
						quality: 50, //ios为了避免部分设备上出现内存错误，quality的设定值要低于50。
						destinationType: Camera.DestinationType.FILE_URI, //FILE_URI,DATA_URL
						sourceType: (index == 0 ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY), //CAMERA,SAVEDPHOTOALBUM
						allowEdit: false,
						correctOrientation: true,
						encodingType: Camera.EncodingType.JPEG, //JPEG,PNG
						targetWidth: 2100,
						targetHeight: 2940
					});

					return true;
				}
			});

		}

		$scope.submit = function() {
			var pic1 = mk.file0 || "";
			var pic2 = mk.file1 || "";
			var pic3 = mk.file3 || "";

			if(($scope.submit_type == "xz" && pic1 == "" && pic2 == "") || ($scope.submit_type == "fy" && pic3 == "")) {
				$rootScope.Alert("请确认答题卡是否拍照成功");
			} else {
				$rootScope.LoadingShow();

				var data = {
					"func": "submitFile",
					"unionid": $rootScope.userinfo.unionid,
					"fr": 1,
					"paperid": mk.paperid
				};
				encode(data);

				var formData = new FormData();

				angular.forEach(data, function(v, k) {
					formData.append(k, v);
				});

				//#region 写作提交 - 2页
				if($scope.submit_type == "xz" && pic1 != "" && pic2 != "") {
					window.resolveLocalFileSystemURL(mk.file0, function(fileEntry) {
						fileEntry.file(function(file) {
							var reader = new FileReader();
							reader.onloadend = function(e) {
								var imgBlob = new Blob([this.result], {
									type: "image/jpeg"
								});
								formData.append('file0', imgBlob);

								//#region file1
								window.resolveLocalFileSystemURL(mk.file1, function(fileEntry1) {
									fileEntry1.file(function(file1) {
										var reader1 = new FileReader();
										reader1.onloadend = function(e1) {
											var imgBlob1 = new Blob([this.result], {
												type: "image/jpeg"
											});
											formData.append('file1', imgBlob1);

											//#region 提交数据
											$http({
												url: $rootScope.rootUrl + "/examination.php",
												method: 'post',
												headers: {
													'Content-Type': undefined
												},
												data: formData
											}).then(function(response) {
												$rootScope.LoadingHide();

												if(response && response.data) {
													if(response.data.flag == 0) {
														$rootScope.Alert("提交成功", function() {
															$scope.modalSubmit.hide();

															$scope.init();
														});

													} else if(response.data.flag == -1) {
														if(response.data.err == "解析图片错误") {
															$rootScope.Alert(response.data.err + ",请重新拍照后再提交");
														} else {
															$rootScope.Alert(response.data.err);
														}

													} else {
														$rootScope.Alert("提交错误");
													}
												} else {
													$rootScope.Alert("提交错误");
												}
											});
											//#endregion

										};
										reader1.readAsArrayBuffer(file1);

									}, function(e1) {
										$scope.errorHandler(e1)
									});
								}, function(e1) {
									$scope.errorHandler(e1)
								});
								//#endregion
							};
							reader.readAsArrayBuffer(file);

						}, function(e) {
							$scope.errorHandler(e)
						});
					}, function(e) {
						$scope.errorHandler(e)
					});
				}
				//#endregion

				//#region 写作提交 - 1页
				if($scope.submit_type == "xz" && pic1 != "" && pic2 == "") {
					window.resolveLocalFileSystemURL(mk.file0, function(fileEntry) {
						fileEntry.file(function(file) {
							var reader = new FileReader();
							reader.onloadend = function(e) {
								var imgBlob = new Blob([this.result], {
									type: "image/jpeg"
								});
								formData.append('file0', imgBlob);

								//#region 提交数据
								$http({
									url: $rootScope.rootUrl + "/examination.php",
									method: 'post',
									headers: {
										'Content-Type': undefined
									},
									data: formData
								}).then(function(response) {
									$rootScope.LoadingHide();

									if(response && response.data) {
										if(response.data.flag == 0) {
											$rootScope.Alert("提交成功", function() {
												$scope.modalSubmit.hide();

												$scope.init();
											});

										} else if(response.data.flag == -1) {
											if(response.data.err == "解析图片错误") {
												$rootScope.Alert(response.data.err + ",请重新拍照后再提交");
											} else {
												$rootScope.Alert(response.data.err);
											}

										} else {
											$rootScope.Alert("提交错误");
										}
									} else {
										$rootScope.Alert("提交错误");
									}
								});
								//#endregion
							};
							reader.readAsArrayBuffer(file);

						}, function(e) {
							$scope.errorHandler(e)
						});
					}, function(e) {
						$scope.errorHandler(e)
					});
				}
				//#endregion

				//#region 翻译提交 - 1页
				if($scope.submit_type == "fy" && pic3 != "") {
					window.resolveLocalFileSystemURL(mk.file3, function(fileEntry) {
						fileEntry.file(function(file) {
							var reader = new FileReader();
							reader.onloadend = function(e) {
								var imgBlob = new Blob([this.result], {
									type: "image/jpeg"
								});
								formData.append('file3', imgBlob);

								//#region 提交数据
								$http({
									url: $rootScope.rootUrl + "/examination.php",
									method: 'post',
									headers: {
										'Content-Type': undefined
									},
									data: formData
								}).then(function(response) {
									$rootScope.LoadingHide();

									if(response && response.data) {
										if(response.data.flag == 0) {
											$rootScope.Alert("提交成功", function() {
												$scope.modalSubmit.hide();

												$scope.init();
											});

										} else if(response.data.flag == -1) {
											if(response.data.err == "解析图片错误") {
												$rootScope.Alert(response.data.err + ",请重新拍照后再提交");
											} else {
												$rootScope.Alert(response.data.err);
											}

										} else {
											$rootScope.Alert("提交错误");
										}
									} else {
										$rootScope.Alert("提交错误");
									}
								});
								//#endregion
							};
							reader.readAsArrayBuffer(file);

						}, function(e) {
							$scope.errorHandler(e)
						});
					}, function(e) {
						$scope.errorHandler(e)
					});
				}
				//#endregion

			}
		}

		$scope.init();

		$rootScope.updateUserInfo();
	})

	.controller('mk_detailCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicPopup, $ionicModal, $interval, $ionicActionSheet, $jrCrop) {
		var id = $stateParams.id;
		var mk = $rootScope.MK[id];
		var interval = null;

		$scope.mk = mk;
		$scope.timediff = new Date(1970, 0, 1);

		$scope.status = {
			step: 'zw',
			current: 0,
			count: parseInt(mk.exam_duration) * 60,
			zw: {
				current: 0,
				count: 30 * 60
			},
			tl: {
				current: 0,
				count: (parseInt(mk.exam_duration) - 100) * 60
			},
			yd: {
				current: 0,
				count: 40 * 60
			},
			fy: {
				current: 0,
				count: 30 * 60
			},
		};

		mk.file0 = "";
		mk.file1 = "";

		$ionicModal.fromTemplateUrl('templates/mk_intro.html', {
			scope: $scope,
			animation: 'slide-in-up',
			hardwareBackButtonClose: false
		}).then(function(modal) {
			$scope.modalMK = modal;
		});

		$ionicModal.fromTemplateUrl('templates/mk_submit.html', {
			scope: $scope,
			animation: 'slide-in-up',
			hardwareBackButtonClose: false
		}).then(function(modal) {
			$scope.modalSubmit = modal;
		});

		$scope.beginMK = function() {
			if($scope.status.current == 0) {
				$rootScope.Confirm("开始听力，跳过作文", "是", "否", function() {
					var v = document.getElementById("audio");
					v.pause();
					v.src = $rootScope.exam + mk.audio_path;
					v.play();

					//#region 开始听力
					$scope.status.step = "tl";
					$scope.status.zw.current = $scope.status.zw.count;

					$scope.initTime();
					//#endregion

				}, function() {
					//#region 开始作文
					$scope.initTime();
					//#endregion
				});
			}
		}

		$scope.endMK = function() {
			var v = document.getElementById("audio");
			v.pause();
			$interval.cancel(interval);

			$scope.modalSubmit.show();
		}

		$scope.takePhoto = function(t) {

			var _title = "";

			if(t == "xz") {
				_title = "答题卡1正面";
			}
			if(t == "tl") {
				_title = "答题卡1反面";
			}
			if(t == "yd") {
				_title = "答题卡2正面";
			}
			if(t == "fy") {
				_title = "答题卡2反面";
			}

			$ionicActionSheet.show({
				buttons: [{
						text: '拍照'
					},
					{
						text: '从手机相册选择'
					}
				],
				titleText: _title,
				cancelText: '取消',
				cancel: function() {
					return true;
				},
				buttonClicked: function(index) {
					navigator.camera.getPicture(function(imageURI) {

						//var image = "data:image/jpeg;base64," + imageURI;
						var image = imageURI;

						$("." + t + "_pic").css("backgroundImage", "url(" + image + ")");

						if(t == "xz") {
							mk.file0 = image;
						}
						if(t == "tl") {
							mk.file1 = image;
						}
						if(t == "yd") {
							mk.file2 = image;
						}
						if(t == "fy") {
							mk.file3 = image;
						}

						//$jrCrop.crop({
						//    url: imageURI,
						//    width: 280,
						//    height: 392
						//}).then(function (canvas)
						//{
						//    var image = canvas.toDataURL();

						//    document.getElementById(t + "_pic").style.backgroundImage = "url(" + image + ")";

						//    if (t == "tl")
						//    {
						//        mk.file0=dataURLtoBlob(image);
						//    }
						//    else
						//    {
						//        mk.file1 = dataURLtoBlob(image);
						//    }
						//});

					}, function(message) {
						log('Failed because: ' + message);
					}, {
						quality: 50, //ios为了避免部分设备上出现内存错误，quality的设定值要低于50。
						destinationType: Camera.DestinationType.FILE_URI, //FILE_URI,DATA_URL
						sourceType: (index == 0 ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY), //CAMERA,SAVEDPHOTOALBUM
						allowEdit: false,
						correctOrientation: true,
						encodingType: Camera.EncodingType.JPEG, //JPEG,PNG
						targetWidth: 2100,
						targetHeight: 2940
					});

					return true;
				}
			});

		}

		$scope.initTime = function() {
			//#region 答题时间
			$rootScope.beginTestTime = new Date().getTime();

			var tick = function() {
				$scope.timediff = new Date(new Date().getTime() - $rootScope.beginTestTime - 8 * 60 * 60 * 1000);

				$scope.status.current++;
				$scope.status[$scope.status.step].current++;

				var s = "";
				if($scope.status[$scope.status.step].current > $scope.status[$scope.status.step].count && !$scope.status.alert) {
					$scope.status.alert = true;

					//#region 做完作文
					if($scope.status.step == 'zw') {
						s = "作文时间已过，开始答听力";

						$rootScope.Alert(s, function() {
							var v = document.getElementById("audio");
							v.pause();
							v.src = $rootScope.exam + mk.audio_path;
							v.play();

							$scope.status.step = "tl";

							$scope.status.alert = false;
						});
					}
					//#endregion

					//#region 做完听力
					if($scope.status.step == 'tl') {
						s = "听力时间已过，开始答阅读";

						$rootScope.Alert(s, function() {
							var v = document.getElementById("audio");
							v.pause();
							$scope.status.step = "yd";
							$scope.status.alert = false;
						});

					}
					//#endregion

					//#region 做完阅读
					if($scope.status.step == 'yd') {
						s = "阅读时间已过，开始答翻译";

						$rootScope.Alert(s, function() {
							$scope.status.step = "fy";

							$scope.status.alert = false;
						});

					}
					//#endregion

					//#region 做完翻译
					if($scope.status.step == 'fy') {
						s = "时间已过，开始交卷";

						$rootScope.Alert(s, function() {
							$scope.endMK();
						});

					}
					//#endregion
				}
			}

			tick();
			interval = $interval(tick, 1000);
			//#endregion
		}

		$scope.submit = function() {
			var pic1 = mk.file0 || "";
			var pic2 = mk.file1 || "";
			var pic3 = mk.file2 || "";
			var pic4 = mk.file3 || "";

			if((pic1 == "" && !mk.stu_file_writing) || pic2 == "" || pic3 == "" || (pic4 == "" && !mk.stu_file_translate)) {
				$rootScope.Alert("请确认答题卡是否拍照成功");
			} else {
				$rootScope.LoadingShow();

				var data = {
					"func": "submitData",
					"unionid": $rootScope.userinfo.unionid,
					"fr": 1,
					"paperid": mk.paperid,
					"time": $scope.status.current,
					"time1": "0",
					"time2": "0",
					"time3": "0",
					"time4": "0",
					"file0": mk.file0,
					"file1": mk.file1,
					"file2": mk.file2,
					"file3": mk.file3
				};
				encode(data);

				var formData = new FormData();

				angular.forEach(data, function(v, k) {
					if(k == "file0") {} else if(k == "file1") {} else if(k == "file2") {} else if(k == "file3") {} else {
						formData.append(k, v);
					}
				});

				if(pic1 == "") {
					mk.file0 = mk.file1;
				}
				if(pic4 == "") {
					mk.file3 = mk.file1;
				}

				window.resolveLocalFileSystemURL(mk.file0, function(fileEntry) {
					fileEntry.file(function(file) {
						var reader = new FileReader();
						reader.onloadend = function(e) {
							var imgBlob = new Blob([this.result], {
								type: "image/jpeg"
							});

							if(!mk.stu_file_writing) {
								formData.append('file0', imgBlob);
							}

							//#region file1
							window.resolveLocalFileSystemURL(mk.file1, function(fileEntry1) {
								fileEntry1.file(function(file1) {
									var reader1 = new FileReader();
									reader1.onloadend = function(e1) {
										var imgBlob1 = new Blob([this.result], {
											type: "image/jpeg"
										});
										formData.append('file1', imgBlob1);

										//#region file2
										window.resolveLocalFileSystemURL(mk.file2, function(fileEntry2) {
											fileEntry2.file(function(file2) {
												var reader2 = new FileReader();
												reader2.onloadend = function(e2) {
													var imgBlob2 = new Blob([this.result], {
														type: "image/jpeg"
													});
													formData.append('file2', imgBlob2);

													//#region file3
													window.resolveLocalFileSystemURL(mk.file3, function(fileEntry3) {
														fileEntry3.file(function(file3) {
															var reader3 = new FileReader();
															reader3.onloadend = function(e3) {
																var imgBlob3 = new Blob([this.result], {
																	type: "image/jpeg"
																});

																//#region 提交数据
																if(!mk.stu_file_translate) {
																	formData.append('file3', imgBlob3);
																}

																$http({
																	url: $rootScope.rootUrl + "/examination.php",
																	method: 'post',
																	headers: {
																		'Content-Type': undefined
																	},
																	data: formData
																}).then(function(response) {
																	$rootScope.LoadingHide();

																	if(response && response.data) {
																		if(response.data.flag == 0) {
																			$rootScope.Alert("提交成功", function() {
																				$rootScope.mk_report(mk.paperid, id);

																				$scope.modalSubmit.hide();
																			});

																		} else if(response.data.flag == -1) {
																			if(response.data.err == "解析图片错误") {
																				$rootScope.Alert(response.data.err + ",请重新拍照后再提交");
																			} else {
																				$rootScope.Alert(response.data.err);
																			}

																		} else {
																			$rootScope.Alert("提交错误");
																		}
																	} else {
																		$rootScope.Alert("提交错误");
																	}
																});
																//#endregion
															};
															reader3.readAsArrayBuffer(file3);

														}, function(e3) {
															$scope.errorHandler(e3)
														});
													}, function(e3) {
														$scope.errorHandler(e3)
													});
													//#endregion
												};
												reader2.readAsArrayBuffer(file2);

											}, function(e2) {
												$scope.errorHandler(e2)
											});
										}, function(e2) {
											$scope.errorHandler(e2)
										});
										//#endregion

									};
									reader1.readAsArrayBuffer(file1);

								}, function(e1) {
									$scope.errorHandler(e1)
								});
							}, function(e1) {
								$scope.errorHandler(e1)
							});
							//#endregion
						};
						reader.readAsArrayBuffer(file);

					}, function(e) {
						$scope.errorHandler(e)
					});
				}, function(e) {
					$scope.errorHandler(e)
				});

			}
		}

		setTimeout(function() {
			$scope.modalMK.show();
		}, 500);

	})

	.controller('mk_reportCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicModal) {
		var id = $stateParams.id;
		$rootScope.MKIndex = id;
		$scope.mk = $rootScope.MK[id];

		var tempMain = [];
		var tempSub = [];
		var f1 = [];
		var f2 = [];

		//alert($rootScope.MK_Report.writing_teacher==null);

		angular.forEach($rootScope.MK_Report.record, function(item) {
			var i = $.inArray(item.item_type + '|' + item.item_subtype, f2);

			if(i != -1) {
				tempSub[i].son.push(item);
			} else {
				var s = item.item_type + '|' + item.item_subtype;
				f2.push(s);

				if(s == "1|5") {
					if($rootScope.userinfo.level == "1") {
						item_name = "新闻";
					} else {
						item_name = "讲座";
					}
				}
				if(s == "1|1") {
					item_name = "短对话";
				}
				if(s == "1|2") {
					item_name = "长对话";
				}
				if(s == "1|3") {
					item_name = "听力长篇";
				}

				if(s == "2|3") {
					item_name = "选词填空";
				}
				if(s == "2|2") {
					item_name = "匹配题";
				}
				if(s == "2|1") {
					item_name = "选择题";
				}

				tempSub.push({
					item_type: item.item_type,
					item_name: item_name,
					item_subtype: item.item_subtype,
					son: [item]
				});
			}
		});

		angular.forEach(tempSub, function(item) {
			var i = $.inArray(item.item_type, f1);

			if(i != -1) {
				tempMain[i].son.push(item);
			} else {
				f1.push(item.item_type);

				if(item.item_type == "1") {
					item_name = "听力";
				}
				if(item.item_type == "2") {
					item_name = "阅读";
				}

				tempMain.push({
					item_type: item.item_type,
					item_name: item_name,
					son: [item]
				});
			}
		});

		$scope.MKGroup = tempMain;

		$scope.goDetail = function(record_id, item_id, item_type, paperid) {
			//#region 获取模考单项结果
			var url = $rootScope.rootUrl + "/examination.php";
			var data = {
				"func": "getPaperItem",
				"unionid": $rootScope.userinfo.unionid,
				"item_type": item_type,
				"paperid": paperid,
				"fr": 1
			};
			encode(data);

			$rootScope.LoadingShow();

			$http.post(url, data).success(function(response) {
				$rootScope.LoadingHide();

				if(response && response.data && response.data.length > 0) {
					$rootScope.MKResult = response.data;

					var parentIndex = 0;
					var sonIndex = 0;

					angular.forEach($rootScope.MKResult, function(item, index) {
						if(item.parentid == item_id) {
							parentIndex = index;
						}
					});

					angular.forEach($rootScope.MKResult[parentIndex].son, function(item, index) {
						if(item.record.id == record_id) {
							sonIndex = index;
						}
					});

					if(item_type == 1) {
						$state.go("mk_tl", {
							id: parentIndex,
							sonIndex: sonIndex
						});
					} else {
						$state.go("mk_yd", {
							id: parentIndex,
							sonIndex: sonIndex
						});
					}
				} else {
					$rootScope.Alert("获取数据失败");
				}
			}).error(function(response, status) {
				$rootScope.LoadingHide();
				$rootScope.Alert('连接失败！[' + response + status + ']');
				return;
			});
			//#endregion
		}

		//$rootScope.Alert("模考报告说明<br>感谢您对模考的使用，写作和翻译的分数暂时设定为往年考试的平均得分以供参考，我们将在24小时内对写作和翻译模块进行人工批改，请到时查看批改结果。另外，滑动页面到底部为听力和阅读的结果和解析，点击红色或者绿色图标可进入解析页面！");

		$ionicModal.fromTemplateUrl('templates/mk_imgs.html', {
			scope: $scope,
			animation: 'slide-in-up',
			hardwareBackButtonClose: false
		}).then(function(modal) {
			$scope.modalImg = modal;
		});

		$scope.openSlide = function(t) {
			if(t == 1) {
				$rootScope.imgs = $rootScope.MK_Report.writing_file;
			}
			if(t == 2) {
				$rootScope.imgs = $rootScope.MK_Report.translate_file;
			}
			$scope.modalImg.show();
		}

		$ionicModal.fromTemplateUrl('templates/mk_answer.html', {
			scope: $scope,
			animation: 'slide-in-up',
			hardwareBackButtonClose: false
		}).then(function(modal) {
			$scope.modalAnswer = modal;
		});

		$scope.openAnswer = function(t) {
			var _title = "";
			var _content = "";

			if(t == 1) {
				_title = "作文答案";
				if($rootScope.MK_Report.writing_answer != null) {
					_content = $rootScope.MK_Report.writing_answer.replace(/\n/g, "<br>");
				}
			}
			if(t == 2) {
				_title = "翻译答案";
				if($rootScope.MK_Report.translate_answer != null) {
					_content = $rootScope.MK_Report.translate_answer.replace(/\n/g, "<br>");
				}
			}

			if(_content.length > 5) {
				$scope.modalAnswer.show();

				//setTimeout(function ()
				//{

				$(".mk_answer_title").html(_title);
				$(".mk_answer_content").html(_content);

				//}, 800);
			} else {
				$rootScope.Alert("暂无答案，近期添加。");
			}
		}
	})

	.controller('mk_tlCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicSlideBoxDelegate, $interval, $timeout) {
		//#region 初始化数据
		var id = parseInt($stateParams.id);
		var sonIndex = parseInt($stateParams.sonIndex);

		$scope.tl = $rootScope.MKResult[id];
		$scope.id = id;

		angular.forEach($scope.tl.son, function(data) {
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
		});
		//#endregion

		$timeout(function() {
			$ionicSlideBoxDelegate.enableSlide(false);

			if(sonIndex > 0) {
				$ionicSlideBoxDelegate.slide(sonIndex);
			}

		}, 0);

		//#region 音频

		//#region 初始化音频
		$scope.media = {
			duration: "0",
			current: "0",
			playing: false
		};

		var v = document.getElementById("audio");
		v.pause();
		v.src = $rootScope.sMp3 + $scope.tl.source_id + ".mp3";

		var v2 = document.getElementById("audioSon");
		v2.pause();
		//#endregion

		$scope.mainPlay = function() {
			$scope.subStop();

			$scope.media.playing = true;

			v.addEventListener("timeupdate", function() {
				$scope.media.duration = v.duration;
				$scope.media.current = v.currentTime;

				$scope.$apply();
			});

			v.addEventListener("ended", function() {
				$scope.media.playing = false;
			});

			v.play();
		}

		$scope.mainPause = function() {
			$scope.media.playing = false;

			v.pause();
		}

		$scope.mainDrag = function() {
			$scope.subStop();

			if($scope.media.duration == 0) {
				return;
			} else {
				v.pause();

				v.currentTime = $scope.media.current;

				$scope.media.playing = true;

				v.play();
			}
		}

		$scope.subPlay = function(sonIndex) {
			var son = $scope.tl.son[sonIndex];

			$scope.mainPause();
			$scope.subStop();

			son.playing = true;

			v2.pause();
			v2.src = $rootScope.iMp3 + son.item_id + ".mp3";
			v2.addEventListener("ended", function() {
				son.playing = false;
			});
			v2.play();

			$ionicSlideBoxDelegate.slide(sonIndex);
		}

		$scope.subStop = function() {
			v2.pause();

			for(i = 0; i < $scope.tl.son.length; i++) {
				$scope.tl.son[i].playing = false;
			}
		}

		//#endregion

		//#region 选择答案
		$scope.chooseAnswer = function(sonIndex, answer) {
			setTimeout(function() {
				if(sonIndex + 1 < $scope.tl.son.length) {
					$ionicSlideBoxDelegate.slide(sonIndex + 1);
				} else if(id + 1 < $rootScope.MKResult.length) {
					$state.go("mk_tl", {
						id: id + 1,
						sonIndex: 0
					});
				} else {
					$scope.submit();
				}
			}, 360);
		}
		//#endregion

		//#region 左右滑动
		$scope.slideLeft = function() {
			var i = $ionicSlideBoxDelegate.currentIndex();
			var c = $ionicSlideBoxDelegate.slidesCount();

			if(i + 1 < c) {
				$ionicSlideBoxDelegate.next();
			} else if(id + 1 < $rootScope.MKResult.length) {
				$state.go("mk_tl", {
					id: id + 1,
					sonIndex: 0
				});
			} else {
				$scope.submit();
			}
		}

		$scope.slideRight = function() {

			var i = $ionicSlideBoxDelegate.currentIndex();
			var c = $ionicSlideBoxDelegate.slidesCount();

			if(i - 1 > -1) {
				$ionicSlideBoxDelegate.previous();
			} else if(id > 0) {
				$state.go("mk_tl", {
					id: id - 1,
					sonIndex: 0
				});
			}
		}

		$scope.pageLeft = function() {
			if(id + 1 < $rootScope.MKResult.length) {
				$state.go("mk_tl", {
					id: id + 1,
					sonIndex: 0
				});
			} else {
				$scope.submit();
			}

		}

		$scope.pageRight = function() {
			if(id > 0) {
				$state.go("mk_tl", {
					id: id - 1,
					sonIndex: 0
				});
			}
		}
		//#endregion

		$scope.submit = function() {
			$rootScope.Alert("没有更多了");
		}

	})

	.controller('mk_ydCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicSlideBoxDelegate, $interval, $timeout) {
		//#region 初始化数据
		var id = parseInt($stateParams.id);
		var sonIndex = parseInt($stateParams.sonIndex);

		$scope.yd = $rootScope.MKResult[id];
		$scope.id = id;

		angular.forEach($scope.yd.son, function(data) {
			var option_arr = [];

			if(data.option_list.substr(data.option_list.length - 2, 2) == "||") {
				data.option_list = data.option_list.substring(0, data.option_list.length - 2);
			}

			angular.forEach(data.option_list.split('||'), function(str) {
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

			});

			data.option_arr = option_arr;
		});

		if($scope.yd.item_format == "8") {

			var temp = $scope.yd.text.split("___");

			var s = "";

			for(i = 0; i < temp.length; i++) {
				if(s != "") {
					s += '<input type="text" class="dc-input" onclick="inputClick(' + i + ',this)" readonly="readonly" value="' + i + '" id="dc-input-' + i + '" />';
				}
				s += temp[i];
			}

			$scope.yd.text = s;
		}

		$(".yd_text").html($scope.yd.text);

		//#endregion

		$timeout(function() {
			$ionicSlideBoxDelegate.enableSlide(false);

			if(sonIndex > 0) {
				$ionicSlideBoxDelegate.slide(sonIndex);
			}

			$("#dc-input-" + (sonIndex + 1)).addClass("activated");

		}, 500);

		//#region 选择答案
		$scope.chooseAnswer = function(sonIndex, answer, detail) {
			setTimeout(function() {
				if(sonIndex + 1 < $scope.yd.son.length) {
					$ionicSlideBoxDelegate.slide(sonIndex + 1);

					if($scope.yd.item_format == "8") {
						$(".dc-input").removeClass("activated");
						$("#dc-input-" + (sonIndex + 2)).addClass("activated");
					}
				} else if(id + 1 < $rootScope.MKResult.length) {
					$state.go("mk_yd", {
						id: id + 1,
						sonIndex: 0
					});
				} else {
					$scope.submit();
				}
			}, 360);
		}
		//#endregion

		//#region 左右滑动
		$scope.slideLeft = function() {
			var i = $ionicSlideBoxDelegate.currentIndex();
			var c = $ionicSlideBoxDelegate.slidesCount();

			if(i + 1 < c) {
				$ionicSlideBoxDelegate.next();

				if($scope.yd.item_format == "8") {
					$(".dc-input").removeClass("activated");
					$("#dc-input-" + (i + 1)).addClass("activated");
				}
			} else if(id + 1 < $rootScope.MKResult.length) {
				$state.go("mk_yd", {
					id: id + 1,
					sonIndex: 0
				});
			} else {
				$scope.submit();
			}
		}

		$scope.slideRight = function() {
			var i = $ionicSlideBoxDelegate.currentIndex();
			var c = $ionicSlideBoxDelegate.slidesCount();

			if(i - 1 > -1) {
				$ionicSlideBoxDelegate.previous();

				if($scope.yd.item_format == "8") {
					$(".dc-input").removeClass("activated");
					$("#dc-input-" + (i - 1)).addClass("activated");
				}
			} else if(id > 0) {
				$state.go("mk_yd", {
					id: id - 1,
					sonIndex: 0
				});
			}
		}

		$scope.pageLeft = function() {
			if(id + 1 < $rootScope.MKResult.length) {
				$state.go("mk_yd", {
					id: id + 1,
					sonIndex: 0
				});
			} else {
				$scope.submit();
			}

		}

		$scope.pageRight = function() {
			if(id > 0) {
				$state.go("mk_yd", {
					id: id - 1,
					sonIndex: 0
				});
			}
		}
		//#endregion

		$scope.submit = function() {
			$rootScope.Alert("没有更多了");
		}

		$scope.slide = function() {
			$ionicSlideBoxDelegate.slide(slideIndex);
		}

	})
	//#endregion

	//#region 烤词主页
	.controller('kc_homeCtrl', function($rootScope, $scope, $state, $http) {
		var date = new Date();
		$rootScope.throwed_num = parseInt(getStorage("" + formatDate2(date), true));
		//		//#region 获取学习计划
		//		$rootScope.LoadingShow();
		//		var url = $rootScope.rootUrl + "/learn/getsetting";
		//		var data = {
		//			"uid": $rootScope.userinfo.uid,
		//		};
		//		$.post(url, data, function(response) {
		//				$rootScope.LoadingHide();
		//				if(response && response.status == 200) {
		//					$rootScope.plan_data = response.data;
		//					$rootScope.remain = "";
		//					$scope.plan = response.data.plan;
		//					$scope.records = response.data.last_record;
		//					$scope.plan.leftday = leftDay($scope.plan.end_date);
		//					if($scope.records) {
		//						//线状图 - 所有参数都已经条好，只需要从服务端取回数据替换 x,y数组即可。
		//						var x = []; //x轴数据
		//						var y = []; //y轴数据
		//						angular.forEach($scope.records, function(data) {
		//							x.push(data.date);
		//							y.push(data.finish);
		//						});
		//						var ichart = new Highcharts.Chart({
		//							chart: {
		//								renderTo: 'report_chart',
		//								type: 'line',
		//								backgroundColor: 'rgba(0,0,0,0)'
		//							},
		//							title: {
		//								text: '',
		//								x: 0 //center
		//							},
		//							subtitle: {
		//								text: '',
		//								x: 0
		//							},
		//							xAxis: {
		//								categories: x,
		//								tickWidth: 0,
		//								gridLineWidth: 0,
		//								labels: {
		//									style: {
		//										color: '#FFC013',
		//										fontFamily: 'HuakangWawa'
		//									}
		//								}
		//							},
		//							yAxis: {
		//								title: {
		//									text: ''
		//								},
		//								labels: {
		//									style: {
		//										color: '#FFC013',
		//										fontFamily: 'HuakangWawa'
		//									}
		//								},
		//								tickPositions: [10, 20, 30, 40, 50, 60, 70, 80]
		//							},
		//							tooltip: {
		//								valueSuffix: ''
		//							},
		//							legend: {
		//								enabled: false
		//							},
		//							colors: ['#FFC013', '#FFC013', '#FFC013', '#FFC013', '#FFC013', '#FFC013', '#FFC013', '#FFC013', '#FFC013'],
		//							series: [{
		//								name: '词汇量',
		//								data: y
		//							}]
		//						});
		//					}
		//				} else if(response.status == 1) {
		//					$state.go("cs_category", {
		//						"type": "2"
		//					});
		//				} else {
		//					$rootScope.Alert("获取计划失败");
		//				}
		//			}, "json")
		//			//#endregion

		//#region 获取八个要学习的词汇
		$scope.getVocabulary = function() {
			$rootScope.LoadingShow();
			var url = $rootScope.rootUrl + "learn/getvocabulary";
			var data = {
				"uid": $rootScope.userinfo.uid
			};
			$.post(url, data, function(response) {
				$rootScope.LoadingHide();
				if(response && response.status == 200) {

					//保存刚开始获取的八个词汇 后面的操作在此变量上进行
					$rootScope.vocabularys = response.data;

					//保存刚开始获取的八个词汇 后面的操作不在此变量上进行 目的是 获取八个真题的时候使用
					$rootScope.original_vocabularys = angular.copy($rootScope.vocabularys);

					$state.go("kc_main", {
						id: 0
					});
				} else {
					$rootScope.Alert("获取词汇失败");
				}
			}, "json")

		}
		//#endregion

		//#region 获取单词计划
		$scope.getWordPlan = function() {
			$rootScope.LoadingShow();
			var url = $rootScope.wordRootUrl + "user_setting_get";
			var data = {
				"unionid": $rootScope.userinfo.unionid,
				"level": $rootScope.userinfo.level
			};
			$.post(url, data, function(response) {
				$rootScope.LoadingHide();
				if(response.error) {
					$rootScope.Alert("获取计划失败");
				} else {
					$rootScope.word_plan = response;
					$rootScope.word_plan.end_date = $rootScope.word_plan.end_date.substring(0, 10);
				}
			}, "json")
		}
		//#endregion

		//#region 获取要学习的单词
		$scope.wordGet = function() {
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

		//#region 学习记录 错题本 收藏夹
		$scope.record = function(type) {
			$state.go('kc_record', {
				id: type
			});
		}
		//#endregion

		//#region pk
		$scope.startPk = function(type) {
			$state.go('pk_home');
		}
		//#endregion

		//#region setPlan
		$scope.setPlan = function() {
			$state.go('jh_setting');
		}
		//#endregion

		$scope.getWordPlan();

	})
	//#endregion

	//#region 烤词记录
	.controller('kc_recordCtrl', function($rootScope, $scope, $state, $http, $stateParams, $timeout) {

		$scope.id = parseInt($stateParams.id);
		$scope.titleLables = [{
			"type": "1",
			"name": "烤词记录",
			"options": [{
				"subtype": "11",
				"name": "已烤",
				"selected": true
			}, {
				"subtype": "12",
				"name": "已学",
				"selected": false
			}, {
				"subtype": "13",
				"name": "未学",
				"selected": false
			}]
		}, {
			"type": "2",
			"name": "收藏夹",
		}, {
			"type": "3",
			"name": "错题本",
		}];

		$scope.titleLable = $scope.titleLables[$scope.id];
		$scope.page = 0;
		$scope.hasmore = false;
		$scope.subtype = undefined;

		$scope.getList = function(page, type, subtype) {
			$rootScope.LoadingShow();
			var url = $rootScope.wordRootUrl + "word_list";
			var data = {
				"unionid": $rootScope.userinfo.unionid,
				"level": $rootScope.userinfo.level,
				"page": page,
				"page_size": "20",
				"type": type,
				"subtype": subtype
			};
			$.post(url, data, function(response) {
				$rootScope.LoadingHide();
				if(response) {
					$scope.words = response.words;
					$scope.page = response.page;
					$scope.total = response.total;
					//page_size=20
					if(parseInt($scope.page) * 20 < parseInt($scope.total)) {
						$scope.hasmore = true;
					} else {
						$scope.hasmore = false;
					}

				} else {
					$rootScope.Alert("获取词汇失败");
				}
			}, "json")
		}

		$scope.optionSelect = function(index) {
			$scope.page = 0;
			$scope.hasmore = false;
			for(i = 0; i < $scope.titleLable.options.length; i++) {
				if(i == index) {
					$scope.subtype = $scope.titleLable.options[index].subtype;
					$scope.titleLable.options[index].selected = true;
					$scope.getList("1", $scope.titleLable.type, $scope.titleLable.options[index].subtype)
				} else {
					$scope.titleLable.options[i].selected = false;
				}
			}
		}

		if($scope.titleLable.options) {
			$scope.optionSelect(0)
		} else {
			$scope.getList("1", $scope.titleLable.type)
		}

		document.getElementById("lable_down").style.display = 'none';
		$scope.showselect = function() {
			if(document.getElementById("lable_down").style.display == 'none') {
				document.getElementById("lable_down").style.display = 'block';
			} else {
				document.getElementById("lable_down").style.display = 'none';
			}
		};

		$scope.lableSelect = function(index) {
			$scope.hasmore = false;
			$scope.page = 0;
			$scope.subtype = undefined;
			$scope.titleLable = $scope.titleLables[index];
			document.getElementById("lable_down").style.display = 'none';
			if($scope.titleLable.options) {
				$scope.optionSelect(0);
			} else {
				$scope.getList("1", $scope.titleLable.type)
			}
		}

		$scope.isshowAll = false;

		$scope.recordSelect = function(item) {
			$scope.words[item].show = !$scope.words[item].show;
		}

		$scope.showAll = function() {
			$scope.isshowAll = !$scope.isshowAll;
			angular.forEach($scope.words, function(data) {
				data.show = $scope.isshowAll;
			});
		}

		$scope.loadmore = function() {
			$rootScope.LoadingShow();
			var url = $rootScope.wordRootUrl + "word_list";
			var data = {
				"unionid": $rootScope.userinfo.unionid,
				"level": $rootScope.userinfo.level,
				"page": parseInt($scope.page) + 1 + "",
				"page_size": "20",
				"type": $scope.titleLable.type,
				"subtype": $scope.subtype
			};
			$.post(url, data, function(response) {
				$rootScope.LoadingHide();
				if(response) {
					$scope.words = $scope.words.concat(response.words);
					$scope.page = response.page;
					$scope.total = response.total;
					//page_size=20
					if(parseInt($scope.page) * 20 < parseInt($scope.total)) {
						$scope.hasmore = true;
					} else {
						$scope.hasmore = false;
					}

				} else {
					$rootScope.Alert("获取词汇失败");
				}
			}, "json")
		}
	})
	//#endregion

	//#region 烤词根
	.controller('kcg_homeCtrl', function($rootScope, $scope, $state, $http) {

		$scope.kcgGame = function() {
			$state.go("kcg_game");
		}

		$scope.start = function() {
			$state.go("kcg_intro");
		}

	})
	//#endregion

	//#region 设定背单词计划
	.controller('jh_settingCtrl', function($rootScope, $scope, $state, $http, $ionicHistory) {
		//注意如果接口那边返回的 amount 是字符串，需要转换成 int型。
		// $scope.tempData = [{ label: "高频词0", amount: 1500, checked: true }, { label: "高频词2", amount: 1600, checked: false }, { label: "高频词3", amount: 1700, checked: false }];

		//仅用做测试数据，以后可以删除
		//		if(!$rootScope.myCat) {
		//			$rootScope.myCat = {
		//				"id": "4",
		//				"pid": "1",
		//				"label": "四级",
		//				"amount": "4600",
		//				"modified": "2016-07-01 14:43:47",
		//				"subcatlist": [{
		//					"id": "5",
		//					"pid": "4",
		//					"label": "必备词",
		//					"amount": "2000",
		//					"modified": "2016-07-01 14:43:47"
		//				}, {
		//					"id": "6",
		//					"pid": "4",
		//					"label": "高频词",
		//					"amount": "1600",
		//					"modified": "2016-07-01 14:43:47"
		//				}, {
		//					"id": "7",
		//					"pid": "4",
		//					"label": "低频词",
		//					"amount": "100",
		//					"modified": "2016-07-01 14:43:47"
		//				}]
		//			};
		//		}

		//#region 获取词汇类别
		$scope.wordCategory = function() {
			$rootScope.LoadingShow();
			var url = $rootScope.wordRootUrl + "category";
			var data = {
				"unionid": $rootScope.userinfo.unionid,
				"level": $rootScope.userinfo.level
			};
			$.post(url, data, function(response) {
				$rootScope.LoadingHide();
				if(response) {
					$rootScope.word_category = response;
					var soncats = $rootScope.word_plan.select_detail;
					for(var i = 0; i < $rootScope.word_category.length; i++) {
						for(var j = 0; j < soncats.length; j++) {
							if($rootScope.word_category[i].id == soncats[j].id) {
								$rootScope.word_category[i].checked = true;
							}
						}
					}
					$scope.initData();
				} else {
					$rootScope.Alert("获取词汇失败");
				}
			}, "json")
		}
		//#endregion
		$scope.initData = function() {

			//#region 计算单词总量
			$scope.catid_list = [];
			var amount = 0;

			angular.forEach($rootScope.word_category, function(data) {
				if(data.checked) {
					$scope.catid_list.push(parseInt(data.id));
					amount += parseInt(data.amount) - data.throw_away;
				}
			});

			$scope.amount_date.amount = amount;
			//#endregion

			//#region 计算背诵天数和每天单词量
			var day_word = [];
			for(i = 5; i <= 180; i = i + 5) {
				var everyday_word = Math.ceil(Math.ceil($scope.amount_date.amount / i) / 8) * 8;
				day_word.push({
					day: i,
					amount: everyday_word
				});
			}

			$scope.day_word = day_word;
			$scope.plan = $scope.day_word[0];
			$scope.amount_date.date = (new Date()).getTime() + $scope.day_word[0].day * 24 * 60 * 60 * 1000; //day => ms
			//#endregion

		}

		$scope.wordCategory();

		//		angular.forEach($scope.soncats, function(item) {
		//			item.checked = true;
		//		});

		$scope.day_word = []; //用于存储背诵天数和每天单词量(数组类型) exp：{ day: 10, amount: 100 }

		$scope.amount_date = {
			amount: 0,
			date: 0
		}; //用于存储单词总量+结束时间

		$scope.slider = {
			sliderLeft: undefined,
			optionLeft: {
				direction: 'vertical',
				paginationHide: true,
				activeIndex: 0,
				slidesPerView: 5,
				centeredSlides: true,
				spaceBetween: 8,
				showPager: false,
				onInit: function(swiper) {
					$scope.slider.sliderLeft = swiper;
				},
				onSlideChangeEnd(swiper) {
					var i = swiper.activeIndex;
					$scope.slider.sliderRight.slideTo(i);
					$scope.amount_date.date = (new Date()).getTime() + $scope.day_word[i].day * 24 * 60 * 60 * 1000; //day => ms
					$scope.$apply();
				}
			},

			sliderRight: undefined,
			optionRight: {
				direction: 'vertical',
				paginationHide: true,
				activeIndex: 0,
				slidesPerView: 5,
				centeredSlides: true,
				spaceBetween: 8,
				showPager: false,
				onInit: function(swiper) {
					$scope.slider.sliderRight = swiper;
				},
				onSlideChangeEnd(swiper) {
					$scope.slider.sliderLeft.slideTo(swiper.activeIndex);
					$scope.plan = $scope.day_word[swiper.activeIndex];
				}
			},

			sliderHorizontal: undefined,
			optionHorizontal: {
				direction: 'horizontal',
				paginationHide: true,
				slidesPerView: 4.2,
				centeredSlides: false,
				spaceBetween: 8,
				showPager: false,
				onInit: function(swiper) {
					$scope.slider.sliderHorizontal = swiper;
				},
				onSlideChangeEnd(swiper) {
					// $scope.slider.sliderHorizontal.slideTo(swiper.activeIndex);
				}
			}
		}

		$scope.change = function() {
			//由于计算重新输出slider比较慢，加一个loading
			$rootScope.LoadingShow();

			setTimeout(function() {
				$scope.initData();

				if($scope.slider.sliderLeft) {
					$scope.slider.sliderLeft.slideTo(0);
				}

				if($scope.slider.sliderRight) {
					$scope.slider.sliderRight.slideTo(0);
				}

				$rootScope.LoadingHide();
			}, 500);
		}

		$scope.setPlan = function() {
			var select_list = "";
			if($scope.catid_list.length > 0) {
				for(var i = 0; i < $scope.catid_list.length; i++) {
					select_list += $scope.catid_list[i] + ","
				}
			}
			if(select_list.length > 0) {
				select_list = select_list.substring(0, select_list.length - 1);
			}
			var url = $rootScope.wordRootUrl + "user_setting";
			var data = {
				"unionid": $rootScope.userinfo.unionid,
				"level": $rootScope.userinfo.level,
				"select_list": select_list,
				"end_date": getDate($scope.amount_date.date),
				"num": $scope.plan.amount,
			};
			$.post(url, data, function(response) {
				$rootScope.LoadingHide();
				if(response) {
					$rootScope.Alert("计划设置已成功!");
					$ionicHistory.goBack(-1);
				} else {
					$rootScope.Alert("提交失败，请重试");
				}
			}, "json")
		}
	})
	//#endregion

	//#region 单词学习
	.controller('kc_mainCtrl', function($rootScope, $scope, $state, $stateParams, $http) {

		$scope.id = parseInt($stateParams.id);
		if($rootScope.vocabularys) {
			$scope.voc = $rootScope.vocabularys[$scope.id];
			if($scope.voc.question_show == undefined) {
				$scope.voc.question_show = true;
			}
		}

		//#region 炼句
		$scope.sentence = function(index) {
			var sentences = [];
			sentences.push({
				"expl_en": $scope.voc.example[index].en,
				"expl_cn": $scope.voc.example[index].zh
			});
			$state.go("kc_setence", {
				"word": $scope.voc.word,
				"sentences": JSON.stringify(sentences)
			});
		}
		//#endregion

		$scope.speak = function() {
			$state.go("kc_speak", {
				"word": $scope.voc.word,
				"audio": $scope.voc.audio_us,
			});
		}

		if($scope.voc.example) {
			setTimeout(function() {
				for(var m = 0; m < $scope.voc.example.length; m++) {
					$('#' + $scope.voc.word + '_example').append("<div class='row'><div class='col-80'><div class='col'><p style='color:#ffffff'>" + $scope.voc.example[m].en + "</p><p style='color:#222222'>" + $scope.voc.example[m].zh + "</p></div></div><div class='col-20 text-center col-center'><img src='img/dc/lian.png' width=25 id='" + $scope.voc.word + "_eimg_" + m + "')' ></div></div>");
					$('#' + $scope.voc.word + '_eimg_' + m).click(function() {
						$scope.sentence(this.id.toString().substring(this.id.toString().length - 1, this.id.toString().length));
					});
				}
			}, 1000);
		}

		$scope.is_end = false;

		$scope.slideLeft = function() {
			if($scope.id < $rootScope.vocabularys.length - 1) {
				$state.go("kc_main", {
					id: $scope.id + 1
				});
			} else {
				$scope.is_end = true;
			}
		}

		$scope.slideRight = function() {
			if($scope.id > 0) {
				$state.go("kc_main", {
					id: $scope.id - 1
				});
				$scope.is_end = false;
			}
		}

		$scope.simpleTest = function() {

			$rootScope.voc_list = angular.copy($rootScope.vocabularys);
            angular.forEach($rootScope.voc_list,function(data){
            	data.exercise.submited = false;
            	data.exercise.myanswer = undefined;
            })

			$state.go("kc_stest", {
				id: 0
			});
		}
		
		$scope.again = function() {
			$state.go("kc_main", {
				id: 0
			});
		}
		
		$scope.play = function() {
			$rootScope.playWord($rootScope.wordAudioUrl+$scope.voc.audio_us,$("#kc_main_word"))
		}

		//#region 加入学习记录
		$scope.learn = function() {
			$rootScope.LoadingShow();
			var url = $rootScope.wordRootUrl + "word_operate";
			var data = {
				"action": "learn",
				"unionid": $rootScope.userinfo.unionid,
				"word_id": $scope.voc.id,
				"category_id": $scope.voc.category_id,
			}
			$.post(url, data, function(response) {
				$rootScope.LoadingHide();
				if(response) {

				}
			}, "json")
		}
		//#endregion

		$scope.chooseAnswer = function(option) {
			if($scope.voc.exercise.submited) {
				return;
			}
			$scope.voc.exercise.submited = true;
			$scope.voc.exercise.myanswer = option;
			$scope.learn();
			setTimeout(function() {
				$scope.voc.question_show = false;
				$scope.$apply();
			}, 1000);
		}

		//#region 拼写
		$scope.spell = function() {
			var letters = [];
			var word = $scope.voc.word;
			for(var i = 0; i < word.length; i++) {
				if(!letters.contains(word.substring(i, i + 1))) {
					letters.push(word.substring(i, i + 1));
				}
			}
			$state.go("kc_word", {
				'audio': $scope.voc.audio_us,
				'letters': JSON.stringify(letters.sort()),
				'word': $scope.voc.word
			})
		}
		//#endregion

		$scope.explain = false;

		//#region收藏/取消收藏
		$scope.fav = function() {
			if($scope.voc.is_favorite == "0") {
				$rootScope.favorite($scope.voc.id, $scope.voc.category_id, function(response) {
					if(response.error == 0) {
						$scope.voc.is_favorite = "1";
					}
				})
			} else if($scope.voc.is_favorite == "1") {
				$rootScope.remove_favorite($scope.voc.id, $scope.voc.category_id, function(response) {
					if(response.error == 0) {
						$scope.voc.is_favorite = "0";
					}
				})
			}
		}
		//#endregion
		
		//#region 扔烤箱
		$scope.throw = function() {
			if($rootScope.vocabularys.length < 2) {
				$rootScope.Alert("不能再扔了哦 确定都会吗？");
				return;
			}
			$rootScope.root_throw($scope.voc.id, $scope.voc.category_id, function(response) {
				if(response.error == 0) {
					$rootScope.vocabularys.splice($scope.id, 1);
					if($scope.id > $rootScope.vocabularys.length - 1) {
						$scope.id = $rootScope.vocabularys.length - 1;
					}
					$scope.voc = $rootScope.vocabularys[$scope.id];
				} else {
					$rootScope.Alert("扔烤箱失败");
				}
			})
		}
		//#endregion

	})
	//#endregion

	//#region 单词拼写
	.controller('kc_wordCtrl', function($rootScope, $scope, $state, $stateParams, $http) {

		//		$rootScope.Tip('提示', '听录音<br>选出正确的字母组成单词');
		var Regx = /^[A-Za-z]*$/;
		$scope.audio = $stateParams.audio;
		$scope.letters = JSON.parse($stateParams.letters); //单词中包含的字母数组 不重复
		function sortNumber(a, b) {
			return a < b
		}
		$scope.letters = $scope.letters.sort(sortNumber);

		$scope.word = $stateParams.word; //单词的正确拼写
		$scope.answers = []; //单词的正确拼写数组
		for(var i = 0; i < $scope.word.length; i++) {
			$scope.answers.push($scope.word.substring(i, i + 1));
		}
		// $scope.items = [{ submitted: 0, value: 'fa' }, { submitted: 0, value: 'ble' }, { submitted: 0, value: 'bao' }, { submitted: 0, value: 'fe' }];     //选项,sumibit用来标记用户是否答过提了，答过的就不能再点击，并且变灰
		$scope.result = ""; //最终结果
		$scope.play = function() {
			var v = document.getElementById("audio");
			v.src = "audio/error.mp3";
			v.play();
		}
		/*
		 * 点击字母 
		 * @param {Object} index
		 */
		$scope.kongClick = function(index) {
			if(Regx.test($("#" + $scope.word + "_" + index).html())) {
				$("#" + $scope.word + "_" + index).html("&#12288;")
				$("#" + $scope.word + "_" + index).css({
					color: "black"
				})
				$scope.completed = false;
				$scope.has_write = $scope.has_write - 1;
			}
		}
		
		$scope.completed = false;
		$scope.right = true;
		$scope.has_write = 0;

		/**
		 * 点击按钮 
		 * @param {Object} letter
		 */
		$scope.chooseAnswer = function(letter) {

			if(!$scope.completed) {
				for(var i = 0; i < $scope.word.length; i++) {
					if(!Regx.test($("#" + $scope.word + "_" + i).html())) {
						$("#" + $scope.word + "_" + i).html(letter);
						$scope.has_write = $scope.has_write + 1;
						if($scope.has_write == $scope.word.length) {
							for(var i = 0; i < $scope.word.length; i++) {
								if($("#" + $scope.word + "_" + i).html().indexOf($scope.answers[i]) == 0) {
									$("#" + $scope.word + "_" + i).css({
										color: "green"
									})
								} else {
									$("#" + $scope.word + "_" + i).css({
										color: "red"
									})
									$scope.right = false;
								}
							}
							$scope.completed = true;
						}
						return;
					}
				}
			}
		}

		$scope.word_show = false;
		$scope.showWord = function() {
			$scope.word_show = true;
			setTimeout(function() {
				$scope.word_show = false;
				$scope.$apply();
			}, 500)
		}

		$scope.clear = function() {

			$scope.completed = false;
			$scope.right = true;
			$scope.has_write = 0;
			for(var i = 0; i < $scope.word.length; i++) {
				$("#" + $scope.word + "_" + i).html("&#12288;")
				$("#" + $scope.word + "_" + i).css({
					color: "black"
				})
			}
		}

	})
	//#endregion

	//#region 炼句
	.controller('kc_setenceCtrl', function($rootScope, $scope, $state, $stateParams, $http) {

		//		$rootScope.Tip('提示', '听录音<br>选出正确的单词组成句子');
		var Regx = /^[A-Za-z\.]*$/;
		$scope.word = $stateParams.word;
		$scope.sentences = JSON.parse($stateParams.sentences);
		var sentence = $scope.sentences[0];

		$scope.vocs = sentence.expl_en.replace("<u>", "").replace("</u>", "").split(/\s+/);
		$scope.answers = sentence.expl_en.replace("<u>", "").replace("</u>", "").split(/\s+/);

		function sortNumber(a, b) {
			return a < b
		}
		$scope.options = $scope.vocs.sort(sortNumber);

		/*
		 * 点击已选择的字母 
		 * @param {Object} index
		 */
		$scope.kongClick = function(index) {
			if(Regx.test($("#" + $scope.word + "_se_" + index).html())) {
				$("#" + $scope.word + "_se_" + index).html("&#12288;")
				$("#" + $scope.word + "_se_" + index).css({
					'border-bottom': "2px solid #7B5F15"
				})
				$("#" + $scope.word + "_se_" + index).css({
					color: "black"
				})
				$scope.completed = false;
				$scope.has_write = $scope.has_write - 1;
			}
		}

		$scope.completed = false;
		$scope.right = true;
		$scope.has_write = 0;
		/**
		 * 点击按钮 
		 * @param {Object} letter
		 */
		$scope.chooseAnswer = function(letter) {
			if(!$scope.completed) {
				for(var i = 0; i < $scope.answers.length; i++) {
					if(!Regx.test($("#" + $scope.word + "_se_" + i).html())) {
						$("#" + $scope.word + "_se_" + i).html(letter);
						$("#" + $scope.word + "_se_" + i).css({
							'border-bottom': "none"
						})
						$scope.has_write = $scope.has_write + 1;
						if($scope.has_write == $scope.answers.length) {
							for(var i = 0; i < $scope.answers.length; i++) {
								if($("#" + $scope.word + "_se_" + i).html().indexOf($scope.answers[i]) == 0) {
									$("#" + $scope.word + "_se_" + i).css({
										color: "green"
									})
								} else {
									$("#" + $scope.word + "_se_" + i).css({
										color: "red"
									})
									$scope.right = false;
								}
							}
							$scope.completed = true;
						}
						return;
					}
				}
			}
		}

		$scope.word_show = false;
		$scope.showWord = function() {
			$scope.word_show = true;
			setTimeout(function() {
				$scope.word_show = false;
				$scope.$apply();
			}, 500)
		}

		$scope.clear = function() {
			$scope.completed = false;
			$scope.right = true;
			$scope.has_write = 0;
			for(var i = 0; i < $scope.answers.length; i++) {
				$("#" + $scope.word + "_se_" + i).html("&#12288;")
				$("#" + $scope.word + "_se_" + i).css({
					color: "black"
				})
				$("#" + $scope.word + "_se_" + i).css({
					'border-bottom': "2px solid #7B5F15"
				})
			}
		}

		//		//生成随机数的个数rand 即要造多少空格
		//		var rand = parseInt(vocs.length - 1 * Math.random());
		//
		//		//生成随机数的个数不能小于句子单词个数的一半
		//		if(rand < vocs.length / 2) {
		//			rand = Math.round(vocs.length / 2);
		//		}
		//		//生成rand个随机数的数组
		//	
		//	    var rands = [];
		//		for(var i = 0; i < rand; i++) {
		//			var rand2 = parseInt((vocs.length - 1) * Math.random());
		//			if(!rands.contains(rand2)) {
		//				rands.push(rand2);
		//			}
		//		}
		//		//选项
		//		$scope.items = [];
		//		for(var j = 0; j < rands.length; j++) {
		//			$scope.items.push({
		//				submitted: 0,
		//				value: vocs[rands[j]]
		//			})
		//		}
		//		
		//		function sortNumber(a,b) 
		//		{ 
		//			return a - b 
		//		} 
		//		
		//		var key_rands = rands.sort(sortNumber);
		//		//正确答案注意中间用^隔开
		//		$scope.keys = "";
		//		$scope.keysArr=[];
		//		for(var k = 0; k < key_rands.length; k++) {
		//			$scope.keys = ($scope.keys == "" ? vocs[key_rands[k]] : $scope.keys + "^" + vocs[key_rands[k]]);
		//			$scope.keysArr.push(vocs[key_rands[k]])
		//		}
		//		//题干，blank 用来标记是否需要填空
		//		$scope.title_items = [];
		//		for(var l = 0; l < vocs.length; l++) {
		//			if(key_rands.contains(l)) {
		//				$scope.title_items.push({
		//					submitted: 0,
		//					blank: 1,
		//					value: vocs[l]
		//				})
		//			} else {
		//				$scope.title_items.push({
		//					submitted: 0,
		//					blank: 0,
		//					value: vocs[l]
		//				})
		//			}
		//		}
		//
		//		$scope.result = ""; //最终结果
		//		$scope.playButton = 'play.png';
		//		$scope.play = function() {
		//			if($scope.playButton != 'playing.gif') {
		//				$scope.playButton = 'playing.gif';
		//
		//				var v = document.getElementById("audioSon");
		//				//百度语音接口 token 由于跨域问题 需请求后台获取token
		//				v.src = "http://tsn.baidu.com/text2audio?tex=" + sentence.expl_en + "+&lan=zh&cuid=4875412968745211445&ctp=1&tok=24.84d5f84b48d2983876b8aead96e2e0f6.2592000.1470473859.282335-8341308";
		//				v.addEventListener("ended", function() {
		//					$scope.playButton = 'play.png';
		//					$scope.$apply();
		//				});
		//				v.play();
		//			}
		//		}
		//
		//		var timer = null;
		//      var index_num = 0;//从开始数第几个已填写
		//
		//		$scope.chooseAnswer = function(i) {
		//			
		//		    if($scope.items[i].submitted==1||$scope.items[i].submitted==-1){
		//		    	return;
		//		    }
		//			//答题结束或者已经答题过
		//			if($scope.result == $scope.keys || $scope.items[i].submitted || $scope.items[i].submitted == -1) {
		//				return;
		//			}
		//			var myanswer = ($scope.result == "" ? $scope.items[i].value : $scope.result + "^" + $scope.items[i].value);
		//			//正确
		//			if($scope.keysArr[index_num] == $scope.items[i].value) {
		////				playAudio(1);
		//				$scope.items[i].submitted = 1;
		//				$scope.result = myanswer;
		//              $scope.title_items[key_rands[index_num]].submitted = 1;
		//              index_num = index_num+1;
		//
		////				angular.forEach($scope.title_items, function(data) {
		////					if(data.value == item.value) {
		////						data.submitted = 1;
		////					}
		////				});
		//			} else {
		////				playAudio(0);
		//				$scope.items[i].submitted = -1;
		//
		//				timer = setTimeout(function() {
		//					$scope.items[i].submitted = 0;
		//
		//					clearTimeout(timer);
		//
		//					$scope.$apply();
		//
		//				}, 360);
		//			}
		//		}
	})
	//#endregion

	.controller('kc_speakCtrl', function($rootScope, $scope, $state, $stateParams, $http) {

		$scope.recorded = false;
		$scope.playing = false;
		$scope.score = 0;
		$scope.seconds = 0;
		$scope.word = $stateParams.word;
		$scope.audio_us = $stateParams.audio;
		$scope.time_long = 3;

		//		$scope.per_progress = 23;
		//		if($scope.word.en.length > 8) {
		//			$scope.time_long = 5;
		//			$scope.per_progress = 14;
		//		}
		$scope.isFinished = false;
		//	
		//		if($scope.word.zh.split('/').length - 1 == 2 && $scope.word.zh.indexOf('/') > 10) {
		//			setTimeout(function() {
		//				$('#explain_word1').html($scope.word.zh.replace('/', '<br>/'));
		//			}, 100);
		//		}

		// Record audio
		//mp3不支持
		var remoreAudioUrl = "";
		var mediaRec;
		var src = "audio.amr";

		if($rootScope.isIOS) {
			src = audioRecord;
		}

		$scope.clicked = false;
		$scope.recordAudio = function() {
			$scope.if_low_show = false;

			if(!$scope.clicked) {
				$scope.recorded = false;
				$scope.clicked = true;
				$scope.seconds = 0;
				$scope.count = 0;

				mediaRec = new Media(src,
					// success callback
					function() {},
					// error callback
					function(err) {
						$scope.clicked = false;
					}
				);
				// Record audio
				mediaRec.startRecord();

				$("#read_record").attr("src", "img/record_gif.gif")

				var timer = $interval(function() {
					$scope.count++;
					if($scope.count == 1) {} else if($scope.count > $scope.time_long) {
						$scope.seconds = $scope.time_long;
					} else {
						$scope.seconds = $scope.count - 1;
					}

					if($scope.count == $scope.time_long + 1) {
						$("#read_record").attr("src", "img/xiaoxue_cut_09.png")
						$scope.recorded = true;
						$scope.clicked = false;
						mediaRec.stopRecord();
						$scope.uploadAudio($scope.word.en);
					}

					if($scope.count > $scope.time_long) {
						$interval.cancel(timer); //停止并清除
					}

				}, 1000, 10);

			}
		}
		// Play audio
		//

		$scope.uploadAudio = function(word) {  

			$scope.if_low_show = false;

			$rootScope.LoadingShow();
			var fileURL = cordova.file.externalRootDirectory + "audio.amr";

			if($rootScope.isIOS) {
				fileURL = iosFileURL;
			}

			var options = new FileUploadOptions();  
			options.fileKey = "audio";  
			options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);  
			options.mimeType = "audio/x-amr";    //上传参数
			if($rootScope.isIOS) {
				options.mimeType = "audio/wav";
			}
			var params = {};  
			params.text = word;
			params.format = 'amr';
			if($rootScope.isIOS) {
				options.format = "wav";
			}
			options.params = params;   
			var ft = new FileTransfer();   //上传地址
			var SERVER = $rootScope.rootUrl + "/stt";

			ft.upload(fileURL, encodeURI(SERVER), function(r) {     
				$rootScope.LoadingHide();
				var response = JSON.parse(r.response)
				if(response.rate) {
					$scope.score = parseInt(response.rate);
				} else {
					$scope.score = 0;
				}

				if($scope.score < 60) {
					$scope.if_low_show = true;

				}

			}, function(error) {     
				$rootScope.LoadingHide();
				alert("上传失败!请稍后再试 ");  
			}, options);   

		}

		$scope.playRecordAudio = function() {

			if(!$scope.playing) {
				$scope.seconds = 0;
				$scope.count = 0;
				$scope.playing = true;
				mediaRec.play();

				$("#read_play").attr("src", "img/play_gif.gif")
				var timer2 = $interval(function() {
					$scope.count++;
					if($scope.count == 1) {} else if($scope.count > $scope.time_long) {
						$scope.seconds = $scope.time_long;
					} else {
						$scope.seconds = $scope.count - 1;
					}
					$('.progress_bar').width(($scope.per_progress * $scope.seconds) + '%').css("backgroundColor", "#0c7cd6");
					if($scope.seconds == $scope.time_long) {
						$scope.playing = false;
						mediaRec.stop();
						$("#read_play").attr("src", "img/xiaoxue_cut_07.png")
					}
					if($scope.count > $scope.time_long) {
						$interval.cancel(timer2); //停止并清除
					}
				}, 1000, 10);
			}
		}

		$scope.playReadWord1 = function(audio) {
			$rootScope.playWord(audio, $("#read_paly_1"));
		}
		$scope.playReadWord0 = function(audio) {
			$rootScope.playWord(audio, $("#read_paly_0"));
		}
		
		$scope.play = function() {
			$rootScope.playWord($rootScope.wordAudioUrl+$scope.audio_us,$("#kc_speak_word"))
		}
		

	})

	//#region 小测提示
	.controller('kc_tipCtrl', function($rootScope, $scope, $state, $stateParams, $http) {

		$scope.simpleTest = function() {
			$state.go("kc_stest", {
				id: 0
			});
		}

		$scope.again = function() {
			$state.go("kc_main", {
				id: 0
			});
		}
	})
	//#endregion

	//#region 小测
	.controller('kc_stestCtrl', function($rootScope, $scope, $state, $stateParams, $http) {
		$scope.id = parseInt($stateParams.id);
		$scope.voc = $rootScope.voc_list[$scope.id];
		if($scope.voc.exercise.submited) {} else {
			$scope.voc.exercise.submited = false;
			$scope.voc.exercise.myanswer = undefined;
		}

		$scope.is_end = false;
		$scope.chooseAnswer = function(option) {
			if($scope.voc.exercise.submited) {
				return;
			}
			$scope.voc.exercise.submited = true;
			$scope.voc.exercise.myanswer = option;
			//			playAudio($scope.exercise.myanswer == $scope.exercise.keys);
			if($scope.id == $rootScope.voc_list.length - 1) {
				//小测完毕
				//				$state.go("kc_task");
				$scope.is_end = true;
			} else {
				//继续下一个小测
				var timer = setTimeout(function() {
					//小测中每道题需要答对两次才能过关
					if($scope.voc.exercise.answerright_times == 2) {
						return;
					}
					//					$scope.voc.exercise.submited = false;
					if($scope.voc.exercise.myanswer == $scope.voc.exercise.answer) {
						if($scope.voc.exercise.answerright_times != 2) {
							if($scope.voc.exercise.answerright_times == undefined) {
								$scope.voc.exercise.answerright_times = 1;
								var svoc = angular.copy($scope.voc);
								svoc.exercise.submited = false;
								svoc.exercise.myanswer = undefined;
								$rootScope.voc_list.push(svoc)
							} else {
								$scope.voc.exercise.answerright_times + 1;
							}
						}
					} else {
						var svoc = angular.copy($scope.voc);
						svoc.exercise.submited = false;
						svoc.exercise.myanswer = undefined;
						$rootScope.voc_list.push(svoc)
					}
					$state.go("kc_stest", {
						id: $scope.id + 1
					});
					clearTimeout(timer);
				}, 600);
			}
		}

		//#endregion
		$scope.slideLeft = function() {
			if($scope.id < $rootScope.voc_list.length - 1) {
				$state.go("kc_stest", {
					id: $scope.id + 1
				});
			}else{
				$scope.is_end = true;
			}
		}
		$scope.slideRight = function() {
			if($scope.id > 0) {
				$state.go("kc_stest", {
					id: $scope.id - 1
				});
			}
		}

		$scope.getTrueExam = function() {
			var word_id_list = [];
			for(var k = 0; k < $rootScope.voc_list.length; k++) {
				if(word_id_list.length > 0) {
					if(!word_id_list.contains($rootScope.voc_list[k].id)) {
						word_id_list.push($rootScope.voc_list[k].id);
					}
				} else {
					word_id_list.push($rootScope.voc_list[k].id);
				}
			}

			var word_list_str = "";
			if(word_id_list.length > 0) {
				for(var j = 0; j < word_id_list.length; j++) {
					word_list_str += word_id_list[j] + ","
				}
				word_list_str = word_list_str.substring(0, word_list_str.length - 1);

				$rootScope.LoadingShow();
				var url = $rootScope.wordRootUrl + "exercise_list";
				var data = {
					"unionid": $rootScope.userinfo.unionid,
					"level": $rootScope.userinfo.level,
					"word_list": word_list_str //由于获取联系词汇api有误，暂时硬编码
				};
				$.post(url, data, function(response) {
					$rootScope.LoadingHide();
					if(!response.error) {
						$rootScope.ExerciseList = response;
						$state.go("kc_challenge", {
							id: 0
						});
					} else {
						$rootScope.Alert("获取真题失败");
					}
				}, "json");
			}
		}

		$scope.continue = function() {
			$state.go("kc_main", {
				id: 0
			})
		}

		//#region收藏/取消收藏
		$scope.fav = function() {
			if($scope.voc.is_favorite == "0") {
				$rootScope.favorite($scope.voc.id, $scope.voc.category_id, function(response) {
					if(response.error == 0) {
						$scope.voc.is_favorite = "1";
					}
				})
			} else if($scope.voc.is_favorite == "1") {
				$rootScope.remove_favorite($scope.voc.id, $scope.voc.category_id, function(response) {
					if(response.error == 0) {
						$scope.voc.is_favorite = "0";
					}
				})
			}
		}
		//#endregion

		//#region 扔烤箱
		$scope.throw = function() {
			if($rootScope.voc_list.length < 2) {
				$rootScope.Alert("不能再扔了哦 确定都会吗？");
				return;
			}
			$rootScope.root_throw($scope.voc.id, $scope.voc.category_id, function(response) {
				if(response.error == 0) {
					$rootScope.voc_list.splice($scope.id, 1);
					if($scope.id > $rootScope.voc_list.length - 1) {
						$scope.id = $rootScope.voc_list.length - 1;
					}
					$scope.voc = $rootScope.voc_list[$scope.id];
				} else {
					$rootScope.Alert("扔烤箱失败");
				}
			})
		}
		//#endregion
		
		$scope.play = function() {
			$rootScope.playWord($rootScope.wordAudioUrl+$scope.voc.audio_us,$("#kc_stest_word"))
		}
		
		

	})
	//#endregion

	//#region 真题
	.controller('kc_challengeCtrl', function($rootScope, $scope, $state, $stateParams, $http) {

		$scope.id = parseInt($stateParams.id);
		$scope.exercise = $rootScope.ExerciseList[$scope.id];

		if($scope.exercise.option_list) {
			if($scope.exercise.option_list instanceof Array) {} else {
				$scope.exercise.option_list = $scope.exercise.option_list.split("||");
				for(var i = 0; i < $scope.exercise.option_list.length; i++) {
					$scope.exercise.option_list[i] = trim($scope.exercise.option_list[i]);
				}
			}
		}

		if($scope.exercise.item_subtype == '3') {
			$scope.stem_text_arr = $scope.exercise.stem_text.split(" ");
		}

		if($scope.exercise.item_subtype == '2') {
			$scope.if_subtype2_finished = false;
			
			$scope.exercise.stem_text = $scope.exercise.stem_text.replace("___", "<input class='text-center' name='et_tv' id='input_" + $scope.exercise.keys + "' maxlength='" + $scope.exercise.keys.length + "'  style='width:60px'/>");
			alert($scope.exercise.stem_text);
			setTimeout(function() {
				$("#challenge_subtype2_" + $scope.exercise.keys).html($scope.exercise.stem_text);
				//input宽度自适应
				$("#input_" + $scope.exercise.keys).width($scope.exercise.keys.length * 10);
				$("#input_" + $scope.exercise.keys).unbind('keyup').bind('keyup', function() {
					if($(this).val().length < $scope.exercise.keys.length) {
						$(this).css({
							color: "black"
						});
						$scope.if_subtype2_finished = false;
						$scope.$apply();
						//$(this).width(textWidth($(this).val()));
					} else if($(this).val().length == $scope.exercise.keys.length) {
						if($(this).val() == $scope.exercise.keys) {
							$(this).css({
								color: "green"
							});
						} else {
							$(this).css({
								color: "red"
							});
						}
						$scope.if_subtype2_finished = true;
						$scope.$apply();
					}
				});
				
			}, 300)
		}

		$scope.exercise.collect_img = "star.png";
		//#region 音频
		//#region 初始化音频
		$scope.media = {
			duration: "0",
			current: "0",
			playing: false
		};

//		var v = document.getElementById("audio");
//		v.pause();
//		v.src = "audio/1.mp3";
//
//		//#endregion
//		$scope.mainPlay = function() {
//			if(!$scope.media.playing) //播放
//			{
//				$scope.media.playing = true;
//
//				v.addEventListener("timeupdate", function() {
//					$scope.media.duration = v.duration;
//					$scope.media.current = v.currentTime;
//					$scope.$apply();
//				});
//
//				v.addEventListener("ended", function() {
//					$scope.media.playing = false;
//				});
//
//				v.play();
//			} else //暂停
//			{
//				$scope.media.playing = false;
//				v.pause();
//			}
//		}
//
//		$scope.mainDrag = function() {
//			if($scope.media.duration == 0) {
//				return;
//			} else {
//				v.pause();
//				v.currentTime = $scope.media.current;
//				$scope.media.playing = true;
//				v.play();
//			}
//		}
//		//#endregion

        $scope.continue = function() {
			$state.go("kc_main", {
				id: 0
			})
		}
        
		//#region 涂抹题
		$scope.earse = function($event) {
			$($event.currentTarget).addClass("slideout");
		};
		$scope.clear = function() {
			$(".erase-box div").addClass("slideout");
		}
		$scope.is_end = false;

		//#endregion
		$scope.slideLeft = function() {
			if($scope.id < $rootScope.ExerciseList.length - 1) {
				$state.go("kc_challenge", {
					id: $scope.id + 1
				});
			} else {
				$scope.is_end = true;
			}
		}
		$scope.slideRight = function() {
			if($scope.id > 0) {
				$state.go("kc_challenge", {
					id: $scope.id - 1
				});
				$scope.is_end = false;
			}
		}

		$scope.chooseAnswer = function(option) {
			if($scope.exercise.submited) {
				return;
			}
			$scope.exercise.submited = true;
			if(option.substr(0, 1)) {
				$scope.exercise.myanswer = option.substr(0, 1);
			} else if(option.substr(1, 2)) {
				$scope.exercise.myanswer = option.substr(1, 2);
			}
			if($scope.exercise.myanswer == $scope.exercise.keys) {
				setTimeout(function() {
					if($scope.id < $rootScope.ExerciseList.length - 1) {
						$state.go("kc_challenge", {
							id: $scope.id + 1
						});
					}
				}, 1000)
			}
		}

		//#region收藏/取消收藏
		$scope.fav = function() {
			if($scope.exercise.is_favorite == "0") {
				$rootScope.favorite($scope.exercise.word_id, $scope.exercise.category_id, function(response) {
					if(response.error == 0) {
						$scope.exercise.is_favorite = "1";
					}
				})
			} else if($scope.exercise.is_favorite == "1") {
				$rootScope.remove_favorite($scope.exercise.word_id, $scope.exercise.category_id, function(response) {
					if(response.error == 0) {
						$scope.exercise.is_favorite = "0";
					}
				})
			}
		}
		//#endregion

		//#region 扔烤箱
		$scope.throw = function() {
			if($rootScope.voc_list.length < 2) {
				$rootScope.Alert("不能再扔了哦 确定都会吗？");
				return;
			}
			$rootScope.root_throw($scope.exercise.word_id, $scope.exercise.category_id, function(response) {
				if(response.error == 0) {
					$rootScope.ExerciseList.splice($scope.id, 1);
					if($scope.id > $rootScope.ExerciseList.length - 1) {
						$scope.id = $rootScope.ExerciseList.length - 1;
					}
					$scope.exercise = $rootScope.ExerciseList[$scope.id];
				} else {
					$rootScope.Alert("扔烤箱失败");
				}
			})
		}
		//#endregion
		
		$scope.play = function() {
			$rootScope.playWord($rootScope.exerciseAudioUrl+$scope.exercise.item_id+".mp3",$("#kc_challenge_word"))
		}
		
		
		
	})

//#endregion