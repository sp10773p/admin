/**
 * Created by sdh on 2017-01-31.
 */
FileUtil = function (params) {
    this.inputFileTagId  = ($.comm.isNull(params.id) ? "inputFile" : params.id);    // input type='file' 인 tag ID
    this.attachId        = params.attachId;         // FILE_ID
    this.gridDiv         = params.gridDiv;          // 멀티파일첨부일때 그리드 DIV ID
    this.addBtnId        = params.addBtnId;         // 파일업로드 버튼 ID
    this.delBtnId        = params.delBtnId;         // 파일삭제 버튼 ID
    this.viewBtnId       = params.viewBtnId;       // 파일미리보기 버튼 ID
    this.downBtnId       = params.downBtnId;        // 파일다운로드 버튼 ID (싱글 일때)
    this.downloadFn      = params.downloadFn;       // 파일다운로드 함수명(멀티 일때)
    this.headers         = ($.comm.isNull(params.headers)         ? null : params.headers);         // 멀티파일첨부 그리드의 헤더
    this.fileGridWrapper = ($.comm.isNull(params.fileGridWrapper) ? null : params.fileGridWrapper); // 멀티파일첨부 그리드 Object
    this.addUrl          = ($.comm.isNull(params.addUrl) ? "common/uploadFiles" : params.addUrl);// 업로드 요청 URL
    this.delUrl          = ($.comm.isNull(params.delUrl) ? "/common/deleteFiles" : params.delUrl);// 삭제 요청 URL
    this.successCallback = params.successCallback;      // 성공시 콜백함수
    this.postService     = params.postService;          // 파일 업로드후 실행할 '서비스ID.메서드명'
    this.preAddScript    = params.preAddScript;
    this.preDelScript    = params.preDelScript;
    this.postDelScript   = params.postDelScript;
    this.params          = ($.comm.isNull(params.params)   ? {} : params.params);
    this.extNames        = ($.comm.isNull(params.extNames) ? [] : params.extNames);

    this.formObj;

    this.fileUploadScreenDiv = params.fileUploadScreenDiv; // 파일 구분 디렉토리 명

    // 멀티 첨부일때
    if(!$.comm.isNull(this.gridDiv)){
        // 첨부파일 그리드
        if(this.headers == null){
            this.headers = [
                {"HEAD_TEXT": globalVar.multiWord.fileNm  , "WIDTH": "*"  , "FIELD_NAME": "orignFileNm", "ALIGN":"left", "LINK":this.downloadFn},
                {"HEAD_TEXT": globalVar.multiWord.fileSize, "WIDTH": "120", "FIELD_NAME": "fileSizeFm" , "ALIGN":"right"}
            ]
        }
        if(this.fileGridWrapper == null){
            var controllers = [];
            if(!$.comm.isNull(this.delBtnId)){
                var deletePram = {"btnName": this.delBtnId, "type": "D", "targetURI":this.delUrl};
                if(!$.comm.isNull(this.preDelScript)){
                    deletePram["preScript"] = this.preDelScript;
                }
                if(!$.comm.isNull(this.postDelScript)) {
                    deletePram["postScript"] = this.postDelScript;
                }

                controllers.push(deletePram);
            }    

            var params = {
                "postService" : this.postService
            }

            this.fileGridWrapper = new GridWrapper({
                "targetLayer"  : this.gridDiv,
                "requestUrl"   : "/common/fileList",
                "qKey"         : "common.selectFileInfoList",
                "displayNone"  : ["countId"],
                "headers"      : this.headers,
                "firstLoad"    : false,
                "check"        : $.comm.isNull(this.delBtnId) ? false : true,
                "paramsGetter" : params,
                "defaultSort"  : "fileSn",
                "controllers"  : controllers
            });
        }
    }

    this.initializeLayer();

}

