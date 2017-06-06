/*!

 @Name：UyuHuaCi v0.1 划词组件
 @Author：wangmin
 @Site：http://dict.efenji.com
 @License：LGPL
    
 */

var UyuHuaCi = function (config)
{
    var Speech = new UyuSpeech();
    var v = '0.1';
    var l = 0;
    var t = 0;
    var searchword = "";
    var wordcontent = "";
    var langs = "en";
    var DoShowWord = false;
    var parentContainer;

    var currentWord;
    var HandWordForEN = function (e)
    {
        

        if (e.target.tagName == "A")
        {
            var ahref = e.srcElement.href;
            if (ahref != "undefined" && ahref != "" && ahref.indexOf("http://m.hujiang.com/d/") >= 0)
            {
                str = e.srcElement.innerText;
                GetWidthHeight(e.srcElement);
                GetWord(str);
                return false;
            }
        }
        else
        {
            try
            {
                
                var s = window.getSelection();
                
                if (s.type == "None")
                {
                    return;
                }

                var range = s.getRangeAt(0);
                var node = s.anchorNode;

                var position = range.startOffset;
                var start = range.startOffset, end = range.endOffset;


                //找单词开头
                while (range.toString().match(/^[^\w-'’]/) == null)
                {
                    if (range.startOffset == 0)
                    {
                        start = 0
                        break;
                    }
                    start = range.startOffset;
                    range.setStart(node, (range.startOffset - 1));
                }

                //找单词结尾
                while (range.toString().match(/[^\w-'’]$/) == null)
                {
                    if (range.endOffset == node.length)
                    {
                        end = node.length;
                        break;
                    }
                    end = range.endOffset;
                    range.setEnd(node, range.endOffset + 1);
                };

                range.setStart(node, start);
                range.setEnd(node, end);

                //排除单词头尾非字母字符
                while (range.toString().match(/^[^\w]/) != null)
                {
                    range.setStart(node, (range.startOffset + 1));
                }
                while (range.toString().match(/[^\w]$/) != null)
                {
                    range.setEnd(node, range.endOffset - 1);
                }

                var str = range.toString().trim().replace(/[^\w-'’]/, '');

                if (position == start || position == end)
                {
                    str = '';
                }

                if (str.length == 0)
                {
                    HuaCiClose();
                    return;
                }

                $(".select-word").each(function ()
                {
                    $(this).replaceWith($(this).html());
                });
                var span = document.createElement("span");
                span.className = 'select-word';
                span.innerHTML = range.toString();

                range.deleteContents();
                range.insertNode(span);

                GetWidthHeight(span);

                str = str.replace("’", "'");

                GetWord(str);
                DoShowWord = true;
                return true;
            } catch (ex)
            {

            }
        }
        return false;
    };

    var SupportedLangs = [{
        name: 'en',
        HandWord: HandWordForEN
    }
    ];

    //推广信息
    var GetRecommendADInfo = function ()
    {
        var ua = navigator.userAgent;
        if (ua.indexOf("iPhone") > 0)
        {
            return {
                id: "cihui_ios",
                des: "烤鱿鱼背单词！立即下载>>",
                link: "###"
            };
        } else
        {
            return {
                id: "cihui_android",
                des: "烤鱿鱼背单词！立即下载>>",
                link: "###"
            };
        }



    };


    //get click word for various region.
    var HandWord = function (e)
    {
        //langs = $("#Langs").val();



        var targetLang;
        for (var lindex = 0; lindex < SupportedLangs.length; lindex++)
        {
            if (SupportedLangs[lindex].name == langs)
            {
                targetLang = SupportedLangs[lindex];
                break;
            }
        }
        //alert(targetLang);

        if (!targetLang)
        {
            return false;
        }
        targetLang.HandWord(e);
    };

    var AjaxRequest = function (request)
    {
        $.ajax({
            type: request.method || "GET",
            async: false,
            url: request.url,
            dataType: request.dataType || "text",
            jsonp: request.jsonp || 'callback',
            success: request.success || function (data)
            {

            },
            error: request.error || function (status, code)
            {
                console.log(status);
            }
        });
    };

    var amw_callback = function (json)
    {
        if (json.result == "yes")
        {
            $("#addmywordarea").html("<a href=\"http://m.hujiang.com/d/scb/\" title=\"查看我的生词本\" target=\"_blank\" class=\"more huaciAction\"><img class=\"huaciAction\" style='display:inline' align=\"absmiddle\" src=\"http://dict.hjenglish.com/images/btn_myword_del.gif\" alt=\"查看我的生词本\">已添加</a>");
        }
    };

    var AddMyWord = function ()
    {
        var userID = $("#hiUserID").val();
        if (!userID || userID == "0")
        {
            $("#addmywordarea").html("请先<a onclick=\"ga_track_event('huaci', 'click_login', 'login', 0);Passport.Login();\" class=\"login huaciAction\">登录</a>|<a class=\"signup huaciAction\" onclick=\"ga_track_event('huaci', 'click_signup', 'signup', 0);Passport.Signup();\">注册</a>");
        } else
        {
            var addMyWordUrl = "http://dict.hujiang.com/services/AddMyWordAjax.ashx?w=" + searchword + "&c=" + wordcontent + "&r=http://m.hujiang.com/en/&l=&" + Math.random();
            AjaxRequest({
                url: addMyWordUrl,
                dataType: "jsonp",
                jsonp: 'callback',
                success: function (data)
                {
                    var result = eval(data);
                    amw_callback(result);
                }
            });
        }
    };

    var GetWord = function (word)
    {
        searchword = word;
        // var requestURL = "http://dict.hujiang.com/services/simpleExplain/" + langs + "_simpleExplain.ashx?r=" + Math.random(1) + "&w=" + word;
        var requestURL = "http://dict.hjapi.com/v2/quick/" + langs + "/cn/" + word + "?format=json";
        AjaxRequest({
            url: requestURL,
            dataType: "jsonp",
            jsonp: 'callback',
            success: function (data)
            {
                var defines = data.data.partOfSpeeches;
                if (data && defines)
                {
                    var wd = "";
                    defines.forEach(function (a)
                    {
                        if (a.typeString)
                        {
                            wd += a.typeString;
                        }
                        if (a.definitions)
                        {
                            a.definitions.forEach(function (b)
                            {
                                wd += b.value;
                            });
                        }
                        wd += "<br/>";
                    });
                    ShowWord(wd);
                } else
                {
                    ShowWord("对不起,没有找到您要的内容！");
                }
            }
        });

    };

    var buildSpeech = function (returnContent)
    {

        if (returnContent.indexOf("对不起，没有查询到您要的内容") > 0)
        {
            return "";
        };
        if (searchword.match('\\d'))
        {
            return Speech.GetTTSVoice(searchword);
        };
        return "英:" + Speech.GetTTSVoice('http://tts.yeshj.com/uk/s/' + searchword) + "&nbsp;&nbsp;美:" + Speech.GetTTSVoice(searchword);
    };

    var ShowWord = function (content)
    {
        if ($("#tip").css("display") == "block")
        {
            $("#tip").remove();
        }

        wordcontent = content;

        var rinfo = GetRecommendADInfo();

        var html = "<div class=\"tipBox\" ><div class=\"title\">"
            + "<span class=\"word\">" + searchword + "</span><br/>" + buildSpeech(content)
            + "<a href=\"###\" class=\"close HuaCiClose\" title=\"点击关闭\"><img src=\"http://learn.efenji.com/plugs/img/close.png\" /></a>"
            + "</div>"
            + "<div class=\"content\">" + content + "</div>"
            + "<div class=\"morearea\"><a onclick=\"ga_track_event('huaci', 'click_more', 'more', 0);\" href=\"###\" title=\"查看参考例句\" class=\"more huaciAction\">参考例句»</a>"
            + "<span id=\"addmywordarea\"><a href=\"###\"  class=\"addmyword huaciAction UyuHuaCiAddMyWord\"><img class='huaciAction' style='display:inline' src=\"http://dict.hjenglish.com/images/btn_myword_add.gif\" alt=\"添加到我的生词本\" /><a class='UyuHuaCiAddMyWord huaciAction addmyword'>加入生词本</a><span>"
            + "</div>"

        + "<div class=\"hc_AdInfo\"><a onclick=\"ga_track_event('huaci', 'click_ad', 'ad', " + rinfo.id + ");\" href=\"" + rinfo.link + "\" target=\"_blank\" title=\"用户反馈\" class=\"more huaciAction\">" + rinfo.des + "</a></div></div>";

        var tipDiv = document.createElement("div");
        tipDiv.id = "tip";
        $(tipDiv).html(html).css({ "top": t + 10, "left": l, "z-index": "99999" }).show();
        parentContainer.append(tipDiv);
        $(tipDiv).css({ "display": "block" });

        //Adjust the huaci position.
        var cwoff = $(currentWord).offset();
        if ((cwoff.top + $(tipDiv).height() + 50) > document.body.clientHeight)
        {
            t = (cwoff.top + Math.abs(parentContainer.scrollTop())) - ($(tipDiv).height() + 10);
            $(tipDiv).html(html).css({ "top": t + 10 });
        }

        $(tipDiv).click(function (e)
        {
            if (e.srcElement.tagName != "A" && !$(e.srcElement).hasClass("huaciAction"))
            {
                HuaCiClose();
            } else
            {
                return;
            }
        });
        showWordCallBack && showWordCallBack();
    };

    var HuaCiClose = function ()
    {
        $("#tip").remove();
        $(".select-word").each(function ()
        {
            $(this).replaceWith($(this).html());
        });
    };

    //获取插入的位置坐标
    var GetWidthHeight = function (element)
    {

        currentWord = element;
        var offSetPositon = $(element).offset();

        l = offSetPositon.left;
        t = offSetPositon.top + element.offsetHeight + Math.abs(parentContainer.scrollTop());

        var width = $(window).width();
        var tempWidth = l + 300 - width;
        if (tempWidth > 0)
        {
            l = l - tempWidth - 10;
        }
    };

    var clickWord = function (e)
    {
        DoShowWord = false;


        var wd = HandWord(e);
        if (wd)
        {

        }
    };

    var showWordCallBack;

    return {
        Init: function (container)
        {
            if (container)
            {
                parentContainer = $(container);
            } else
            {
                parentContainer = $(document.body);
            }
            Speech.Init();

            parentContainer.addClass('UyuHuaCi');


            $(".UyuHuaCi").click(function (e)
            {
                
                clickWord(e);
            });

            //close Popup
            $("body,.wrapper").on('click', '*', function (e)
            {
                var s = $("#tip");
                if (s.length > 0 && !DoShowWord && !$(e.target).hasClass("huaciAction") && !$(e.target).hasClass("ro_control"))
                {
                    HuaCiClose();
                }
                DoShowWord = false;
            });

            $("body,.wrapper").on('click', '.HuaCiClose', function (e)
            {
                HuaCiClose();
            });

            //add to bools
            $("body").on('click', '.UyuHuaCiAddMyWord', function (e)
            {
                ga_track_event('huaci', 'click_AddMyWord', '加入生词本', 0);
                //AddMyWord();
                e.stopPropagation();
                e.preventDefault();
            });

        },
        BuildSpeech: function ()
        {
            $("#d_vocab_list .font_big").forEach(function (target)
            {
                searchword = $(target).text();
                $(target).html($("<span style='border:0px;margin-top:3px;margin-bottom:3px;'><span>").html($(target).text() + "<br/>" + buildSpeech($(target).text())));
            });
        },
        showWordCallback: function (e)
        {
            showWordCallBack = e && e.callBack;
        }
    };
};

var UyuSpeech = function ()
{
    var M = function (e, t)
    {
        clearInterval(e.getAttribute("data-anid")), clearTimeout(e.getAttribute("data-sanid")), e.removeAttribute("data-anid"), e.removeAttribute("data-sanid"), t && (e.style.backgroundPosition = t[0] + "px " + t[1] + "px");
    };
    var O = function (e, t, n, r)
    {
        M(e, t[0]);
        var i = 0, s = setInterval(function ()
        {
            e.style.backgroundPosition = t[i][0] + "px " + t[i][1] + "px", i = i < t.length - 1 ? i + 1 : 0
        }, n);
        e.setAttribute("data-anid", s);
        var o = setTimeout(function ()
        {
            M(e, t[0]);
        }, r);
        e.setAttribute("data-sanid", o);
    };

    var GetTTSVoice = function (playerfile)
    {
        if (playerfile.indexOf("http://") < 0)
        {
            playerfile = "http://tts.yeshj.com/s/" + encodeURI(playerfile);
        }
        var str = " <a class='huaciAction voice_track voice-icon voice-style1' src=\"";
        str += playerfile;
        str += "\" href='javascript:void(0);'>";
        str += "</a>";

        return str;
    };

    var Init = function ()
    {
        $("body").on('click', '.voice_track', function (e)
        {
            O(e.target, [[0, 0], [0, -24], [0, -48]], 200, 2000);
            e.stopPropagation();
            e.preventDefault();
            $(this).blur();
            $('.ro_icon_pause').click();
            (new Audio($(e.target).attr("src"))).play();
            return false;
        }).on('mouseout', '.voice_track', function (e)
        {
            $("img", this).attr("src", "/images/btn_voice.gif");
        });
    };

    return { GetTTSVoice: GetTTSVoice, Init: Init };

};