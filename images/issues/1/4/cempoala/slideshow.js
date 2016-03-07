var externalData
var map
var currentSlide
var slides = new Array()
var accentColor

function loadSlideshowData(uri) {
    $.getJSON(uri,function(data) {
        externalData = data

        setupLaunchSlide()
    })
}

function setupLaunchSlide() {
    var $wrapper = $("#" + externalData["id"])
    $wrapper.empty()

    $wrapper.append(
        $("<div/>").addClass("splash-intro-slide").append(
            $("<div/>").addClass("inner-screen").append(
                    $("<p/>").addClass("splash-intro").html("Sometime in the late sixteenth century, an indigenous painter in Mexico put brush to paper and brought his world, a region named Cempoala, to life. The map, part of a <i>relación geográfica</i> made for the king of Spain, became one of the most important sources for regional history in the sixteenth-century New World. Barbara Mundy explains why."))
                .append(
                    $("<div/>").addClass("slideshow-splash-button").append(
                            $("<a/>").attr("href","#")
                                     .on("click",function() { return loadSlideshow() })
                                     .html("Play »")
                        ))
                .append(
                    $("<p/>").addClass("splash-intro").addClass("small").html("To read a specially-formatted interactive version of this article, click <a class=\"play\" href=\"#\">Play</a> above. Readers who want a vanilla version can <a class=\"skip\" href=\"#\">read the essay</a>.")
                )
    ))
    
    $("p.splash-intro a.play").on("click",function() { return loadSlideshow() })
    $("p.splash-intro a.skip").on("click",function() { return showEssay() })
}

function showEssay() {
    // TODO: abstract this away from cempoala-specific implementation
    $("#cempoala-attribution").hide()
    $("#cempoala-skip-slideshow").hide()
    $("#" + externalData["id"] + "-wrapper").fadeOut(function() {
        $("#issue-1-4-cempoala-page").fadeIn()
    })

    return false
}

function loadSlideshow() {
    var $wrapper = $("#" + externalData["id"])

    $("#cempoala-skip-slideshow").css({ "display": "block" })
    
    $wrapper.children(".splash-intro-slide").fadeOut(function() {
        $wrapper.empty()

        buildMap(externalData["id"],externalData["center"],externalData["zoom"],externalData["minZoom"],externalData["maxZoom"],externalData["southWest"],externalData["northEast"],externalData["tiles"])

        accentColor = externalData["accentColor"]

        $(externalData["slides"]).each(function() {
            slides.push(buildSlide(this))
        })

        $("#" + externalData["id"]).append(
            $("<div/>").addClass("nav-button").addClass("next").append(
                    $("<a/>").attr("href","#")
                             .on("click",function() { return changeSlide("next") })
                             .html("»")
                )
        ).append(
            $("<div/>").addClass("nav-button").addClass("previous").append(
                    $("<a/>").attr("href","#")
                             .on("click",function() { return changeSlide("previous") })
                             .html("«")
                )
        ).append(
            $("<div/>").addClass("explore-button").append(
                    $("<a/>").attr("href","#")
                             .on("click",function() { return changeSlide("next") })
                             .html("Explore the Map")
                )
        )

        currentSlide = -1
        changeSlide("next")

        setTimeout(function() {
            $(map.getContainer()).children(".next-button").slideDown()
        },500)
    })

    return false
}

function buildMap(id,center,zoom,minZoom,maxZoom,southWestSeed,northEastSeed,tiles) {
    map = L.map(id, {
        center: center,
        zoom: zoom,
        minZoom: minZoom,
        maxZoom: maxZoom,
        attributionControl: false,
        scrollWheelZoom: false,
        crs: L.CRS.Simple
    })
    var southWest = map.unproject(southWestSeed, map.getMaxZoom())
    var northEast = map.unproject(northEastSeed, map.getMaxZoom())
    map.setMaxBounds(new L.LatLngBounds(southWest, northEast))

    L.tileLayer(tiles, {
        minZoom: minZoom,
        maxZoom: maxZoom,
        tms: true,
        noWrap: true
    }).addTo(map)
}

function changeSlide(direction) {
    var lastSlide

    switch (direction) {
        case "next":
            lastSlide = currentSlide
            currentSlide++
            break
        case "previous":
            lastSlide = currentSlide
            currentSlide--
            break
    }

    $navButtons = $(map.getContainer()).children("div.nav-button")

    $navButtons.fadeOut(function() {
        if (currentSlide > 0) {
            killSlide(lastSlide)
        }
        showSlide(currentSlide)

        setTimeout(function() {
            if (currentSlide == 0) {
                $(map.getContainer()).children("div.nav-button.next").fadeIn()
            } else if (currentSlide < slides.length - 2) {
                $navButtons.fadeIn()
                $(map.getContainer()).children("div.explore-button").fadeOut()
            } else if (currentSlide == slides.length - 2) {
                $(map.getContainer()).children("div.nav-button.previous").fadeIn()
                $(map.getContainer()).children("div.explore-button").fadeIn()
            }
        },500)
    })

    return false
}

