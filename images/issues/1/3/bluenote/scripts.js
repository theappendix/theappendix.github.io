Array.prototype.shuffle = function() {
    var s = []
    while (this.length) s.push(this.splice(Math.random() * this.length, 1)[0])
    while (s.length) this.push(s.pop())
    return this
}

var maps = (function(module) {
    module.startYear = 1943
    module.endYear = 1967
    module.map = $K.map("#appendixed-1-3-us-map")
    module.europe_map = $K.map("#appendixed-1-3-europe-map")

    var playerTrajectories = []
    var playerMarkers = []
    var europeTrajectories = []
    var europeMarkers = []
    var playerData = []
    var europeData = []

    var clearTrajectories = function(label) {
        var data
        switch (label) {
            case "US":
                data = playerTrajectories
                break
            case "Europe":
                data = europeTrajectories
                break
        }
        $(data).each(function() {
            this.remove()
        })
        data.length = 0
    }

    module.updateGrid = function(values) {
        var years = []

        for (var i = values[0]; i <= values[1]; i++) {
            years.push(i + "")
        }

        $("#appendixed-1-3-us-personnel-grid span.cell").removeClass("on")

        $(years).each(function() {
            $("#appendixed-1-3-us-personnel-grid span.year-" + this).addClass("on")
        })
    }

    module.updateMap = function(label,years) {
        var data
        switch (label) {
            case "US":
                data = playersForDateRange(years)
                break
            case "Europe":
                data = europeData
                break
        }
        clearTrajectories(label)
        clearMarkers(label)
        updateMarkers(label,data)
        updateTrajectories(label,data)
    }

    var addMarker = function(markers,coordinates) {
        var marked = false
        $(markers).each(function() {
            if ((this.latitude == coordinates.latitude) &&
                    (this.longitude == coordinates.longitude)) {
                this.counter++
                marked = true
            }
        })

        if (!marked) {
            markers.push(
                {
                    "latitude": coordinates.latitude,
                    "longitude": coordinates.longitude,
                    "counter": 1
                }
            )
        }

        return markers
    }

    var updateMarkers = function(label,data) {
        var locationPairs = []
        var map = {}
        var markers = {}

        switch (label) {
            case "US":
                map = module.map
                markers = playerMarkers
                $(data).each(function() {
                    if (this.birthplace && this.birthplace.coordinates) {
                        var lat = parseFloat(this.birthplace.coordinates.latitude)
                        var lon = parseFloat(this.birthplace.coordinates.longitude)

                        locationPairs = addMarker(locationPairs,{
                            "latitude": lat,
                            "longitude": lon
                        })
                    }
                })
                break
            case "Europe":
                map = module.europe_map
                markers = europeMarkers
                $(data).each(function() {
                    if (this.birthplace && this.birthplace.coordinates && 
                            this.destination && this.destination.coordinates) {
                        var lat = parseFloat(this.birthplace.coordinates.latitude)
                        var lon = parseFloat(this.birthplace.coordinates.longitude)

                        locationPairs = addMarker(locationPairs,{
                            "latitude": lat,
                            "longitude": lon
                        })

                        lat = parseFloat(this.destination.coordinates.latitude)
                        lon = parseFloat(this.destination.coordinates.longitude)

                        locationPairs = addMarker(locationPairs,{
                            "latitude": lat,
                            "longitude": lon
                        })
                    }
                })
                break
        }

        $(locationPairs).each(function() {
            var marker = this
            markers.push(map.addSymbols({
                type: $K.Bubble,
                data: marker,
                location: function() { 
                    return [marker.longitude,marker.latitude] 
                },
                radius: function() {
                    if (marker.counter > 4) {
                        return marker.counter / 2
                    } else {
                        return 2
                    }
                },
                style: 'fill:red;stroke:none;opacity:.2'
            }))
        })

        switch (label) {
            case "US":
                playerMarkers = markers
                break
            case "Europe":
                europeMarkers = markers
                break
        }
    }

    var clearMarkers = function(label) {
        var markers = {}
        switch (label) {
            case "US":
                markers = playerMarkers
                break
            case "Europe":
                markers = europeMarkers
                break
        }
        $(markers).each(function() {
            this.remove()
        })
        markers.length = 0
    }

    var updateTrajectories = function(label,data) {
        switch (label) {
            case "US":
                $(data).each(function() {
                    var lat = this.birthplace.coordinates.latitude
                    var lon = this.birthplace.coordinates.longitude

                    playerTrajectories.push(module.map.addGeoPath([new $K.LonLat(lon,lat),new $K.LonLat(-73.94,40.67)],"M S","trajectory"))
                })

                break
            case "Europe":
                // Not gated by date, so we ignore the years parameter
                $(data).each(function() {
                    if (this.birthplace && this.birthplace.coordinates &&
                            this.destination && this.destination.coordinates) {
                        var lat = this.birthplace.coordinates.latitude
                        var lon = this.birthplace.coordinates.longitude
                        var dest_lat = this.destination.coordinates.latitude
                        var dest_lon = this.destination.coordinates.longitude

                        europeTrajectories.push(module.europe_map.addGeoPath([new $K.LonLat(lon,lat),new $K.LonLat(dest_lon,dest_lat)],"M S","trajectory"))
                    }
                })
                break
        }
    }

    var playersForDateRange = function(years) {
        var players = []

        $(playerData).each(function() {
            if (this.birthplace && this.birthplace.coordinates) {
                var player = this
                if (validDateRangeForPlayer(player,years)) {
                    players.push(player)
                }
            }
        })

        return players
    }

    var validDateRangeForPlayer = function(player,years) {
        for (var i = years[0]; i <= years[1]; i++) {
            var validFlag = false
            $(player.sessions).each(function() {
                if (parseInt(i) == parseInt(this.year)) {
                    validFlag = true
                }
            })
            if (validFlag) {
                return true
            }
        }

        return false
    }

    var populateUSPersonnelGrid = function() {
        var $grid = $("#appendixed-1-3-us-personnel-grid")

        $(playerData).each(function() {
            var $cell = $("<span/>")

            if (this.birthplace) {
                $cell.html(this.name)
                $cell.addClass("cell")
                $cell.addClass("on")
                $(this.sessions).each(function() {
                    $cell.addClass("year-" + this.year)
                })
                $grid.append($cell).append($("<span/>").addClass("bullet").html("•"))
            }
        })

        $grid.children("span.bullet").last().remove()
    }

    var populateEuropePersonnelGrid = function() {
        var $grid = $("#appendixed-1-3-europe-personnel-grid")

        $(europeData).each(function() {
            var $cell = $("<span/>")

            if (this.birthplace) {
                $cell.html(this.name)
                $cell.addClass("cell")
                $cell.addClass("on")
                $grid.append($cell).append($("<span/>").addClass("bullet").html("•"))
            }
        })

        $grid.children("span.bullet").last().remove()
    }

    $.getJSON("/images/issues/1/3/bluenote/players.json", function(data) {
        playerData = data
        playerData.shuffle()
        $.getJSON("/images/issues/1/3/bluenote/europeans.json", function(data) {
            europeData = data
            europeData.shuffle()

            module.map.loadMap("/images/issues/1/3/bluenote/svg/map.svg",function() {
                module.map.addLayer("countries", {
                    styles: {
                        fill: '#fff',
                        stroke: '#f0e5ec'
                    }
                })
                module.map.addLayer("states", {
                    styles: {
                        fill: '#f7f0f4',
                        stroke: '#ddc5d5'
                    }
                })

                module.europe_map.loadMap("/images/issues/1/3/bluenote/svg/transatlantic.svg",function() {
                    module.europe_map.addLayer("background_countries", {
                        styles: {
                            fill: '#fff',
                            stroke: '#f0e5ec'
                        }
                    })
                    module.europe_map.addLayer("main_countries", {
                        styles: {
                            fill: '#f7f0f4',
                            stroke: '#ddc5d5'
                        }
                    })

                    module.updateMap("US",[module.startYear,module.endYear])
                    module.updateMap("Europe")
                    populateUSPersonnelGrid()
                    populateEuropePersonnelGrid()
                })
            })
        })
    })

    return module
}(maps || {}))
