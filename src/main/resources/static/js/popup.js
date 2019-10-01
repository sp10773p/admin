/**
 * Created by sdh on 2017-01-13.
 */
$.fn.popupwindow = function(p){
    var profiles = p || {};
    var settings, parameters, b, a, winObj;

    // for overrideing the default settings

    settings = {
        url:null,
        params: null,
        windowName:null,
        height:600, // sets the height in pixels of the window.
        width:600, // sets the width in pixels of the window.
        toolbar:0, // determines whether a toolbar (includes the forward and back buttons) is displayed {1 (YES) or 0 (NO)}.
        scrollbars:0, // determines whether scrollbars appear on the window {1 (YES) or 0 (NO)}.
        status:0, // whether a status line appears at the bottom of the window {1 (YES) or 0 (NO)}.
        resizable:1, // whether the window can be resized {1 (YES) or 0 (NO)}. Can also be overloaded using resizable.
        left:0, // left position when the window appears.
        top:0, // top position when the window appears.
        center:1, // should we center the window? {1 (YES) or 0 (NO)}. overrides top and left
        createnew:1, // should we create a new window for each occurance {1 (YES) or 0 (NO)}.
        location:0, // determines whether the address bar is displayed {1 (YES) or 0 (NO)}.
        menubar:0, // determines whether the menu bar is displayed {1 (YES) or 0 (NO)}.
        onUnload:null // function to call when the window is closed
    };

    // see if a profile has been defined
    if(typeof profiles != "undefined"){
        settings = jQuery.extend(settings, profiles);
    }

    // center the window
    if (settings.center == 1){
        settings.top = (screen.height-(parseInt(settings.height) + 110))/2;
        settings.left = (screen.width-parseInt(settings.width))/2;
    }

    parameters = "location=" + settings.location
                + ",menubar=" + settings.menubar
                + ",height=" + settings.height
                + ",width=" + settings.width
                + ",toolbar=" + settings.toolbar
                + ",scrollbars=" + settings.scrollbars
                + ",status=" + settings.status
                + ",resizable=" + settings.resizable
                + ",left=" + settings.left
                + ",screenX=" + settings.left
                + ",top=" + settings.top
                + ",screenY=" + settings.top;

    var name = settings.createnew ? settings.windowName  : "PopUpWindow";
    if($.comm.isNull(name)) name = "PopUpWindow";

    var menuCd = $.comm.getMenuCdByUrl("/view?viewName=" + settings.url);
    if ($.comm.isNull(menuCd)) {
        alert($.comm.getMessage('W0017')); // 권한이 없는 화면입니다.
        return;
    }

    // settings.url += '&currMenuCd=' + menuCd + '&currLangCd=' + $('#currLangCd').val();



    var inputs = '';
    var token = $("meta[name='_csrf']").attr("content");
    if (!$.comm.isNull(token)) {
        inputs+='<input type="hidden" name="_csrf" value="'+ token +'" />';
    }

    inputs+='<input type="hidden" name="currMenuCd" value="'+ menuCd +'" />';
    inputs+='<input type="hidden" name="currLangCd" value="'+ $('#currLangCd').val() +'" />';
    if (settings.params) {
        for (var key in settings.params) {
            if (!$.comm.isNull(settings.params[key])) {
                inputs+='<input type="hidden" name="' + key + '" value="'+ settings.params[key] +'" />';
            }
        }
    }

    winObj = window.open('', name, parameters);
    $('<form action="'+ globalVar.contextPath + "/view?viewName=" + settings.url +'" method="post" target="' + name + '">'+inputs+'</form>').appendTo('body').submit().remove();

    if(settings.dimmed == 1){
        $.comm.setDimmed(true);
    }

    if (settings.onUnload) {
        // Incremental check for window status
        // Attaching directly to window.onunlaod event causes invoke when document within window is reloaded
        // (i.e. an inner refresh)
        unloadInterval = setInterval(function() {
            if (!winObj || winObj.closed) {
                $.comm.setDimmed(false);
                clearInterval(unloadInterval);
                settings.onUnload.call($(this));
            }
        },500);
    }

    winObj.focus();

    return false;

};