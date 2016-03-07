var BREAK_DISPLAY_WIDTH = 40;
var TICK_SPACING = 200;

var AppendixedMap = function(id,img_src,width,height) {
    this.id = id
    this.width = width
    this.height = height
    this.markers = []
    this.timeline = {}

    var $img = $(document.createElement("img"))
    $img.attr("src",img_src)
    $img.attr("width",width)
    $img.attr("height",height)

    var map = this
    $("#" + id).on("click",function() {
        map.clearMap()
    })

    $("#" + id).children().remove()
    $("#" + id).append($img)
}

AppendixedMap.prototype.shrinkAnyMarkers = function() {
    $(this.markers).each(function() {
        $marker_container = $('#' + this.apocalypse.id + '-marker')

        if ($marker_container.hasClass("expanded")) {
            $marker_container.removeClass("expanded")
            $marker_container.animate({top: '+=16', left: '+=16', width: '32', height: '32'},100)
            $marker_container.css("z-index",1)
        }
    })

    $(this.timeline.markers).each(function() {
        $("#" + this.apocalypse.id + "-timeline-marker").removeClass("expanded")
    })
}

AppendixedMap.prototype.clearMap = function() {
    var map = this
    $(".popup").fadeOut(function() {
        map.shrinkAnyMarkers()
    })
}

var Apocalypse = function(type,title,dateline,description,date,image,id) {
    this.title = title
    this.dateline = dateline
    this.description = description
    this.date = date
    this.image = image
    this.id = id

    var types = "predicted cataclysm divine".split(" ")

    if (types.indexOf(type) >= 0) {
        this.type = type
    } else {
        this.type = "predicted"
    }
}

Apocalypse.prototype.displayType = function() {
    switch (this.type) {
        case "predicted":
            return "Predicted Apocalypse"
            break
        case "cataclysm":
            return "Natural Disaster"
            break
        case "divine":
            return "Divine Intervention"
            break
        default:
            return "Predicted Apocalypse"
            break
    }
}

var Break = function(beginning,span,index) {
    this.index = index
    this.x = null
    this.timeline = {}

    var ellision_in_years = Math.floor(0.9 * span)
    this.beginning = beginning + Math.floor(0.05 * span)
    this.end = this.beginning + ellision_in_years
    this.span = ellision_in_years
}

Break.prototype.addToTimeline = function(timeline) {
    timeline.breaks.push(this)
    this.timeline = timeline
}

Break.prototype.recalculatePosition = function() {
    var breaks_offset = 0
    var breaks_offset_in_years = 0
    var this_break = this

    $(this.timeline.breaks).each(function() {
        if (this_break.beginning > this.beginning) {
            breaks_offset++
            breaks_offset_in_years += this.span
        }
    })

    this.x = Math.floor((this.beginning - breaks_offset_in_years - this.timeline.beginning) / this.timeline.years_per_pixel) + (breaks_offset * BREAK_DISPLAY_WIDTH)
}

Break.prototype.drawOnTimeline = function() {
    $("#timeline-break-" + this.index).remove()
    $("#" + this.timeline.id).append(this.buildForDOM())
}

Break.prototype.buildForDOM = function() {
    var $break_container = $(document.createElement("div"))
    $break_container.attr("id", "timeline-break-" + this.timeline.id)
    $break_container.addClass("timeline-break")
    $break_container.css("left",this.x)

    return $break_container
}

var ImageLoader = function() {
    this.images = []
    this.done = false
}

ImageLoader.prototype.addImage = function(image) {
    this.images.push(image)
}

ImageLoader.prototype.startLoadQueue = function() {
    var loader = this
    $(loader.images).each(function() {
        var img = new Image()
        img.onload = function() {
            loader.removeImageFromQueue(this)
        }
        img.src = this
    })
}

ImageLoader.prototype.removeImageFromQueue = function(image) {
    this.images.splice(this.images.indexOf(image),1)
    this.done = (this.images.length > 0) ? false : true
}

var MapMarker = function(x,y,apocalypse,map) {
    this.x = x
    this.y = y
    this.apocalypse = apocalypse
    this.map = {}
}

MapMarker.prototype.addToMap = function(map) {
    this.map = map
    map.markers.push(this)

    $("#" + map.id).append(this.buildMarkerForDOM())
}

MapMarker.prototype.buildMarkerForDOM = function() {
    var $marker_container = $(document.createElement("div"))
    $marker_container.attr("id",this.apocalypse.id + "-marker")
    $marker_container.addClass("map-marker")
    $marker_container.width(32)
    $marker_container.height(32)
    $marker_container.css("left",this.x - 16)
    $marker_container.css("top",this.y - 16)

    var $marker_image = $(document.createElement("img"))
    $marker_image.attr("src",this.getApocalypseIcon())
    $marker_container.append($marker_image)

    var marker = this 
    $marker_container.on("click",function() {
        if (!$marker_container.hasClass("expanded")) {
            marker.displayPopup()
            $("#" + marker.apocalypse.id + "-timeline-marker").addClass("expanded")
        }

        return false
    })

    return $marker_container
}

