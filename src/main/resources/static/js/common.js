(function($) {
    $.comm = {

        /***
         * 비동기방식으로 서버요청할 경우 사용하는 공통함수
         * @param url : 요청 URL
         * @param data : 파라미터 데이터
         * @param successCallback : 성공시 callback 함수
         * @param errorCallback : 에러시 callback 함수
         * @param async : 비동기 여부
         * @param ownerObj : 콜백함수에서 인자로 넘겨줄 현재 Object
         */
        send: function (url, data, successCallback, errorCallback, async, ownerObj) {

            if (this.isNull(data)) data = {};

            if (this.isNull(data['currMenuCd'])) {
                data['currMenuCd'] = $('#currMenuCd').val();
            }
            if (this.isNull(data['currLangCd'])) {
                data['currLangCd'] = $('#currLangCd').val();
            }

            var paramTitle = {};
            for (var key in data) {
                var label = $("[for*='" + key + "']");
                if (!$.comm.isNull(label) && label.length > 0) {
                    paramTitle[key] = label.html();
                }
            }

            data['paramTitle'] = paramTitle;

            var token = $("meta[name='_csrf']").attr("content");
            var header = $("meta[name='_csrf_header']").attr("content");

            var result =
                $.ajax({
                    type: 'POST',
                    url: globalVar.contextPath + url,
                    dataType: 'json',
                    cache: false,
                    async: $.type(async) === 'undefined' || $.type(async) === 'null' ? true : async,
                    processData: false,
                    contentType: "application/json; charset=UTF-8",
                    enctype: 'multipart/form-data',
                    data: (JSON.stringify(data)).split("null").join(''),
                    beforeSend: function (xhr) {
                        if (!$.comm.isNull(token)) {
                            xhr.setRequestHeader(header, token);
                        }
                        xhr.setRequestHeader("AJAX", true);
                        $.comm.wait(true);
                    },
                    successCallback: successCallback,
                    errorCallback: errorCallback,
                    ownerObj: ownerObj,
                    success: function (data, status) {
                        if(data.status != 0){

                            if(data.status == -9999){ // 시스템에러가 발생하였습니다.
                                alert(data["msg"]);
                                return;
                            }
                            if(data.status == -9001){ // 세션이 만료되었습니다.
                                alert($.comm.getMessage("E0002"));
                                location.reload(true);
                            }
                        }

                        if(!$.comm.isNull(data["msg"])){
                            alert(data["msg"]);
                        }

                        if(!$.comm.isNull(this.successCallback)) {
                            this.successCallback(data, status, this.ownerObj);
                        }

                        if(this.async == false){
                            return data;
                        }
                    },
                    complete:function(){
                        $.comm.wait(false);
                    },
                    error: ($.comm.isNull(errorCallback)) ?
                        function (request,status,error) {
                            console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
                        } : errorCallback
                });

            if(async == false){
                if(result != null && result.responseText != null){
                    return JSON.parse(result.responseText);
                }else{
                    return {};
                }
            }
        },
        /***
         * 동기방식으로 서버요청할 경우 사용하는 공통함수
         * @param url : 요청 URL
         * @param data : 파라미터 데이터
         * @param actionNm : 요청 서비스 설명
         * @returns {Object}
         */
        sendSync: function (url, data) {
            return this.send(url, data, null,null, false);
        },
        /***
         * 메시지 코드로 메시지를 호출
         * @param code  : 메세지 코드
         * @param argObj : 메세지의 아규먼트 ( string, Array)
         * @returns {*}
         */
        getMessage: function (code, argObj) {
            var msgObj = sessionStorage.getItem("DELEO_ADMIN_MESSAGE_OBJ");

            if(msgObj == null){
                var messageList = $.comm.sendSync('/common/getMessage');
                if(messageList) {
                    msgObj = {};
                    messageList.forEach(function (message) {
                        msgObj[message.code] = message.msg
                    });

                    sessionStorage.setItem("DELEO_ADMIN_MESSAGE_OBJ", JSON.stringify(msgObj));

                }
            }else{
                msgObj = JSON.parse(sessionStorage.getItem("DELEO_ADMIN_MESSAGE_OBJ"));
            }

            try{
                var msg = msgObj[code];
                if(argObj != null) {
                    if (Array.isArray(argObj)) {
                        $.each(argObj, function (idx, a) {
                            msg = msg.replace('{' + (idx) + '}', a);
                        })
                    } else {
                        msg = msg.replace('{0}', argObj);
                    }
                }

                return msg.replace(/\\n/g, "\n");
            }catch(e){
                console.log("$.comm.getMessage() error : " + e);
                return '[' + code + "] 메세지가 존재하지 않습니다.";
            }
        },
        clearMessage: function () {
            sessionStorage.removeItem("DELEO_ADMIN_MESSAGE_OBJ");
        },

        /***
         * 1. TAG 속성에 datefield 속성이 있으면 해당 TAG에 CALENDAR 기능을 적용
         *   - datefield의 값이 존재 하면 기본 날짜를 셋팅
         *   - 숫자+속성 : 숫자는 현재날짜를 기준으로 속성에 따라 가감
         *   - 예) 7일전 : '-7'
         *         2달전 : '-2m'
         *         1년전 : '-1y'
         *  2. TAG 속성에 toDatefield 속성이 있으면 해당 TAG와 toDatefield 속성의 값에 지정된 TAG를 dueCalendar로 지정 ( dueCalendar함수를 호출 )
         *    - 기간의 자동 유효성 검사가 됨
         */
        initCalendar : function () {
            var dueDateArr = new Array();
            var selector = $("*[datefield]");

            selector.each(function(idx, oinput){
                var id = $(oinput).get(0).id;
                //$("#"+id).attr("style", "width: 100px; margin-right: 5px");

                $("#"+id).datepicker();

                $("#"+id).css("datepicker");

                // onBlur시 날짜 유효성 검사
                $("#"+id).blur(function() {
                    if(!$.date.isValidDate(this.value)){
                        this.value = "";
                    }else{
                        var val = this.value.trim().replace(/\/|-/g, '');
                        if(val.length == 8){
                            this.value = val.toDate("YYYYMMDD").format("YYYY-MM-DD");
                        }
                    }
                });

                var dateVal = $("#"+id).attr("datefield");
                if(!$.comm.isNull(dateVal)){
                    var currDate = new Date();
                    var pattern = "d"; // default 일
                    if(dateVal.indexOf("m") > 0){
                        pattern = "M";
                        dateVal = dateVal.replace("m", "");

                    }else if(dateVal.indexOf("y") > 0){
                        pattern = "y";
                        dateVal = dateVal.replace("y", "");

                    }

                    var amount = parseInt($.trim(dateVal));
                    var val = currDate.dateAdd2(pattern, amount);

                    $("#"+id).datepicker("setDate", val);
                }

                var toDateId = $("#"+id).attr("toDatefield");
                if(!$.comm.isNull(toDateId)){
                    dueDateArr.push(id+"-"+toDateId);
                }
            });

            if(dueDateArr.length > 0) this.dueCalendar(dueDateArr);
        },
        /***
         * 기간을 가지는 날짜필드 셋팅
         * @param dateIds[Array] : 각 index에 인자는 하이푼으로 구분('formDateId-toDateId)
         */
        dueCalendar : function (dateIds) {
            var convertorDateValue = function (selectedDate) {
                if (!$.comm.isNull(selectedDate)) {
                    var val = selectedDate.trim().replace(/\/|-/g, '');
                    selectedDate = val.toDate("YYYYMMDD").format("YYYY-MM-DD");
                }

                return selectedDate;
            };

            for(var i=0; i<dateIds.length; i++){
                var due = dateIds[i];
                var fromDateId = due.split("-")[0];
                var toDateId = due.split("-")[1];

                $('#'+fromDateId).datepicker("option", "onClose",
                    (function(toId){
                    	return function (selectedDate) {
	                        $('#' + toId).datepicker( "option", "minDate", convertorDateValue(selectedDate));
	                    }
                    })(toDateId)
                    
                );
                $('#'+toDateId).datepicker("option", "onClose",
                	(function(fromId){
                       	return function (selectedDate) {
	                        $('#' + fromId).datepicker( "option", "maxDate", convertorDateValue(selectedDate));
	                    }
                	})(fromDateId)
                );
            }
        },
        dueCalendarCheck : function (formId) {
            var a = $('#' + formId).serializeArray();
            var bool = true;
            $.each(a, function () {
                if ($('#'+this.name).is('[datefield]') && $('#'+this.name).is('[todatefield]')) {
                    var fromDate = this.value;
                    var toDate = $('#'+$('#'+this.name).attr("todatefield")).val();

                    if($.comm.isNull(fromDate) && !$.comm.isNull(toDate)){
                        $(this).focus();
                        bool = false;
                    }
                    if(!$.comm.isNull(fromDate) && $.comm.isNull(toDate)){
                        $('#'+$('#'+this.name).attr("todatefield")).focus();
                        bool = false;
                    }

                    if(bool == false){
                        alert($.comm.getMessage("W0006")); // 날짜기간을 확인하세요.;
                        return bool;
                    }
                }
            })

            return bool;
        },
        getFormData : function (formId) {
            var paramObj = {};

            var selectBox = $("select[disabled=disabled]");
            selectBox.removeAttr("disabled");

            var a = $('#' + formId).serializeArray();
            $.each(a, function () {
                if(this.value != null && this.value != ''){
                    // 날짜필드이면 '-' 삭제
                    if($('#'+this.name).is('[datefield]')){
                        this.value = this.value.trim().replace(/\/|-/g, '');

                    // 숫자필드
                    }else if($('#'+this.name).is('[numberOnly]')){
                        this.value = $.comm.numberWithoutCommas(this.value.trim());
                    }

                    paramObj[this.name] = this.value;
                }
            })

            selectBox.attr("disabled", true);
            return paramObj;
        },
        /**
         * 인자의 Object의 key를 ID로 가지는 객체(TAG)에 value를 지정
         *  - formIdArr 가 있을 경우 해당 폼을 reset
         * @param data : 바인드할 데이터 ( 데이터타입 : Object )
         * @param formIdArr : reset 할 form 정보 ( 테이터타입 : string or array )
         */
        bindData: function (data, formIdArr) {
            if (!$.comm.isNull(formIdArr)){
                if ($.type(formIdArr) == "string"){
                    $('#' + formIdArr)[0].reset();

                }else if ($.type(formIdArr) == 'array') {
                    $.each(formIdArr, function (i, formId) {
                        $('#' + formId)[0].reset();
                    })
                }
            }

            for(var key in data){
                var val = data[key];
                if($.comm.isNull(key) || $('#' + key).length == 0)
                    continue;

                var obj = $('#' + key)[0];
                if(obj.tagName.toLowerCase() == "span" || obj.tagName.toLowerCase() == "strong") {
                    $('#' + key).html(val);

                }else if(obj.tagName.toLowerCase() == "select"){
                    $('#' + key).val(val).attr("selected", "selected");

                }else if(obj.tagName.toLowerCase() == "input" && obj.type.toLowerCase() == 'checkbox'){
                    $('input:checkbox[name="'+key+'"]').each(function() {
                        if(this.value == val){
                            this.checked = true;
                        }
                    });
                }else{
                    if($("#"+key).is("[datefield]")){
                        val = val.trim().replace(/\/|-/g, '');
                        if(val.length == 8){
                            val = val.toDate("YYYYMMDD").format("YYYY-MM-DD");
                        }
                    }

                    $('#' + key).val(val);
                }
            }
        },
        /***
         * 화면 이동시 사용하는 공통 함수
         * @param url    : menuUrl 명
         * @param params : 파라메터
         */
        forward: function (url, params) {
            if($.comm.isNull(url)){
                alert("url 인자(첫번째 인자)는 필수 입니다.");
                return;
            }

            $("#commonForm")[0].reset();
            $("#commonForm").empty();

            for(var p in params){
                $("#commonForm").append($("<input type='hidden' name='" + p + "' value='" + params[p] + "' >"));
            }

            url = "/view?viewName=" + url;

            var menu = this.getMenuByUrl(url);
            var menuCd = menu['menuCd'];
            if ($.comm.isNull(menuCd)) {
                alert($.comm.getMessage('W0017')); // 권한이 없는 화면입니다.
                return;
            }

            // 메뉴가 아닐때
            if (menu['menuType'] != 'M') {
                $("#commonForm").append($("<input type='hidden' id='naviMenuCd' name='naviMenuCd' value='" + $('#currMenuCd').val() + "' >"));
            }
            
            $("#commonForm").append($("<input type='hidden' id='currMenuCd' name='currMenuCd' value='" + menuCd + "' >"));

            $("#commonForm").attr("method", "post");
            $("#commonForm").attr("action", globalVar.contextPath+url).submit();

        },
        getMenuByUrl: function (url) {
            if (globalVar.menuList.length > 0) {
                for (var idx in globalVar.menuList) {
                    var menu = globalVar.menuList[idx];
                    if (menu['menuUrl'] == url) {
                        return menu;
                    }
                }
            }

            console.error("Not found menu info : ", url);
            return {};
        },
        getMenuCdByUrl: function (url) {
            var menu = this.getMenuByUrl(url);
            return menu['menuCd'];
        },
        /**
         * 트리 생성
         * @param treeDivId : 트리를 생성할 div Id
         * @param treeDataList : 트리를 생성할 데이터 리스트
         * @param levelColId  : Level 컬럼 Id
         * @param nameColId : 트리 Leaf 명 Id
         * @param onclickFunctionNm : 트리 Leaf 클릭시 호출 함수명
         * @param functionParamColId1 : 트리 Leaf 클릭시 함수 인자1
         * @param functionParamColId2 : 트리 Leaf 클릭시 함수 인자2
         * @param functionParamColId3 : 트리 Leaf 클릭시 함수 인자3
         * @param isCheck : 트리에 체크박스 생성 여부 (default : false)
         * @param checkFnObj : 트리에 체크박스가 있을때 체크박스 클릭시 호출 함수
         * @param treeOption : dTree Option
         */
        drawTree: function(treeDivId, treeDataList, levelColId, nameColId, onclickFunctionNm, functionParamColId1, functionParamColId2, functionParamColId3, isCheck, checkFnObj, treeOption){
            $("#" + treeDivId).empty();

            var preMenuLevel = 0;
            var ul = $("<ul>");
            var li1, li2, li3, li4, li5, li6, li7, li8;
            var ul1, ul2, ul3, ul4, ul5, ul6, ul7;
            $.each(treeDataList, function (index, data) {
                var menuLevel = data[levelColId];
                var menuNm    = data[nameColId];
                var chk       = data["chk"];

                var anchor = $('<a>');

                if(!$.comm.isNull(onclickFunctionNm)){
                    anchor.on('click', function () {
                        $("li > a[style='font-weight: bold;']").css("font-weight", "normal");
                        $(this).css("font-weight", "bold");
                    })
                    anchor.attr("onclick", onclickFunctionNm+"('" + data[functionParamColId1] + "', '" + data[functionParamColId2] +"', '" + data[functionParamColId3] +"')");
                }
                anchor.html(menuNm);

                var check;
                if(isCheck && isCheck == true){
                    check = $("<input>");
                    check.attr("type", "checkbox");
                    check.attr("name", "check");
                    check.attr("id", data[functionParamColId1]);

                    check.attr("style", "display: inline-block");

                    // Menu tree일때 사용하기위함
                    if(functionParamColId2 == "pmenuCd"){
                        check.attr("pid", data[functionParamColId2]);
                    }

                    if(chk == "1"){
                        check.attr("checked", "checked");
                    }
                }

                if(menuLevel != 0 && preMenuLevel != 0 &&
                    menuLevel < preMenuLevel){

                    ul.append(li1);
                }
                if(menuLevel == 0){
                    var li = $('<li>');
                    li.html("&nbsp;");
                    li.append(anchor);

                    ul.append(li);

                }else if(menuLevel == 1){
                    li1 = $('<li>');
                    if(check)li1.append(check);
                    li1.append(anchor);

                    ul.append(li1);
                }else if(menuLevel == 2){
                    li2 = $('<li>');
                    if(check)li2.append(check);
                    li2.append(anchor);

                    if(preMenuLevel < menuLevel){
                        ul1 = $('<ul>');
                        li1.append(ul1);
                    }

                    ul1.append(li2);
                }else if(menuLevel == 3){
                    li3 = $('<li>');
                    if(check)li3.append(check);
                    li3.append(anchor);

                    if(preMenuLevel < menuLevel){
                        ul2 = $('<ul>');
                        li2.append(ul2);
                    }

                    ul2.append(li3);

                }else if(menuLevel == 4){
                    li4 = $('<li>');
                    if(check)li4.append(check);
                    li4.append(anchor);

                    if(preMenuLevel < menuLevel){
                        ul3 = $('<ul>');
                        li3.append(ul3);
                    }

                    ul3.append(li4);

                }else if(menuLevel == 5){
                    li5 = $('<li>');
                    if(check)li5.append(check);
                    li5.append(anchor);

                    if(preMenuLevel < menuLevel){
                        ul4 = $('<ul>');
                        li4.append(ul4);
                    }

                    ul4.append(li5);
                }else if(menuLevel == 6){
                    li6 = $('<li>');
                    if(check)li6.append(check);
                    li6.append(anchor);

                    if(preMenuLevel < menuLevel){
                        ul5 = $('<ul>');
                        li5.append(ul5);
                    }

                    ul5.append(li6);
                }else if(menuLevel == 7){
                    li7 = $('<li>');
                    if(check)li7.append(check);
                    li7.append(anchor);

                    if(preMenuLevel < menuLevel){
                        ul6 = $('<ul>');
                        li6.append(ul6);
                    }

                    ul6.append(li7);
                }else if(menuLevel == 8){
                    li8 = $('<li>');
                    if(check)li8.append(check);
                    li8.append(anchor);

                    if(preMenuLevel < menuLevel){
                        ul7 = $('<ul>');
                        li7.append(ul7);
                    }

                    ul7.append(li8);
                }

                preMenuLevel = menuLevel;

            });

            $('#'+treeDivId).attr("class", "dTree");
            $('#'+treeDivId).append(ul);
            $('#'+treeDivId).dTree(treeOption);


            if(!$.comm.isNull(checkFnObj)){
                (function(checkFnObj) {
                    $('input[name="check"]').click(function () {
                        return checkFnObj.call(this);
                    });
                })(checkFnObj);
            }
        },
        /* Utility */
        bindAsListener: function (func, obj) {
            return function () {
                return func.apply(obj, arguments);
            }
        },
        getTarget: function (event) {
            if (event == null) return null;
            if (event.target) return event.target;
            else if (event.srcElement) return event.srcElement;
            return null;
        },
        /**
         * 페이지 forward 후 다시 로드 될때 파라미터 리턴
         */
        getInitPageParam : function () {
            try {
                if(PAGE_GLOBAL_VAR){
                    var inputData = PAGE_GLOBAL_VAR["PAGE_PARAM"];
                    if ($.comm.isNull(inputData)) {
                        return null;
                    }

                    return inputData;
                }

                return null;
            }catch(e){}
        },
        /***
         * TAG 속성에 mandatory 속성을 갖는 객체의 필수 체크
         */
        mandCheck: function (formId) {
            var frm = new JForm();
            var selector;

            if($.comm.isNull(formId)){
                selector = $("*[mandatory]");
            }else{
                selector = $('#'+formId).find("*[mandatory]");
            }

            selector.each(function(idx, obj){
                var id = $(obj).get(0).id;

                // TODO 수정필요
                var name = "";
                if($("label[for='"+id+"']")){
                    name = $("label[for='"+id+"']").html();
                }

                //Title이 없으면 체크안함
                if(!$.comm.isNull(name)){
                    var e = $(obj);
                    if(e.get(0).tagName.toLowerCase() == 'input'){

                        if(e.attr('type').toLowerCase() == 'text'){
                            frm.add(new JText(name, id));
                        }else if(e.attr('type').toLowerCase() == 'checkbox'){
                            //TODO 구현해야함
                        }
                    }else if(e.get(0).tagName.toLowerCase() == 'select'){
                        frm.add(new JSelect(name, id));
                    }
                }
            });

            return frm.validate();
        },

        /**
         * 다국어 지원으로 라벨 셋팅
         * @param targetLabel
         */
        initialLabel: function (multiWord) {
            var selector = $("*[for]");
            $.each(selector, function (idx, obj) {
                try{
                    if (!$.comm.isNull(obj)) {
                        var forStr = $(obj).attr('for');
                        var word = multiWord[forStr];
                        $(obj).html(word);
                    }
                }catch(e){
                    console.error('exception in initialLabel()', idx, obj);
                }

            })
        },

        /**
         * 필수항목 셋팅
         * @param targetLabel
         */
        mandatoryLabel: function () {
            var selector = $("*[mandatory]");
            $.each(selector, function (idx, th) {
                if (!$.comm.isNull(th)) {
                    var title = $(th).html();
                    $(th).html(title + " <em>*</em>");
                }
            })
        },
        initFieldType: function () {
            // 숫자만 입력 가능 (numberOnly='true')
            $(document).on("keyup", "input:text[numberOnly]", function() {
                if($(this).attr('decimalFormat')) {
                    if($(this).val() != $(this).val().replace(/[^0-9\\.]/gi,"")) {
                        $(this).val($(this).val().replace(/[^0-9\\.]/gi,"") );
                    }

                    var f = $(this).attr('decimalFormat').split(',');
                    f[0] = Number(f[0]) - Number(f[1]);
                    var v = $(this).val().split('.');

                    if(v[0].length > f[0]) {
                        $(this).val(v[0].substring(0, f[0]));
                    } else {
                        if(f.length > 1 && v.length > 1 && v[1].length > Number(f[1])) {
                            v[1] = v[1].substring(0, f[1]);
                            $(this).val(v[0] + (v.length == 2 ? '.' : '') + (v[1] ? v[1] : ''));
                        }
                    }
                } else {
                    $(this).val( $(this).val().replace(/[^0-9]/gi,"") );
                }
            });
            
            $('input:text[numberOnly]').css("text-align", "right");

            //영문 + 띄어쓰기 (alphaOnly="true")
            $(document).on("keyup", "input:text[alphaOnly]", function() {
                $(this).val( $(this).val().replace(/[^a-zA-Z\s]/gi,"") );
            });

            //영문 + 숫자 + 띄어쓰기 (alphaNumber="true")
            $(document).on("keyup", "input:text[alphaNumber]", function() {
                $(this).val( $(this).val().replace(/[^0-9a-zA-Z\s]/gi,"") );
            });

            //한글 + 영문 + 숫자 + 띄어쓰기 (hanAlphaNumber="true")
            $(document).on("keyup", "input:text[hanAlphaNumber]", function() {
                $(this).val( $(this).val().replace(/[^ㄱ-ㅎ가-힣0-9a-zA-Z\s]/gi,"") );
            });
        },
        /***
         * 파일 다운로드
         * @param data
         * @param url
         */
        fileDownload : function (data, url) {
            if($.comm.isNull(url)) url = "common/fileDownload";

            if($.comm.isNull(data)){
                data = "";
            }

            data = typeof data == 'string' ? data : decodeURIComponent($.param(data));
            var inputs = '';
            $.each(data.split('&'), function(){
                var pair = this.split('=');
                inputs+='<input type="hidden" name="'+ pair[0] +'" value="'+ pair[1] +'" />';
            });

            var token = $("meta[name='_csrf']").attr("content");
            if (!$.comm.isNull(token)) {
                /*
                var header = $("meta[name='_csrf_header']").attr("content");
                inputs+='<input type="hidden" name="'+ header +'" value="'+ token +'" />';
                */
                inputs+='<input type="hidden" name="_csrf" value="'+ token +'" />';
            }

            if ($('#iframe_file_download').length == 0) {
                var iframeref = $('<iframe style="display:none" height=0 width=0 id="iframe_file_download" name="iframe_file_download"></iframe>');
                $("body").append(iframeref);

            }

            $('<form action="'+ url +'" method="post" target="iframe_file_download">'+inputs+'</form>').appendTo('body').submit().remove();
        },
        wait: function (bool) {
            $('#cu-wrap').attr('class', bool ? 'cu-spinner' : '');
            if(bool) $('.cu-spinner-bg').show();
            else $('.cu-spinner-bg').hide();
        },
        isNull: function (obj) {
            if($.type(obj) === 'undefined' || $.type(obj) === 'null') return true;
            if (obj == null) return true;
            if (obj == "NaN") return true;
            if (new String(obj).valueOf() == "undefined") return true;
            var chkStr = new String(obj);
            if( chkStr.valueOf() == "undefined" ) return true;
            if (chkStr == null) return true;
            if (chkStr.toString().length == 0 ) return true;
            return false;
        },
        /***
         * 숫자 3자리마다 콤마를 찍는다.
         * @param x
         * @returns {string}
         */
        numberWithCommas : function (x) {
            return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        /***
         * 숫자 콤마를 삭제
         * @param x
         * @returns {string}
         */
        numberWithoutCommas : function (x) {
            return String(x).replace(/(,)/g, "");
        },
        /***
         * 인자의 byte 길이를 리턴
         * @param txt
         */
        bytelength: function (str, isUnicode) {
            if (isUnicode){
                var stringByteLength = (function (s, b, i, c) {
                    for (b = i = 0; c = s.charCodeAt(i++); b += c >> 11 ? 3 : c >> 7 ? 2 : 1);
                    return b
                })(str);

                return stringByteLength;

            }else{
                var byteNum=0;
                for(var i=0;i<str.length;i++){
                    byteNum+=(str.charCodeAt(i)>127)?2:1;
                }
                return byteNum;

            }
        },
        getJQueryObject: function (n) {
            var o = null;

            if ($.type(n) === 'object') {
                o = $(n);
            }
            else if ($.type(n) === 'string') {
                o = $('#' + n);
                if (o.length == 0) {
                    o = $('[name=' + n + ']');
                    if (o.length > 0) {
                        o = $(o.get(0));
                    }
                }
            } else {
                throw Error('illegal argument !');
            }

            return o;
        },
        /***
         * window.open 을 호출한다.
         * @param id  :팝업창의 id
         * @param url : url
         * @param width : 팝업창의 넓이
         * @param height : 팝업창의 높이
         */
        open: function (id, url, width, height, setting) {
            var profiles = {
                url: url,
                windowName:id+"_popup",
                center:1,
                height : height,
                width : width,
                dimmed : 0
            }
            profiles = $.extend(profiles, setting);
            $.fn.popupwindow(profiles);
        },
        /**
         * POST 방식으로 window open
         * @param url
         * @param name
         * @param params
         */
        postOpen : function (url, name, params) {
            var formId = "WINDOW_POST_OPEN_ID_123456789";

            var submitForm = $('#'+formId);
            if(submitForm.length > 0){
                submitForm.remove();
            }

            submitForm = $("<form>");
            submitForm.attr("id", formId);
            submitForm.attr("method", "POST");
            submitForm.attr("action", globalVar.contextPath + "/view?viewName=" + url);
            submitForm.attr("target", name);

            $("body").append(submitForm);

            function createHidden(pObj, id, value) {
                var input = $("<input>");
                input.attr("name", id);
                input.attr("id"  , id);
                input.attr("type", "hidden");

                var val = (JSON.stringify(value)).split("null").join('');
                if(val.substring(0, 1) == '"') val = val.substring(1, val.length);
                if(val.substring(val.length -1, val.length)) val = val.substring(0, val.length-1);

                input.val(val);

                $(pObj).append(input);
            }

            for(var key in params) {
                if (params[key] instanceof Object || params[key] instanceof Function){
                } else {
                    createHidden(submitForm, key, params[key]);
                }
            }

            //window.open("", name, "dependent=no,top=10,left=10,directories=yes,menubar=yes,toolbar=yes,location=yes,status=yes,resizable=yes");
            submitForm.submit();
        },
        /***
         * window.showModalDialog와 같이 팝업창으로 인자를 넘기고
         * 팜업창이 닫힐때 지정된 callback 함수로 리턴값을 넘긴다.
         * @param url : url
         * @param spec : 팝업창의 feature
         * @param params : 팝업창에 넘길 인자값
         * @param callBack : callback 함수
         */
        dialog : function (url, spec, params, callBack) {
            var profile ={
                url: url,
                params: params,
                createnew:1,
                center:1,
                height:740,
                width:700,
                scrollbars:0,
                resizable:1,
                status:0,
                dimmed:1,
                onUnload:(callBack ? callBack : function () {})
            };

            var mdattrs = spec.split(";");
            for (var i = 0; i < mdattrs.length; i++) {
                var mdattr = mdattrs[i].split(":");

                var n = mdattr[0];
                var v = mdattr[1];
                if (n) {
                    n = n.trim().toLowerCase();
                }
                if (v) {
                    v = v.trim().toLowerCase();
                }

                if (n == "dialogheight" || n == "height") {
                    profile.height = v.replace("px", "");
                } else if (n == "dialogwidth" || n == "width") {
                    profile.width = v.replace("px", "");
                } else if (n == "resizable") {
                    profile.resizable = v;
                } else if (n == "scroll") {
                    profile.scrollbars = v;
                } else if (n == "status") {
                    profile.status = v;
                } else if (n == "windowname") {
                    profile.windowName = v;
                } else {
                    // no-op
                }
            }

            $.fn.popupwindow(profile);
        },
        setDimmed : function (bool) {
            var val = (bool ? "block" : "none");
            var winDim = $("#main_win_dim");
            if(winDim.length > 0){
                winDim.css("display", val);
            }
        },
        
        /**
         * nicEditor 생성
         * @param id : 내용영역 id
         * @param height : 내용영역 높이
         */
        editor : function (id, height) {
        	if ($('#' + id)) {
        		$('#' + id).width('100%');
        	}
        	
            var nEditor = new nicEditor();
            nEditor.panelInstance(id);
            if(!$.comm.isNull(height)){
                $(nEditor.nicInstances[0].elm).css("max-height", height+"px");
            }
            $(nEditor.nicInstances[0].elm).css("overflow", "auto");
            $(nEditor.nicInstances[0].elm).css("padding", "5px");
            $(nEditor.nicInstances[0].elm).css("line-height", "1.5");

            return nEditor;
        },
        /**
         * nicEditor의 내용을 리턴
         * @param id
         * @returns {*}
         */
        getContents : function (id) {
            return nicEditors.findEditor(id).getContent();
        },
        /**
         * nicEditor의 내용을 바인딩
         * @param id
         * @param html
         * @returns {*}
         */
        setContents : function (id, html) {
            nicEditors.findEditor(id).setContent(html);
        },
        /**
         * nicEditor의 내용을 textarea에 적용
         * @param id
         * @returns {*}
         */
        saveContent : function (id) {
            return nicEditors.findEditor(id).saveContent();
        },
        /***
         * 지정한 객체의 display를 조정
         * @param idObj : id 속성
         * @param bool  : true-show, false-hide
         */
        display: function (idObj, bool) {
            var arr = [];
            if ($.type(idObj) == 'string') {
                arr[0] = idObj;
            }else if ($.type(idObj) == 'array') {
                arr = idObj;
            }else {
                throw Error('lllegal argument !!!!');
            }

            $.each(arr, function (idx, id) {
                if(bool == true){
                    $('#' + id).show();
                }else{
                    $('#' + id).hide();
                }
            })
        },
        prettyJson: function (json) {
            try {
                json = this.isNull(json) ? "" : JSON.stringify(JSON.parse(json), null, '\t')
            } catch (e) {};
            return json;
        }
    };
})(jQuery);

/*
 *  HTML Form Validation
 */

function JForm() {

    this.children = [];

    this.add = function(child) {
        this.children[this.children.length] = child;
        return this;
    };
    this.clear = function() {
        this.children = [];
    };
    this.last = function() {
        return this.children[this.children.length - 1]
    };
    this.validate = function() {
        for (var i = 0; i < this.children.length; i++) {
            if (!this.children[i].validate()) {
                return false;
            }
        }
        return true;
    };
}

/***
 * 길이 체크 ( byte length로 체크 )
 * @param name
 * @param object
 * @param len
 * @constructor
 */
function JLength(name, object, len, isUnicode){
    this.name = name;
    this.object = $.comm.getJQueryObject(object);
    this.len = len;
    this.minlength = len.split(",")[0];
    this.maxlength = len.split(",")[1];
    this.isUnicode = isUnicode;

    this.validate = function() {
        var value = this.object == null ? '' : this.object.val();
        if(this.object.is('[numberOnly]')){
            value = $.comm.numberWithoutCommas(value);
        }
        var valLen = $.comm.bytelength(value, this.isUnicode);
        var min = 0;
        var max = 0;
        var arr = this.len.split(",");

        if(arr.length == 0){
            alert("length의 속성값을 확인 하세요");
            return false;
        }

        // maxlength 만 체크
        if(arr.length == 1){
            max = parseInt(arr[0]);

        }
        if(arr.length == 2){
            min = parseInt(arr[0]);
            max = parseInt(arr[1]);
        }

        if(min > valLen){
            alert($.comm.getMessage("W0007", this.name)); // {0}의 글자수가 최소 글자수 미만 입니다.
            return this.focus();
        }

        if(max < valLen){
            alert($.comm.getMessage("W0008", this.name)); // {0}의 글자수가 최대 글자수를 초과 하였습니다.
            return this.focus();
        }

        return true;
    };
    this.focus = function() {
        if (this.object != null ) {
            this.object.focus();
        }
        return false;
    };
}

/**
 *	Mandatory Validation.
 */
function JText(name, object, nullCheck) {
    this.name = name;
    this.object = $.comm.getJQueryObject(object);
    this.nullCheck = ($.type (nullCheck) === 'null' || $.type (nullCheck) === 'undefined') ? true : nullCheck;

    this.validate = function() {
        var value = this.object == null ? '' : this.object.val();
        if (this.nullCheck && $.trim(value).length == 0) {
            alert($.comm.getMessage("W0009", this.name)); // $을(를) 입력하십시오.
            return this.focus();
        }
        return true;
    };
    this.focus = function() {
        if (this.object != null ) {
            this.object.focus();
        }
        return false;
    };
}


/**
 *	Select Html Tag Validation.
 */
function JSelect(name, object, nullCheck, defaultValue) {
    this.name = name;
    this.object = $.comm.getJQueryObject(object);
    this.nullCheck = ($.type (nullCheck) === 'null' || $.type (nullCheck) === 'undefined') ? true : nullCheck;
    this.defaultValue = ($.type (defaultValue) === 'null' || $.type (defaultValue) === 'undefined') ? '' : defaultValue;

    this.validate =  function() {
        var value = this.object == null ? '' : this.object.val();
        if (this.nullCheck && ((this.defaultValue.length == 0 && $.trim(value).length == 0) || (this.defaultValue == $.trim(value)))) {
            alert($.comm.getMessage("W0009", this.name)); // $을(를) 입력하십시오.
            return this.focus();
        }
        return true;
    };
    this.focus = function() {
        if (this.object != null ) {
            this.object.focus();
        }
        return false;
    };
}

/**
 *	Date Type Validation.
 */
function JDate(name, object, nullCheck) {
    this.name = name;
    this.object = $.comm.getJQueryObject(object);
    this.nullCheck = ($.type (nullCheck) === 'null' || $.type (nullCheck) === 'undefined') ? true : nullCheck;

    this.validate =  function() {
        var value = this.object == null ? '' : this.object.val();
        if (this.nullCheck && !$.date.isValidDate(value)) {
            alert($.comm.getMessage("W0009", this.name)); // $을(를) 입력하십시오.
            return this.focus();
        }
        return true;
    };
    this.focus = function() {
        if (this.object != null ) {
            this.object.focus();
        }
        return false;
    };
}

/**
 *	Number Type Validation.
 */
function JNumeric(name, object, nullCheck) {

    this.name = name;
    this.object = $.comm.getJQueryObject(object);
    this.nullCheck = ($.type (nullCheck) === 'null' || $.type (nullCheck) === 'undefined') ? true : nullCheck;

    this.validate =  function() {
        var value = this.object == null ? '' : this.object.val().replace(/,/ig,'');
        if (this.nullCheck && !$.isNumeric(value)) {
            alert($.comm.getMessage("W0009", this.name)); // $을(를) 입력하십시오.
            return this.focus();
        }
        return true;
    };
    this.focus = function() {
        if (this.object != null ) {
            this.object.focus();
        }
        return false;
    };
}

function JEmail(name) {
    this.name = name;
    this.object = $.comm.getJQueryObject(name);

    this.validate =  function() {
        var value = this.object == null ? '' : this.object.val();
        if ($.trim(value).length > 0) {
            var regEmail = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
            if (!regEmail.test(value)) {
                alert($.comm.getMessage("W0010")); //이메일 주소가 유효하지 않습니다.
                this.object.focus();
                return false;
            }
        }

        return true;
    };
    this.focus = function() {
        if (this.object != null ) {
            this.object.focus();
        }
        return false;
    };
}

function JPhone(name) {
    this.name = name;
    this.object = $.comm.getJQueryObject(name);

    this.validate =  function() {
        var value = this.object == null ? '' : this.object.val();
        if ($.trim(value).length > 0) {
            var regExp = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
            if (!regExp.test(value)) {
                alert($.comm.getMessage("W0011")); //휴대폰번호가 유효하지 않습니다.
                this.object.focus();
                return false;
            }
        }

        return true;
    };
    this.focus = function() {
        if (this.object != null ) {
            this.object.focus();
        }
        return false;
    };
}

function JTel(name) {
    this.name = name;
    this.object = $.comm.getJQueryObject(name);

    this.validate =  function() {
        var value = this.object == null ? '' : this.object.val();
        if ($.trim(value).length > 0) {
            var regExp = /^\d{2,3}-\d{3,4}-\d{4}$/;
            if (!regExp.test(value)) {
                alert($.comm.getMessage("W0012")); //전화번호가 유효하지 않습니다.
                this.object.focus();
                return false;
            }
        }

        return true;
    };
    this.focus = function() {
        if (this.object != null ) {
            this.object.focus();
        }
        return false;
    };
}

function JCustom(fn) {
    if (!$.isFunction(fn)) {
        throw Error('lllegal argument !');
    }
    this.fn = $.type(fn) === 'string' ? eval(fn) : fn;
    this.validate = fn;
}

$.fn.clearForm = function() {
    return this.each(function() {
        try{
            var type = this.type,
                tag = this.tagName.toLowerCase()
            if (tag === "form") {
                return $(":input", this).clearForm()
            }

            if (tag === "textarea" || tag === "input") {
                this.value = ""

            } else if (type === "checkbox" || type === "radio") {
                this.checked = false

            } else if (tag === "select") {
                this.selectedIndex = 0
            }
        }catch(e){}
    })
}