FileUtil.prototype = {
    initializeLayer: function() {
        if($.comm.isNull(this.gridDiv)){
            if(!$.comm.isNull(this.downBtnId)){
                $('#' + this.downBtnId).on("click", $.comm.bindAsListener(this.downLoad, this));
            }
            if(!$.comm.isNull(this.delBtnId)){
                $('#' + this.delBtnId).on("click", $.comm.bindAsListener(this.deleteFile, this));
            }
        }

        $('#' + this.addBtnId).on("click", $.comm.bindAsListener(this.addDialog, this));
        
    	if(!$.comm.isNull(this.viewBtnId)){
            $('#' + this.viewBtnId).on("click", $.comm.bindAsListener(this.viewFile, this));
        }
    },
    addDialog: function () {
        if(!$.comm.isNull(this.preAddScript)){
            var retVal = $.isFunction(this.preAddScript) ? this.preAddScript($(this)) : eval(this.preAddScript+"(this)");
            if(!retVal) return;
        }

        var body = $("body");
        if(!$.comm.isNull(this.formObj) && this.formObj.length > 0 ){
            this.formObj.remove();
        }

        this.formObj = $("<form>");
        var fileObj = $("<input>");
        fileObj.attr({
            "type"    : "file",
            "style"   : "display:none",
            "id"      : this.inputFileTagId
        });

        if(!$.comm.isNull(this.gridDiv)){
            fileObj.attr("name"    , this.inputFileTagId+"[]");
            fileObj.attr("multiple", "");
        }else{
            fileObj.attr("name", this.inputFileTagId);
        }

        this.formObj.append(fileObj);
        body.append(this.formObj);

        $('#' + this.inputFileTagId).on("change", $.comm.bindAsListener(this.addCallback, this));
        $('#' + this.inputFileTagId).click();
    },
    addCallback: function () {
        if(!$.comm.isNull(this.extNames)){
            var fileArr = [];
            if(!$.comm.isNull(this.gridDiv)){
                fileArr = $('input[name="'+this.inputFileTagId+"[]"+ '"]');
            }else{
                fileArr = $('input[name="'+this.inputFileTagId+ '"]');
            }

            for(var i=0; i < fileArr.length; i++){
                var ext = fileArr[i].value.split(".");
                ext = ext[ext.length-1];
                if ($.inArray(ext, this.extNames) == -1) {
                    alert(this.extNames.toString() + ' 파일만 업로드 할수 있습니다.');
                    return;
                }
            }
        }

        var tempVal = ($.comm.isNull(this.attachId) ? '' : this.attachId);

        if(this.formObj.find("input[name=fileId]").length == 0){
            this.formObj.append("<input type='hidden' name='fileId' value='" + tempVal + "'>");
        }else{
            this.formObj.find("input[name=fileId]").val(tempVal);
        }

        var token = $("meta[name='_csrf']").attr("content");
        if (!$.comm.isNull(token)) {
            if(this.formObj.find("input[name=_csrf]").length == 0){
                this.formObj.append("<input type='hidden' name='_csrf' value='" + token + "'>");
            }else{
                this.formObj.find("input[name=_csrf]").val(token);
            }
        }

        tempVal = ($.comm.isNull(this.fileUploadScreenDiv) ? '' : this.fileUploadScreenDiv);

        if(this.formObj.find("input[name=fileUploadScreenDiv]").length == 0){
            this.formObj.append("<input type='hidden' name='fileUploadScreenDiv' value='" + tempVal + "'>");
        }else{
            this.formObj.find("input[name=fileUploadScreenDiv]").val(tempVal);
        }

        tempVal = ($.comm.isNull(this.postService) ? '' : this.postService);

        if(this.formObj.find("input[name=postService]").length == 0){
            this.formObj.append("<input type='hidden' name='postService' value='" + tempVal + "'>");
        }else{
            this.formObj.find("input[name=postService]").val(tempVal);
        }

        for(var key in this.params) {
            var val = this.params[key];
            val = ($.comm.isNull(val) ? '' : val);
            if(this.formObj.find("input[name=" + key + "]").length == 0){
                this.formObj.append("<input type='hidden' name='" + key + "' value='" + val + "'>");
            }else{
                this.formObj.find("input[name=" + key + "]").val(val);
            }
        }

        $.comm.wait(true);
        $(this.formObj).ajaxForm({
            url: this.addUrl,
            type: "POST",
            enctype: "multipart/form-data",
            beforeSubmit: null,
            headers :{
            },
            fileUtilObj: this,
            success: function (data, status) {
                if(data.status != 0){

                    if(data.status == -9999){ // 시스템에러가 발생하였습니다.
                        alert(data["msg"]);
                        console.log(data["msg"]);
                        return;
                    }
                    if(data.status == -9001){ // 세션이 만료되었습니다.
                        alert($.comm.getMessage("E0002"));
                        location.reload(true);
                    }
                    if(!$.comm.isNull(data["msg"])){
                        alert(data["msg"]);
                        return;
                    }
                }

                if(!$.comm.isNull(data["msg"])){
                    alert(data["msg"]);
                }

                this.fileUtilObj.setFileId(data["fileId"]);

                if(!$.comm.isNull(this.fileUtilObj.gridDiv)) {
                    this.fileUtilObj.fileGridWrapper.addParam("fileId", this.fileUtilObj.attachId);
                    this.fileUtilObj.fileGridWrapper.requestToServer();
                }

                if(!$.comm.isNull(this.fileUtilObj.successCallback)) {
                    this.fileUtilObj.successCallback(data, status, this.fileUtilObj);
                }
            },
            //ajax error
            error: function(){
                $.comm.wait(false);
                alert("파일업로드 실패!!");
            },
            complete: function () {
                $.comm.wait(false);
            }
        });

        $(this.formObj).submit();
    },
    /**
     * 파일리스트 조회
     * @param param
     */
    selectFileList: function (param) {
        this.fileGridWrapper.clearBody();
        for(var key in param){
            this.fileGridWrapper.addParam(key, param[key]);
        }
        this.fileGridWrapper.requestToServer();
    },
    deleteFile: function () {
        if(!$.comm.isNull(this.preDelScript)){
            var retVal = $.isFunction(this.preDelScript) ? this.preDelScript($(this)) : eval(this.preDelScript+"(this)");
            if(!retVal) return;
        }

        var data = {
            "fileId" : $('#fileId').val(),
            "fileSn" : $.comm.isNull($('#fileSn').val()) ? "1" : $('#fileSn').val()
        }

        if(!$.comm.isNull(this.postService)) {
            data["postService"] = this.postService;
            data["postServiceParamType"] = this.postServiceParamType;
        }

        $.comm.send(this.delUrl, data, this.successCallback);
    },
    downLoad: function () {
        var data = {
            "fileId" : $('#fileId').val(),
            "fileSn" : $.comm.isNull($('#fileSn').val()) ? "1" : $('#fileSn').val()
        }
        $.comm.fileDownload(data);
    },
    fileDownload: function (index) {
        var data = this.fileGridWrapper.getRowData(index);
        $.comm.fileDownload(data);
    },
    setFileId: function (atchFileId) {
        this.attachId = $.comm.isNull(atchFileId) ? "" : atchFileId;
    },
    initGrid: function () {
        this.fileGridWrapper.initializeLayer();
    },
    addParam:function (key, val) {
        if(this.fileGridWrapper != null){
            this.fileGridWrapper.addParam(key, val);
        }
        this.params[key] = val;
    },
    setParams: function (params) {
        if(this.fileGridWrapper != null){
            this.fileGridWrapper.setParams(params);
        }
        this.params = params;
    },
    clear: function () {
        this.params = {};
        this.attachId = null;
        this.initGrid();
    },
    viewFile: function () {
    	 var grdSize = this.fileGridWrapper.getSize();
    	 if(grdSize == 0){
    		 alert($.comm.getMessage("W0021")); //파일이 존재하지 않습니다.
             return;
    	 }
    	 var fileGbn = $.comm.isNull(this.params.FILE_GBN) ? "" : this.params.FILE_GBN
    	 var data = this.fileGridWrapper.getRowData(0);
    	 data["FILE_GBN"] = fileGbn;
    	 $.comm.setModalArguments(data);
         var spec = "width:720px;height:850px;scroll:auto;status:no;center:yes;resizable:yes;windowName:fileViewPopup";
         $.comm.dialog("/jspView.do?jsp=cmm/popup/fileViewPopup", spec,
             function () { 
                 var ret = $.comm.getModalReturnVal();
                 if (ret) {
                 	
                 }
             }
         );
    }
    
}
