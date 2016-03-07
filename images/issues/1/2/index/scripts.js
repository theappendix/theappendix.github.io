var scrollPoints = new Array()
var lastScrollPoint = -1

function prepElements() {
    $("#intro-box").css("margin","0")
    $("#card-list-box").css("display","none")
    $("#card-list-box").css("margin","0")
    $("#card-list-box li").addClass("past")
    $("#essay-box").css("display","none")
    $("#essay-box").css("margin","0")

    $(".demo-wrapper").css("background-image","url(/images/issues/1/2/index/images/the-librarian.jpg)")
    $(".blockquote-wrap").css("display","block")
    $(".intro .credit").css("display","block")

    scrollPoints.push($("#intro-box").offset().top + $("#intro-box p.intro").height())
    scrollPoints.push(scrollPoints[0] + $("#card-list-box").height() - 50)
}

function scrollHandler(e) {
    var y = $(window).scrollTop()

    $("#appendixed-1-2").height(
        $("#essay-box").offset().top +
        $("#essay-box").height() - 340
    )

    var maxScrollPoint = -1
    for (var i = 0; i <= scrollPoints.length; i++) {
        if (y > scrollPoints[i]) {
            maxScrollPoint = i
        }
    }

    switch (maxScrollPoint) {
        case -1:
            $("#lead-blockquote").slideDown()
            if ($("#card-list-box").css("display") == "block") {
                $("#card-list-box").css("display","none")
            }
        case 0:
            if (maxScrollPoint > lastScrollPoint) {
                $("#lead-blockquote").slideUp()
                if ($("#card-list-box").css("display") == "none") {
                    $("#card-list-box").css("position","absolute")
                    $("#card-list-box").css("top",$(window).scrollTop() + $(window).height() - 100)
                    $("#card-list-box").css("display","block")
                }
            }
            break;
        case 1:
            if (maxScrollPoint > lastScrollPoint) {
                if ($("#essay-box").css("display") == "none") {
                    $("#essay-box").css("position","absolute")
                    $("#essay-box").css("top",$(window).scrollTop() + $(window).height() + 50)
                    $("#essay-box").css("display","block")
                }
            }
            break;
    }

    $("#card-list-box ul li").each(function() {
        if ($(this).offset().top - $(window).scrollTop() < 20) {
            $(this).removeClass("past")
            $(this).addClass("future")
        } else if ($(this).offset().top > $(window).scrollTop() + $(window).height() - 100) {
            $(this).removeClass("future")
            $(this).addClass("past")
        } else {
            $(this).removeClass("future")
            $(this).removeClass("past")
        }
    })

    lastScrollPoint = maxScrollPoint
}