function killSlide(number) {
    switch (slides[number]["type"]) {
        case "map":
            $(slides[number]["layers"]).each(function() {
                map.removeLayer(this)
            })
            break
        case "text":
            $(map.getContainer()).children(".text-slide").fadeOut(function() {
                $(this).remove()
            })
            break
        case "text-image":
            $(map.getContainer()).children(".text-image-slide").fadeOut(function() {
                $(this).remove()
            })
            break
        case "text-image-vertical":
            $(map.getContainer()).children(".text-image-vertical-slide").fadeOut(function() {
                $(this).remove()
            })
            break
    }
}

function showSlide(number) {
    var slide = slides[number]

    switch (slide["type"]) {
        case "map":
            showMapSlide(slide)
            break
        case "text":
            showTextSlide(slide)
            break
        case "text-image":
            showTextImageSlide(slide)
            break
        case "text-image-vertical":
            showTextImageVerticalSlide(slide)
            break
    }
}

function showMapSlide(slide) {
    $(map.getContainer()).children(".leaflet-control-container").fadeIn(function() {
        if (slide["transition"]) {
            map.setView(slide["transition"]["center"],
                        slide["transition"]["zoom"])
        }

        setTimeout(function() {$(slide["layers"]).each(function() {
            switch (this.slideLabel) {
                case "popup":
                    this.openOn(map)
                    break
                case "shape":
                    this.addTo(map)
                    break
            }
        })},500)
    })
}

function showTextSlide(slide) {
    $(map.getContainer()).children(".leaflet-control-container").fadeOut(function() {
        var newSlide = $("<div/>").addClass("text-slide").append(
                $("<div/>").addClass("text-block").html(slide["message"])
            )

        $(map.getContainer()).append(newSlide)

        $(newSlide).fadeIn()
    })
}

function showTextImageSlide(slide) {
    $(map.getContainer()).children(".leaflet-control-container").fadeOut(function() {
        var newSlide = $("<div/>").addClass("text-image-slide").append(
                $("<div/>").addClass("text-block").html(slide["message"])
            ).append(
                $("<div/>").addClass("image-block").append(
                        $("<img/>").attr("src",slide["image"]["src"]).
                                    attr("width",slide["image"]["width"]).
                                    attr("height",slide["image"]["height"])
                    ).append(
                        $("<p/>").addClass("caption").html(slide["image"]["caption"])
                    ).append(
                        $("<p/>").addClass("credit").html(slide["image"]["credit"])
                    )
            )

        $(map.getContainer()).append(newSlide)

        $(newSlide).fadeIn()
    })
}

function showTextImageVerticalSlide(slide) {
    $(map.getContainer()).children(".leaflet-control-container").fadeOut(function() {
        var newSlide = $("<div/>").addClass("text-image-vertical-slide").append(
                $("<div/>").addClass("text-block").html(slide["message"])
            ).append(
                $("<div/>").addClass("image-block").append(
                        $("<img/>").attr("src",slide["image"]["src"]).
                                    attr("width",slide["image"]["width"]).
                                    attr("height",slide["image"]["height"])
                    ).append(
                        $("<p/>").addClass("caption").html(slide["image"]["caption"])
                    ).append(
                        $("<p/>").addClass("credit").html(slide["image"]["credit"])
                    )
            )

        $(map.getContainer()).append(newSlide)

        $(newSlide).fadeIn()
    })
}

function buildSlide(slide) {
    switch (slide["type"]) {
        case "map":
            return buildMapSlide(slide)
            break
        case "text":
            return buildTextSlide(slide)
            break
        case "text-image":
            return buildTextImageSlide(slide)
            break
        case "text-image-vertical":
            return buildTextImageVerticalSlide(slide)
            break
    }
}

function buildTextSlide(slide) {
    return slide
}

function buildTextImageSlide(slide) {
    return slide
}

function buildTextImageVerticalSlide(slide) {
    return slide
}

function buildMapSlide(slide) {
    var layerElements = new Array()
    var result

    $(slide["elements"]).each(function() {
        var bounds = [
            map.unproject(this["bounds"][0],map.getMaxZoom()),
            map.unproject(this["bounds"][1],map.getMaxZoom())
        ]

        switch (this["type"]) {
            case "polyline":
                var shape = L.polyline(bounds,
                                    { color: accentColor, weight: 10, opacity: 0.6})
                break
            case "rect":
                var shape = L.rectangle(bounds, { color: accentColor, weight: 1 })
                break
        }

        shape.slideLabel = "shape"
        layerElements.push(shape)
    })

    $(slide["popups"]).each(function() {
        layerElements.push(buildPopup(this["coords"],this["message"],
                                        this["maxWidth"],this["linkMessage"]))
    })

    result = {
        "type": "map",
        "layers": layerElements
    }

    if (slide["frame"]) {
        result["transition"] = {
            "center": map.unproject(slide["frame"]["center"],map.getMaxZoom()),
            "zoom": slide["frame"]["zoom"]
        }
    }

    return result
}

function buildPopup(coords,message,maxWidth) {
    if (!maxWidth) {
        maxWidth = 300
    }

    var popup = L.popup({
            "closeOnClick": false,
            "closeButton": false,
            "maxWidth": maxWidth
        })
        .setLatLng(map.unproject(coords,map.getMaxZoom()))
        .setContent("<p>" + message + "</p>")

    popup.slideLabel = "popup"

    return popup
}
