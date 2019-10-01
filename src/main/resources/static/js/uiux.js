
/* login input focus event */
$(document).ready(function() {
    $(".cu-form-input").each(function() {
        $(this).on("blur", function() {
            if($(this).val().trim() != "") {
                $(this).addClass("cu-has-val");
            }
            else {
                $(this).val("");
                $(this).removeClass("cu-has-val");
            }
        });
    });
})

/* gnb navigation */
$(document).ready(function() {
	/* sub menu default condition */
    $(".cu-gnb .cu-navi > li").each(function () {
        if($(this).hasClass("cu-open")) {
        	$(this).children(".cu-submenu").css("display","block");
        } else {
            $(this).children(".cu-submenu").css("display","none");
        }
    });
	if($("#cu-wrap").hasClass("cu-gnb-collapse")) {
		$(".cu-gnb .cu-navi .cu-submenu").css("display","none");		
	}

    /* gnb collapse */
    $(".cu-btn-gnbCollapse").on("click", function() {
        $("#cu-wrap").toggleClass("cu-gnb-collapse");
        $(".cu-gnb .cu-navi .cu-submenu").each(function () {
            $(".cu-gnb .cu-navi li").removeClass("cu-open");
			$(this).css("display","none");
        })
    });

    /* sub menu collapse */   
    $(document).on("click",".cu-1depth", function() {
        if(!$("#cu-wrap").hasClass("cu-gnb-collapse")) {
            $(this).parent().toggleClass("cu-open");
            $(this).siblings(".cu-submenu").slideToggle(300);
        }
    });
});