MapMarker.prototype.expandMarker = function() {
    var $marker_container = $("#" + this.apocalypse.id + "-marker")
    $marker_container.addClass("expanded")
    $marker_container.animate({top: '-=16', left: '-=16', width: '64', height: '64'},100)
    $marker_container.css("z-index",3)
}

MapMarker.prototype.buildPopup = function() {
    $popup = $(document.createElement("div"))
    $popup.addClass("popup")
    $popup.width(512)
    $popup.height(364)

    var $image = $(document.createElement("img"))
    $image.attr("src",this.apocalypse.image)
    $image.attr("width",220)
    $image.attr("height",310)

    var $header = $(document.createElement("p"))
    $header.addClass("header")
    $header.append($(document.createElement("span")).addClass("title").html(this.apocalypse.title))
    $header.append($(document.createElement("span")).addClass("dateline").html(this.apocalypse.dateline))

    var $description = $(document.createElement("p"))
    $description.addClass("description")
    $description.append(this.apocalypse.description)

    $popup.append($image)
    $popup.append($header)
    $popup.append($description)

    $("#" + this.map.id).append($popup)
    this.positionPopup($popup)
    $popup.fadeIn()
}

MapMarker.prototype.positionPopup = function($popup) {
    var displayToRight, displayToBottom 

    displayToRight = (this.x < this.map.width / 2) ? true : false
    displayToBottom = (this.y < this.map.height / 2) ? true : false

    if (displayToRight) {
        $popup.css("left",this.x + 12)
    } else {
        $popup.css("left",this.x - 524)
    }

    if (displayToBottom) {
        $popup.css("top",this.y + 12)
    } else {
        $popup.css("top",this.y - 344)
    }

    if (displayToRight && displayToBottom) { // Square top left corner
        $popup.css("border-top-left-radius",0)
    } else if (displayToRight) { // Square bottom left corner
        $popup.css("border-bottom-left-radius",0)
    } else if (displayToBottom) { // Square top right corner
        $popup.css("border-top-right-radius",0)
    } else { // Square bottom right corner
        $popup.css("border-bottom-right-radius",0)
    }
}

MapMarker.prototype.displayPopup = function() {
    this.map.shrinkAnyMarkers()
    this.expandMarker()

    if ($(".popup").length > 0) {
        $(".popup").addClass("kill-queue")
        $(".popup").fadeOut(function() {
            $(".kill-queue").remove()
            var $popup = this.buildPopup()
        }.apply(this))
    } else {
        var $popup = this.buildPopup()
    }
}

MapMarker.prototype.getApocalypseIcon = function() {
    switch (this.apocalypse.type) {
        case "predicted":
            return "/images/issues/1/1/appendixed/images/icons/predicted-apocalypse.png"
            break
        case "cataclysm":
            return "/images/issues/1/1/appendixed/images/icons/natural-disaster.png"
            break
        case "divine":
            return "/images/issues/1/1/appendixed/images/icons/divine-intervention.png"
            break
    }
}

Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
}

var Tick = function(timeline,year) {
    this.timeline = timeline
    this.year = year
    this.x = null

    this.recalculatePosition()
}

Tick.prototype.recalculatePosition = function() {
    var breaks_offset = 0
    var breaks_offset_in_years = 0
    var this_break = this

    $(this.timeline.breaks).each(function() {
        if (this_break.year > this.beginning) {
            breaks_offset++
            breaks_offset_in_years += this.span
        }
    })

    this.x = Math.floor((this.year - breaks_offset_in_years - this.timeline.beginning) / this.timeline.years_per_pixel) + (breaks_offset * BREAK_DISPLAY_WIDTH)
}

Tick.prototype.drawOnTimeline = function() {
    var $tick_container

    $("#timeline-tick-" + this.year).remove()

    $tick_container = this.buildForDOM()
    $("#" + this.timeline.id).append($tick_container)

    $tick_container.css("margin-left",-1 * Math.floor($tick_container.width() / 2))
}

Tick.prototype.buildForDOM = function() {
    var $tick_container = $(document.createElement("div"))
    var year_label = (this.year >= 0) ? this.year : Math.abs(this.year) + " BCE"
    $tick_container.attr("id", "timeline-tick-" + this.timeline.id)
    $tick_container.addClass("timeline-tick")
    $tick_container.append($(document.createElement("div")).addClass("tick-mark"))
    $tick_container.append($(document.createElement("p")).addClass("tick-label").text(year_label))
    $tick_container.css("left",this.x)

    return $tick_container
}

var Timeline = function(id,beginning,end,width) {
    this.id = id
    this.map = {}
    this.beginning = beginning
    this.end = end
    this.markers = []
    this.breaks = []
    this.ticks = []
    
    this.width = width

    this.years_per_pixel = Math.floor(Math.abs((this.beginning - this.end) / this.width))
}

Timeline.prototype.addTicks = function() {
    var timeline = this

    if (this.beginning.mod(TICK_SPACING) == 0) {
        this.ticks.push(new Tick(this,this.beginning))
    }
    
    var next_tick = this.beginning + (TICK_SPACING - this.beginning.mod(TICK_SPACING))
    while (next_tick < this.end) {
        var show_this_tick = true

        $(this.breaks).each(function() {
            if ((next_tick >= this.beginning) && (next_tick <= this.beginning + this.span)) {
                show_this_tick = false
            }
        })

        if (show_this_tick) {
            this.ticks.push(new Tick(this,next_tick))
        }

        next_tick += TICK_SPACING
    }
}

Timeline.prototype.addBreaks = function(number) {
    var timeline = this
    var years = []
    var spans = []
    var breaks = []

    $(this.markers).each(function() {
        years.push(this.apocalypse.date)
    })
    years.sort()

    var last_year = null
    $(years).each(function() {
        if (last_year !== null) {
            spans.push(Math.abs(last_year - this))
        }
        last_year = this
    })

    for (var i = 0; i < number; i++) {
        var largest_span = null
        for (var j = 0; j < spans.length; j++) {
            if (largest_span !== null) {
                largest_span = (spans[j] > largest_span) ? spans[j] : largest_span
            } else {
                largest_span = spans[j]
            }
        }
        breaks.push({beginning: years[i], span: largest_span, index: i})
        spans.splice(spans.indexOf(largest_span),1)
    }

    $(breaks).each(function() {
        (new Break(this.beginning,this.span,this.index)).addToTimeline(timeline)
    })
}

Timeline.prototype.redraw = function() {
    this.recalculateYearsPerPixel()

    $(this.markers).each(function() {
        this.drawOnTimeline()
    })

    $(this.breaks).each(function() {
        this.drawOnTimeline()
    })

    $(this.ticks).each(function() {
        this.drawOnTimeline()
    })
}

Timeline.prototype.recalculateYearsPerPixel = function() {
    var span = Math.abs(this.end - this.beginning)

    $(this.breaks).each(function() {
        span -= this.span
    })

    var display_width = this.width - (this.breaks.length * BREAK_DISPLAY_WIDTH)
    this.years_per_pixel = span / display_width

    $(this.markers).each(function() {
        this.recalculatePosition()
    })

    $(this.breaks).each(function() {
        this.recalculatePosition()
    })

    $(this.ticks).each(function() {
        this.recalculatePosition()
    })
}

var TimelineMarker = function(apocalypse) {
    this.timeline = {}
    this.apocalypse = apocalypse

    this.x = null
}

TimelineMarker.prototype.addToTimeline = function(timeline) {
    this.timeline = timeline
    timeline.markers.push(this)

    this.x = Math.floor((this.apocalypse.date - this.timeline.beginning) / this.timeline.years_per_pixel)
}

TimelineMarker.prototype.recalculatePosition = function() {
    var breaks_offset = 0
    var breaks_offset_in_years = 0
    var marker = this

    $(this.timeline.breaks).each(function() {
        if (marker.apocalypse.date > this.beginning) {
            breaks_offset++
            breaks_offset_in_years += this.span
        }
    })

    this.x = Math.floor((this.apocalypse.date - breaks_offset_in_years - this.timeline.beginning) / this.timeline.years_per_pixel) + (breaks_offset * BREAK_DISPLAY_WIDTH)
}

TimelineMarker.prototype.drawOnTimeline = function() {
    $("#" + this.apocalypse.id + "-timeline-marker").remove()
    $("#" + this.timeline.id).append(this.buildForDOM())
}

TimelineMarker.prototype.buildForDOM = function() {
    var $marker_container = $(document.createElement("div"))
    $marker_container.attr("id",this.apocalypse.id + "-timeline-marker")
    $marker_container.addClass("timeline-marker")
    $marker_container.css("left",this.x)


    var marker = this 
    $marker_container.on("click",function() {
        if (!$marker_container.hasClass("expanded")) {
            $(marker.timeline.map.markers).each(function() {
                if (marker.apocalypse.id == this.apocalypse.id) {
                    this.displayPopup()
                }
            })
            $("#" + marker.apocalypse.id + "-timeline-marker").addClass("expanded")
        }

        return false
    })

    return $marker_container
}